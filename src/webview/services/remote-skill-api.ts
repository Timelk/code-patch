/**
 * Remote skill marketplace API layer.
 *
 * All HTTP requests are proxied through the extension host (CSP-safe).
 * The webview sends `remote:search` via postMessage, extension host fetches,
 * and returns `remote:searchResult`.
 */

import { postMessage } from "./vscode-message";

// ─── Types ─────────────────────────────────────────────────────────

export interface RemoteSkill {
  readonly name: string;
  readonly description: string;
  readonly author: string;
  readonly downloads: number;
  readonly tags: readonly string[];
  readonly version?: string;
  readonly homepage?: string;
}

export interface RemoteSource {
  readonly id: string;
  readonly label: string;
  readonly host: string;
}

// ─── Sources ───────────────────────────────────────────────────────

const SOURCES: readonly RemoteSource[] = [
  { id: "skillhub", label: "SkillHub", host: "skillhub.tencent.com" },
  { id: "skillsmp", label: "SMP", host: "skillsmp.com" },
  { id: "skillssh", label: "Skills.sh", host: "skills.sh" },
];

export function getRemoteSources(): readonly RemoteSource[] {
  return SOURCES;
}

// ─── Search (via extension host) ───────────────────────────────────

export function requestRemoteSearch(sourceId: string, query?: string): void {
  postMessage({
    type: "remote:search",
    payload: { sourceId, query },
  });
}

export function requestRemoteInstall(sourceId: string, skill: RemoteSkill, targetAgent?: string): void {
  postMessage({
    type: "remote:install",
    payload: { sourceId, skill, targetAgent },
  });
}

export function requestRemoteRemove(skillName: string): void {
  postMessage({
    type: "remote:remove",
    payload: { skillName },
  });
}
