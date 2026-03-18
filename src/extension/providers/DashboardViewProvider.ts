import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { randomBytes } from "crypto";
import type { WebviewMessage, ExtensionMessage, Scope } from "../types/messages";
import { detectAgents, findAgentsWithSkill, resolveSkillsDir, resolveOwnSkillsDir } from "../services/agent-detector";
import { AGENT_REGISTRY } from "../types/agent";
import { scanSkills } from "../services/skill-scanner";
import { syncSkill } from "../services/sync-engine";
import { scanMcpServers } from "../services/mcp-scanner";
import { diffSkill } from "../services/diff-engine";
import { loadSyncHistory, addSyncHistoryEntry, clearSyncHistory } from "../services/sync-history";
import { SkillFileWatcher } from "../services/file-watcher";

/**
 * Collects all known skill directories for path validation.
 */
function getAllKnownSkillsDirs(
  scope: Scope,
  workspaceRoot: string | undefined
): string[] {
  const dirs: string[] = [];
  for (const agent of AGENT_REGISTRY) {
    const skillsDir = resolveSkillsDir(agent, scope, workspaceRoot);
    if (skillsDir) dirs.push(skillsDir);
    const ownDir = resolveOwnSkillsDir(agent, scope, workspaceRoot);
    if (ownDir && ownDir !== skillsDir) dirs.push(ownDir);
  }
  return dirs;
}

/**
 * Validates that a file path is inside one of the known skill directories.
 */
async function isPathInsideSkillsDirs(
  filePath: string,
  scope: Scope,
  workspaceRoot: string | undefined
): Promise<boolean> {
  const allowedRoots = getAllKnownSkillsDirs(scope, workspaceRoot);
  let realPath: string;
  try {
    realPath = await fs.promises.realpath(filePath);
  } catch {
    // If file doesn't exist, check parent directory
    realPath = path.resolve(filePath);
  }
  return allowedRoots.some((root) => realPath.startsWith(root));
}

/**
 * Manages a Code Patch dashboard as an editor tab (WebviewPanel).
 */
export class DashboardPanel {
  public static readonly viewType = "codePatch.dashboard";

  private static instance: DashboardPanel | undefined;
  private readonly panel: vscode.WebviewPanel;
  private readonly extensionUri: vscode.Uri;
  private readonly fileWatcher: SkillFileWatcher;
  private currentScope: Scope = "project";
  private currentAgentFilter: string | undefined = undefined;
  private disposed = false;

  private constructor(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri,
    fileWatcher: SkillFileWatcher
  ) {
    this.panel = panel;
    this.extensionUri = extensionUri;
    this.fileWatcher = fileWatcher;

    // Set webview HTML
    this.panel.webview.html = this.getHtmlForWebview(this.panel.webview);

    // Listen for messages from webview
    this.panel.webview.onDidReceiveMessage(
      (message: WebviewMessage) => this.handleMessage(message),
      null
    );

    // Watch for file changes (capture disposable to prevent listener leak)
    const fileChangeDisposable = this.fileWatcher.onFileChange((event) => {
      this.postMessage({
        type: "skill:fileChanged",
        payload: event,
      });
    });

    // Clean up on panel close
    this.panel.onDidDispose(() => {
      fileChangeDisposable.dispose();
      this.disposed = true;
      DashboardPanel.instance = undefined;
    });
  }

  /**
   * Create or reveal the dashboard panel.
   */
  public static createOrShow(
    extensionUri: vscode.Uri,
    fileWatcher: SkillFileWatcher
  ): void {
    // If panel already exists, reveal it
    if (DashboardPanel.instance) {
      DashboardPanel.instance.panel.reveal(vscode.ViewColumn.One);
      return;
    }

    // Create a new panel in the editor area
    const panel = vscode.window.createWebviewPanel(
      DashboardPanel.viewType,
      "Code Patch",
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.joinPath(extensionUri, "dist", "webview"),
        ],
      }
    );

    DashboardPanel.instance = new DashboardPanel(panel, extensionUri, fileWatcher);
  }

  private async handleMessage(message: WebviewMessage): Promise<void> {
    if (this.disposed) return;

    try {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

    switch (message.type) {
      case "webview:ready": {
        const [agents, skills] = await Promise.all([
          detectAgents(),
          scanSkills(this.currentScope, workspaceRoot, this.currentAgentFilter),
        ]);
        this.postMessage({ type: "agents:detected", payload: agents });
        this.postMessage({ type: "skills:loaded", payload: skills });
        break;
      }

      case "skills:load": {
        this.currentScope = message.payload.scope;
        this.currentAgentFilter = message.payload.agentFilter;
        const skills = await scanSkills(
          message.payload.scope,
          workspaceRoot,
          message.payload.agentFilter
        );
        this.postMessage({ type: "skills:loaded", payload: skills });
        break;
      }

      case "agents:detect": {
        const agents = await detectAgents();
        this.postMessage({ type: "agents:detected", payload: agents });
        break;
      }

      case "sync:execute": {
        const report = await syncSkill(
          message.payload.skillName,
          message.payload.targetAgents,
          this.currentScope,
          workspaceRoot
        );
        const successCount = report.results.filter((r) => r.success).length;
        await addSyncHistoryEntry({
          skillName: message.payload.skillName,
          targetAgents: [...message.payload.targetAgents],
          mode: "copy",
          successCount,
          failCount: report.results.length - successCount,
          timestamp: report.timestamp,
        });
        this.postMessage({ type: "sync:result", payload: report });
        break;
      }

      case "sync:batch": {
        const batchResults = await Promise.all(
          message.payload.skillNames.map((skillName) =>
            syncSkill(
              skillName,
              message.payload.targetAgents,
              this.currentScope,
              workspaceRoot
            )
          )
        );
        const allResults = batchResults.flatMap((r) => r.results);
        const mergedReport = { results: allResults, timestamp: Date.now() };
        const totalSuccess = allResults.filter((r) => r.success).length;
        await addSyncHistoryEntry({
          skillName: message.payload.skillNames.join(", "),
          targetAgents: [...message.payload.targetAgents],
          mode: "copy",
          successCount: totalSuccess,
          failCount: allResults.length - totalSuccess,
          timestamp: mergedReport.timestamp,
        });
        this.postMessage({ type: "sync:result", payload: mergedReport });
        break;
      }

      case "skill:openInEditor": {
        const openPath = message.payload.path;
        if (!(await isPathInsideSkillsDirs(openPath, this.currentScope, workspaceRoot))) {
          console.error("[code-patch] Blocked opening path outside skills dirs:", openPath);
          break;
        }
        const uri = vscode.Uri.file(openPath);
        await vscode.window.showTextDocument(uri);
        break;
      }

      case "skill:create": {
        // Sanitize skill name to prevent path traversal
        const safeName = path.basename(message.payload.name).replace(/[^a-z0-9_-]/gi, "");
        if (!safeName || safeName !== message.payload.name) {
          vscode.window.showErrorMessage("Invalid skill name. Use only letters, numbers, hyphens, and underscores.");
          break;
        }
        // Determine target dir based on agent filter
        const agentName = message.payload.agentFilter;
        const targetAgent = agentName
          ? AGENT_REGISTRY.find((a) => a.name === agentName)
          : AGENT_REGISTRY.find((a) => a.name === "claude-code"); // default
        const baseDir = targetAgent
          ? resolveSkillsDir(targetAgent, this.currentScope, workspaceRoot)
          : (workspaceRoot ? path.join(workspaceRoot, ".agents/skills") : null);
        const targetDir = baseDir
          ? path.join(baseDir, safeName)
          : null;
        if (targetDir) {
          await fs.promises.mkdir(targetDir, { recursive: true });
          const description = message.payload.description ?? "";
          const content =
            `---\nname: ${safeName}\ndescription: "${description}"\n---\n\n` +
            message.payload.content;
          await fs.promises.writeFile(path.join(targetDir, "SKILL.md"), content, "utf-8");
          const skills = await scanSkills(this.currentScope, workspaceRoot, agentName);
          this.postMessage({ type: "skills:loaded", payload: skills });
        } else {
          vscode.window.showErrorMessage("Could not determine target directory for skill creation.");
        }
        break;
      }

      case "skill:delete": {
        // Delete the specific skill file from the agent directory indicated by filePath
        const skillFilePath = message.payload.filePath;
        if (skillFilePath) {
          const skillDir = path.dirname(skillFilePath);
          // Validate path is inside a known skills directory
          if (!(await isPathInsideSkillsDirs(skillDir, this.currentScope, workspaceRoot))) {
            console.error("[code-patch] Blocked deletion of path outside skills dirs:", skillDir);
            break;
          }
          try {
            await fs.promises.rm(skillDir, { recursive: true });
          } catch (err) {
            console.error(`[code-patch] Failed to delete ${skillDir}:`, err);
          }
          const updated = await scanSkills(this.currentScope, workspaceRoot, this.currentAgentFilter);
          this.postMessage({ type: "skills:loaded", payload: updated });
        }
        break;
      }

      case "mcps:load": {
        const servers = await scanMcpServers(workspaceRoot);
        this.postMessage({ type: "mcps:loaded", payload: servers });
        break;
      }

      case "diff:request": {
        const report = await diffSkill(
          message.payload.skillName,
          this.currentScope,
          workspaceRoot
        );
        this.postMessage({ type: "diff:result", payload: report });
        break;
      }

      case "history:load": {
        const history = await loadSyncHistory();
        this.postMessage({ type: "history:loaded", payload: history });
        break;
      }

      case "history:clear": {
        await clearSyncHistory();
        this.postMessage({ type: "history:loaded", payload: [] });
        break;
      }

      case "skill:checkAgents": {
        const agentsWithSkill = await findAgentsWithSkill(
          message.payload.skillName,
          this.currentScope,
          workspaceRoot
        );
        this.postMessage({ type: "skill:agentsWithSkill", payload: agentsWithSkill });
        break;
      }
      case "settings:open":
        await vscode.commands.executeCommand("workbench.action.openSettings", "codePatch");
        break;

      case "remote:search": {
        const { sourceId, query } = message.payload;
        try {
          const result = await this.fetchRemoteSkills(sourceId, query);
          this.postMessage({ type: "remote:searchResult", payload: { sourceId, ...result } });
        } catch (err) {
          this.postMessage({
            type: "remote:searchResult",
            payload: {
              sourceId,
              skills: [],
              total: 0,
              error: err instanceof Error ? err.message : String(err),
            },
          });
        }
        break;
      }

      case "remote:install": {
        const { sourceId: installSource, skill: remoteSkill, targetAgent: installAgent } = message.payload;
        try {
          await this.installRemoteSkill(remoteSkill, installSource, installAgent, workspaceRoot);
          this.postMessage({ type: "remote:installResult", payload: { success: true, skillName: remoteSkill.name } });
          // Refresh skill list
          const updated = await scanSkills(this.currentScope, workspaceRoot, this.currentAgentFilter);
          this.postMessage({ type: "skills:loaded", payload: updated });
        } catch (err) {
          this.postMessage({
            type: "remote:installResult",
            payload: { success: false, skillName: remoteSkill.name, error: err instanceof Error ? err.message : String(err) },
          });
        }
        break;
      }

      case "remote:remove": {
        const { skillName: removeSkillName } = message.payload;
        try {
          await this.removeInstalledSkill(removeSkillName, workspaceRoot);
          this.postMessage({ type: "remote:removeResult", payload: { success: true, skillName: removeSkillName } });
          // Refresh skill list
          const updated = await scanSkills(this.currentScope, workspaceRoot, this.currentAgentFilter);
          this.postMessage({ type: "skills:loaded", payload: updated });
        } catch (err) {
          this.postMessage({
            type: "remote:removeResult",
            payload: { success: false, skillName: removeSkillName, error: err instanceof Error ? err.message : String(err) },
          });
        }
        break;
      }
    }
    } catch (err) {
      console.error("[code-patch] Error handling message:", message.type, err);
      this.postMessage({
        type: "error:occurred",
        payload: {
          operation: message.type,
          message: err instanceof Error ? err.message : String(err),
        },
      });
    }
  }

  // ─── Remote Skill Fetchers ────────────────────────────────────────

  /** SkillHub CDN JSON cache (12K+ entries, cached for session lifetime) */
  private skillhubCache: { skills: readonly any[]; fetchedAt: number } | null = null;

  /**
   * Install a remote skill locally by fetching its content or generating from metadata.
   */
  private async installRemoteSkill(
    skill: import("../types/messages").RemoteSkillItem,
    sourceId: string,
    targetAgentName: string | undefined,
    workspaceRoot: string | undefined
  ): Promise<void> {
    // Sanitize skill name for directory
    const safeName = skill.name.replace(/[^a-z0-9_-]/gi, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    if (!safeName) throw new Error("Invalid skill name");

    // Resolve target directory
    const agentName = targetAgentName ?? "claude-code";
    const targetAgent = AGENT_REGISTRY.find((a) => a.name === agentName)
      ?? AGENT_REGISTRY.find((a) => a.name === "claude-code");
    const baseDir = targetAgent
      ? resolveSkillsDir(targetAgent, this.currentScope, workspaceRoot)
      : (workspaceRoot ? path.join(workspaceRoot, ".agents/skills") : null);

    if (!baseDir) throw new Error("Cannot resolve target directory for skill installation");

    const targetDir = path.join(baseDir, safeName);

    // Check if already installed
    try {
      await fs.promises.access(path.join(targetDir, "SKILL.md"), fs.constants.F_OK);
      throw new Error(`Skill "${safeName}" is already installed`);
    } catch (err) {
      if (err instanceof Error && err.message.includes("already installed")) throw err;
      // Not installed — proceed
    }

    // Try to fetch real content from source, fallback to generated SKILL.md
    let content: string;
    try {
      content = await this.fetchRemoteSkillContent(skill, sourceId);
    } catch {
      // Generate from metadata
      const tagLine = skill.tags.length > 0 ? `\ntags: [${skill.tags.join(", ")}]` : "";
      content =
        `---\nname: ${safeName}\ndescription: "${skill.description}"` +
        `\nauthor: ${skill.author}` +
        (skill.version ? `\nversion: ${skill.version}` : "") +
        tagLine +
        `\nsource: ${sourceId}` +
        (skill.homepage ? `\nhomepage: ${skill.homepage}` : "") +
        `\n---\n\n# ${skill.name}\n\n${skill.description}\n`;
    }

    await fs.promises.mkdir(targetDir, { recursive: true });
    await fs.promises.writeFile(path.join(targetDir, "SKILL.md"), content, "utf-8");
  }

  /**
   * Fetch actual SKILL.md content from a remote source.
   */
  private async fetchRemoteSkillContent(
    skill: import("../types/messages").RemoteSkillItem,
    sourceId: string
  ): Promise<string> {
    switch (sourceId) {
      case "skillhub": {
        // Try CDN raw content endpoint
        const slug = skill.name.replace(/[^a-z0-9_-]/gi, "-");
        const url = `https://skillhub.tencent.com/api/skills/${encodeURIComponent(slug)}/raw`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`SkillHub content fetch failed: ${res.status}`);
        return await res.text();
      }
      case "skillsmp": {
        const apiKey = vscode.workspace.getConfiguration("codePatch").get<string>("skillsmpApiKey");
        const headers: Record<string, string> = {};
        if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;
        const url = `https://skillsmp.com/api/v1/skills/${encodeURIComponent(skill.name)}/download`;
        const res = await fetch(url, { headers });
        if (!res.ok) throw new Error(`SkillsMP download failed: ${res.status}`);
        return await res.text();
      }
      case "skillssh": {
        if (!skill.homepage) throw new Error("No homepage URL for Skills.sh skill");
        const url = `${skill.homepage}/raw`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Skills.sh content fetch failed: ${res.status}`);
        return await res.text();
      }
      default:
        throw new Error(`Unknown source: ${sourceId}`);
    }
  }

  /**
   * Remove a locally installed skill by name (searches all agent directories).
   */
  private async removeInstalledSkill(
    skillName: string,
    workspaceRoot: string | undefined
  ): Promise<void> {
    let removed = false;

    for (const agent of AGENT_REGISTRY) {
      const dir = resolveSkillsDir(agent, this.currentScope, workspaceRoot);
      if (!dir) continue;

      const skillDir = path.join(dir, skillName);
      const skillFile = path.join(skillDir, "SKILL.md");

      try {
        await fs.promises.access(skillFile, fs.constants.F_OK);
        await fs.promises.rm(skillDir, { recursive: true });
        removed = true;
      } catch {
        // Skill not in this agent dir
      }
    }

    if (!removed) {
      throw new Error(`Skill "${skillName}" not found in any agent directory`);
    }
  }

  private async fetchRemoteSkills(
    sourceId: string,
    query?: string
  ): Promise<{ skills: readonly import("../types/messages").RemoteSkillItem[]; total: number }> {
    switch (sourceId) {
      case "skillhub":
        return this.fetchSkillHub(query);
      case "skillsmp":
        return this.fetchSkillsMP(query);
      case "skillssh":
        return this.fetchSkillsSh(query);
      default:
        throw new Error(`Unknown remote source: ${sourceId}`);
    }
  }

  /** SkillHub (skillhub.tencent.com) — static CDN JSON, client-side filter */
  private async fetchSkillHub(
    query?: string
  ): Promise<{ skills: readonly import("../types/messages").RemoteSkillItem[]; total: number }> {
    const CACHE_TTL = 10 * 60 * 1000; // 10 min
    if (!this.skillhubCache || Date.now() - this.skillhubCache.fetchedAt > CACHE_TTL) {
      const url = "https://cloudcache.tencentcs.com/qcloud/tea/app/data/skills.2d46363b.json?max_age=31536000";
      const res = await fetch(url);
      if (!res.ok) throw new Error(`SkillHub CDN returned ${res.status}`);
      const data: any = await res.json();
      this.skillhubCache = { skills: data.skills ?? [], fetchedAt: Date.now() };
    }

    let filtered = this.skillhubCache.skills;
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (s: any) =>
          (s.name ?? "").toLowerCase().includes(q) ||
          (s.description_zh ?? s.description ?? "").toLowerCase().includes(q) ||
          (s.slug ?? "").toLowerCase().includes(q)
      );
    }

    // Sort by downloads desc, take top 50
    const sorted = [...filtered].sort((a: any, b: any) => (b.downloads ?? 0) - (a.downloads ?? 0));
    const top = sorted.slice(0, 50);

    return {
      total: filtered.length,
      skills: top.map((s: any) => ({
        name: s.name ?? s.slug ?? "unknown",
        description: s.description_zh ?? s.description ?? "",
        author: s.owner ?? "unknown",
        downloads: s.downloads ?? 0,
        tags: s.tags ?? [],
        version: s.version,
        homepage: s.homepage,
      })),
    };
  }

  /** SkillsMP (skillsmp.com) — REST API, requires API key */
  private async fetchSkillsMP(
    query?: string
  ): Promise<{ skills: readonly import("../types/messages").RemoteSkillItem[]; total: number }> {
    const searchQuery = query || "agent";
    const url = `https://skillsmp.com/api/v1/skills/search?q=${encodeURIComponent(searchQuery)}&limit=50&sortBy=stars`;

    // API key from VSCode settings (optional)
    const apiKey = vscode.workspace.getConfiguration("codePatch").get<string>("skillsmpApiKey");
    const headers: Record<string, string> = {};
    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const res = await fetch(url, { headers });
    if (!res.ok) {
      if (res.status === 401) throw new Error("SkillsMP requires an API key. Set codePatch.skillsmpApiKey in settings.");
      throw new Error(`SkillsMP returned ${res.status}`);
    }

    const data: any = await res.json();
    const items: any[] = data.skills ?? data.data ?? data.results ?? [];

    return {
      total: data.total ?? items.length,
      skills: items.slice(0, 50).map((s: any) => ({
        name: s.name ?? s.filename ?? "unknown",
        description: s.description ?? "",
        author: s.owner ?? s.author ?? s.repo ?? "unknown",
        downloads: s.stars ?? s.downloads ?? 0,
        tags: s.tags ?? s.categories ?? [],
        version: s.version,
        homepage: s.url ?? s.homepage,
      })),
    };
  }

  /** Skills.sh — no public API, fetch SSR page and parse leaderboard */
  private async fetchSkillsSh(
    query?: string
  ): Promise<{ skills: readonly import("../types/messages").RemoteSkillItem[]; total: number }> {
    const url = query
      ? `https://skills.sh/search?q=${encodeURIComponent(query)}`
      : "https://skills.sh/";

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Skills.sh returned ${res.status}`);
    const html = await res.text();

    // Parse leaderboard entries: pattern "RANK NAME OWNER/REPO INSTALLS"
    const skills: import("../types/messages").RemoteSkillItem[] = [];
    // Match skill links: href="/owner/repo/skill-name" with heading and install count
    const linkRegex = /<a[^>]*href="\/([^"]+)"[^>]*>[\s\S]*?<h3[^>]*>([^<]+)<\/h3>[\s\S]*?<p[^>]*>([^<]+)<\/p>[\s\S]*?<(?:span|div|td)[^>]*>([\d.]+K?)<\/(?:span|div|td)>/g;
    let match;
    while ((match = linkRegex.exec(html)) !== null && skills.length < 50) {
      const [, urlPath, name, repo, installsStr] = match;
      const installs = installsStr.includes("K")
        ? parseFloat(installsStr) * 1000
        : parseInt(installsStr, 10);
      skills.push({
        name: name.trim(),
        description: `from ${repo.trim()}`,
        author: repo.trim().split("/")[0] ?? "unknown",
        downloads: Math.round(installs) || 0,
        tags: [],
        homepage: `https://skills.sh/${urlPath}`,
      });
    }

    // If regex parsing fails (SSR structure changed), return what we have
    return { total: skills.length, skills };
  }

  private postMessage(message: ExtensionMessage): void {
    if (!this.disposed) {
      this.panel.webview.postMessage(message);
    }
  }

  private getHtmlForWebview(webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, "dist", "webview", "assets", "index.js")
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, "dist", "webview", "assets", "index.css")
    );

    const nonce = getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; font-src ${webview.cspSource};">
  <link rel="stylesheet" href="${styleUri}">
  <title>Code Patch</title>
</head>
<body>
  <div id="root"></div>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }
}

function getNonce(): string {
  return randomBytes(16).toString("base64");
}
