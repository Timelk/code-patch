参考 @code.html @screen.png @原型.png 开发一个 vscode 插件 配色使用 vscode 默认黑灰配色
主要是用来 同步各个不同 codeing agnet 的 skills

详细参考 使用 deepwiki https://github.com/vercel-labs/skills 里边有很多可复用的功能 例如各个 agent 的 skill 配置文件位置

技术栈使用 vite+react

---

# Vibe Rules - 项目深度审查与优化计划 v2

> 基于全部 45+ 源码文件的逐行审查，覆盖 Extension Host（12 文件）+ Webview（20+ 组件）+ i18n + VibeTips + 构建配置。
> 上一版审查日期：2026-03-16 | 本次更新：2026-03-28

---

## 项目现状总览

### 架构概况

```
Extension Host (TypeScript/Node, CommonJS)
├── extension.ts          — 入口，注册 3 个命令 + 文件监视器
├── providers/
│   └── DashboardViewProvider.ts (438行) — WebviewPanel 管理 + 14 种消息处理
├── services/
│   ├── agent-detector.ts (201行) — Agent 检测/路径解析/配置覆盖
│   ├── skill-scanner.ts  (159行) — SKILL.md 扫描/解析/去重
│   ├── sync-engine.ts    (209行) — 快照+复制同步，UUID 命名
│   ├── diff-engine.ts    (134行) — 跨 Agent 技能差异对比
│   ├── sync-history.ts   (64行)  — ~/.vibe-rules/sync-history.json 持久化
│   ├── mcp-scanner.ts    (116行) — 5 处 MCP 配置发现
│   └── file-watcher.ts   (71行)  — SKILL.md 变更监听
└── types/
    ├── agent.ts   (171行) — AGENT_REGISTRY (10 启用 + 8 注释掉)
    ├── skill.ts   (41行)  — Skill/SyncResult/SyncReport 接口
    └── messages.ts (125行) — Extension↔Webview 消息类型定义

Webview (Vite + React + Tailwind, ESNext)
├── App.tsx (576行)        — 全局状态编排 (12+ useState)
├── components/
│   ├── layout/            — Header(148) Sidebar(206) MainContent(174) RightPanel(155)
│   ├── skill/             — SkillList(276) SkillDetail(112) SyncDialog(234)
│   │                        CreateSkillDialog(178) DiffPreview(150) SyncHistory(138)
│   ├── agent/             — AgentTabs(96) AgentStatusBadge(28)
│   ├── mcp/               — McpList(92)
│   ├── settings/          — SettingsPanel(349)
│   ├── common/            — SearchInput(47) ScopeToggle(36) ConfirmDialog(83) ResizeHandle(66)
│   └── vibetips/          — VibeTipsPanel(107) VibeTipsCard(114) VibeTipsHots(119)
│                            VibeTipsMCPs(70) VibeTipsSkills(56)
├── hooks/                 — useSkills(88) useAgents(36) useVSCodeApi(21)
├── services/              — vscode-message.ts(43)
├── i18n/                  — I18nContext(45) useI18n(14) en.ts(138) zh.ts(138)
├── data/                  — vibetips-data.ts(538) — 框架/技能/MCP 精选数据
└── styles/                — index.css(202) — CSS 变量 + Tailwind + 动画
```

### 关键指标

| 指标 | 数值 |
|------|------|
| 总文件数 | 45+ |
| 总代码行数 | ~5,500+ |
| 启用 Agent 数 | 10（8 个被注释掉） |
| 消息类型数 | Webview→Extension 14 种, Extension→Webview 10 种 |
| i18n 翻译键数 | 138（英文/中文各一份） |
| 测试覆盖率 | 0%（零测试） |
| 版本 | v0.2.0 |
| 远程市场功能 | 未实现（CLAUDE.md 描述存在但代码中未实现） |

### 上一版问题修复进度

| # | 问题 | 状态 | 备注 |
|---|------|------|------|
| 1 | 路径遍历 - skill:delete | ✅ 已修复 | `isPathInsideSkillsDirs()` 路径验证 |
| 2 | 路径遍历 - skill:create | ✅ 已修复 | `path.basename()` + 正则消毒 |
| 3 | 双重 frontmatter | ✅ 已修复 | webview 仅传字段，extension 统一构建 |
| 6 | applyOverrides 映射 | ✅ 已修复 | `ownSkillsDir` 保留原值 |
| 7 | 错误反馈缺失 | ✅ 已修复 | `error:occurred` 消息 + toast |
| 9 | AgentTabs 硬编码 | ✅ 已修复 | 从 agents prop 动态生成 |
| 10 | Nonce 使用 Math.random | ✅ 已修复 | `crypto.randomBytes(16)` |
| 11 | 快照目录碰撞 | ✅ 已修复 | `crypto.randomUUID()` |
| 22 | 动态 import 冗余 | ✅ 已修复 | 统一静态导入 |
| 27 | 版本号不一致 | ✅ 已修复 | i18n 统一 v0.2.0 |
| 28 | "Symlink Sync" 标签 | ✅ 已修复 | 改为 "Copy Sync" |
| 12 | handleMessage God Method | ⚠️ 部分修复 | 仍 270 行，有 try-catch 但未拆分 |
| 21 | workspaceRoot 保护 | ⚠️ 部分修复 | 可选链但无显式提示 |
| 5 | App.tsx God Component | ❌ 未修复 | 576 行，12+ useState |
| 8 | SyncDialog re-sync | ❌ 未修复 | 仍过滤已有技能的 Agent |

**修复率：11/15 完全修复，2/15 部分修复，2/15 未修复**

### 新增功能（自上次审查后）

1. **i18n 国际化系统** — React Context + useI18n hook，支持英文/中文切换，138 个翻译键
2. **VibeTips 功能** — 新数据源标签页，展示热门框架、精选技能/MCP、编程技巧，538 行静态数据
3. **Agent 注册表扩展** — 新增 Kimi Code CLI、Qwen Code 等，总计 18 个 Agent（10 启用 + 8 注释掉）
4. **设置面板增强** — Agent 启用/禁用开关、语言切换、JSON 配置文件打开

---

## 遗留问题（仍需修复）

### P1-1. [架构] App.tsx God Component（原 #5，未修复）

- **文件**: `src/webview/App.tsx`（576 行）
- **现状**: 12+ 个 `useState`、~20 个 callback handler，Sidebar 接收 17 个 props。新增 VibeTips 和 i18n 后行数从 503 增长到 576。
- **影响**: 任何新功能都必须修改此文件，prop drilling 导致组件间耦合严重。
- **修复**: 按领域拆分 Context + useReducer：
  - `SkillContext` — skills, selectedSkill, scope, agentFilter, searchQuery
  - `SyncContext` — syncNotification, syncStats, agentsWithSkill
  - `SelectionContext` — multiSelect, selectedSkillNames
  - `UIContext` — dialogs, panels, locale, source

### P1-2. [UX] SyncDialog 无法 re-sync（原 #8，未修复）

- **文件**: `src/webview/components/skill/SyncDialog.tsx:28-30`
- **现状**: `availableAgents.filter((a) => a.installed && !agentsWithSkill.has(a.name))` 仍然过滤掉已拥有技能的 Agent。
- **影响**: 技能更新后无法推送到已部署的 Agent，阻断核心同步工作流。
- **修复**: 显示所有已安装 Agent，已同步的标注状态并允许强制覆盖。

### P1-3. [架构] handleMessage God Method（原 #12，部分修复）

- **文件**: `src/extension/providers/DashboardViewProvider.ts:129-399`（270 行）
- **现状**: 14 个 case 分支，虽增加了统一 try-catch 但未提取为独立 handler。
- **修复**: 提取为 handler 注册表模式，每个 case 独立函数。

### P1-4. [DX] workspaceRoot 保护不完整（原 #21，部分修复）

- **文件**: `src/extension/providers/DashboardViewProvider.ts:133`
- **现状**: 使用可选链 `workspaceFolders?.[0]?.uri.fsPath`，但 project scope 操作时不提示用户。
- **修复**: project scope 操作前检查 `workspaceRoot`，为空时弹出提示引导打开文件夹。

### P2-1. [DX] 零可访问性支持（原 #4，未修复）

- **范围**: 全部 webview 组件
- **现状**: 仍无 `aria-*`、`role`、焦点管理。部分对话框支持 Escape 关闭，但无焦点陷阱。
- **修复**: 分批添加：先对话框 `role="dialog"` + 焦点陷阱，再交互元素 `tabIndex` + 键盘事件。

### P2-2. [性能] 多个性能问题（原 #14/16/17/18/19）

- `scanSkills` 顺序扫描 36 个目录（#16）
- `findAgentsWithSkill` 无缓存（#17）
- `getSkillByName` 全量扫描（#18）
- 批量同步无并发控制（#19）
- 无 `React.memo` / `useMemo`（#14）

### P2-3. [DX] Hover 样式用命令式 DOM（原 #13，未修复）

- **范围**: SkillList, MainContent, Header, SettingsPanel, McpList（~20 处）
- **修复**: 迁移到 Tailwind `hover:` 或 CSS class。

### P2-4. [DRY] 类型定义重复（原 #15，未修复）

- `DiffEntry` 和 `SyncHistoryEntry` 在 extension 和 webview 各定义一次。
- **修复**: 创建 `src/shared/types/` 目录，两个 tsconfig 共享。

### P2-5. [DX] 缺少 Error Boundary（原 #25，未修复）

### P2-6. [DX] Webview 状态不持久化（原 #26，未修复）

### P2-7. [Bug] syncHistory 竞态条件（原 #23，未修复）

### P3-1. [DX] 151 处内联 style（原 #32，未修复）

### P3-2. [UX] 搜索仅匹配 name（原 #33，未修复）

### P3-3. [UX] 无首次使用引导（原 #34，未修复）

---

## 新发现问题

### N1. [架构] AGENT_REGISTRY 有 8 个 Agent 被注释掉

- **文件**: `src/extension/types/agent.ts`
- **问题**: Windsurf、Augment、Continue、Goose、Kilo、Trae、Amp、Junie 等 8 个 Agent 被注释掉，但 CLAUDE.md 和 README 均声称支持 18 个 Agent。这导致文档与实际不一致。
- **建议**: 要么启用这些 Agent（按 CLAUDE.md 路径配置），要么更新文档反映实际支持数。

### N2. [架构] 远程技能市场功能未实现

- **文件**: 缺失 `src/webview/services/remote-skill-api.ts`
- **问题**: CLAUDE.md 详细描述了三个远程源（SkillHub、SkillsMP、Skills.sh）的集成，messages.ts 定义了 `remote:search/install/remove` 消息类型，但实际代码中：
  - 不存在 `remote-skill-api.ts` 文件
  - DashboardViewProvider 无 `remote:*` 消息处理
  - Webview 无 RemoteSkillPanel 组件
- **影响**: CLAUDE.md 描述与实际实现严重不符，误导开发者。
- **建议**: 从 CLAUDE.md 中移除未实现功能的描述，或作为后续功能规划。

### N3. [Bug] extension.ts 三个命令功能重复

- **文件**: `src/extension/extension.ts`（39 行）
- **问题**: `vibeRules.openDashboard`、`vibeRules.refreshSkills`、`vibeRules.syncSkill` 三个命令都只是打开仪表板。`refreshSkills` 执行 webview 重载命令，`syncSkill` 与 `openDashboard` 完全相同。
- **建议**:
  - `refreshSkills` 应向已打开的 webview 发送刷新消息，而非重载
  - `syncSkill` 应打开仪表板并自动进入同步流程，或接受参数

### N4. [i18n] 国际化覆盖不完整

- **范围**: 多个组件
- **问题**: 虽然 i18n 系统已建立（138 个翻译键），但以下地方仍有硬编码文本：
  - SyncDialog 中 "全选"/"Select All" 手动判断 locale
  - ConfirmDialog "Cancel" 按钮未翻译
  - SettingsPanel 中 "copy"、"extension" 等信息未翻译
  - SkillList 中 Agent 徽章缩写（19 个硬编码映射）
  - DiffPreview 中状态文案
  - 部分 placeholder 和 tooltip 未翻译
- **建议**: 统一通过 `t()` 函数翻译，移除所有内联 locale 判断。

### N5. [DX] SkillList Agent 徽章硬编码 19 个映射

- **文件**: `src/webview/components/skill/SkillList.tsx` — `getAgentBadge()` 函数
- **问题**: 手动维护 19 个 Agent 名称到 2-3 字母缩写的映射。新增 Agent 时需同时修改此函数。
- **建议**: 将徽章信息移入 `AGENT_REGISTRY` 或新建 Agent 元数据映射，单一数据源。

### N6. [DX] VibeTips 静态数据维护负担

- **文件**: `src/webview/data/vibetips-data.ts`（538 行）
- **问题**: 框架星级（如 "93K"）、URL、描述等硬编码，无法自动更新。随时间推移数据会过时。
- **建议**: 考虑远程 JSON + 本地缓存机制，或至少在数据文件中标注 `lastUpdated` 供人工定期维护。

### N7. [UX] RightPanel 相对时间不实时更新

- **文件**: `src/webview/components/layout/RightPanel.tsx`
- **问题**: `formatRelativeTime()` 在渲染时计算 "5m ago"，但组件不会自动重渲染，时间显示永远停留在首次渲染值。
- **建议**: 添加 `useEffect` + `setInterval(60000)` 定时刷新。

### N8. [DX] CSS 变量回退值仅适配深色主题

- **文件**: `src/webview/styles/index.css`
- **问题**: CSS 变量 `--cp-*` 的回退值全部为深色主题颜色。VSCode 浅色主题下，如果 `var(--vscode-*)` 变量未生效，UI 会显示为深色背景+深色文字，不可读。
- **建议**: 添加 `prefers-color-scheme: light` 媒体查询或检测 VSCode 主题类型。

### N9. [Bug] SearchInput 缺少防抖

- **文件**: `src/webview/components/common/SearchInput.tsx`
- **问题**: 每次按键触发 `onChange`，连锁触发 `skills:load` 消息到 extension host。快速输入时产生大量无效的文件扫描。
- **建议**: 添加 300ms 防抖。

### N10. [Bug] SyncHistory 清空无确认

- **文件**: `src/webview/components/skill/SyncHistory.tsx`
- **问题**: 清空历史按钮直接执行，无确认对话框。误触后数据不可恢复。
- **建议**: 使用 ConfirmDialog 确认。

### N11. [DX] CreateSkillDialog 缺少重名和内容验证

- **文件**: `src/webview/components/skill/CreateSkillDialog.tsx`
- **问题**:
  - 不检查技能名称是否已存在（静默覆盖）
  - 允许提交空内容
  - Slug 转换可能将有意义的名称变为无法识别的形式
- **建议**: 创建前通过消息查询重名，空内容时禁用提交。

---

## 产品功能缺口

### G1. 远程技能市场（未实现）

CLAUDE.md 和 messages.ts 已定义完整的远程技能市场方案（SkillHub、SkillsMP、Skills.sh），但代码未实现。这是产品最大的功能缺口。

### G2. Agent 检测可靠性（原 #35）

仅检查 skills 目录存在性，误报率高。

### G3. MCP 管理能力（原 #36）

当前仅为只读发现，无编辑/删除/启用/禁用功能。

### G4. 零测试基础设施（原 #37）

对于执行文件删除/覆盖的工具，零测试是重大风险。

### G5. Scope 冲突处理（原 #38）

同名技能跨 scope 时无提示。

### G6. 多根工作区支持（原 #39）

仅读取第一个 workspace folder。

### G7. 技能编辑能力

当前只能查看和在 VSCode 中打开编辑。可考虑内嵌编辑器支持快速修改。

---

## 优秀实践（确认保持）

1. **零 `any` 使用** — 全代码库无 `any`，TypeScript 类型覆盖完整
2. **一致的不可变模式** — 所有接口 `readonly`，状态更新返回新对象
3. **安全的 CSP 实现** — `default-src 'none'` + nonce-based script（已升级为 crypto 生成）
4. **清晰的关注点分离** — Extension/Webview 通过类型化消息协议通信
5. **防御性 disposed 检查** — postMessage 和 handleMessage 都检查 `this.disposed`
6. **Singleton Panel 模式** — `createOrShow` 正确实现单例模式 + dispose 清理
7. **源安全同步** — UUID 快照机制防止源/目标重叠时的数据损坏
8. **智能去重** — `scanSkills` 用 `Set<string>` 避免 universal agent 共享目录重复扫描
9. **路径安全验证** — `isPathInsideSkillsDirs()` + `path.basename()` 消毒（新增）
10. **完整的 i18n 架构** — Context + Hook + 回退机制 + 参数插值（新增）

---

## 更新后的实施路线图

### Phase 1: 文档对齐 + 关键 Bug 修复

> 目标：文档与代码一致，消除用户可见 Bug

- [ ] N2 — 更新 CLAUDE.md，移除未实现的远程市场描述
- [ ] N1 — 决定注释掉的 8 个 Agent：启用或更新文档
- [ ] N3 — 修复 3 个命令功能重复
- [ ] P1-2 — SyncDialog 支持 re-sync
- [ ] N10 — SyncHistory 清空添加确认
- [ ] N11 — CreateSkillDialog 重名检查 + 内容验证
- [ ] P1-4 — workspaceRoot 保护完善

### Phase 2: i18n 完善 + UX 改进

> 目标：国际化全覆盖，交互体验完整

- [ ] N4 — i18n 覆盖不完整的组件（SyncDialog、ConfirmDialog、DiffPreview 等）
- [ ] N5 — Agent 徽章映射统一到数据源
- [ ] N9 — SearchInput 防抖
- [ ] N7 — RightPanel 相对时间实时更新
- [ ] P3-2 — 搜索扩展到 description + tags
- [ ] P2-1 — 基础可访问性（对话框 role + Escape + tabIndex）

### Phase 3: 架构重构

> 目标：可维护性和可扩展性

- [ ] P1-1 — App.tsx 拆分（Context + useReducer）
- [ ] P1-3 — handleMessage handler 注册表
- [ ] P2-4 — 创建 shared types，类型定义去重
- [ ] P2-5 — Error Boundary
- [ ] P2-6 — Webview 状态持久化
- [ ] P2-7 — syncHistory 竞态条件修复

### Phase 4: 性能优化 + 代码质量

> 目标：大规模使用性能达标

- [ ] P2-2 — scanSkills 并行化 + Agent 检测缓存 + 批量同步并发控制
- [ ] P2-3 — hover 样式迁移到 CSS/Tailwind
- [ ] P3-1 — 内联 style 迁移
- [ ] N8 — CSS 变量浅色主题回退
- [ ] React.memo + useMemo 优化

### Phase 5: 产品完整性

> 目标：功能闭环，可发布状态

- [ ] G4 — 测试基础设施搭建（优先 sync-engine、skill-scanner）
- [ ] G1 — 远程技能市场实现
- [ ] G3 — MCP 基础管理能力
- [ ] P3-3 — 首次使用引导
- [ ] G2 — Agent 检测增强
- [ ] G5 — Scope 冲突处理

---

*初版审查: 2026-03-16 (3-agent deep review team)*
*本次更新: 2026-03-28 (Claude Opus 4.6 全量代码审查，覆盖 45+ 文件)*
