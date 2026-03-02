import * as vscode from "vscode";
import * as path from "path";
import type { WebviewMessage, ExtensionMessage, Scope } from "../types/messages";
import { detectAgents, findAgentsWithSkill } from "../services/agent-detector";
import { scanSkills } from "../services/skill-scanner";
import { syncSkill } from "../services/sync-engine";
import { scanMcpServers } from "../services/mcp-scanner";
import { diffSkill } from "../services/diff-engine";
import { loadSyncHistory, addSyncHistoryEntry, clearSyncHistory } from "../services/sync-history";
import { SkillFileWatcher } from "../services/file-watcher";

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
        const uri = vscode.Uri.file(message.payload.path);
        await vscode.window.showTextDocument(uri);
        break;
      }

      case "skill:create": {
        // Determine target dir based on agent filter
        const { resolveSkillsDir: resolveDir } = await import("../services/agent-detector");
        const { AGENT_REGISTRY: agents } = await import("../types/agent");
        const agentName = message.payload.agentFilter;
        const targetAgent = agentName
          ? agents.find((a: { name: string }) => a.name === agentName)
          : agents.find((a: { name: string }) => a.name === "claude-code"); // default
        const baseDir = targetAgent
          ? resolveDir(targetAgent, this.currentScope, workspaceRoot)
          : (workspaceRoot ? path.join(workspaceRoot, ".agents/skills") : null);
        const targetDir = baseDir
          ? path.join(baseDir, message.payload.name)
          : null;
        if (targetDir) {
          const { mkdir, writeFile } = await import("fs/promises");
          await mkdir(targetDir, { recursive: true });
          const content =
            `---\nname: ${message.payload.name}\ndescription: ""\n---\n\n` +
            message.payload.content;
          await writeFile(path.join(targetDir, "SKILL.md"), content, "utf-8");
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
          const { rm } = await import("fs/promises");
          const skillDir = path.dirname(skillFilePath);
          try {
            await rm(skillDir, { recursive: true });
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
    }
    } catch (err) {
      console.error("[code-patch] Error handling message:", message.type, err);
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
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
