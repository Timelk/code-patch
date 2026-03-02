export interface SkillFrontmatter {
  readonly name: string;
  readonly description?: string;
  readonly metadata?: {
    readonly internal?: boolean;
    readonly [key: string]: unknown;
  };
}

export interface Skill {
  /** Skill name from frontmatter (or directory name fallback) */
  readonly name: string;
  /** Description from frontmatter */
  readonly description: string;
  /** Full markdown body (without frontmatter) */
  readonly content: string;
  /** Raw file content (frontmatter + body) */
  readonly rawContent: string;
  /** Absolute path to the SKILL.md file */
  readonly filePath: string;
  /** Which agent directory this skill was found in */
  readonly sourceAgent: string;
  /** Whether this file is a symlink */
  readonly isSymlink: boolean;
  /** Parsed frontmatter metadata */
  readonly metadata: Record<string, unknown>;
}

export interface SyncResult {
  readonly skillName: string;
  readonly targetAgent: string;
  readonly success: boolean;
  readonly mode: "symlink" | "copy";
  readonly error?: string;
}

export interface SyncReport {
  readonly results: readonly SyncResult[];
  readonly timestamp: number;
}
