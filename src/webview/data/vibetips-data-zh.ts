// Chinese description overrides for VibeTips data
// Only translatable fields (description, summary, detail) — names/brands stay English

export const ZH_FRAMEWORKS: Record<string, string> = {
  "Superpowers": "#1 技能框架。强制 TDD、子代理开发、代码审查——完整的 SDLC 工作流。",
  "Get Shit Done (GSD)": "\"每个任务一个全新大脑\"——解决上下文腐化问题。PM → 调研 → 架构 → 开发 → 测试流水线。",
  "gstack": "YC CEO Garry Tan 的虚拟工程团队：CEO 审查、工程审查、QA、发布、浏览。",
  "vibe-kanban": "Web 看板管理多个 AI 代理（Claude Code / Gemini CLI / Codex）并行工作。",
  "claude-squad": "终端多代理管理器。tmux + git worktree 隔离，支持 Claude Code / Codex / Aider。",
  "oh-my-claudecode": "多代理编排层：自动驾驶、ralph、ultrawork、团队模式 + 20 个专家代理。",
  "viwo-cli": "可视化工作树管理器。分支隔离 + TUI，自动清理，IDE 集成。",
  "Aider": "终端 AI 结对编程。Git 感知、多模型支持 Claude/GPT/Gemini。",
};

export const ZH_TIPS: Record<string, { summary: string; detail?: string }> = {
  "CLAUDE.md is your team constitution": {
    summary: "在项目根目录定义代码风格、架构约束和禁止规则。",
    detail: "在项目根目录放置 CLAUDE.md。比每次输入提示词高效 100 倍。包含：代码风格、架构决策、禁止模式、测试要求。",
  },
  "Context Rot Management": {
    summary: "监控上下文使用率：50-70% 注意，70-90% 用 /compact，90%+ 强制 /clear。",
    detail: "0-50%：自由工作。50-70%：注意力下降。70-90%：使用 /compact。90%+：强制 /clear。GSD 通过每个任务全新上下文解决此问题。",
  },
  "Git Worktree Isolation": {
    summary: "每个功能分支一个工作树——并行开发互不干扰。",
    detail: "每个功能分支拥有独立的工作树。并行开发互不干扰。gstack、viwo-cli、claude-squad 都有内置支持。",
  },
  "Role-based Prompting": {
    summary: "不要让 AI 同时充当 PM 和开发者——关注点分离。",
    detail: "使用 gstack 的 /plan-ceo-review 和 /plan-eng-review 进行分阶段审查。或 GSD 的 PM → 调研 → 架构 → 开发 → 测试循环。",
  },
  "TDD First": {
    summary: "Superpowers 强制 RED/GREEN TDD——显著减少 AI 逻辑错误。",
    detail: "先写失败测试 → 写最少代码通过 → 继续。Superpowers 强制执行此模式。显著减少 AI 生成的逻辑错误。",
  },
  "Security First": {
    summary: "安装前审查第三方技能。MCP 服务器可以读写你的代码库。",
    detail: "使用 skill-vetter 审核任何第三方技能。使用 VibeSec-Skill 防止常见漏洞。MCP 服务器可以读写你的代码库——检查权限范围。",
  },
  "Progressive Building": {
    summary: "不要一次描述整个项目——头脑风暴 → 计划 → 实施。",
    detail: "分阶段：先头脑风暴，然后计划，再实施。每一步验证后再继续。防止范围爆炸和上下文浪费。",
  },
  "Sub-agent Division": {
    summary: "将复杂任务拆分给专门的子代理，使用隔离的上下文。",
    detail: "每个子代理有独立上下文——无交叉污染。Superpowers 和 claude-swarm 原生支持子代理编排。",
  },
  "Headless Browser Testing": {
    summary: "使用 Playwright MCP 可视化验证 UI 变更——截图和交互。",
    detail: "Playwright MCP 提供 22 个工具：导航、点击、填写、截图、执行。无需离开终端即可验证 UI 变更。",
  },
  "Skill Composition": {
    summary: "组合小型专注技能，而非一个庞大的提示词。",
    detail: "每个技能保持在 500 行以内，单一职责。通过子代理调用或顺序调用链接。更易测试、版本控制和复用。",
  },
  "MCP Server Discovery": {
    summary: "使用 Vibe Rules 扫描和盘点所有代理的 MCP 服务器。",
    detail: "Vibe Rules 扫描 5 个已知配置位置（Claude、Cursor、Windsurf 等），在一个视图中显示所有 MCP 服务器。帮助避免重复或冲突的服务器配置。",
  },
  "Diff Before Sync": {
    summary: "同步前始终检查代理间的技能差异。",
    detail: "不同代理可能有同一技能的不同副本。Vibe Rules 的差异引擎显示所有代理间的内容差异，方便你同步正确的版本。",
  },
};

export const ZH_SKILL_MARKETS: Record<string, string> = {
  "SkillHub": "7,000+ 技能，AI 评分和 Playground 即时测试。",
  "SkillsMP": "跨平台（Claude Code / Codex / ChatGPT），GitHub 自动同步。",
  "LobeHub Skills": "分类齐全：自我提升、记忆、Reddit 阅读器等。",
  "ClaudeSkills.info": "最大的 Claude 技能市场。按安全、文档、创意分类。",
  "Awesome-Skills.com": "128+ 精选技能，每日安全审计，附安装指南。",
  "ClaudeMarketplaces": "按安装量、星标和社区投票排名。",
  "ClaudePluginHub": "Claude 生态系统的插件 + 技能综合目录。",
};

export const ZH_FEATURED_SKILLS: Record<string, string> = {
  "Superpowers": "#1 技能框架——TDD、子代理开发、代码审查、完整 SDLC。",
  "VibeSec-Skill": "帮助 Claude 编写安全代码。防止常见漏洞。Web 应用必备。",
  "SkillForge": "元技能——生成高质量 Claude Code 技能。",
  "Pretty-mermaid-skills": "Mermaid 图表渲染（SVG + ASCII）。",
  "translate-book": "使用并行子代理翻译整本书（PDF/DOCX/EPUB）。",
  "nuxt-skills": "Vue / Nuxt / NuxtHub 专用技能。",
  "ios-simulator-skill": "iOS 模拟器技能——构建、运行和交互应用。",
  "sickn33": "130+ 代理技能终极合集。",
  "systematic-debugging": "4 阶段结构化调试。无随机猜测——强制根因分析。",
  "test-driven-development": "强制 TDD：先写测试，再实现。",
  "Trail of Bits Security": "CodeQL/Semgrep 静态分析、变体分析、代码审计、修复验证。",
  "web-artifacts-builder": "使用 React + Tailwind + shadcn/ui 构建精美 HTML Artifacts。",
  "oh-my-claudecode": "多代理编排：自动驾驶、ralph 持久循环、ultrawork 并行执行、团队模式。",
  "claude-engineer": "全栈开发代理，支持文件操作、网络搜索和代码分析。",
  "cursor-rules-generator": "从代码库模式和约定自动生成 .cursorrules。",
  "react-component-skill": "生成生产级 React 组件，包含 TypeScript、测试和 Storybook。",
  "docker-compose-skill": "按最佳实践生成和管理 Docker Compose 配置。",
};

export const ZH_MCP_MARKETS: Record<string, string> = {
  "MCP.so": "最大的第三方 MCP 市场。",
  "LobeHub MCP": "分类最全：开发、效率、媒体、商业、科学、金融。",
  "PulseMCP": "每日更新，官方合作。",
  "Glama.ai": "可视化预览，全面的 MCP 发现。",
  "MCP Market": "跨类别 MCP 服务器发现。",
  "mcpservers.org": "官方 Awesome MCP Servers 网站。",
  "mcp-awesome.com": "质量认证，1,200+ 服务器附安装指南。",
  "MCP Playground": "在线即时测试 MCP 服务器。",
};

export const ZH_FEATURED_MCPS: Record<string, string> = {
  "Playwright MCP": "最高评分。无障碍树定位，3 引擎，22 工具，代码生成。",
  "Figma MCP": "Dev Mode 直接读取设计结构、Auto Layout、Tokens。",
  "GitHub MCP": "创建仓库、管理 Issues、审查 PR、搜索代码。",
  "Context7 MCP": "将最新文档注入提示词——消除 API 幻觉。",
  "Supabase MCP": "数据库 + 认证 + Edge Functions + 存储——全栈。",
  "Postgres MCP Pro": "查询分析 + 性能调优 + 安全。",
  "Brave Search MCP": "独立搜索引擎，无广告，无追踪。",
  "Firecrawl MCP": "网页抓取 + 结构化数据提取 + Markdown 转换。",
  "Notion MCP": "页面、数据库和任务——实时访问。",
  "Slack MCP": "实时对话、线程、元数据、工作流。",
  "Cloudflare MCP": "16 个子服务器 + Code Mode 覆盖 2,500 API。",
  "Zapier MCP": "连接数千应用，触发自动化工作流。",
  "Memory MCP": "持久化知识图谱，跨会话记忆。Anthropic 官方。",
  "Desktop Commander": "\"上帝模式\"：终端访问 + 进程管理 + ripgrep 搜索。",
  "Linear MCP": "Issue 追踪集成——创建、更新、搜索 Issues 和项目。",
  "Sentry MCP": "错误监控——查询 Issues、堆栈跟踪和性能数据。",
  "Vercel MCP": "部署预览、管理项目、从代理查看构建日志。",
  "Stripe MCP": "支付集成——管理产品、价格、订阅和发票。",
  "Puppeteer MCP": "无头 Chrome 自动化——导航、截图、在页面中执行 JS。",
  "Obsidian MCP": "在 Obsidian 知识库中读取、搜索和写入笔记。",
};
