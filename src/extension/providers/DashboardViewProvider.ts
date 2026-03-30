import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { randomBytes } from "crypto";
import type { WebviewMessage, ExtensionMessage, Scope } from "../types/messages";
import { detectAgents, detectAllAgents, findAgentsWithSkill, resolveSkillsDir, resolveOwnSkillsDir } from "../services/agent-detector";
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
 * Manages a Vibe Rules dashboard as an editor tab (WebviewPanel).
 */
export class DashboardPanel {
  public static readonly viewType = "viberules.dashboard";

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
      "Vibe Rules",
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
        let report = await syncSkill(
          message.payload.skillName,
          message.payload.targetAgents,
          this.currentScope,
          workspaceRoot
        );

        // Also sync to project scope if requested (from global mode)
        if (message.payload.alsoSyncToProject && this.currentScope === "global" && workspaceRoot) {
          const projectReport = await syncSkill(
            message.payload.skillName,
            message.payload.targetAgents,
            "project",
            workspaceRoot
          );
          report = {
            results: [...report.results, ...projectReport.results],
            timestamp: report.timestamp,
          };
        }

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
        let allResults = batchResults.flatMap((r) => r.results);

        // Also sync to project scope if requested (from global mode)
        if (message.payload.alsoSyncToProject && this.currentScope === "global" && workspaceRoot) {
          const projectBatchResults = await Promise.all(
            message.payload.skillNames.map((skillName) =>
              syncSkill(skillName, message.payload.targetAgents, "project", workspaceRoot)
            )
          );
          allResults = [...allResults, ...projectBatchResults.flatMap((r) => r.results)];
        }

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
          console.error("[vibe-rules] Blocked opening path outside skills dirs:", openPath);
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
            console.error("[vibe-rules] Blocked deletion of path outside skills dirs:", skillDir);
            break;
          }
          try {
            await fs.promises.rm(skillDir, { recursive: true });
          } catch (err) {
            console.error(`[vibe-rules] Failed to delete ${skillDir}:`, err);
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
        await vscode.commands.executeCommand("workbench.action.openSettings", "vibeRules");
        break;

      case "agent:toggle": {
        const { agentName: toggleName, enabled: toggleEnabled } = message.payload;
        const config = vscode.workspace.getConfiguration("vibeRules");
        const current = config.get<Record<string, any>>("agents") ?? {};
        const agentOverride = current[toggleName] ?? {};
        const updatedConfig = {
          ...current,
          [toggleName]: { ...agentOverride, enabled: toggleEnabled },
        };
        await config.update("agents", updatedConfig, vscode.ConfigurationTarget.Global);
        // Re-detect agents (filtered) and refresh skills
        const agents = await detectAgents();
        this.postMessage({ type: "agents:detected", payload: agents });
        const skills = await scanSkills(this.currentScope, workspaceRoot, this.currentAgentFilter);
        this.postMessage({ type: "skills:loaded", payload: skills });
        // Also refresh full agent list for Settings panel
        const allAgents = await detectAllAgents();
        this.postMessage({ type: "agents:allLoaded", payload: allAgents });
        break;
      }

      case "url:open": {
        const { url } = message.payload;
        if (url && typeof url === "string") {
          vscode.env.openExternal(vscode.Uri.parse(url));
        }
        break;
      }

      case "language:load": {
        const lang = vscode.workspace.getConfiguration("vibeRules").get<string>("language") ?? "en";
        this.postMessage({ type: "language:loaded", payload: { language: lang } });
        break;
      }

      case "language:set": {
        const newLang = message.payload.language;
        await vscode.workspace.getConfiguration("vibeRules").update("language", newLang, vscode.ConfigurationTarget.Global);
        this.postMessage({ type: "language:loaded", payload: { language: newLang } });
        break;
      }

      case "agents:loadAll": {
        const allAgents = await detectAllAgents();
        this.postMessage({ type: "agents:allLoaded", payload: allAgents });
        break;
      }
    }
    } catch (err) {
      console.error("[vibe-rules] Error handling message:", message.type, err);
      this.postMessage({
        type: "error:occurred",
        payload: {
          operation: message.type,
          message: err instanceof Error ? err.message : String(err),
        },
      });
    }
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
  <title>Vibe Rules</title>
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
