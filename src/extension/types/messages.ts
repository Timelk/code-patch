import type { AgentInfo } from "./agent";
import type { Skill, SyncReport } from "./skill";

// ─── MCP Types ─────────────────────────────────────────────────────

export interface McpServerInfo {
  readonly name: string;
  readonly command: string;
  readonly args?: readonly string[];
  readonly source: string;
  readonly sourcePath: string;
}

// ─── Diff Types ────────────────────────────────────────────────────

export interface DiffEntry {
  readonly agentName: string;
  readonly agentDisplayName: string;
  readonly status: "identical" | "modified" | "missing" | "symlink";
  readonly canonicalSnippet?: string;
  readonly targetSnippet?: string;
}

export interface DiffReport {
  readonly skillName: string;
  readonly entries: readonly DiffEntry[];
}

// ─── History Types ─────────────────────────────────────────────────

export interface SyncHistoryEntry {
  readonly id: string;
  readonly skillName: string;
  readonly targetAgents: readonly string[];
  readonly mode: "symlink" | "copy";
  readonly successCount: number;
  readonly failCount: number;
  readonly timestamp: number;
}

// ─── Remote Skill Types ───────────────────────────────────────────

export interface RemoteSkillItem {
  readonly name: string;
  readonly description: string;
  readonly author: string;
  readonly downloads: number;
  readonly tags: readonly string[];
  readonly version?: string;
  readonly homepage?: string;
}

// ─── Extension → Webview ───────────────────────────────────────────

export type ExtensionMessage =
  | { readonly type: "skills:loaded"; readonly payload: readonly Skill[] }
  | { readonly type: "agents:detected"; readonly payload: readonly AgentInfo[] }
  | { readonly type: "sync:result"; readonly payload: SyncReport }
  | {
      readonly type: "skill:fileChanged";
      readonly payload: {
        readonly path: string;
        readonly event: "create" | "change" | "delete";
      };
    }
  | { readonly type: "mcps:loaded"; readonly payload: readonly McpServerInfo[] }
  | { readonly type: "diff:result"; readonly payload: DiffReport }
  | { readonly type: "history:loaded"; readonly payload: readonly SyncHistoryEntry[] }
  | { readonly type: "skill:agentsWithSkill"; readonly payload: readonly string[] }
  | { readonly type: "error:occurred"; readonly payload: { readonly operation: string; readonly message: string } }
  | { readonly type: "remote:searchResult"; readonly payload: { readonly sourceId: string; readonly skills: readonly RemoteSkillItem[]; readonly total: number; readonly error?: string } }
  | { readonly type: "remote:installResult"; readonly payload: { readonly success: boolean; readonly skillName: string; readonly error?: string } }
  | { readonly type: "remote:removeResult"; readonly payload: { readonly success: boolean; readonly skillName: string; readonly error?: string } };

// ─── Webview → Extension ───────────────────────────────────────────

export type WebviewMessage =
  | {
      readonly type: "skills:load";
      readonly payload: {
        readonly scope: Scope;
        readonly agentFilter?: string;
      };
    }
  | { readonly type: "agents:detect" }
  | {
      readonly type: "sync:execute";
      readonly payload: {
        readonly skillName: string;
        readonly targetAgents: readonly string[];
      };
    }
  | {
      readonly type: "sync:batch";
      readonly payload: {
        readonly skillNames: readonly string[];
        readonly targetAgents: readonly string[];
      };
    }
  | {
      readonly type: "skill:create";
      readonly payload: {
        readonly name: string;
        readonly description?: string;
        readonly content: string;
        readonly agentFilter?: string;
      };
    }
  | {
      readonly type: "skill:delete";
      readonly payload: {
        readonly name: string;
        readonly filePath: string;
      };
    }
  | {
      readonly type: "skill:openInEditor";
      readonly payload: { readonly path: string };
    }
  | { readonly type: "webview:ready" }
  | { readonly type: "mcps:load" }
  | { readonly type: "diff:request"; readonly payload: { readonly skillName: string } }
  | { readonly type: "history:load" }
  | { readonly type: "history:clear" }
  | { readonly type: "skill:checkAgents"; readonly payload: { readonly skillName: string } }
  | { readonly type: "settings:open" }
  | { readonly type: "remote:search"; readonly payload: { readonly sourceId: string; readonly query?: string } }
  | { readonly type: "remote:install"; readonly payload: { readonly sourceId: string; readonly skill: RemoteSkillItem; readonly targetAgent?: string } }
  | { readonly type: "remote:remove"; readonly payload: { readonly skillName: string } };

export type Scope = "global" | "project";

export type { AgentInfo, Skill, SyncReport };
