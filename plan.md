参考 @code.html @screen.png @原型.png 开发一个 vscode 插件 配色使用 vscode 默认黑灰配色
主要是用来 同步各个不同 codeing agnet 的 skills

详细参考 使用 deepwiki https://github.com/vercel-labs/skills 里边有很多可复用的功能 例如各个 agent 的 skill 配置文件位置

技术栈使用 vite+react

---

# Code Patch - Deep Review & Optimization Plan

> 三位专家（Agent 开发工程师、Vibecoding 专家、产品分析师）对项目进行深度审查的综合报告。
> 审查覆盖全部 35 个源码文件，共发现 **40+ 个问题**，按严重级别和优先级分层整理。

---

## Executive Summary

Code Patch 拥有良好的基础架构：清晰的 Extension/Webview 分离、规范的消息协议、零 `any` 使用、一致的 `readonly` 不可变模式。但存在以下系统性问题：

| 类别 | 核心问题 |
|------|---------|
| **安全** | 2 个路径遍历漏洞（webview 可删除/写入任意目录） |
| **Bug** | 技能创建产生双重 frontmatter、版本号不一致、UI 文案与实现矛盾 |
| **架构** | App.tsx God Component（15 useState + 25 handler + 大规模 prop drilling） |
| **DX** | 零可访问性支持、无错误反馈、无加载状态、hover 用 DOM 操作而非 CSS |
| **产品** | AgentTabs 硬编码 3 个 Agent、无法 re-sync、无首次使用引导、无测试 |

---

## P0: Critical（必须修复，阻塞发布）

### 1. [安全] 路径遍历 -- `skill:delete` 可删除任意目录

- **文件**: `src/extension/providers/DashboardViewProvider.ts:207-221`
- **问题**: `skill:delete` 直接使用 webview 传入的 `filePath`，调用 `rm(path.dirname(filePath), { recursive: true })`，无路径校验。恶意或被 XSS 的 webview 可发送 `filePath: "/home/user/.ssh/authorized_keys"` 删除任意目录。`skill:openInEditor` 同理可打开任意文件。
- **修复**:
  ```typescript
  const allowedRoots = getAllKnownSkillsDirs(scope, workspaceRoot);
  const realPath = await fs.promises.realpath(skillFilePath);
  if (!allowedRoots.some(root => realPath.startsWith(root))) {
    console.error('[code-patch] Blocked path outside skills dirs:', realPath);
    return;
  }
  ```

### 2. [安全] 路径遍历 -- `skill:create` 可写入任意位置

- **文件**: `src/extension/providers/DashboardViewProvider.ts:177-203`
- **问题**: `skill:create` 使用 `message.payload.name` 直接拼接路径，名称如 `../../.ssh/authorized_keys` 可逃逸 skills 目录。虽然前端有 slugify，但 extension host 不应信任 webview 边界。
- **修复**:
  ```typescript
  const safeName = path.basename(message.payload.name).replace(/[^a-z0-9_-]/gi, '');
  if (!safeName || safeName !== message.payload.name) {
    vscode.window.showErrorMessage('Invalid skill name');
    return;
  }
  ```

### 3. [Bug] 技能创建产生双重 frontmatter

- **文件**: `src/webview/components/skill/CreateSkillDialog.tsx:21-23` + `src/extension/providers/DashboardViewProvider.ts:194-197`
- **问题**: `CreateSkillDialog` 构建内容时已包含 frontmatter（`---\nname:...\n---`），`DashboardViewProvider` 的 `skill:create` handler 又额外拼接了一次 frontmatter，导致创建的 SKILL.md 含有**双重 frontmatter**，文件格式损坏。
- **修复**: 二选一 -- 推荐由 extension 端统一生成 frontmatter，webview 仅传原始字段：
  ```typescript
  // CreateSkillDialog: only send name, description, content
  onCreateSkill(slug, content.trim());
  // DashboardViewProvider: build complete content
  const fullContent = `---\nname: ${name}\ndescription: "${desc}"\n---\n\n${content}`;
  ```

### 4. [DX] 零可访问性支持

- **范围**: 全部 webview 组件
- **问题**: 整个 webview 无任何 `aria-*`、`role`、`tabIndex`、`onKeyDown` 属性。5 个模态对话框无 `role="dialog"`、无焦点陷阱、无 Escape 关闭。自定义右键菜单（`SkillList.tsx:192-245`）仅支持鼠标。VSCode 扩展应满足基本无障碍标准。
- **修复**:
  - 所有对话框添加 `role="dialog"` + `aria-modal="true"` + `aria-labelledby`
  - 实现焦点陷阱 + Escape 关闭
  - 交互元素添加 `tabIndex={0}` + 键盘事件
  - 添加 `:focus-visible` 样式
  - 图标按钮添加 `aria-label`

---

## P1: High（显著影响用户体验或代码质量）

### 5. [架构] App.tsx God Component

- **文件**: `src/webview/App.tsx`（503 行）
- **问题**: 15 个 `useState`、~25 个 callback handler、Sidebar 接收 17 个 props、MainContent 接收 12 个 props。违反 SRP，新增功能必须修改此文件，认知负荷极高。
- **修复**: 按领域拆分 React Context：
  - `SyncContext` -- syncNotification, syncStats, pendingSyncSkill, agentsWithSkill
  - `SelectionContext` -- multiSelect, selectedSkillNames 及其 handler
  - `DialogContext` -- showCreateDialog, deleteTargets, diffReport, showHistory, showSettings
  - 使用 `useReducer` 管理关联状态

### 6. [Bug] `applyOverrides` 错误映射 `skillsDir` 到 `ownSkillsDir`

- **文件**: `src/extension/services/agent-detector.ts:48`
- **问题**: 用户设置 `codePatch.agents.cursor.skillsDir` 覆盖时，代码同时覆盖 `ownSkillsDir`（写入目录）。对于 universal agent（如 Cursor 读 `.agents/skills` 但写 `.cursor/skills`），这会导致数据写入错误目录。
- **修复**: 不将 `skillsDir` 覆盖应用到 `ownSkillsDir`：
  ```typescript
  ownSkillsDir: agent.ownSkillsDir, // preserve original, do not override from skillsDir
  ```

### 7. [DX] 错误反馈完全缺失

- **文件**: `src/extension/providers/DashboardViewProvider.ts:264-266`
- **问题**: `handleMessage` 的 catch 仅 `console.error`，永远不向 webview 发送错误消息。用户操作失败时 UI 无任何反馈，表现为"卡住"。`ExtensionMessage` 类型无错误变体。
- **修复**:
  - 在 `messages.ts` 添加 `{ type: "error:occurred"; payload: { operation: string; message: string } }`
  - catch 块发送错误消息到 webview
  - webview 添加错误 toast/banner 组件
  - 异步操作添加 loading/pending 状态

### 8. [UX] SyncDialog 无法 re-sync 已有技能

- **文件**: `src/webview/components/skill/SyncDialog.tsx:20-22`
- **问题**: `SyncDialog` 隐藏已有该技能的 Agent，导致无法推送更新版本。这阻断了核心同步工作流 -- 技能更新后无法同步到已部署的 Agent。
- **修复**: 显示所有 Agent，已有的标注 "已同步" 并允许确认后强制覆盖。

### 9. [UX] AgentTabs 硬编码 3 个 Agent

- **文件**: `src/webview/components/agent/AgentTabs.tsx:8-13`
- **问题**: Tab 列表硬编码为 `["Claude Code", "Codex", "OpenCode", "All"]`，注册表中 18 个 Agent 仅 3 个有专属 Tab。Cursor、Windsurf、Gemini CLI 等用户无法按 Agent 筛选。违反 OCP。
- **修复**: 从检测到的已安装 Agent 列表动态生成 Tab。

### 10. [安全] Nonce 生成使用 `Math.random()`

- **文件**: `src/extension/providers/DashboardViewProvider.ts:302-310`
- **问题**: CSP nonce 用 `Math.random()` 生成，非密码学安全，削弱 CSP 防护。
- **修复**: 使用 `crypto.randomBytes(16).toString('base64')`。

### 11. [Bug] 快照目录名碰撞

- **文件**: `src/extension/services/sync-engine.ts:169`
- **问题**: 快照目录以 `Date.now()` 为后缀，毫秒内并发同步时名称碰撞导致数据损坏。
- **修复**: 使用 `crypto.randomUUID()` 替代 `Date.now()`。

### 12. [DX] `handleMessage` 是 170+ 行的 God Method

- **文件**: `src/extension/providers/DashboardViewProvider.ts:90-267`
- **问题**: 13 个 case 分支混合技能加载、同步、创建、删除、MCP 扫描、Diff、历史管理。圈复杂度高，难以测试和维护。
- **修复**: 提取为 handler 注册表：
  ```typescript
  private readonly handlers: Record<string, (payload: any) => Promise<void>> = {
    'skills:load': (p) => this.handleSkillsLoad(p),
    'sync:execute': (p) => this.handleSyncExecute(p),
    // ...
  };
  ```

---

## P2: Medium（代码质量与性能优化）

### 13. [DX] Hover 样式使用命令式 DOM 操作

- **范围**: SkillList, MainContent, Header, SettingsPanel, McpList（~20 处）
- **问题**: 所有 hover 效果通过 `onMouseEnter/onMouseLeave` 修改 `style` 实现，导致不必要重渲染、状态可能卡住、代码冗长。
- **修复**: 用 Tailwind `hover:bg-[var(--cp-list-hover)]` 或 CSS class 替代。

### 14. [性能] 无 `useMemo` / `React.memo`

- **范围**: 全部 webview 组件
- **问题**: 15 个 useState 中任一变化触发整棵树重渲染，包括 ReactMarkdown（昂贵）。无列表虚拟化，100+ 技能时性能堪忧。
- **修复**: 对 SkillList、SkillDetail、RightPanel 添加 `React.memo()`；对过滤结果使用 `useMemo`。

### 15. [DRY] 类型定义三处重复

- **文件**: `DiffEntry` 定义在 diff-engine.ts / messages.ts / DiffPreview.tsx 三处；`SyncHistoryEntry` 同理。
- **修复**: 创建 shared types 目录或统一在 `types/` 中定义，两个 tsconfig 共享。

### 16. [性能] `scanSkills` 顺序扫描 36 个目录

- **文件**: `src/extension/services/skill-scanner.ts:115-126`
- **问题**: 嵌套 for 循环依次 await 每个目录，18 Agent x 2 scope = 36 次顺序 I/O。
- **修复**: `Promise.all()` 并行扫描。

### 17. [性能] `findAgentsWithSkill` 每次重新检测所有 Agent

- **文件**: `src/extension/services/agent-detector.ts:155-178`
- **问题**: 每次调用都探测 18 个 Agent 的文件系统，无缓存。
- **修复**: 添加 10 秒 TTL 缓存。

### 18. [性能] `getSkillByName` 全量扫描

- **文件**: `src/extension/services/skill-scanner.ts:144-151`
- **问题**: 查找单个技能时扫描所有技能再过滤，O(n) 文件 I/O。
- **修复**: 直接按路径查找 `path.join(dir, name, 'SKILL.md')`。

### 19. [性能] 批量同步无并发控制

- **文件**: `src/extension/providers/DashboardViewProvider.ts:146-155`
- **问题**: `Promise.all` 同时发起所有同步，50 技能 x 18 Agent = 900 并发文件操作。
- **修复**: 添加并发限制（如 `p-limit` 或分批处理，每批 10 个）。

### 20. [Bug] 重复搜索输入

- **文件**: `src/webview/components/layout/Sidebar.tsx:98` + `src/webview/components/layout/MainContent.tsx:166`
- **问题**: 两个 SearchInput 绑定同一 state，输入任一个更新另一个，违反"单一交互源"原则。
- **修复**: 移除其中一个，推荐保留 Sidebar 中的。

### 21. [Bug] 缺少 `workspaceRoot` 保护

- **文件**: `src/extension/providers/DashboardViewProvider.ts:94`
- **问题**: 无文件夹打开时 `workspaceRoot` 为 `undefined`，project scope 操作静默失败，用户收到误导性错误信息。
- **修复**: 操作前检查并提示用户打开文件夹。

### 22. [DX] 动态 import 已静态导入的模块

- **文件**: `src/extension/providers/DashboardViewProvider.ts:179-180,192,210`
- **问题**: `skill:create` 和 `skill:delete` 使用 `await import("../services/agent-detector")` 但该模块已在文件顶部静态导入。
- **修复**: 使用已有的静态导入。

### 23. [Bug] `syncHistory` 竞态条件

- **文件**: `src/extension/services/sync-history.ts`
- **问题**: 两个并发同步同时 `loadSyncHistory()` -> 追加 -> 写回，一条记录丢失。
- **修复**: 使用文件锁或队列化写入。

### 24. [健壮性] `copyDir` 不处理目录内的符号链接

- **文件**: `src/extension/services/sync-engine.ts:19-33`
- **问题**: 如果技能目录包含符号链接的子目录，`isDirectory()` 返回 false，子目录被静默跳过。
- **修复**: 添加 `isSymbolicLink()` 检查并 follow 链接。

### 25. [DX] 缺少 Error Boundary

- **范围**: 全部 webview
- **问题**: ReactMarkdown 渲染异常等任何组件崩溃直接白屏，无恢复路径。
- **修复**: 在 App 层和关键子树添加 ErrorBoundary 组件。

### 26. [DX] Webview 状态不持久化

- **文件**: `src/webview/services/vscode-message.ts:7-8`
- **问题**: `vscodeApi.getState()/setState()` 已声明但从未使用。Webview 隐藏再显示时丢失所有客户端状态（选中技能、面板宽度、搜索词、Tab）。
- **修复**: 在状态变化时 `setState()`，初始化时 `getState()` 恢复。

---

## P3: Low（锦上添花）

### 27. [Bug] 版本号不一致

- **文件**: `src/webview/components/settings/SettingsPanel.tsx:124`（显示 v0.1.0）vs `package.json`（v0.2.0）
- **修复**: 动态读取版本或更新硬编码值。

### 28. [Bug] "Symlink Sync" 误导标签

- **文件**: `src/webview/components/layout/RightPanel.tsx:83`
- **问题**: "Active Features" 列出 "Symlink Sync"，但项目设计决策明确为"No symlinks -- copy mode only"。
- **修复**: 改为 "Copy Sync" 或移除。

### 29. [DX] ConfirmDialog 硬编码 `#fff`

- **文件**: `src/webview/components/common/ConfirmDialog.tsx:62`
- **问题**: 唯一一处硬编码颜色，违反 CSS 变量约定。
- **修复**: 使用 `var(--cp-primary-fg)`。

### 30. [DX] SkillList 使用 `skill.name` 作为 React key

- **文件**: `src/webview/components/skill/SkillList.tsx:126`
- **问题**: "All" 视图下不同 Agent 可能有同名技能，key 不唯一。
- **修复**: 使用 `skill.filePath` 作为 key。

### 31. [DX] diff-engine 内联 `require("os")`

- **文件**: `src/extension/services/diff-engine.ts:103`
- **问题**: 混用 CJS `require` 和 ESM `import`，风格不一致。
- **修复**: 使用顶层 `import * as os from "os"`。

### 32. [DX] 151 处内联 `style={}` 属性

- **范围**: 全部 webview 组件
- **问题**: 每个组件用内联 style 设置 CSS 变量颜色，JSX 冗长。
- **修复**: 迁移到 Tailwind 任意值语法或 CSS class。

### 33. [UX] 搜索仅匹配 name

- **文件**: `src/webview/hooks/useSkills.ts`
- **问题**: 搜索仅过滤 `s.name.toLowerCase().includes(query)`，不搜索 description 或 content。
- **修复**: 扩展搜索范围到 description 和 tags。

### 34. [UX] 无首次使用引导

- **范围**: 全部 webview
- **问题**: 空状态仅显示 "No skills found"，无 Agent 检测结果展示、无创建引导。
- **修复**: 添加 empty-state 引导组件，展示检测到的 Agent、创建技能入口。

---

## Product Gaps（产品功能缺失）

### 35. Agent 检测可靠性

- **问题**: `isAgentInstalled` 仅检查全局 skills 目录是否存在，已卸载但留有目录的 Agent 误报为已安装，新安装未创建目录的 Agent 误报为未安装。
- **建议**: 增加二进制/IDE 存在性检测或多信号综合判断。

### 36. MCP Tab 定位模糊

- **问题**: MCP 扫描为只读发现功能，但 Tab 未标明"Discovery"，用户可能期望管理功能。
- **建议**: 明确标注为 "MCP Discovery" 或添加基础管理能力。

### 37. 无测试基础设施

- **问题**: 零测试文件、零测试脚本、零测试依赖。对于执行破坏性文件操作（delete, overwrite）的工具，这是重大安全隐患。
- **建议**: 优先为 `sync-engine.ts`、`skill-scanner.ts`、`agent-detector.ts` 添加单元测试。

### 38. 全局/项目 Scope 技能名称冲突

- **问题**: 同名技能存在于全局和项目 scope 时，扫描以 `AGENT_REGISTRY` 顺序首次命中为准，可能静默同步错误版本。
- **建议**: 在技能列表中显示 scope 来源，冲突时提示用户选择。

### 39. 多根工作区支持

- **问题**: 仅读取 `workspaceFolders?.[0]`，忽略多根工作区的其他文件夹。
- **建议**: 支持多根工作区或明确文档说明限制。

### 40. 技能创建重名检查

- **问题**: 创建已存在 slug 的技能时静默覆盖 SKILL.md，无确认。
- **建议**: 创建前检查重名并提示用户。

---

## Implementation Roadmap

### Phase 1: Security & Blocker Fixes（1-2 天）

> 目标：消除安全漏洞和数据损坏 Bug

- [ ] #1 路径遍历 -- skill:delete 路径校验
- [ ] #2 路径遍历 -- skill:create 名称消毒
- [ ] #3 双重 frontmatter 修复
- [ ] #10 CSP nonce 改用 crypto
- [ ] #27 版本号修正
- [ ] #28 "Symlink Sync" 标签修正

### Phase 2: Core UX Improvements（3-5 天）

> 目标：核心交互流程可用

- [ ] #7 错误反馈机制（error message type + toast 组件）
- [ ] #8 SyncDialog 支持 re-sync
- [ ] #9 AgentTabs 动态化
- [ ] #4 基础可访问性（Escape 关闭 + tabIndex + aria-label）
- [ ] #6 applyOverrides 映射修复
- [ ] #21 workspaceRoot 保护

### Phase 3: Architecture Refactor（5-7 天）

> 目标：可维护性和可扩展性

- [ ] #5 App.tsx 拆分（Context + useReducer）
- [ ] #12 handleMessage handler 注册表
- [ ] #15 类型定义去重
- [ ] #25 Error Boundary
- [ ] #26 Webview 状态持久化

### Phase 4: Performance & Polish（3-5 天）

> 目标：大规模使用性能达标

- [ ] #13 hover 样式改用 CSS
- [ ] #14 React.memo + useMemo
- [ ] #16 scanSkills 并行化
- [ ] #17 Agent 检测缓存
- [ ] #18 getSkillByName 直接查找
- [ ] #19 批量同步并发控制
- [ ] #32 内联 style 迁移

### Phase 5: Product Completeness（持续迭代）

> 目标：产品体验闭环

- [ ] #37 测试基础设施搭建
- [ ] #34 首次使用引导
- [ ] #35 Agent 检测增强
- [ ] #33 搜索增强（description + tags）
- [ ] #38 Scope 冲突处理
- [ ] #40 创建重名检查

---

## Positive Observations

审查同时确认了项目的多个优秀实践：

1. **零 `any` 使用** -- 全代码库无 `any`，TypeScript 类型覆盖完整
2. **一致的不可变模式** -- 所有接口 `readonly`，状态更新返回新对象
3. **正确的 CSP 实现** -- `default-src 'none'` + nonce-based script（需升级 nonce 生成）
4. **清晰的关注点分离** -- Extension/Webview 通过类型化消息协议通信
5. **防御性 disposed 检查** -- postMessage 和 handleMessage 都检查 `this.disposed`
6. **Singleton Panel 模式** -- `createOrShow` 正确实现单例模式 + dispose 清理
7. **源安全同步** -- 快照机制防止源/目标重叠时的数据损坏
8. **智能去重** -- `scanSkills` 用 `Set<string>` 避免 universal agent 共享目录重复扫描

---

*Generated by 3-agent deep review team: Agent Development Engineer (code-reviewer/opus) + Vibecoding Expert (critic/opus) + Product Analyst (analyst/opus)*
*Date: 2026-03-16*
