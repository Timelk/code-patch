# Code Patch - AI Context

## Project Overview

Code Patch is a VSCode extension that manages and syncs AI coding agent skills (SKILL.md files) across 19+ agents. It provides a Webview dashboard (Vite + React) opened as an editor tab.

## Architecture

```
src/
├── extension/              # VSCode Extension Host (Node.js, TypeScript)
│   ├── extension.ts        # Entry: activate/deactivate, registers commands
│   ├── providers/
│   │   └── DashboardViewProvider.ts  # WebviewPanel manager, message handler (13 cases)
│   ├── services/
│   │   ├── agent-detector.ts   # Detects installed agents, reads VSCode settings overrides
│   │   ├── skill-scanner.ts    # Scans SKILL.md files, gray-matter parsing
│   │   ├── sync-engine.ts      # Copy-based sync (no symlinks), source-safe
│   │   ├── diff-engine.ts      # Compares skill across agents
│   │   ├── sync-history.ts     # Persistent sync log (~/.code-patch/sync-history.json)
│   │   ├── mcp-scanner.ts      # MCP config discovery
│   │   └── file-watcher.ts     # SKILL.md change detection
│   └── types/
│       ├── agent.ts            # AgentConfig, AGENT_REGISTRY (19 agents)
│       ├── skill.ts            # Skill, SyncResult, SyncReport
│       └── messages.ts         # Extension <-> Webview message protocol
└── webview/                # Vite + React (Tailwind CSS)
    ├── App.tsx             # Root state orchestrator
    ├── components/
    │   ├── layout/         # Header, Sidebar, MainContent, RightPanel
    │   ├── skill/          # SkillList, SkillDetail, SyncDialog, CreateSkillDialog,
    │   │                     DiffPreview, SyncHistory
    │   ├── agent/          # AgentTabs, AgentStatusBadge
    │   ├── mcp/            # McpList
    │   └── common/         # SearchInput, ScopeToggle, ConfirmDialog
    ├── hooks/              # useSkills, useAgents, useVSCodeApi
    └── services/           # vscode-message (postMessage bridge)
```

## Key Design Decisions

- **No symlinks** — All sync uses copy mode for cross-platform safety (WSL/Windows)
- **Agent-scoped operations** — Edit/delete operate on the selected agent tab's directory, not a shared canonical
- **WebviewPanel** (not WebviewView) — Dashboard opens as editor tab, not sidebar
- **VSCode CSS Variables** — All colors use `var(--vscode-*)` via `var(--cp-*)` aliases, zero hardcoded colors for main theme
- **Settings-driven** — Agent dirs and enabled/disabled configurable via `codePatch.agents` in VSCode settings

## Build

```bash
npm run build                    # Build both extension + webview
npm run build:extension          # tsc -p tsconfig.extension.json
npm run build:webview            # vite build
```

- Extension output: `dist/extension/`
- Webview output: `dist/webview/` (bundle ~335KB)
- Two separate tsconfig files: `tsconfig.extension.json` (Node) and `tsconfig.json` (DOM/React)

## Message Protocol

Extension <-> Webview communicate via `postMessage`. Key message types:

| Direction | Type | Purpose |
|-----------|------|---------|
| W -> E | `skills:load` | Load skills for scope + agent filter |
| W -> E | `sync:execute` | Sync single skill to agents |
| W -> E | `sync:batch` | Sync multiple skills to agents |
| W -> E | `skill:create` | Create new skill in agent dir |
| W -> E | `skill:delete` | Delete skill by filePath |
| W -> E | `skill:checkAgents` | Check which agents have a skill |
| W -> E | `diff:request` | Compare skill across agents |
| W -> E | `history:load` / `history:clear` | Manage sync history |
| E -> W | `skills:loaded` | Skill list response |
| E -> W | `sync:result` | Sync operation result |
| E -> W | `skill:agentsWithSkill` | Agents that have the skill |

## Conventions

- All interfaces use `readonly` (immutable pattern)
- React components use `FC<Props>` with named exports
- State updates return new objects (no mutation)
- Error handling: try/catch with console.error logging
- CSS: Tailwind utilities + inline `style={{ color: "var(--cp-*)" }}`
