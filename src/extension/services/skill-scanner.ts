import * as fs from "fs";
import * as path from "path";
import matter from "gray-matter";
import type { Skill, SkillFrontmatter } from "../types/skill";
import type { AgentConfig } from "../types/agent";
import { AGENT_REGISTRY } from "../types/agent";
import { resolveSkillsDir, resolveOwnSkillsDir } from "./agent-detector";

/**
 * Parses a single SKILL.md file into a Skill object.
 */
async function parseSkillFile(
  filePath: string,
  sourceAgent: string
): Promise<Skill | null> {
  try {
    const rawContent = await fs.promises.readFile(filePath, "utf-8");
    const { data, content } = matter(rawContent);
    const frontmatter = data as Partial<SkillFrontmatter>;

    const dirName = path.basename(path.dirname(filePath));
    const name = frontmatter.name || dirName;

    // Check if the skill *directory* is a symlink (not just the file)
    let isSymlink = false;
    try {
      const dirStat = await fs.promises.lstat(path.dirname(filePath));
      isSymlink = dirStat.isSymbolicLink();
    } catch {
      // ignore
    }

    return {
      name,
      description: frontmatter.description || "",
      content: content.trim(),
      rawContent,
      filePath,
      sourceAgent,
      isSymlink,
      metadata: (frontmatter.metadata as Record<string, unknown>) || {},
    };
  } catch (error) {
    console.error(`[vibe-rules] Failed to parse skill file ${filePath}:`, error);
    return null;
  }
}

/**
 * Scans a single directory for SKILL.md files.
 * Looks for pattern: {skillsDir}/{skill-name}/SKILL.md
 */
async function scanDirectory(
  dir: string,
  sourceAgent: string
): Promise<readonly Skill[]> {
  try {
    await fs.promises.access(dir, fs.constants.F_OK);
  } catch {
    return [];
  }

  const skills: Skill[] = [];

  try {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });

    const parsePromises = entries
      .filter((entry) => entry.isDirectory() || entry.isSymbolicLink())
      .map(async (entry) => {
        const skillMdPath = path.join(dir, entry.name, "SKILL.md");
        try {
          await fs.promises.access(skillMdPath, fs.constants.F_OK);
          return parseSkillFile(skillMdPath, sourceAgent);
        } catch {
          return null;
        }
      });

    const results = await Promise.all(parsePromises);
    for (const skill of results) {
      if (skill !== null) {
        skills.push(skill);
      }
    }
  } catch {
    // directory not readable
  }

  return skills;
}

/**
 * Scans all agent skill directories for the given scope.
 * Deduplicates universal agents sharing `.agents/skills/`.
 * When agentFilter is undefined ("All"), scans both global and project scopes
 * to show a unified skill list with source information.
 */
export async function scanSkills(
  scope: "global" | "project",
  workspaceRoot?: string,
  agentFilter?: string
): Promise<readonly Skill[]> {
  const agents: readonly AgentConfig[] = agentFilter
    ? AGENT_REGISTRY.filter((a) => a.name === agentFilter)
    : AGENT_REGISTRY;

  const scannedDirs = new Set<string>();
  const allSkills: Skill[] = [];

  // Always respect the scope parameter — "All" mode shows all agents within the selected scope
  const scopes: Array<"global" | "project"> = [scope];

  for (const s of scopes) {
    for (const agent of agents) {
      // Scan the agent's read directory (shared .agents/skills/ for universal agents)
      const dir = resolveSkillsDir(agent, s, workspaceRoot);
      if (dir && !scannedDirs.has(dir)) {
        scannedDirs.add(dir);
        const skills = await scanDirectory(dir, agent.name);
        allSkills.push(...skills);
      }

      // Also scan the agent's own directory (e.g. .copilot/skills/) —
      // sync writes here, so it may contain skills not in the shared dir
      const ownDir = resolveOwnSkillsDir(agent, s, workspaceRoot);
      if (ownDir && !scannedDirs.has(ownDir)) {
        scannedDirs.add(ownDir);
        const skills = await scanDirectory(ownDir, agent.name);
        allSkills.push(...skills);
      }
    }
  }

  // When a specific agent is selected, deduplicate by name (shared dirs may produce dupes).
  // In "All" mode (no agentFilter), keep every occurrence so users can see
  // which agents have which skills — the badge makes each entry distinguishable.
  if (agentFilter) {
    const seen = new Set<string>();
    const unique: Skill[] = [];
    for (const skill of allSkills) {
      if (!seen.has(skill.name)) {
        seen.add(skill.name);
        unique.push(skill);
      }
    }
    return unique.sort((a, b) => a.name.localeCompare(b.name));
  }

  // All mode: sort by name first, then by sourceAgent for grouping
  return allSkills.sort((a, b) =>
    a.name.localeCompare(b.name) || a.sourceAgent.localeCompare(b.sourceAgent)
  );
}

/**
 * Reads a single skill by name from the given scope.
 */
export async function getSkillByName(
  name: string,
  scope: "global" | "project",
  workspaceRoot?: string
): Promise<Skill | null> {
  const skills = await scanSkills(scope, workspaceRoot);
  return skills.find((s) => s.name === name) ?? null;
}
