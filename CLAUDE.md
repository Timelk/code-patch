# Code Patch - AI Context

## Project Overview

Code Patch is a VSCode extension that manages and syncs AI coding agent skills (SKILL.md files) across 19+ agents. It provides a Webview dashboard (Vite + React) opened as an editor tab.

## Architecture

```
src/
├── extension/              # VSCode Extension Host (Node.js, TypeScript)
│   ├── extension.ts        # Entry: activate/deactivate, registers 3 commands
│   ├── providers/
│   │   └── DashboardViewProvider.ts  # WebviewPanel manager, 14 message handlers
│   ├── services/
│   │   ├── agent-detector.ts   # Detects installed agents, reads VSCode settings overrides
│   │   ├── skill-scanner.ts    # Scans SKILL.md files, gray-matter parsing, deduplication
│   │   ├── sync-engine.ts      # Copy-based sync (no symlinks), snapshot-safe
│   │   ├── diff-engine.ts      # Compares skill across agents
│   │   ├── sync-history.ts     # Persistent sync log (~/.code-patch/sync-history.json)
│   │   ├── mcp-scanner.ts      # MCP config discovery (5 known locations)
│   │   └── file-watcher.ts     # SKILL.md change detection
│   └── types/
│       ├── agent.ts            # AgentConfig, AGENT_REGISTRY (19 agents)
│       ├── skill.ts            # Skill, SyncResult, SyncReport
│       └── messages.ts         # Extension <-> Webview message protocol
└── webview/                # Vite + React (Tailwind CSS)
    ├── App.tsx             # Root state orchestrator (~16KB)
    ├── main.tsx            # React entry point
    ├── index.html          # HTML template with CSP nonce
    ├── styles/
    │   └── index.css       # Tailwind + VSCode CSS variable aliases
    ├── components/
    │   ├── layout/         # Header, Sidebar, MainContent, RightPanel
    │   ├── skill/          # SkillList, SkillDetail, SyncDialog, CreateSkillDialog,
    │   │                     DiffPreview, SyncHistory
    │   ├── agent/          # AgentTabs, AgentStatusBadge
    │   ├── mcp/            # McpList
    │   ├── settings/       # SettingsPanel
    │   └── common/         # SearchInput, ScopeToggle, ConfirmDialog, ResizeHandle
    ├── hooks/              # useSkills, useAgents, useVSCodeApi
    └── services/           # vscode-message (postMessage bridge)
```

## Key Design Decisions

- **No symlinks** — All sync uses copy mode for cross-platform safety (WSL/Windows)
- **Snapshot-based sync** — Creates a temp copy before writing to avoid race conditions
- **Agent-scoped operations** — Edit/delete operate on the selected agent tab's own directory, not a shared canonical
- **Dual directory system** — Universal agents read from shared `.agents/skills/`, but always write to their exclusive directory
- **WebviewPanel** (not WebviewView) — Dashboard opens as editor tab, not sidebar
- **VSCode CSS Variables** — All colors use `var(--vscode-*)` via `var(--cp-*)` aliases, zero hardcoded colors for main theme
- **Settings-driven** — Agent dirs and enabled/disabled configurable via `codePatch.agents` in VSCode settings
- **Portal-based context menu** — Escapes overflow clipping in SkillList

## Build

```bash
npm run build                    # Build both extension + webview
npm run build:extension          # tsc -p tsconfig.extension.json
npm run build:webview            # vite build
npm run dev:webview              # Vite dev server with HMR
npm run watch:extension          # TypeScript watch mode
npm run lint                     # ESLint
npm run package                  # Package as VSIX
```

- Extension output: `dist/extension/`
- Webview output: `dist/webview/` (bundle ~335KB)
- Two separate tsconfig files: `tsconfig.extension.json` (Node/CommonJS) and `tsconfig.json` (DOM/React/ESNext)
- No test suite — development via VSCode Extension Development Host (F5)

## Supported Agents (19)

Defined in `src/extension/types/agent.ts` as `AGENT_REGISTRY`:

| Agent | Type | Notes |
|-------|------|-------|
| Claude Code | Standard | `.claude/commands/` |
| Codex | Standard | `.codex/skills/` |
| OpenCode | Standard | `.opencode/skills/` |
| Cursor | Universal | Reads `.agents/skills/` |
| Windsurf | Standard | `.windsurf/skills/` |
| Gemini CLI | Universal | Reads `.agents/skills/` |
| GitHub Copilot | Universal | Reads `.agents/skills/` |
| Cline | Universal | Reads `.agents/skills/` |
| Roo | Standard | `.roo/skills/` |
| Augment | Standard | `.augment/skills/` |
| Continue | Standard | `.continue/skills/` |
| Goose | Standard | `.goose/skills/` |
| Kilo Code | Standard | `.kilo/skills/` |
| Trae | Standard | `.trae/skills/` |
| Amp | Universal | Reads `.agents/skills/` |
| Kimi CLI | Universal | Reads `.agents/skills/` |
| Junie | Standard | `.junie/skills/` |
| Qwen Code | Standard | `.qwen/skills/` |
| (+ more) | — | Registry extensible |

**Universal agents** share `.agents/skills/` as their reading directory but each has an exclusive write directory. `isUniversal: true` in `AgentConfig`.

## Message Protocol

Extension ↔ Webview communicate via `postMessage`. All types defined in `src/extension/types/messages.ts`.

### Webview → Extension

| Type | Payload | Purpose |
|------|---------|---------|
| `webview:ready` | — | Request initial data load (agents + skills) |
| `skills:load` | `{ scope, agentFilter }` | Reload skills for scope/filter change |
| `agents:detect` | — | Re-detect installed agents |
| `sync:execute` | `{ skillName, targetAgents, scope }` | Sync single skill |
| `sync:batch` | `{ skillNames, targetAgents, scope }` | Sync multiple skills |
| `skill:create` | `{ name, description, content, agentId }` | Create new skill in agent dir |
| `skill:delete` | `{ filePath }` | Delete skill directory |
| `skill:openInEditor` | `{ filePath }` | Open file in VSCode editor |
| `skill:checkAgents` | `{ skillName, scope }` | Find which agents have the skill |
| `mcps:load` | — | Scan MCP server configs |
| `diff:request` | `{ skillName, scope }` | Compare skill across agents |
| `history:load` | — | Load sync history |
| `history:clear` | — | Clear sync history |
| `settings:open` | — | Open VSCode settings UI |

### Extension → Webview

| Type | Payload | Purpose |
|------|---------|---------|
| `skills:loaded` | `Skill[]` | Skill list response |
| `agents:detected` | `AgentInfo[]` | Agent detection response |
| `sync:result` | `SyncReport` | Sync operation result |
| `skill:fileChanged` | `{ filePath, event }` | File watcher notification |
| `skill:agentsWithSkill` | `AgentInfo[]` | Agents that have the skill |
| `mcps:loaded` | `McpServer[]` | MCP server list |
| `diff:result` | `DiffResult[]` | Skill comparison across agents |
| `history:loaded` | `SyncHistoryEntry[]` | Sync history (up to 100 entries) |

## VSCode Commands

Registered in `extension.ts` and declared in `package.json`:

| Command | ID | Description |
|---------|----|-------------|
| Open Dashboard | `codePatch.openDashboard` | Opens the webview panel |
| Sync Skill | `codePatch.syncSkill` | Sync active skill |
| Refresh Skills | `codePatch.refreshSkills` | Re-scan and reload |

## Settings Schema

Via `codePatch.agents` in VSCode settings (per-agent overrides):

```json
{
  "codePatch.agents": {
    "claude-code": {
      "enabled": true,
      "skillsDir": "/custom/path",
      "globalSkillsDir": "~/.custom/path"
    }
  }
}
```

- `enabled`: Include/exclude agent from detection
- `skillsDir`: Override project-level skills directory
- `globalSkillsDir`: Override global skills directory
- Path templates: `${home}` and `${configHome}` are expanded

## Skill File Format

SKILL.md files use YAML frontmatter (parsed with `gray-matter`):

```markdown
---
name: My Skill Name
description: Brief description of what this skill does
tags: [optional, tags]
---

# Skill content in Markdown

Full instructions for the AI agent...
```

- Stored as `SKILL.md` inside a named subdirectory (e.g., `my-skill/SKILL.md`)
- Name auto-slugified: lowercase, alphanumeric, dashes only
- `rawContent` preserves full file including frontmatter; `content` is body only

## Service Details

### agent-detector.ts
- `detectAgents()` → all agents with `installed` status + settings overrides
- `resolveSkillsDir(agent)` → reading directory (`.agents/skills/` for universal)
- `resolveOwnSkillsDir(agent)` → exclusive writing directory
- `findAgentsWithSkill(skillName, scope, workspaceRoot)` → agents that have the skill

### skill-scanner.ts
- `scanSkills(scope, workspaceRoot, agentFilter?)` → deduplicated, sorted `Skill[]`
- Detects symlinks via `lstat()`
- Auto-deduplicates by skill name (keeps first occurrence)
- "All" scope scans both global + project directories

### sync-engine.ts
- Snapshot pattern: creates temp copy → writes to target → cleans up
- Removes existing symlinks/directories at target before copying
- Returns `SyncReport` with per-agent success/error detail

### diff-engine.ts
- Canonical source: prefers `.agents/skills/`, falls back to first found
- States: `identical` | `modified` | `missing` | `symlink`
- Includes 300-char content snippets for modified entries

### sync-history.ts
- File: `~/.code-patch/sync-history.json`
- Max 100 entries (auto-trimmed on prepend)
- Each entry: `id` (UUID), `skillName`, `targetAgents[]`, `mode`, `successCount`, `failCount`, `timestamp`

### mcp-scanner.ts
- Scans 5 locations: Claude Code (project), Claude Code (user), Cursor, Windsurf, VSCode
- Parses both `mcpServers` and `servers` JSON keys
- Deduplicates by `${source}:${name}`

## Component Hierarchy

```
App (state orchestrator)
├── Header
│   ├── AgentTabs (Claude Code | Codex | OpenCode | All)
│   └── ScopeToggle (Global | Project)
├── Sidebar
│   ├── SearchInput
│   ├── SkillList (context menu, multi-select, checkboxes)
│   └── McpList (grouped by source)
├── MainContent
│   ├── Toolbar (Sync, Diff, History, Delete)
│   └── SkillDetail (react-markdown + remark-gfm)
├── RightPanel
│   ├── Stats (skills, agents, syncs, last sync)
│   ├── Active Features
│   └── Detected Agents (AgentStatusBadge per agent)
└── Modals (portals)
    ├── SyncDialog (dropdown, installed agents without skill)
    ├── CreateSkillDialog (name, description, content form)
    ├── DiffPreview (per-agent status + snippets)
    ├── SyncHistory (last 100 syncs, clear all)
    ├── ConfirmDialog (delete confirmation, supports multi-item list)
    └── SettingsPanel (agents, sync mode, about, open JSON settings)
```

## Conventions

- All interfaces use `readonly` (immutable pattern)
- React components use `FC<Props>` with named exports
- State updates return new objects (no mutation)
- Error handling: `try/catch` with `console.error` logging
- CSS: Tailwind utilities + inline `style={{ color: "var(--cp-*)" }}`
- `ResizeHandle` component provides draggable panel resizing (reports `deltaX`)
- `useVSCodeApi` hook wraps `acquireVsCodeApi()` singleton + typed message handling

## Dependencies

**Runtime:**
- `gray-matter` 4.0.3 — YAML frontmatter parsing
- `react-markdown` 9.0.1 — Markdown rendering in SkillDetail
- `remark-gfm` 4.0.0 — GitHub Flavored Markdown support

**Dev:**
- TypeScript 5.3.3
- Vite 5.0.12
- React 18.2.0 + React-DOM
- Tailwind CSS 3.4.1 + PostCSS + Autoprefixer
- `@types/vscode` 1.85.0

## File Locations Quick Reference

| Purpose | Path |
|---------|------|
| Extension entry | `src/extension/extension.ts` |
| Webview panel manager | `src/extension/providers/DashboardViewProvider.ts` |
| Agent registry (19 agents) | `src/extension/types/agent.ts` |
| Message types | `src/extension/types/messages.ts` |
| Skill types | `src/extension/types/skill.ts` |
| Root React component | `src/webview/App.tsx` |
| CSS variables | `src/webview/styles/index.css` |
| postMessage bridge | `src/webview/services/vscode-message.ts` |
| Vite config | `vite.config.ts` |
| Tailwind config | `tailwind.config.cjs` |
| Extension tsconfig | `tsconfig.extension.json` |
| Webview tsconfig | `tsconfig.json` |
| Sync history file | `~/.code-patch/sync-history.json` |
