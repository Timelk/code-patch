# Code Patch

Unified skill manager for AI coding agents — sync skills across Claude Code, Codex, OpenCode, Cursor, Windsurf, Gemini CLI and 19+ agents.

## Features

- **Dashboard** — Three-panel Webview UI (Sidebar + Main + Right Panel) opens as an editor tab
- **Skill Scanner** — Auto-discovers `SKILL.md` files across all agent directories
- **Sync Engine** — Copy skills between agents with one click (copy mode, safe on all platforms)
- **Batch Sync** — Multi-select skills and sync them to multiple agents at once
- **Diff Preview** — Compare skill content across agents (identical / modified / missing / symlink)
- **Sync History** — Persistent record of all sync operations (max 100 entries)
- **MCP Discovery** — Scans MCP server configurations from Claude Code, Cursor, Windsurf, VSCode
- **Agent Tab Filtering** — View skills per agent or "All" agents
- **Global / Project Scope** — Manage user-level (`~/`) or project-level (`./`) skills
- **File Watcher** — Auto-refresh when SKILL.md files change on disk
- **VSCode Settings** — Configure skill directories and enable/disable agents per user

## Supported Agents (19)

| Agent | Project Dir | Global Dir | Universal |
|-------|------------|------------|-----------|
| Claude Code | `.claude/skills/` | `~/.claude/skills/` | No |
| Codex | `.agents/skills/` | `~/.codex/skills/` | Yes |
| OpenCode | `.agents/skills/` | `~/.config/opencode/skills/` | Yes |
| Cursor | `.agents/skills/` | `~/.cursor/skills/` | Yes |
| Windsurf | `.windsurf/skills/` | `~/.codeium/windsurf/skills/` | No |
| Gemini CLI | `.agents/skills/` | `~/.gemini/skills/` | Yes |
| GitHub Copilot | `.agents/skills/` | `~/.copilot/skills/` | Yes |
| Cline | `.agents/skills/` | `~/.agents/skills/` | Yes |
| Roo Code | `.roo/skills/` | `~/.roo/skills/` | No |
| Augment | `.augment/skills/` | `~/.augment/skills/` | No |
| Continue | `.continue/skills/` | `~/.continue/skills/` | No |
| Goose | `.goose/skills/` | `~/.config/goose/skills/` | No |
| Kilo Code | `.kilocode/skills/` | `~/.kilocode/skills/` | No |
| Trae | `.trae/skills/` | `~/.trae/skills/` | No |
| Amp | `.agents/skills/` | `~/.config/agents/skills/` | Yes |
| Kimi Code CLI | `.agents/skills/` | `~/.config/agents/skills/` | Yes |
| Junie | `.junie/skills/` | `~/.junie/skills/` | No |
| Qwen Code | `.qwen/skills/` | `~/.qwen/skills/` | No |

> Universal agents share the `.agents/skills/` directory at project level.

## Installation

```bash
# Clone and install
git clone <repo-url> code-patch
cd code-patch
npm install

# Build
npm run build

# Package as VSIX
npm run package
```

Then install the `.vsix` file in VSCode via `Extensions: Install from VSIX...`.

## Usage

1. Open any file in VSCode
2. Click the **Code Patch** icon in the editor title bar (top-right)
3. The dashboard opens as an editor tab
4. Select an agent tab to filter skills
5. Click a skill to preview its content
6. Click **Sync** to copy the skill to other agents
7. Click **Diff** to compare across agents
8. Click **History** to view past sync operations

## Settings

Configure per-agent behavior in VSCode Settings (`Ctrl+,`):

```jsonc
{
  "codePatch.agents": {
    "claude-code": {
      "enabled": true,
      "skillsDir": ".claude/skills",
      "globalSkillsDir": "${home}/.claude/skills"
    },
    "windsurf": {
      "enabled": false  // Disable Windsurf management
    },
    "cursor": {
      "globalSkillsDir": "/custom/path/to/cursor/skills"
    }
  }
}
```

| Setting | Type | Description |
|---------|------|-------------|
| `codePatch.agents.<name>.enabled` | `boolean` | Enable/disable agent management (default: `true`) |
| `codePatch.agents.<name>.skillsDir` | `string` | Override project-level skills directory |
| `codePatch.agents.<name>.globalSkillsDir` | `string` | Override global skills directory (supports `${home}`, `${configHome}`) |

## Skill Format

Skills follow the [vercel-labs/skills](https://github.com/vercel-labs/skills) `SKILL.md` format:

```markdown
---
name: my-skill
description: What this skill does
---

# Skill Title

Skill instructions and prompt content here...
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Extension Host | TypeScript + VSCode API |
| Webview UI | Vite + React + TypeScript |
| Styling | Tailwind CSS + VSCode CSS Variables |
| Markdown | react-markdown + remark-gfm |
| Frontmatter | gray-matter |

## Development

```bash
# Watch extension (terminal 1)
npm run watch:extension

# Dev webview with HMR (terminal 2)
npm run dev:webview

# Press F5 in VSCode to launch Extension Development Host
```

## License

MIT
