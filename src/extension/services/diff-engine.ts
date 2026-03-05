import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { AGENT_REGISTRY } from "../types/agent";
import { resolveSkillsDir } from "./agent-detector";

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

/**
 * Compare a skill's canonical content with each agent's copy.
 */
export async function diffSkill(
  skillName: string,
  scope: "global" | "project",
  workspaceRoot: string | undefined
): Promise<DiffReport> {
  // Find the canonical content first
  const canonicalContent = await findCanonicalContent(skillName, scope, workspaceRoot);
  const entries: DiffEntry[] = [];

  for (const agent of AGENT_REGISTRY) {
    const baseDir = resolveSkillsDir(agent, scope, workspaceRoot);
    if (!baseDir) {
      continue;
    }

    const skillDir = path.join(baseDir, skillName);
    const skillFile = path.join(skillDir, "SKILL.md");

    try {
      const stat = await fs.promises.lstat(skillDir);

      if (stat.isSymbolicLink()) {
        entries.push({
          agentName: agent.name,
          agentDisplayName: agent.displayName,
          status: "symlink",
        });
        continue;
      }

      const targetContent = await fs.promises.readFile(skillFile, "utf-8");

      if (canonicalContent === null) {
        // No canonical found, just report what exists
        entries.push({
          agentName: agent.name,
          agentDisplayName: agent.displayName,
          status: "modified",
          targetSnippet: targetContent.slice(0, 300),
        });
      } else if (targetContent === canonicalContent) {
        entries.push({
          agentName: agent.name,
          agentDisplayName: agent.displayName,
          status: "identical",
        });
      } else {
        entries.push({
          agentName: agent.name,
          agentDisplayName: agent.displayName,
          status: "modified",
          canonicalSnippet: canonicalContent.slice(0, 300),
          targetSnippet: targetContent.slice(0, 300),
        });
      }
    } catch {
      entries.push({
        agentName: agent.name,
        agentDisplayName: agent.displayName,
        status: "missing",
      });
    }
  }

  return { skillName, entries };
}

/**
 * Find the canonical SKILL.md content from .agents/skills/ or first available.
 */
async function findCanonicalContent(
  skillName: string,
  scope: "global" | "project",
  workspaceRoot: string | undefined
): Promise<string | null> {
  // Try .agents/skills/ first (canonical)
  const canonicalBases = [
    scope === "project" && workspaceRoot
      ? path.join(workspaceRoot, ".agents/skills", skillName, "SKILL.md")
      : null,
    path.join(
      process.env["XDG_CONFIG_HOME"] ?? path.join(os.homedir(), ".config"),
      "agents/skills",
      skillName,
      "SKILL.md"
    ),
  ].filter(Boolean) as string[];

  for (const filePath of canonicalBases) {
    try {
      return await fs.promises.readFile(filePath, "utf-8");
    } catch {
      continue;
    }
  }

  // Fallback: first agent that has the skill
  for (const agent of AGENT_REGISTRY) {
    const baseDir = resolveSkillsDir(agent, scope, workspaceRoot);
    if (!baseDir) continue;
    const filePath = path.join(baseDir, skillName, "SKILL.md");
    try {
      const stat = await fs.promises.lstat(path.join(baseDir, skillName));
      if (stat.isSymbolicLink()) continue; // Skip symlinks
      return await fs.promises.readFile(filePath, "utf-8");
    } catch {
      continue;
    }
  }

  return null;
}
