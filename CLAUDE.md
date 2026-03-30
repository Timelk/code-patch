# Vibe Rules - AI Context

## Project Overview

Vibe Rules is a VSCode extension that manages and syncs AI coding agent skills (SKILL.md files) across 18 agents. It provides a Webview dashboard (Vite + React) opened as an editor tab, with local skill management, cross-agent sync, and remote skill marketplace integration.

## Architecture

```
src/
├── extension/              # VSCode Extension Host (Node.js, TypeScript)
│   ├── extension.ts        # Entry: activate/deactivate, registers 3 commands
│   ├── providers/
│   │   └── DashboardViewProvider.ts  # WebviewPanel manager, message handler (17 cases)
│   │                                 # Also handles remote skill install/remove/search
│   ├── services/
│   │   ├── agent-detector.ts   # Detects installed agents, reads VSCode settings overrides
│   │   ├── skill-scanner.ts    # Scans SKILL.md files, gray-matter parsing, dedup by name
│   │   ├── sync-engine.ts      # Copy-based sync (snapshot → parallel write), source-safe
│   │   ├── diff-engine.ts      # Compares skill content across agents (canonical-first lookup)
│   │   ├── sync-history.ts     # Persistent sync log (~/.vibe-rules/sync-history.json, max 100)
│   │   ├── mcp-scanner.ts      # MCP config discovery (5 known locations)
│   │   └── file-watcher.ts     # SKILL.md change detection via FileSystemWatcher
│   └── types/
│       ├── agent.ts            # AgentConfig, AGENT_REGISTRY (18 agents)
│       ├── skill.ts            # Skill, SkillFrontmatter, SyncResult, SyncReport
│       └── messages.ts         # Extension <-> Webview message protocol (full type union)
└── webview/                # Vite + React (Tailwind CSS)
    ├── App.tsx             # Root state orchestrator (~595 lines, all top-level state)
    ├── components/
    │   ├── layout/         # Header, Sidebar, MainContent, RightPanel
    │   ├── skill/          # SkillList, SkillDetail, SyncDialog, CreateSkillDialog,
    │   │                     DiffPreview, SyncHistory, RemoteSkillPanel
    │   ├── agent/          # AgentTabs, AgentStatusBadge
    │   ├── mcp/            # McpList
    │   ├── settings/       # SettingsPanel
    │   └── common/         # SearchInput, ScopeToggle, ConfirmDialog, ResizeHandle
    ├── hooks/              # useSkills, useAgents, useVSCodeApi
    └── services/
        ├── vscode-message.ts      # postMessage bridge
        └── remote-skill-api.ts    # Remote source definitions + request helpers
```

## Key Design Decisions

- **No symlinks** — All sync uses copy mode for cross-platform safety (WSL/Windows)
- **Snapshot before sync** — `sync-engine.ts` creates a UUID-named snapshot of source before parallel writes, preventing race conditions when multiple universal agents share a directory
- **Agent-scoped operations** — Edit/delete operate on the selected agent tab's directory, not a shared canonical
- **Path traversal protection** — `isPathInsideSkillsDirs()` validates all file open/delete paths against known skill directories
- **WebviewPanel** (not WebviewView) — Dashboard opens as editor tab, not sidebar; `retainContextWhenHidden: true`
- **VSCode CSS Variables** — All colors use `var(--vscode-*)` via `var(--cp-*)` aliases, zero hardcoded colors for main theme
- **Settings-driven** — Agent dirs and enabled/disabled configurable via `vibeRules.agents` in VSCode settings
- **CSP-safe remote fetching** — All HTTP requests go through Extension Host, never from Webview directly

## Agent System

18 agents in two categories:

- **Independent agents** (10): Claude Code, Codex, OpenCode, Windsurf, Roo, Augment, Continue, Goose, Trae, Junie, Kilo, Qwen — each has own `skillsDir`
- **Universal agents** (8): Cursor, Gemini CLI, GitHub Copilot, Cline, Amp, Kimi CLI — read from shared `.agents/skills/`, write to own `ownSkillsDir`

Key distinction: `skillsDir` (where agent reads skills) vs `ownSkillsDir` (where sync writes to). Universal agents read `.agents/skills/` but sync writes to `.cursor/skills/`, `.gemini/skills/`, etc.

## Build

```bash
npm run build                    # Build both extension + webview
npm run build:extension          # tsc -p tsconfig.extension.json
npm run build:webview            # vite build
npm run dev:webview              # Vite dev server with HMR
npm run watch:extension          # tsc watch mode
```

- Extension output: `dist/extension/` (CommonJS, ES2022)
- Webview output: `dist/webview/` (ESNext bundle)
- Two separate tsconfig files: `tsconfig.extension.json` (Node/CommonJS) and `tsconfig.json` (DOM/React/ESNext)

## Message Protocol

Extension <-> Webview communicate via `postMessage`. Full message types:

### Webview -> Extension

| Type | Purpose |
|------|---------|
| `webview:ready` | Signal webview initialized, triggers initial data load |
| `skills:load` | Load skills for scope + agent filter |
| `agents:detect` | Re-detect installed agents |
| `sync:execute` | Sync single skill to target agents |
| `sync:batch` | Sync multiple skills to target agents |
| `skill:create` | Create new skill in agent dir (name sanitized) |
| `skill:delete` | Delete skill by filePath (path validated) |
| `skill:openInEditor` | Open SKILL.md in VSCode editor (path validated) |
| `skill:checkAgents` | Check which agents have a specific skill |
| `diff:request` | Compare skill content across all agents |
| `history:load` / `history:clear` | Manage sync history |
| `mcps:load` | Scan MCP server configurations |
| `settings:open` | Open VSCode settings filtered to vibeRules |
| `remote:search` | Search remote skill marketplace |
| `remote:install` | Install remote skill to local agent dir |
| `remote:remove` | Remove installed remote skill |

### Extension -> Webview

| Type | Purpose |
|------|---------|
| `skills:loaded` | Skill list response |
| `agents:detected` | Agent detection results |
| `sync:result` | Sync operation report |
| `skill:fileChanged` | Real-time file change notification |
| `skill:agentsWithSkill` | Agents that have a specific skill |
| `mcps:loaded` | MCP server list |
| `diff:result` | Cross-agent diff report |
| `history:loaded` | Sync history entries |
| `error:occurred` | Operation error with context |
| `remote:searchResult` | Remote search results (with optional error) |
| `remote:installResult` | Remote install success/failure |
| `remote:removeResult` | Remote remove success/failure |

## Remote Skill Marketplace

Three sources integrated in DashboardViewProvider:

| Source | Host | Method |
|--------|------|--------|
| SkillHub | skillhub.tencent.com | Static CDN JSON, client-side filter, 10min cache |
| SkillsMP | skillsmp.com | REST API, optional API key (`vibeRules.skillsmpApiKey`) |
| Skills.sh | skills.sh | SSR HTML regex parsing |

Install flow: fetch raw SKILL.md from source → fallback to metadata-generated file → write to target agent dir.

## Conventions

- All interfaces use `readonly` (immutable pattern)
- React components use `FC<Props>` with named exports
- State updates return new objects (no mutation)
- Error handling: try/catch with console.error logging, `error:occurred` message for webview
- CSS: Tailwind utilities + inline `style={{ color: "var(--cp-*)" }}`
- Skill names sanitized: `path.basename()` + `/[^a-z0-9_-]/gi` regex
- Comments in English throughout codebase
