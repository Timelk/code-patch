# Vibe Rules

[English](#vibe-rules) | [中文](./README_zh.md)

**One dashboard to manage all your AI coding agent skills.**

Vibe Rules is a VSCode extension that lets you browse, sync, and manage SKILL.md files across 18 AI coding agents — Claude Code, Cursor, Codex, Gemini CLI, Windsurf, GitHub Copilot, and more.

Write a skill once, sync it everywhere.

## Why Vibe Rules?

Every AI coding agent has its own skills directory. If you use more than one agent, you end up manually copying SKILL.md files between `~/.claude/skills/`, `~/.cursor/skills/`, `~/.codex/skills/`... it gets old fast.

Vibe Rules gives you a single dashboard to see all your skills across all agents, and sync them with one click.

## Features

**Skill Management**
- Auto-discover all SKILL.md files across 18 agents
- View and edit skills with Markdown preview
- Create new skills from the dashboard
- Global (`~/`) and Project (`./`) scope switching

**One-Click Sync**
- Copy skills between agents instantly
- Batch sync — select multiple skills, sync to multiple agents
- Diff preview — compare skill versions across agents before syncing
- Sync history — track all past sync operations

![Skill Management & Sync](skills.gif)

**Skill Marketplace**
- Browse skills from SkillHub, SkillsMP, and other online sources
- Install remote skills directly to any agent

**MCP Discovery**
- Scan and view all MCP server configurations across your agents in one place

**VibeTips**
- Curated vibe coding tips, hot frameworks, and featured skills/MCPs
- Bilingual support (English / Chinese)

![VibeTips](vibetips.gif)

## Supported Agents

Claude Code, Codex, OpenCode, Cursor, Windsurf, Gemini CLI, GitHub Copilot, Cline, Roo Code, Augment, Continue, Goose, Kilo Code, Trae, Amp, Kimi Code CLI, Junie, Qwen Code

## Getting Started

1. Install the extension in VSCode
2. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
3. Run **Vibe Rules: Open Dashboard**
4. Your skills from all detected agents appear automatically

## Quick Tour

- **Agent tabs** at the top let you filter skills by agent, or view all
- **Sidebar** lists your skills with search and multi-select
- **Main panel** shows skill content with Markdown rendering
- **Sync button** copies a skill to any other agent you choose
- **Diff button** shows how a skill differs across agents
- **VibeTips tab** gives you curated tips, tools, and skill recommendations

## Settings

Customize agent directories or disable specific agents in VSCode Settings:

```jsonc
{
  "vibeRules.agents": {
    "claude-code": {
      "enabled": true,
      "globalSkillsDir": "${home}/.claude/skills"
    },
    "windsurf": {
      "enabled": false
    }
  }
}
```

## License

MIT
