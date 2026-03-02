import * as vscode from "vscode";
import { AGENT_REGISTRY } from "../types/agent";

export type FileChangeEvent = {
  readonly path: string;
  readonly event: "create" | "change" | "delete";
};

export type FileChangeListener = (event: FileChangeEvent) => void;

/**
 * Watches SKILL.md files across all known agent directories.
 */
export class SkillFileWatcher implements vscode.Disposable {
  private readonly watchers: vscode.FileSystemWatcher[] = [];
  private readonly listeners: FileChangeListener[] = [];

  constructor() {
    this.setupWatchers();
  }

  /**
   * Register a listener for file change events.
   */
  onFileChange(listener: FileChangeListener): vscode.Disposable {
    this.listeners.push(listener);
    return new vscode.Disposable(() => {
      const idx = this.listeners.indexOf(listener);
      if (idx >= 0) {
        this.listeners.splice(idx, 1);
      }
    });
  }

  private setupWatchers(): void {
    // Collect unique skill directory patterns
    const patterns = new Set<string>();
    for (const agent of AGENT_REGISTRY) {
      patterns.add(`**/${agent.skillsDir}/**/SKILL.md`);
    }

    for (const pattern of patterns) {
      const watcher = vscode.workspace.createFileSystemWatcher(pattern);

      watcher.onDidCreate((uri) => this.emit(uri, "create"));
      watcher.onDidChange((uri) => this.emit(uri, "change"));
      watcher.onDidDelete((uri) => this.emit(uri, "delete"));

      this.watchers.push(watcher);
    }
  }

  private emit(uri: vscode.Uri, event: FileChangeEvent["event"]): void {
    const changeEvent: FileChangeEvent = {
      path: uri.fsPath,
      event,
    };
    for (const listener of this.listeners) {
      listener(changeEvent);
    }
  }

  dispose(): void {
    for (const watcher of this.watchers) {
      watcher.dispose();
    }
    this.watchers.length = 0;
    this.listeners.length = 0;
  }
}
