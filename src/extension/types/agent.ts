export interface AgentConfig {
  /** CLI identifier (e.g., "claude-code") */
  readonly name: string;
  /** Human-readable name (e.g., "Claude Code") */
  readonly displayName: string;
  /** Project-scoped skills directory for scanning (relative to workspace root). Universal agents use ".agents/skills" here. */
  readonly skillsDir: string;
  /** Agent-specific project-scoped directory for writing (e.g., ".codex/skills"). Used when syncing TO this specific agent. */
  readonly ownSkillsDir: string;
  /** User-wide global skills directory (absolute path, null if unsupported) */
  readonly globalSkillsDir: string | null;
  /** Whether this agent shares the universal `.agents/skills/` directory for reading */
  readonly isUniversal: boolean;
}

export interface AgentInfo extends AgentConfig {
  /** Whether this agent is detected as installed on the machine */
  readonly installed: boolean;
}

/**
 * Registry of known coding agents and their skill directory mappings.
 * Based on vercel-labs/skills agent configuration.
 */
export const AGENT_REGISTRY: readonly AgentConfig[] = [
  {
    name: "claude-code",
    displayName: "Claude Code",
    skillsDir: ".claude/skills",
    ownSkillsDir: ".claude/skills",
    globalSkillsDir: "${home}/.claude/skills",
    isUniversal: false,
  },
  {
    name: "codex",
    displayName: "Codex",
    skillsDir: ".codex/skills",
    ownSkillsDir: ".codex/skills",
    globalSkillsDir: "${home}/.codex/skills",
    isUniversal: false,
  },
  {
    name: "opencode",
    displayName: "OpenCode",
    skillsDir: ".opencode/skills",
    ownSkillsDir: ".opencode/skills",
    globalSkillsDir: "${configHome}/opencode/skills",
    isUniversal: false,
  },
  {
    name: "cursor",
    displayName: "Cursor",
    skillsDir: ".agents/skills",
    ownSkillsDir: ".cursor/skills",
    globalSkillsDir: "${home}/.cursor/skills",
    isUniversal: true,
  },
  // {
  //   name: "windsurf",
  //   displayName: "Windsurf",
  //   skillsDir: ".windsurf/skills",
  //   ownSkillsDir: ".windsurf/skills",
  //   globalSkillsDir: "${home}/.codeium/windsurf/skills",
  //   isUniversal: false,
  // },
  {
    name: "gemini-cli",
    displayName: "Gemini CLI",
    skillsDir: ".agents/skills",
    ownSkillsDir: ".gemini/skills",
    globalSkillsDir: "${home}/.gemini/skills",
    isUniversal: true,
  },
  {
    name: "github-copilot",
    displayName: "Copilot",
    skillsDir: ".agents/skills",
    ownSkillsDir: ".copilot/skills",
    globalSkillsDir: "${home}/.copilot/skills",
    isUniversal: true,
  },
  {
    name: "cline",
    displayName: "Cline",
    skillsDir: ".agents/skills",
    ownSkillsDir: ".cline/skills",
    globalSkillsDir: "${home}/.agents/skills",
    isUniversal: true,
  },
  {
    name: "roo",
    displayName: "Roo Code",
    skillsDir: ".roo/skills",
    ownSkillsDir: ".roo/skills",
    globalSkillsDir: "${home}/.roo/skills",
    isUniversal: true,
  },
  // {
  //   name: "augment",
  //   displayName: "Augment",
  //   skillsDir: ".augment/skills",
  //   ownSkillsDir: ".augment/skills",
  //   globalSkillsDir: "${home}/.augment/skills",
  //   isUniversal: false,
  // },
  // {
  //   name: "continue",
  //   displayName: "Continue",
  //   skillsDir: ".continue/skills",
  //   ownSkillsDir: ".continue/skills",
  //   globalSkillsDir: "${home}/.continue/skills",
  //   isUniversal: false,
  // },
  // {
  //   name: "goose",
  //   displayName: "Goose",
  //   skillsDir: ".goose/skills",
  //   ownSkillsDir: ".goose/skills",
  //   globalSkillsDir: "${configHome}/goose/skills",
  //   isUniversal: false,
  // },
  // {
  //   name: "kilo",
  //   displayName: "Kilo Code",
  //   skillsDir: ".kilocode/skills",
  //   ownSkillsDir: ".kilocode/skills",
  //   globalSkillsDir: "${home}/.kilocode/skills",
  //   isUniversal: false,
  // },
  // {
  //   name: "trae",
  //   displayName: "Trae",
  //   skillsDir: ".trae/skills",
  //   ownSkillsDir: ".trae/skills",
  //   globalSkillsDir: "${home}/.trae/skills",
  //   isUniversal: false,
  // },
  // {
  //   name: "amp",
  //   displayName: "Amp",
  //   skillsDir: ".agents/skills",
  //   ownSkillsDir: ".amp/skills",
  //   globalSkillsDir: "${configHome}/agents/skills",
  //   isUniversal: true,
  // },
  {
    name: "kimi-cli",
    displayName: "Kimi",
    skillsDir: ".agents/skills",
    ownSkillsDir: ".kimi/skills",
    globalSkillsDir: "${home}/.config/agents/skills",
    isUniversal: true,
  },
  // {
  //   name: "junie",
  //   displayName: "Junie",
  //   skillsDir: ".junie/skills",
  //   ownSkillsDir: ".junie/skills",
  //   globalSkillsDir: "${home}/.junie/skills",
  //   isUniversal: false,
  // },
  {
    name: "qwen-code",
    displayName: "Qwen",
    skillsDir: ".qwen/skills",
    ownSkillsDir: ".qwen/skills",
    globalSkillsDir: "${home}/.qwen/skills",
    isUniversal: false,
  },
] as const;
