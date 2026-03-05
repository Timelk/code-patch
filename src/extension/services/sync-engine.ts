import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import * as crypto from "crypto";
import type { AgentConfig } from "../types/agent";
import type { SyncResult, SyncReport } from "../types/skill";
import { AGENT_REGISTRY } from "../types/agent";
import { resolveSkillsDir, resolveOwnSkillsDir } from "./agent-detector";

/**
 * Ensures a directory exists, creating it recursively if needed.
 */
async function ensureDir(dir: string): Promise<void> {
  await fs.promises.mkdir(dir, { recursive: true });
}

/**
 * Copies a directory recursively.
 */
async function copyDir(src: string, dest: string): Promise<void> {
  await ensureDir(dest);
  const entries = await fs.promises.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.promises.copyFile(srcPath, destPath);
    }
  }
}

/**
 * Find the source skill directory from any agent that has it.
 */
async function findSkillSource(
  skillName: string,
  scope: "global" | "project",
  workspaceRoot: string | undefined
): Promise<string | null> {
  for (const agent of AGENT_REGISTRY) {
    const agentDir = resolveSkillsDir(agent, scope, workspaceRoot);
    if (!agentDir) continue;

    const skillDir = path.join(agentDir, skillName);
    const skillFile = path.join(skillDir, "SKILL.md");

    try {
      await fs.promises.access(skillFile, fs.constants.F_OK);
      // Resolve symlinks to find the real directory
      const realPath = await fs.promises.realpath(skillDir);
      return realPath;
    } catch {
      continue;
    }
  }
  return null;
}

/**
 * Syncs a single skill to a target agent directory using copy.
 * Skips if source and target resolve to the same path.
 */
async function syncToAgent(
  skillName: string,
  sourceDir: string,
  agent: AgentConfig,
  scope: "global" | "project",
  workspaceRoot: string | undefined
): Promise<SyncResult> {
  // Use agent's OWN directory (not shared .agents/skills/) for writing
  const targetBase = resolveOwnSkillsDir(agent, scope, workspaceRoot);

  if (!targetBase) {
    return {
      skillName,
      targetAgent: agent.name,
      success: false,
      mode: "copy",
      error: `Cannot resolve skills directory for ${agent.displayName}`,
    };
  }

  const targetDir = path.join(targetBase, skillName);

  try {
    // Resolve both paths to avoid copying over the source
    let targetReal: string | null = null;
    try {
      targetReal = await fs.promises.realpath(targetDir);
    } catch {
      // Target doesn't exist yet — that's fine
    }

    const sourceReal = await fs.promises.realpath(sourceDir);

    // Skip if source and target are the same directory
    if (targetReal && targetReal === sourceReal) {
      return {
        skillName,
        targetAgent: agent.name,
        success: true,
        mode: "copy",
      };
    }

    // Remove existing target (symlink or directory)
    try {
      const stat = await fs.promises.lstat(targetDir);
      if (stat.isSymbolicLink()) {
        await fs.promises.unlink(targetDir);
      } else if (stat.isDirectory()) {
        await fs.promises.rm(targetDir, { recursive: true });
      }
    } catch {
      // Target doesn't exist yet — that's fine
    }

    // Copy skill to target
    await ensureDir(targetBase);
    await copyDir(sourceDir, targetDir);

    return {
      skillName,
      targetAgent: agent.name,
      success: true,
      mode: "copy",
    };
  } catch (err) {
    return {
      skillName,
      targetAgent: agent.name,
      success: false,
      mode: "copy",
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Syncs a skill from its source to one or more target agents using copy.
 */
export async function syncSkill(
  skillName: string,
  targetAgentNames: readonly string[],
  scope: "global" | "project",
  workspaceRoot: string | undefined
): Promise<SyncReport> {
  // Find the source skill from any agent that has it
  const sourceDir = await findSkillSource(skillName, scope, workspaceRoot);

  if (!sourceDir) {
    return {
      results: targetAgentNames.map((name) => ({
        skillName,
        targetAgent: name,
        success: false,
        mode: "copy" as const,
        error: `Skill "${skillName}" not found in any agent directory`,
      })),
      timestamp: Date.now(),
    };
  }

  // Snapshot the source content once to avoid race conditions
  // when multiple universal agents share the same directory
  const snapshotDir = sourceDir + ".sync-snapshot-" + crypto.randomBytes(8).toString("hex");
  try {
    await copyDir(sourceDir, snapshotDir);
  } catch (err) {
    return {
      results: targetAgentNames.map((name) => ({
        skillName,
        targetAgent: name,
        success: false,
        mode: "copy" as const,
        error: `Failed to snapshot source: ${err instanceof Error ? err.message : String(err)}`,
      })),
      timestamp: Date.now(),
    };
  }

  // Sync to each target agent in parallel (from snapshot)
  const targetAgents = AGENT_REGISTRY.filter((a) =>
    targetAgentNames.includes(a.name)
  );

  const results = await Promise.all(
    targetAgents.map((agent) =>
      syncToAgent(skillName, snapshotDir, agent, scope, workspaceRoot)
    )
  );

  // Clean up snapshot
  try {
    await fs.promises.rm(snapshotDir, { recursive: true });
  } catch {
    // Best-effort cleanup
  }

  return {
    results,
    timestamp: Date.now(),
  };
}
