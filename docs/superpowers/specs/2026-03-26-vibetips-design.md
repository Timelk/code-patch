# VibeTips Design Spec

> Replace "Remote" with "VibeTips" — an AI ecosystem navigation page with three sub-tabs.

## 1. Summary

Replace the existing Remote skill browser with **VibeTips**, a static, visually rich information hub showcasing the AI developer ecosystem: trending frameworks/tips (Hots), skill marketplaces + featured skills (Skills), and MCP marketplaces + featured MCPs (MCPs). All data is hardcoded from `vibe.md` — zero network dependency.

## 2. Architecture

### Data flow

```
vibetips-data.ts (static constants)
       │
       ▼
VibeTipsPanel.tsx ──┬── VibeTipsHots.tsx
                    ├── VibeTipsSkills.tsx
                    └── VibeTipsMCPs.tsx
                          │
                     VibeTipsCard.tsx (shared)
                          │
                     url:open message → extension host → vscode.env.openExternal
```

### Component tree

| Component | Responsibility |
|-----------|---------------|
| `VibeTipsPanel` | Tab bar (Hots/Skills/MCPs), tab indicator animation, content switching |
| `VibeTipsHots` | Featured frameworks banner, vibe coding tips grid, community links |
| `VibeTipsSkills` | Skill marketplace cards (gradient), featured skill cards |
| `VibeTipsMCPs` | MCP marketplace cards (gradient), featured MCP cards by category |
| `VibeTipsCard` | Shared card component: icon, title, description, tags, stars, click → open URL |

### Data model (`vibetips-data.ts`)

```ts
interface Market { name: string; url: string; description: string; count?: string; gradient: string; icon: string; }
interface Featured { name: string; description: string; url?: string; stars?: string; tags: string[]; category?: string; }
interface Tip { title: string; emoji: string; summary: string; detail?: string; }
interface Framework { name: string; stars: string; description: string; url: string; install?: string; }
```

## 3. Header changes

- `source` type: `"local" | "remote"` → `"local" | "vibetips"`
- Toggle label: `Remote` → lightning icon + `VibeTips`
- Lightning icon: inline SVG with `linear-gradient(135deg, #f97316, #ec4899)` fill

## 4. UI & Animation

| Element | Effect |
|---------|--------|
| Tab switch | Sliding underline indicator (CSS transform), content fade-in (opacity 0→1, 200ms) |
| Card entrance | Staggered fade-up: translateY(8px→0) + opacity, 50ms delay per card |
| Card hover | translateY(-2px), shadow expand, 150ms ease |
| Market cards | Full-width gradient backgrounds, unique color per market |
| Hots banner | Hero card for Superpowers (93K stars), full row width |
| Tips | Collapsible cards — click to expand detail text |

All animations use CSS transitions only (no JS animation libraries). Respect `prefers-reduced-motion`.

## 5. Code removal

Delete:
- `src/webview/components/skill/RemoteSkillPanel.tsx`
- `src/webview/services/remote-skill-api.ts`

Remove from `App.tsx`:
- State: `remoteSkills`, `remoteTotal`, `remoteLoading`, `remoteError`, `pendingRemoteSkills`
- Handlers: `handleRemoteSearch`, `handleRemoteInstall`, `handleRemoteRemove`
- Import: `RemoteSkillPanel`, `RemoteSkill`

Remove from `DashboardViewProvider.ts`:
- Methods: `fetchRemoteSkills`, `fetchSkillHub`, `fetchSkillsSh`, `fetchRemoteSkillContent`, `installRemoteSkill`, `removeInstalledSkill`
- Fields: `skillhubCache`
- Message cases: `remote:search`, `remote:install`, `remote:remove`

Remove from `messages.ts`:
- Types: `RemoteSkillItem`, remote message variants from both ExtensionMessage and WebviewMessage unions

## 6. Files created

| Path | Purpose |
|------|---------|
| `src/webview/data/vibetips-data.ts` | All static data constants |
| `src/webview/components/vibetips/VibeTipsPanel.tsx` | Main panel with tab bar |
| `src/webview/components/vibetips/VibeTipsHots.tsx` | Hots tab content |
| `src/webview/components/vibetips/VibeTipsSkills.tsx` | Skills tab content |
| `src/webview/components/vibetips/VibeTipsMCPs.tsx` | MCPs tab content |
| `src/webview/components/vibetips/VibeTipsCard.tsx` | Shared card component |

## 7. Files modified

| Path | Change |
|------|--------|
| `src/webview/App.tsx` | Replace remote state/handlers with VibeTipsPanel, change source type |
| `src/webview/components/layout/Header.tsx` | Rename toggle, add gradient icon |
| `src/extension/providers/DashboardViewProvider.ts` | Remove remote handlers |
| `src/extension/types/messages.ts` | Remove remote message types |

## 8. Acceptance criteria

- [ ] Header shows `Local / VibeTips` toggle with gradient lightning icon
- [ ] Clicking VibeTips shows full-width panel with Hots/Skills/MCPs tabs
- [ ] Hots tab: Superpowers hero banner, 8 vibe coding tips (expandable), 5 framework cards
- [ ] Skills tab: 7 marketplace gradient cards, 10+ featured skill cards with tags
- [ ] MCPs tab: 8+ marketplace gradient cards, 10+ featured MCP cards by category
- [ ] All cards clickable → open URL in external browser
- [ ] Staggered fade-in animation on tab switch
- [ ] Card hover effect (lift + shadow)
- [ ] Tab indicator slides smoothly
- [ ] Zero network requests from VibeTips
- [ ] All remote-related code removed
- [ ] TypeScript builds without errors
- [ ] `prefers-reduced-motion` respected
