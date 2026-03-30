# Rename: Code Patch → Vibe Rules

## Overview

Rename the VSCode extension from "Code Patch" to "Vibe Rules", and the GitHub repository from `code-patch` to `viberules`.

## Naming Mapping

| Location | Old | New |
|----------|-----|-----|
| package.json `name` | `code-patch` | `viberules` |
| package.json `displayName` | `Code Patch` | `Vibe Rules` |
| package.json `publisher` | `code-patch` | `VibeRules` |
| Command IDs | `codePatch.*` | `viberules.*` |
| Command titles | `Code Patch: ...` | `Vibe Rules: ...` |
| Settings keys | `codePatch.*` | `vibeRules.*` |
| Settings section title | `Code Patch` | `Vibe Rules` |
| Webview panel type | `codePatch.dashboard` | `viberules.dashboard` |
| Panel title | `"Code Patch"` | `"Vibe Rules"` |
| Runtime directory | `~/.code-patch/` | `~/.vibe-rules/` |
| HTML title | `Code Patch` | `Vibe Rules` |
| i18n app.title | `code patch` | `vibe rules` |
| i18n description | `Code Patch — ...` | `Vibe Rules — ...` |
| Log prefix | `[code-patch]` | `[vibe-rules]` |
| CSS variables `--cp-*` | **no change** | **no change** |
| CSS class names `.cp-*` | **no change** | **no change** |

## Scope

### In scope

- All user-visible brand names
- VSCode API identifiers (command IDs, settings keys, webview panel type)
- Runtime paths (`~/.code-patch/` → `~/.vibe-rules/`)
- Documentation: README.md, CLAUDE.md, plan.md
- i18n strings (en.ts, zh.ts)
- HTML page titles
- Console log prefixes

### Out of scope

- CSS variable prefix `--cp-*` (internal, not user-visible)
- CSS class names `.cp-*` (internal, not user-visible)
- GitHub repository rename (manual operation by owner)

## Files to modify

### Package configuration
- `package.json` — name, displayName, publisher, command IDs, command titles, settings keys, settings title

### Extension source
- `src/extension/extension.ts` — command registrations (`codePatch.*` → `viberules.*`)
- `src/extension/providers/DashboardViewProvider.ts` — viewType, panel title
- `src/extension/services/agent-detector.ts` — `getConfiguration("codePatch")` → `getConfiguration("vibeRules")`
- `src/extension/services/skill-scanner.ts` — log prefix
- `src/extension/services/sync-history.ts` — runtime directory path

### Webview
- `src/webview/index.html` — page title
- `src/webview/i18n/locales/en.ts` — app.title, settings.extensionDesc
- `src/webview/i18n/locales/zh.ts` — app.title, settings.extensionDesc

### Documentation
- `README.md` — all brand references, command names, settings keys, directory paths
- `CLAUDE.md` — all brand references, settings keys, directory paths

### Other
- `code.html` — page title, header text (reference file)
- `plan.md` — brand references

## Notes

- `package-lock.json` will auto-regenerate after `npm install`
- No migration logic needed for `~/.code-patch/` → `~/.vibe-rules/` (sync history is non-critical data)
- GitHub repo rename is a manual step done via GitHub Settings
