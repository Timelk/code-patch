# Rename Code Patch → Vibe Rules Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename the VSCode extension from "Code Patch" to "Vibe Rules" across all identifiers, user-visible strings, and documentation. CSS `--cp-*` / `.cp-*` prefixes are intentionally kept unchanged.

**Architecture:** Pure find-and-replace renaming. No logic changes, no migration code, no new files. Each task targets a logical group of files.

**Tech Stack:** TypeScript, React, VSCode Extension API, Vite

---

### Task 1: Rename package.json identifiers

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Update package metadata fields**

In `package.json`, change these fields:

```json
"name": "viberules",
"displayName": "Vibe Rules",
"publisher": "VibeRules",
```

(Lines 2, 3, 6 — replace `"code-patch"` / `"Code Patch"`)

- [ ] **Step 2: Update command IDs and titles**

Replace all command entries (lines 19-32):

```json
{
  "command": "viberules.openDashboard",
  "title": "Vibe Rules: Open Dashboard",
  "icon": {
    "light": "media/icon.svg",
    "dark": "media/icon.svg"
  }
},
{
  "command": "viberules.syncSkill",
  "title": "Vibe Rules: Sync Skill"
},
{
  "command": "viberules.refreshSkills",
  "title": "Vibe Rules: Refresh Skills"
}
```

- [ ] **Step 3: Update menu command reference**

Line 39: change `"codePatch.openDashboard"` → `"viberules.openDashboard"`

- [ ] **Step 4: Update configuration section**

Line 44: change `"title": "Code Patch"` → `"title": "Vibe Rules"`

Line 46: change `"codePatch.agents"` → `"vibeRules.agents"`

Line 70: change `"codePatch.language"` → `"vibeRules.language"`

- [ ] **Step 5: Regenerate lockfile**

Run: `npm install`

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json
git commit -m "rename: update package.json identifiers to Vibe Rules"
```

---

### Task 2: Rename extension source files

**Files:**
- Modify: `src/extension/extension.ts`
- Modify: `src/extension/providers/DashboardViewProvider.ts`
- Modify: `src/extension/services/agent-detector.ts`
- Modify: `src/extension/services/skill-scanner.ts`
- Modify: `src/extension/services/sync-history.ts`

- [ ] **Step 1: Update extension.ts command registrations**

In `src/extension/extension.ts`, replace all three command strings:

```typescript
vscode.commands.registerCommand("viberules.openDashboard", () => {
```

```typescript
vscode.commands.registerCommand("viberules.refreshSkills", () => {
```

```typescript
vscode.commands.registerCommand("viberules.syncSkill", () => {
```

- [ ] **Step 2: Update DashboardViewProvider.ts**

In `src/extension/providers/DashboardViewProvider.ts`:

Line 52 — JSDoc comment: change `Code Patch dashboard` → `Vibe Rules dashboard`

Line 55 — viewType: change `"codePatch.dashboard"` → `"viberules.dashboard"`

Line 115 — panel title: change `"Code Patch"` → `"Vibe Rules"`

- [ ] **Step 3: Update agent-detector.ts**

In `src/extension/services/agent-detector.ts`:

Line 33: change `getConfiguration("codePatch")` → `getConfiguration("vibeRules")`

- [ ] **Step 4: Update skill-scanner.ts**

In `src/extension/services/skill-scanner.ts`:

Line 44: change `[code-patch]` → `[vibe-rules]`

```typescript
console.error(`[vibe-rules] Failed to parse skill file ${filePath}:`, error);
```

- [ ] **Step 5: Update sync-history.ts**

In `src/extension/services/sync-history.ts`:

Line 15: change `".code-patch"` → `".vibe-rules"`

```typescript
const HISTORY_FILE = path.join(os.homedir(), ".vibe-rules", "sync-history.json");
```

- [ ] **Step 6: Verify build**

Run: `npm run build:extension`
Expected: Build succeeds with no errors.

- [ ] **Step 7: Commit**

```bash
git add src/extension/
git commit -m "rename: update extension source to Vibe Rules"
```

---

### Task 3: Rename webview files

**Files:**
- Modify: `src/webview/index.html`
- Modify: `src/webview/i18n/locales/en.ts`
- Modify: `src/webview/i18n/locales/zh.ts`

- [ ] **Step 1: Update HTML title**

In `src/webview/index.html`, line 6:

```html
<title>Vibe Rules</title>
```

- [ ] **Step 2: Update English locale**

In `src/webview/i18n/locales/en.ts`:

Line 4: change `"app.title": "code patch"` → `"app.title": "vibe rules"`

Line 83: change `"settings.extensionDesc": "Code Patch — AI agent skill manager"` → `"settings.extensionDesc": "Vibe Rules — AI agent skill manager"`

- [ ] **Step 3: Update Chinese locale**

In `src/webview/i18n/locales/zh.ts`:

Line 4: change `"app.title": "code patch"` → `"app.title": "vibe rules"`

Line 83: change `"settings.extensionDesc": "Code Patch — AI 代理技能管理器"` → `"settings.extensionDesc": "Vibe Rules — AI 代理技能管理器"`

- [ ] **Step 4: Verify build**

Run: `npm run build:webview`
Expected: Build succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/webview/index.html src/webview/i18n/
git commit -m "rename: update webview strings to Vibe Rules"
```

---

### Task 4: Rename reference file

**Files:**
- Modify: `code.html`

- [ ] **Step 1: Update code.html**

Line 5: change `<title>Code Patch Main Dashboard</title>` → `<title>Vibe Rules Main Dashboard</title>`

Line 47: change `code patch</h1>` → `vibe rules</h1>`

- [ ] **Step 2: Commit**

```bash
git add code.html
git commit -m "rename: update code.html reference to Vibe Rules"
```

---

### Task 5: Update documentation

**Files:**
- Modify: `README.md`
- Modify: `CLAUDE.md`
- Modify: `plan.md`

- [ ] **Step 1: Update README.md**

Apply these replacements throughout the file:
- `# Code Patch` → `# Vibe Rules`
- `~/.code-patch/` → `~/.vibe-rules/`
- `code-patch` (in clone/cd instructions) → `viberules`
- `Code Patch: Open Dashboard` → `Vibe Rules: Open Dashboard`
- `Code Patch: Sync Skill` → `Vibe Rules: Sync Skill`
- `Code Patch: Refresh Skills` → `Vibe Rules: Refresh Skills`
- `"codePatch.agents"` → `"vibeRules.agents"`
- `"codePatch.language"` → `"vibeRules.language"`
- `codePatch.` → `vibeRules.` (any remaining settings references)
- Any other `Code Patch` brand mentions → `Vibe Rules`

- [ ] **Step 2: Update CLAUDE.md**

Apply these replacements throughout the file:
- `# Code Patch - AI Context` → `# Vibe Rules - AI Context`
- `Code Patch is a VSCode extension` → `Vibe Rules is a VSCode extension`
- `~/.code-patch/` → `~/.vibe-rules/`
- `codePatch.agents` → `vibeRules.agents`
- `codePatch.skillsmpApiKey` → `vibeRules.skillsmpApiKey`
- `codePatch.` → `vibeRules.` (all settings references)
- `Code Patch` → `Vibe Rules` (all brand mentions)
- `code-patch` → `vibe-rules` (in directory/identifier contexts)

- [ ] **Step 3: Update plan.md**

Replace all `Code Patch` → `Vibe Rules` and `~/.code-patch/` → `~/.vibe-rules/` throughout the file.

- [ ] **Step 4: Commit**

```bash
git add README.md CLAUDE.md plan.md
git commit -m "rename: update documentation to Vibe Rules"
```

---

### Task 6: Final verification

- [ ] **Step 1: Full build**

Run: `npm run build`
Expected: Both extension and webview build succeed with no errors.

- [ ] **Step 2: Grep for remaining references**

Run: `grep -r "code.patch\|codePatch\|Code Patch\|code-patch" --include="*.ts" --include="*.tsx" --include="*.json" --include="*.html" --include="*.md" src/ package.json README.md CLAUDE.md plan.md code.html`

Expected: No matches (except CSS `--cp-*` / `.cp-*` which are intentionally kept, and `package-lock.json` which auto-regenerated).

- [ ] **Step 3: Commit any fixes if needed**

If step 2 found remaining references, fix them and commit:

```bash
git add -A
git commit -m "rename: fix remaining code-patch references"
```
