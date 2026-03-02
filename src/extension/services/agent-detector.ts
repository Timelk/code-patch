import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import * as vscode from "vscode";
import { AgentConfig, AgentInfo, AGENT_REGISTRY } from "../types/agent";

/**
 * Per-agent settings from VSCode configuration.
 */
interface AgentSettingsOverride {
  readonly enabled?: boolean;
  readonly skillsDir?: string;
  readonly globalSkillsDir?: string;
}

/**
 * Resolves path template variables like ${home} and ${configHome}.
 */
function resolvePath(template: string): string {
  const home = os.homedir();
  const configHome =
    process.env["XDG_CONFIG_HOME"] || path.join(home, ".config");

  return template
    .replace(/\$\{home\}/g, home)
    .replace(/\$\{configHome\}/g, configHome);
}

/**
 * Reads per-agent settings overrides from VSCode configuration.
 */
function getAgentSettings(): Record<string, AgentSettingsOverride> {
  const config = vscode.workspace.getConfiguration("codePatch");
  return (config.get<Record<string, AgentSettingsOverride>>("agents") ?? {});
}

/**
 * Apply settings overrides to an agent config.
 */
function applyOverrides(
  agent: AgentConfig,
  override: AgentSettingsOverride | undefined
): AgentConfig {
  if (!override) return agent;
  return {
    ...agent,
    skillsDir: override.skillsDir ?? agent.skillsDir,
    ownSkillsDir: override.skillsDir ?? agent.ownSkillsDir,
    globalSkillsDir: override.globalSkillsDir ?? agent.globalSkillsDir,
  };
}

/**
 * Checks if an agent is installed by probing its global skills directory itself
 * (not the parent), reducing false positives.
 */
async function isAgentInstalled(agent: AgentConfig): Promise<boolean> {
  if (agent.globalSkillsDir === null) {
    return false;
  }

  const resolvedDir = resolvePath(agent.globalSkillsDir);

  try {
    await fs.promises.access(resolvedDir, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Detects all coding agents, applying settings overrides and enabled/disabled filter.
 */
export async function detectAgents(): Promise<readonly AgentInfo[]> {
  const settings = getAgentSettings();

  const results = await Promise.all(
    AGENT_REGISTRY.map(async (baseAgent): Promise<AgentInfo | null> => {
      const override = settings[baseAgent.name];

      // Skip disabled agents
      if (override?.enabled === false) {
        return null;
      }

      const agent = applyOverrides(baseAgent, override);
      const installed = await isAgentInstalled(agent);
      return { ...agent, installed };
    })
  );

  return results.filter((a): a is AgentInfo => a !== null);
}

/**
 * Returns only installed agents (respecting settings).
 */
export async function getInstalledAgents(): Promise<readonly AgentInfo[]> {
  const all = await detectAgents();
  return all.filter((a) => a.installed);
}

/**
 * Resolves the actual skills directory path for an agent, applying settings overrides.
 */
export function resolveSkillsDir(
  agent: AgentConfig,
  scope: "global" | "project",
  workspaceRoot?: string
): string | null {
  const settings = getAgentSettings();
  const override = settings[agent.name];
  const effectiveAgent = applyOverrides(agent, override);

  if (scope === "global") {
    return effectiveAgent.globalSkillsDir ? resolvePath(effectiveAgent.globalSkillsDir) : null;
  }

  if (!workspaceRoot) {
    return null;
  }

  return path.join(workspaceRoot, effectiveAgent.skillsDir);
}

/**
 * Resolves the agent's OWN (dedicated) skills directory for writing/syncing.
 * Unlike resolveSkillsDir, this always returns the agent-specific directory,
 * never the shared `.agents/skills/` for universal agents.
 */
export function resolveOwnSkillsDir(
  agent: AgentConfig,
  scope: "global" | "project",
  workspaceRoot?: string
): string | null {
  const settings = getAgentSettings();
  const override = settings[agent.name];
  const effectiveAgent = applyOverrides(agent, override);

  if (scope === "global") {
    return effectiveAgent.globalSkillsDir ? resolvePath(effectiveAgent.globalSkillsDir) : null;
  }

  if (!workspaceRoot) {
    return null;
  }

  return path.join(workspaceRoot, effectiveAgent.ownSkillsDir);
}

/**
 * Check which agents already have a specific skill.
 */
export async function findAgentsWithSkill(
  skillName: string,
  scope: "global" | "project",
  workspaceRoot?: string
): Promise<readonly string[]> {
  const agents = await detectAgents();
  const result: string[] = [];

  for (const agent of agents) {
    if (!agent.installed) continue;
    const dir = resolveSkillsDir(agent, scope, workspaceRoot);
    if (!dir) continue;

    const skillFile = path.join(dir, skillName, "SKILL.md");
    try {
      await fs.promises.access(skillFile, fs.constants.F_OK);
      result.push(agent.name);
    } catch {
      // Skill not present for this agent
    }
  }

  return result;
}

export { resolvePath };
