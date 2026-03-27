# AI 开发者工具生态全景指南 (2026)

> Skills 市场 · MCP 市场 · Vibe Coding 技巧 & 框架

---

## 一、Skills 市场推荐

> **Skills** = Claude 的内置专业能力模块（SKILL.md），按上下文自动触发，无需手动调用。
> 安装路径：`~/.claude/skills/`（个人）或 `.claude/skills/`（项目）

### 1.1 综合市场/目录

| 市场 | 地址 | 特点 |
|------|------|------|
| **SkillsMP** | https://skillsmp.com | 跨平台（Claude Code / Codex / ChatGPT），自动同步 GitHub |
| **SkillHub** | https://www.skillhub.club | 7,000+ Skills，AI 评估评分，支持 Playground 即试即用 |
| **LobeHub Skills** | https://lobehub.com/skills | 分类清晰，含 self-improvement、memory、Reddit reader 等 |
| **ClaudeSkills.info** | https://claudeskills.info | 最大 Claude Skills 市场，按安全/文档/创意等分类 |
| **Awesome-Skills.com** | https://awesome-skills.com | 128+ 精选，每日安全审查更新，含安装评估 |
| **ClaudeMarketplaces** | https://claudemarketplaces.com | 按安装量、Stars、社区投票排名 |
| **ClaudePluginHub** | https://www.claudepluginhub.com | 插件 + Skills 综合目录 |

### 1.2 GitHub Awesome Lists

| 仓库 | Stars | 说明 |
|------|-------|------|
| **travisvn/awesome-claude-skills** | 🔥 | 最全面的 Claude Skills 精选列表，含分类和安装指南 |
| **BehiSecc/awesome-claude-skills** | 🔥 | 按安全/文档/测试/前端等分类整理 |
| **hesreallyhim/awesome-claude-code** | 🔥 | Skills + Hooks + 命令 + Agent 编排器综合列表 |
| **jqueryscript/awesome-claude-code** | 🔥 | 工具、IDE 集成、框架全面列表 |
| **rohitg00/awesome-claude-code-toolkit** | 🔥 | 135 Agents + 35 Skills + 42 Commands + 150+ Plugins |

### 1.3 热门 Skills 精选

#### 🏆 工作流框架类（必装）

| Skill | Stars | 说明 |
|-------|-------|------|
| **obra/superpowers** | ★ 93K | #1 Skills 框架。强制 TDD、子代理开发、Code Review，完整 SDLC 工作流 |
| **garrytan/gstack** | ★ Hot | YC CEO Garry Tan 开源。8 个角色化 Skills：`/plan-ceo-review`、`/plan-eng-review`、`/review`、`/ship`、`/browse`、`/qa`、`/retro`、`/setup-browser-cookies` |
| **get-shit-done (GSD)** | ★ 32K | "每个任务一个新大脑"，解决 Context Rot 问题。PM→研究→架构→开发→测试全流程 |

#### 🔒 安全类

| Skill | Stars | 说明 |
|-------|-------|------|
| **VibeSec-Skill** | ★ 496 | 帮 Claude 写安全代码，防止常见漏洞。做 Web 应用必装 |
| **Trail of Bits Security Skills** | 专业 | CodeQL/Semgrep 静态分析、变体分析、代码审计、修复验证 |
| **owasp-security** | — | OWASP Top 10:2025 + ASVS 5.0 + Agentic AI 安全，覆盖 20+ 语言 |
| **defense-in-depth** | — | 多层测试和安全最佳实践 |
| **varlock-claude-skill** | — | 安全环境变量管理，确保密钥不泄露 |
| **sanitize** | — | 检测和脱敏 PII（SSN、信用卡、API Key 等 15 类） |

#### 🧪 测试 & 调试类

| Skill | Stars | 说明 |
|-------|-------|------|
| **test-driven-development** | — | 强制 TDD：先写测试，再写实现 |
| **systematic-debugging** | — | 四阶段结构化调试，禁止随机猜测，强制根因分析 |

#### 📄 文档 & 办公类

| Skill | 说明 |
|-------|------|
| **docx** | 创建/编辑/分析 Word 文档，支持批注和格式 |
| **pdf** | 提取文本/表格、合并/拆分、OCR、水印 |
| **pptx** | 读取/生成/调整幻灯片 |
| **xlsx** | 电子表格操作：公式、图表、数据转换 |
| **translate-book** (★ 432) | 使用并行子代理翻译整本书（PDF/DOCX/EPUB） |

#### 🎨 前端 & 设计类

| Skill | Stars | 说明 |
|-------|-------|------|
| **web-artifacts-builder** | — | 用 React + Tailwind + shadcn/ui 构建 claude.ai 的精美 HTML Artifacts |
| **revealjs-skill** | — | 用 Reveal.js 生成专业 HTML 演示文稿 |
| **Pretty-mermaid-skills** | ★ 487 | Mermaid 图表渲染（SVG + ASCII） |
| **nuxt-skills** | ★ 475 | Vue / Nuxt / NuxtHub 专用 Skills |
| **ios-simulator-skill** | ★ 440 | iOS 模拟器 Skill，构建/运行/交互 App |

#### 🧠 元能力 & 自我改进类

| Skill | 说明 |
|-------|------|
| **self-improvement** | 自动捕获学习、错误和纠正，持续改进 |
| **SkillForge** (★ 467) | 生成高质量 Claude Code Skills 的元 Skill |
| **skill-vetter** | 安装任何 Skill 前的安全审查 |

#### 🧩 大合集类

| Skill | Stars | 说明 |
|-------|-------|------|
| **sickn33** | ★ 448 | 130+ Agentic Skills 终极合集 |
| **mhattingpete/claude-skills-marketplace** | — | 工程工作流 + 可视化文档 + 生产力 + 代码操作 |

---

## 二、MCP 市场推荐

> **MCP** (Model Context Protocol) = 连接外部工具/API/数据源的开放标准协议。
> 目前生态已超 **18,000+** 服务器，Anthropic、OpenAI、Google 均已采纳。

### 2.1 综合市场/目录

| 市场 | 地址 | 规模 | 特点 |
|------|------|------|------|
| **MCP.so** | https://mcp.so | 18,998+ | 最大第三方 MCP 市场 |
| **LobeHub MCP** | https://lobehub.com/mcp | 42,700+ | 分类最全：开发/生产力/媒体/商业/科教/金融等 |
| **PulseMCP** | https://www.pulsemcp.com/servers | 12,560+ | 每日更新，官方合作 |
| **Glama.ai** | https://glama.ai/mcp/servers | 大量 | 带可视化预览的综合市场 |
| **MCP Market** | https://mcpmarket.com | 大量 | 跨类别发现 MCP 服务器 |
| **mcpservers.org** | https://mcpservers.org | 大量 | Awesome MCP Servers 官方站 |
| **aiagentslist.com** | https://aiagentslist.com/mcp-servers | 593+ | 按类别/语言/范围浏览 |
| **mcp-awesome.com** | https://mcp-awesome.com | 1,200+ | 质量验证，含安装指南 |
| **MCP Playground** | https://mcpplaygroundonline.com | — | 在线即时测试 MCP 服务器 |

### 2.2 GitHub Awesome Lists

| 仓库 | 说明 |
|------|------|
| **punkpeye/awesome-mcp-servers** | 官方精选列表，社区维护 |
| **tolkonepiu/best-of-mcp-servers** | 按 Stars 和活跃度排名，每周更新 |
| **modelcontextprotocol/servers** | Anthropic 官方参考实现 |

### 2.3 热门 MCP 服务器精选（按类别）

#### 🌐 浏览器自动化

| MCP Server | Stars/热度 | 说明 |
|------------|-----------|------|
| **Playwright MCP** (Microsoft) | ★ 28K+ | ⭐ 评分最高。无障碍树定位，3 引擎，22 工具，代码生成 |
| **BrowserMCP** | ★ 6.1K | 自动化本地 Chrome |
| **Browserbase MCP** | — | 云端浏览器自动化，反检测/CAPTCHA |
| **Chrome DevTools MCP** | — | 直接访问 Console、Network、Performance |
| **BrowserStack MCP** | — | 云端真实设备测试 |

#### 🔍 搜索 & 抓取

| MCP Server | 说明 |
|------------|------|
| **Brave Search MCP** | 独立搜索引擎，无广告偏向，无追踪 |
| **Tavily MCP** | 专为 AI 设计的搜索 API，含提取/爬取 |
| **Firecrawl MCP** | 网页抓取 + 结构化数据提取 + 转 Markdown |
| **Jina Reader MCP** | URL 转清洁 Markdown |
| **Perplexity MCP** | 语义搜索，适合深度研究 |
| **Exa MCP** | 语义搜索 + 相似内容发现 |
| **SearXNG MCP** | 自托管元搜索引擎，隐私优先 |

#### 💾 数据库

| MCP Server | 说明 |
|------------|------|
| **Supabase MCP** | 数据库 + Auth + Edge Functions + Storage 全套 |
| **PostgreSQL MCP** | 官方 Postgres 集成 |
| **Postgres MCP Pro** (crystaldba, ★ 2.3K) | 查询分析 + 性能调优 + 安全 |
| **Neon MCP** | 云 Postgres + 分支迁移工作流 |
| **MongoDB MCP** | 40+ 工具，Atlas 管理 + 性能顾问 |
| **SQLite MCP** | 本地优先开发 |
| **Convex MCP** | 全栈功能实现，后端函数 + 表 |
| **MindsDB MCP** | 跨多数据库/仓库/SaaS 推理 |
| **DBHub** (Bytebase) | 多数据库支持（Postgres/MySQL/SQLite 等） |
| **Redis MCP** | 所有数据结构 + 向量搜索 |
| **Snowflake MCP** | 读写操作 + 洞察追踪 |

#### 🛠️ 开发工具

| MCP Server | 说明 |
|------------|------|
| **GitHub MCP** | ★ 3.2K。创建仓库、管理 Issue、Review PR、搜索代码 |
| **Figma MCP** | ★ 14K。Dev Mode 直接读取设计稿结构/Auto Layout/Tokens |
| **Context7 MCP** | 注入最新版本文档到提示词，消除 API 幻觉 |
| **Sentry MCP** | 错误追踪 + 堆栈分析 + Seer AI 诊断 |
| **Linear MCP** | Issue 追踪和项目管理 |
| **Vercel MCP** | 部署管理 |
| **Desktop Commander** | "上帝模式"：终端访问 + 进程管理 + ripgrep 搜索 |
| **Filesystem MCP** | 官方安全文件系统访问 |
| **E2B MCP** | 安全沙箱代码执行（Python/JS） |
| **Code Runner MCP** | 沙箱环境执行多语言代码 |
| **Docker Hub MCP** | 容器管理 |
| **GitMCP** | 免费远程 MCP，适用于任何 GitHub 项目 |

#### 📊 生产力 & 团队协作

| MCP Server | 说明 |
|------------|------|
| **Notion MCP** | 页面/数据库/任务实时访问 |
| **Slack MCP** | 实时对话线程、元数据、工作流 |
| **Asana MCP** | 任务/项目/Sprint 管理（官方 MCP Apps 合作伙伴） |
| **Jira MCP** (Atlassian) | Issue/Ticket/文档管理 |
| **Monday.com MCP** | 项目看板/工作流 |
| **Google Workspace MCP** | Google 全家桶集成 |
| **Box MCP** | 文件存储和文档管理 |
| **Obsidian MCP** | 本地知识库管理 |

#### 📈 商业 & 营销

| MCP Server | 说明 |
|------------|------|
| **Salesforce MCP** | CRM 数据（账户/线索/对话），官方 MCP Apps 合作伙伴 |
| **HubSpot MCP** | 营销 + 销售 + 服务 |
| **Amplitude MCP** | 产品分析/漏斗/留存数据，官方合作伙伴 |
| **Ahrefs MCP** | SEO 数据分析 |
| **Clay MCP** | 数据丰富 + 潜客发现 |
| **Stripe MCP** | 支付/交易/订阅管理 |
| **Shopify MCP** | 产品/订单/店面管理 |
| **Hex MCP** | 数据笔记本/SQL 查询/分析，官方合作伙伴 |

#### 🤖 AI & 自动化

| MCP Server | 说明 |
|------------|------|
| **Zapier MCP** | 连接数千个 App，触发自动化工作流 |
| **n8n MCP** | 工作流自动化平台，525+ 节点 |
| **Memory MCP** (Anthropic 官方) | 持久化知识图谱，跨会话记忆 |
| **Sequential Thinking MCP** | 高级推理和思维链 |
| **LangChain MCP** | 构建全功能 MCP 服务器 |
| **LlamaIndex MCP** | 结构化 + 非结构化数据源 |
| **Pinecone MCP** | 向量数据库语义检索 |
| **Vectara MCP** | 向量搜索 + RAG |

#### 🎨 设计 & 创意

| MCP Server | 说明 |
|------------|------|
| **Canva MCP** | 图形/营销视觉/社交素材 |
| **BioRender MCP** | 科学图表和插图 |
| **Excalidraw MCP** | 手绘风格图表 + SVG 动画 |
| **BlenderMCP** | Blender 3D 建模控制 |
| **21st.dev Magic MCP** | 自然语言生成 UI 组件 |

#### ☁️ 云 & 基础设施

| MCP Server | 说明 |
|------------|------|
| **Cloudflare MCP** | 16 个子服务器 + Code Mode 覆盖 2,500 API |
| **Kubernetes MCP** | K8s + OpenShift 管理 |
| **Netlify MCP** | 部署和托管 |

---

## 三、Vibe Coding 技巧 & 框架

> Vibe Coding = 用 AI 代理驱动整个开发流程，从"写代码"转变为"指挥 AI 写代码"

### 3.1 核心框架（GitHub 高星）

| 项目 | Stars | 说明 | 安装 |
|------|-------|------|------|
| **obra/superpowers** | ★ 93K | #1 框架。brainstorm → plan → implement 工作流，TDD + 子代理 + Code Review，自动触发 | `/plugin marketplace add obra/superpowers-marketplace` |
| **get-shit-done (GSD)** | ★ 32K | 解决 Context Rot。每个任务一个新上下文窗口（200K tokens），PM→研究→架构→开发→测试 | `npx get-shit-done-cc@latest` |
| **garrytan/gstack** | ★ Hot | YC CEO 的虚拟工程团队：CEO 审查、工程审查、Code Review、QA、发布、浏览器测试 | `git clone https://github.com/garrytan/gstack.git ~/.claude/skills/gstack && cd ~/.claude/skills/gstack && ./setup` |
| **vibe-kanban** | ★ 14.7K | Web 看板管理多个 AI 代理（Claude Code / Gemini CLI / Codex），并行执行 | GitHub |
| **claude-squad** | ★ 5.6K | 终端多代理管理器，tmux + git worktree 隔离，支持 Claude Code / Codex / Aider | GitHub |

### 3.2 多代理编排工具

| 项目 | Stars | 说明 |
|------|-------|------|
| **Auto-Claude** | — | 自主多代理框架（Claude Agent SDK），Kanban UI，完整 SDLC |
| **Claude Code Flow** | — | 代码优先编排层，递归代理循环中自动编写/编辑/测试/优化 |
| **claude-swarm** | ★ 1.6K | 轻松启动连接到代理群的 Claude Code 会话 |
| **awesome-claude-agents** | ★ 3.7K | 专业 AI 代理团队协作，构建完整功能 |
| **Code Conductor** | — | 多代理并行编排 + git worktree 隔离，零合并冲突 |
| **Dmux** | — | tmux + git worktree 的简化并行开发 CLI |
| **agent-of-empires** | ★ 870 | 终端会话管理器（tmux + git worktree），支持 5+ 代理 |
| **ralph-claude-code** | ★ 1.2K | 自主 AI 开发循环 + 智能退出检测 |

### 3.3 UI 客户端 & 仪表盘

| 项目 | Stars | 说明 |
|------|-------|------|
| **happy** | ★ 7.0K | Claude Code 移动端 + Web 客户端，实时语音 + 加密 |
| **claudecodeui** | ★ 5.4K | Claude Code 桌面端 + 移动端 UI |
| **1code** | ★ 4.4K | Claude Code 最佳 UI，支持本地和远程代理执行 |
| **CodePilot** | ★ 1.8K | 原生桌面 GUI：聊天 + 编码 + 项目管理 |
| **companion** | ★ 1.7K | 开源 Claude Code / Codex Web UI |
| **Sniffly** | ★ 1.1K | 使用统计仪表盘 + 错误分析 |
| **clui-cc** | ★ 946 | macOS 透明浮窗覆盖层 |
| **Claude Code Chat** (VS Code) | — | VS Code 优雅聊天界面 |

### 3.4 效率增强工具

| 项目 | Stars | 说明 |
|------|-------|------|
| **claude-code-settings** | ★ 1.1K | Vibe Coding 专用设置和命令集 |
| **claude-code-prompt-improver** | ★ 1.0K | 智能提示词改进 Hook。输入随意，输出精准 |
| **Claude-Code-Remote** | ★ 943 | 通过邮件远程控制 Claude Code |
| **Claude-Command-Suite** | ★ 904 | 专业 slash 命令集：Code Review + 功能实现 |
| **Vibe-Log** | — | 分析 Claude Code 提示词，生成漂亮的 HTML 报告 |
| **viwo-cli** | — | Docker 容器中运行 Claude Code + git worktree |
| **VoiceMode MCP** | — | 语音对话能力（Whisper.cpp + Kokoro） |
| **viberank** | — | 社区排行榜，追踪和比较 Claude Code 使用统计 |

### 3.5 最佳实践 & 指南

| 资源 | 地址 | 说明 |
|------|------|------|
| **claude-code-best-practice** | github.com/shanraisshan/claude-code-best-practice | 综合最佳实践，含视频链接和工具对比 |
| **claude-code-ultimate-guide** | github.com/FlorianBruniaux/claude-code-ultimate-guide | 从入门到高级的完整指南，含测验和速查表 |
| **awesome-claude-code** (hesreallyhim) | github.com/hesreallyhim/awesome-claude-code | 精选 Skills + Hooks + 命令 + 编排器 |
| **awesome-claude-code-toolkit** | github.com/rohitg00/awesome-claude-code-toolkit | 最全工具箱：135 agents + 35 skills + 42 commands |
| **Outcome Engineering (o16g)** | — | Cory Ondrejka 的 16 条原则：从"软件工程"到"结果工程" |
| **scriptbyai.com/claude-code-resource-list** | scriptbyai.com | 终极资源列表（2026 版） |
| **awesome-claude-code.com** | awesome-claude-code.com | 可视化浏览目录 |
| **awesomeclaude.ai** | awesomeclaude.ai | 增强探索界面 |

### 3.6 核心 Vibe Coding 技巧

```
1. 🧠 CLAUDE.md 是你的"团队宪法"
   - 在项目根目录放置 CLAUDE.md，定义代码风格、架构约束、禁止事项
   - 比每次手打提示词高效 100 倍

2. 🔄 Context Rot 管理
   - 0-50% 上下文：自由工作
   - 50-70%：注意力下降
   - 70-90%：使用 /compact
   - 90%+：强制 /clear

3. 🌳 Git Worktree 隔离
   - 每个功能分支一个 worktree
   - 并行开发不互相干扰
   - gstack、viwo-cli、claude-squad 均内置支持

4. 🎭 角色化提示
   - 不要让 AI 同时当 PM 和开发者
   - 用 gstack 的 /plan-ceo-review 和 /plan-eng-review 分阶段
   - 或用 GSD 的 PM→研究→架构→开发→测试循环

5. 🧪 TDD 优先
   - Superpowers 强制 RED/GREEN TDD
   - 先写失败测试 → 写最少代码通过 → 继续
   - 显著减少 AI 生成的逻辑错误

6. 🔒 安全第一
   - 安装任何第三方 Skill 前用 skill-vetter 审查
   - 用 VibeSec-Skill 防止常见漏洞
   - MCP 服务器可读写你的代码库——注意权限范围

7. 📝 渐进式构建
   - 不要一次性描述整个项目
   - 先 brainstorm → 再 plan → 最后 implement
   - 每步验证后再继续

8. 🤖 子代理分工
   - 复杂任务拆分给专门的子代理
   - 每个子代理有独立上下文，不会互相污染
   - Superpowers 和 claude-swarm 原生支持
```

---

## 四、快速安装命令速查

```bash
# Superpowers（#1 框架，93K Stars）
/plugin marketplace add obra/superpowers-marketplace

# GSD（解决 Context Rot，32K Stars）
npx get-shit-done-cc@latest

# gstack（YC CEO 的工作流）
git clone https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
cd ~/.claude/skills/gstack && ./setup

# Claude Squad（多代理管理）
# 见 GitHub: github.com/smtg-ai/claude-squad

# Vibe Kanban（看板管理多代理）
# 见 GitHub: github.com/ (搜索 vibe-kanban)
```

---

*最后更新：2026 年 3 月*
*数据来源：GitHub、SkillsMP、MCP.so、LobeHub、PulseMCP、Glama.ai 及各 Awesome 列表*