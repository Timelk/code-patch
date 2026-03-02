import * as fs from "fs";
import * as path from "path";
import matter from "gray-matter";
import type { Skill, SkillFrontmatter } from "../types/skill";
import type { AgentConfig } from "../types/agent";
import { AGENT_REGISTRY } from "../types/agent";
import { resolveSkillsDir } from "./agent-detector";

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
    console.error(`[code-patch] Failed to parse skill file ${filePath}:`, error);
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

  // When "All" (no agent filter), scan both scopes to show everything
  const scopes: Array<"global" | "project"> =
    !agentFilter ? ["global", "project"] : [scope];

  for (const s of scopes) {
    for (const agent of agents) {
      const dir = resolveSkillsDir(agent, s, workspaceRoot);
      if (!dir || scannedDirs.has(dir)) {
        continue;
      }
      scannedDirs.add(dir);

      const skills = await scanDirectory(dir, agent.name);
      allSkills.push(...skills);
    }
  }

  // Deduplicate by skill name (keep first occurrence)
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
