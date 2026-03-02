import * as vscode from "vscode";
import { DashboardPanel } from "./providers/DashboardViewProvider";
import { SkillFileWatcher } from "./services/file-watcher";

let fileWatcher: SkillFileWatcher | undefined;

export function activate(context: vscode.ExtensionContext): void {
  fileWatcher = new SkillFileWatcher();

  // Open dashboard as an editor tab
  context.subscriptions.push(
    vscode.commands.registerCommand("codePatch.openDashboard", () => {
      DashboardPanel.createOrShow(context.extensionUri, fileWatcher!);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("codePatch.refreshSkills", () => {
      vscode.commands.executeCommand(
        "workbench.action.webview.reloadWebviewAction"
      );
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("codePatch.syncSkill", () => {
      // Open dashboard first, then user can sync from there
      DashboardPanel.createOrShow(context.extensionUri, fileWatcher!);
    })
  );

  context.subscriptions.push(fileWatcher);
}

export function deactivate(): void {
  fileWatcher?.dispose();
  fileWatcher = undefined;
}
