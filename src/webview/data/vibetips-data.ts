// Static data for VibeTips — sourced from vibe.md
// All URLs are opened via extension host (vscode.env.openExternal)

export interface Market {
  readonly name: string;
  readonly url: string;
  readonly description: string;
  readonly count?: string;
  readonly gradient: string;
  readonly icon: string;
}

export interface Featured {
  readonly name: string;
  readonly description: string;
  readonly url?: string;
  readonly stars?: string;
  readonly tags: readonly string[];
  readonly category?: string;
}

export interface Tip {
  readonly title: string;
  readonly emoji: string;
  readonly summary: string;
  readonly detail?: string;
}

export interface Framework {
  readonly name: string;
  readonly stars: string;
  readonly description: string;
  readonly url: string;
  readonly install?: string;
}

// ─── Hots Tab ─────────────────────────────────────────────────────

export const FRAMEWORKS: readonly Framework[] = [
  {
    name: "Superpowers",
    stars: "93K",
    description: "#1 Skills framework. Enforces TDD, sub-agent dev, code review — complete SDLC workflow.",
    url: "https://github.com/obra/superpowers",
    install: "/plugin marketplace add obra/superpowers-marketplace",
  },
  {
    name: "Get Shit Done (GSD)",
    stars: "32K",
    description: "\"One new brain per task\" — solves Context Rot. PM → Research → Architect → Dev → Test pipeline.",
    url: "https://github.com/get-shit-done/gsd",
    install: "npx get-shit-done-cc@latest",
  },
  {
    name: "gstack",
    stars: "Hot",
    description: "YC CEO Garry Tan's virtual engineering team: CEO review, eng review, QA, ship, browse.",
    url: "https://github.com/garrytan/gstack",
    install: "git clone https://github.com/garrytan/gstack.git ~/.claude/skills/gstack",
  },
  {
    name: "vibe-kanban",
    stars: "14.7K",
    description: "Web kanban managing multiple AI agents (Claude Code / Gemini CLI / Codex) in parallel.",
    url: "https://github.com/vibe-kanban/vibe-kanban",
  },
  {
    name: "claude-squad",
    stars: "5.6K",
    description: "Terminal multi-agent manager. tmux + git worktree isolation, supports Claude Code / Codex / Aider.",
    url: "https://github.com/smtg-ai/claude-squad",
  },
  {
    name: "oh-my-claudecode",
    stars: "4.8K",
    description: "Multi-agent orchestration layer: autopilot, ralph, ultrawork, team mode + 20 specialist agents.",
    url: "https://github.com/nicobailey/oh-my-claudecode",
    install: "/install oh-my-claudecode",
  },
  {
    name: "viwo-cli",
    stars: "3.2K",
    description: "Visual worktree manager. Branch isolation with TUI, auto-cleanup, IDE integration.",
    url: "https://github.com/nicobailey/viwo-cli",
  },
  {
    name: "Aider",
    stars: "27K",
    description: "AI pair programming in your terminal. Git-aware, multi-model, supports Claude/GPT/Gemini.",
    url: "https://github.com/paul-gauthier/aider",
    install: "pip install aider-chat",
  },
];

export const TIPS: readonly Tip[] = [
  {
    title: "CLAUDE.md is your team constitution",
    emoji: "\u{1F9E0}",
    summary: "Define code style, architecture constraints, and prohibitions in project root.",
    detail: "Place CLAUDE.md at project root. 100x more efficient than typing prompts every time. Include: code style, architecture decisions, forbidden patterns, testing requirements.",
  },
  {
    title: "Context Rot Management",
    emoji: "\u{1F504}",
    summary: "Monitor context usage: 50-70% caution, 70-90% use /compact, 90%+ force /clear.",
    detail: "0-50%: work freely. 50-70%: attention drops. 70-90%: use /compact. 90%+: force /clear. GSD solves this with fresh context per task.",
  },
  {
    title: "Git Worktree Isolation",
    emoji: "\u{1F333}",
    summary: "One worktree per feature branch — parallel dev without interference.",
    detail: "Each feature branch gets its own worktree. Parallel development without mutual interference. gstack, viwo-cli, claude-squad all have built-in support.",
  },
  {
    title: "Role-based Prompting",
    emoji: "\u{1F3AD}",
    summary: "Don't let AI be PM and developer simultaneously — separate concerns.",
    detail: "Use gstack's /plan-ceo-review and /plan-eng-review for staged review. Or GSD's PM \u2192 Research \u2192 Architect \u2192 Dev \u2192 Test cycle.",
  },
  {
    title: "TDD First",
    emoji: "\u{1F9EA}",
    summary: "Superpowers enforces RED/GREEN TDD — significantly reduces AI logic errors.",
    detail: "Write failing test first \u2192 write minimal code to pass \u2192 continue. Superpowers enforces this pattern. Dramatically reduces AI-generated logic errors.",
  },
  {
    title: "Security First",
    emoji: "\u{1F512}",
    summary: "Vet third-party skills before install. MCP servers can read/write your codebase.",
    detail: "Use skill-vetter to audit any third-party skill before install. Use VibeSec-Skill to prevent common vulnerabilities. MCP servers can read/write your codebase — check permission scopes.",
  },
  {
    title: "Progressive Building",
    emoji: "\u{1F4DD}",
    summary: "Don't describe entire project at once — brainstorm \u2192 plan \u2192 implement.",
    detail: "Break into phases: brainstorm first, then plan, then implement. Verify each step before continuing. Prevents scope explosion and wasted context.",
  },
  {
    title: "Sub-agent Division",
    emoji: "\u{1F916}",
    summary: "Split complex tasks to specialized sub-agents with isolated context.",
    detail: "Each sub-agent has independent context — no cross-contamination. Superpowers and claude-swarm natively support sub-agent orchestration.",
  },
  {
    title: "Headless Browser Testing",
    emoji: "\u{1F310}",
    summary: "Use Playwright MCP to verify UI changes visually — screenshot and interact.",
    detail: "Playwright MCP provides 22 tools: navigate, click, fill, screenshot, evaluate. Verify your UI changes are correct without leaving the terminal.",
  },
  {
    title: "Skill Composition",
    emoji: "\u{1F9F1}",
    summary: "Combine small focused skills instead of one monolithic prompt.",
    detail: "Keep each skill under 500 lines with a single responsibility. Chain them via sub-agent calls or sequential invocation. Easier to test, version, and reuse.",
  },
  {
    title: "MCP Server Discovery",
    emoji: "\u{1F50D}",
    summary: "Use Code Patch to scan and inventory all MCP servers across your agents.",
    detail: "Code Patch scans 5 known config locations (Claude, Cursor, Windsurf, etc.) to show all MCP servers in one view. Helps avoid duplicate or conflicting server configs.",
  },
  {
    title: "Diff Before Sync",
    emoji: "\u{1F4CA}",
    summary: "Always review skill differences across agents before syncing.",
    detail: "Different agents may have diverged copies of the same skill. Code Patch's diff engine shows content differences across all agents so you can sync the right version.",
  },
];

// ─── Skills Tab ───────────────────────────────────────────────────

export const SKILL_MARKETS: readonly Market[] = [
  {
    name: "SkillHub",
    url: "https://www.skillhub.club",
    description: "7,000+ Skills with AI scoring and Playground for instant testing.",
    count: "7,000+",
    gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    icon: "\u{1F3AF}",
  },
  {
    name: "SkillsMP",
    url: "https://skillsmp.com",
    description: "Cross-platform (Claude Code / Codex / ChatGPT), auto-sync with GitHub.",
    gradient: "linear-gradient(135deg, #3b82f6, #06b6d4)",
    icon: "\u{1F310}",
  },
  {
    name: "LobeHub Skills",
    url: "https://lobehub.com/skills",
    description: "Well-categorized: self-improvement, memory, Reddit reader and more.",
    gradient: "linear-gradient(135deg, #10b981, #34d399)",
    icon: "\u{1F9E9}",
  },
  {
    name: "ClaudeSkills.info",
    url: "https://claudeskills.info",
    description: "Largest Claude Skills marketplace. Categorized by security, docs, creativity.",
    gradient: "linear-gradient(135deg, #f97316, #fb923c)",
    icon: "\u{1F4DA}",
  },
  {
    name: "Awesome-Skills.com",
    url: "https://awesome-skills.com",
    description: "128+ curated skills, daily security audits, with install guides.",
    count: "128+",
    gradient: "linear-gradient(135deg, #ec4899, #f472b6)",
    icon: "\u2B50",
  },
  {
    name: "ClaudeMarketplaces",
    url: "https://claudemarketplaces.com",
    description: "Ranked by installs, stars, and community votes.",
    gradient: "linear-gradient(135deg, #8b5cf6, #a78bfa)",
    icon: "\u{1F3C6}",
  },
  {
    name: "ClaudePluginHub",
    url: "https://www.claudepluginhub.com",
    description: "Combined plugins + skills directory for the Claude ecosystem.",
    gradient: "linear-gradient(135deg, #14b8a6, #2dd4bf)",
    icon: "\u{1F50C}",
  },
];

export const FEATURED_SKILLS: readonly Featured[] = [
  {
    name: "Superpowers",
    description: "#1 Skills framework — TDD, sub-agent dev, code review, complete SDLC.",
    stars: "93K",
    tags: ["workflow", "tdd", "code-review"],
    url: "https://github.com/obra/superpowers",
    category: "Workflow",
  },
  {
    name: "VibeSec-Skill",
    description: "Helps Claude write secure code. Prevents common vulnerabilities. Essential for web apps.",
    stars: "496",
    tags: ["security", "web"],
    url: "https://github.com/vibesec/vibesec-skill",
    category: "Security",
  },
  {
    name: "SkillForge",
    description: "Meta-skill that generates high-quality Claude Code Skills.",
    stars: "467",
    tags: ["meta", "generator"],
    category: "Meta",
  },
  {
    name: "Pretty-mermaid-skills",
    description: "Mermaid diagram rendering (SVG + ASCII).",
    stars: "487",
    tags: ["diagrams", "visualization"],
    category: "Frontend",
  },
  {
    name: "translate-book",
    description: "Translate entire books (PDF/DOCX/EPUB) using parallel sub-agents.",
    stars: "432",
    tags: ["translation", "documents"],
    category: "Documents",
  },
  {
    name: "nuxt-skills",
    description: "Vue / Nuxt / NuxtHub dedicated skills.",
    stars: "475",
    tags: ["vue", "nuxt", "frontend"],
    category: "Frontend",
  },
  {
    name: "ios-simulator-skill",
    description: "iOS Simulator skill — build, run, and interact with apps.",
    stars: "440",
    tags: ["ios", "mobile", "simulator"],
    category: "Mobile",
  },
  {
    name: "sickn33",
    description: "130+ Agentic Skills ultimate collection.",
    stars: "448",
    tags: ["collection", "agentic"],
    category: "Collection",
  },
  {
    name: "systematic-debugging",
    description: "4-phase structured debugging. No random guessing — root cause analysis enforced.",
    tags: ["debugging", "methodology"],
    category: "Testing",
  },
  {
    name: "test-driven-development",
    description: "Enforced TDD: write tests first, then implement.",
    tags: ["tdd", "testing"],
    category: "Testing",
  },
  {
    name: "Trail of Bits Security",
    description: "CodeQL/Semgrep static analysis, variant analysis, code audit, fix verification.",
    tags: ["security", "static-analysis"],
    category: "Security",
  },
  {
    name: "web-artifacts-builder",
    description: "Build beautiful HTML Artifacts with React + Tailwind + shadcn/ui.",
    tags: ["react", "tailwind", "html"],
    category: "Frontend",
  },
  {
    name: "oh-my-claudecode",
    description: "Multi-agent orchestration: autopilot, ralph persistence loop, ultrawork parallel exec, team mode.",
    stars: "4.8K",
    tags: ["orchestration", "multi-agent", "workflow"],
    url: "https://github.com/nicobailey/oh-my-claudecode",
    category: "Workflow",
  },
  {
    name: "claude-engineer",
    description: "Full-stack development agent with file operations, web search, and code analysis.",
    stars: "520",
    tags: ["full-stack", "agent"],
    category: "Workflow",
  },
  {
    name: "cursor-rules-generator",
    description: "Auto-generate .cursorrules from your codebase patterns and conventions.",
    stars: "380",
    tags: ["cursor", "rules", "automation"],
    category: "Meta",
  },
  {
    name: "react-component-skill",
    description: "Generate production-grade React components with TypeScript, tests, and Storybook stories.",
    tags: ["react", "typescript", "components"],
    category: "Frontend",
  },
  {
    name: "docker-compose-skill",
    description: "Generate and manage Docker Compose configurations with best practices.",
    tags: ["docker", "devops", "infrastructure"],
    category: "DevOps",
  },
];

// ─── MCPs Tab ─────────────────────────────────────────────────────

export const MCP_MARKETS: readonly Market[] = [
  {
    name: "MCP.so",
    url: "https://mcp.so",
    description: "Largest third-party MCP marketplace.",
    count: "18,998+",
    gradient: "linear-gradient(135deg, #1e293b, #334155)",
    icon: "\u{1F30D}",
  },
  {
    name: "LobeHub MCP",
    url: "https://lobehub.com/mcp",
    description: "Most comprehensive categories: dev, productivity, media, business, science, finance.",
    count: "42,700+",
    gradient: "linear-gradient(135deg, #0f172a, #1e40af)",
    icon: "\u{1F4E6}",
  },
  {
    name: "PulseMCP",
    url: "https://www.pulsemcp.com/servers",
    description: "Daily updates, official partnership.",
    count: "12,560+",
    gradient: "linear-gradient(135deg, #7c3aed, #4f46e5)",
    icon: "\u{1F4A1}",
  },
  {
    name: "Glama.ai",
    url: "https://glama.ai/mcp/servers",
    description: "Visual previews for comprehensive MCP discovery.",
    gradient: "linear-gradient(135deg, #059669, #047857)",
    icon: "\u{1F52E}",
  },
  {
    name: "MCP Market",
    url: "https://mcpmarket.com",
    description: "Cross-category MCP server discovery.",
    gradient: "linear-gradient(135deg, #b91c1c, #dc2626)",
    icon: "\u{1F6D2}",
  },
  {
    name: "mcpservers.org",
    url: "https://mcpservers.org",
    description: "Official Awesome MCP Servers site.",
    gradient: "linear-gradient(135deg, #0369a1, #0284c7)",
    icon: "\u{1F3E0}",
  },
  {
    name: "mcp-awesome.com",
    url: "https://mcp-awesome.com",
    description: "Quality verified, 1,200+ servers with install guides.",
    count: "1,200+",
    gradient: "linear-gradient(135deg, #c2410c, #ea580c)",
    icon: "\u2728",
  },
  {
    name: "MCP Playground",
    url: "https://mcpplaygroundonline.com",
    description: "Test MCP servers online instantly.",
    gradient: "linear-gradient(135deg, #4338ca, #6366f1)",
    icon: "\u{1F3AE}",
  },
];

export const FEATURED_MCPS: readonly Featured[] = [
  {
    name: "Playwright MCP",
    description: "Top-rated. Accessibility tree targeting, 3 engines, 22 tools, code generation.",
    stars: "28K+",
    tags: ["browser", "automation", "microsoft"],
    url: "https://github.com/anthropics/mcp-playwright",
    category: "Browser",
  },
  {
    name: "Figma MCP",
    description: "Dev Mode reads design structure, Auto Layout, Tokens directly.",
    stars: "14K",
    tags: ["design", "figma", "ui"],
    category: "Dev Tools",
  },
  {
    name: "GitHub MCP",
    description: "Create repos, manage issues, review PRs, search code.",
    stars: "3.2K",
    tags: ["github", "git", "code"],
    category: "Dev Tools",
  },
  {
    name: "Context7 MCP",
    description: "Inject latest docs into prompts — eliminates API hallucinations.",
    tags: ["docs", "context", "accuracy"],
    category: "Dev Tools",
  },
  {
    name: "Supabase MCP",
    description: "Database + Auth + Edge Functions + Storage — full stack.",
    tags: ["database", "auth", "supabase"],
    category: "Database",
  },
  {
    name: "Postgres MCP Pro",
    description: "Query analysis + performance tuning + security.",
    stars: "2.3K",
    tags: ["postgres", "database", "performance"],
    category: "Database",
  },
  {
    name: "Brave Search MCP",
    description: "Independent search engine, no ads, no tracking.",
    tags: ["search", "privacy"],
    category: "Search",
  },
  {
    name: "Firecrawl MCP",
    description: "Web scraping + structured data extraction + Markdown conversion.",
    tags: ["scraping", "data", "markdown"],
    category: "Search",
  },
  {
    name: "Notion MCP",
    description: "Pages, databases, and tasks — real-time access.",
    tags: ["notion", "productivity"],
    category: "Productivity",
  },
  {
    name: "Slack MCP",
    description: "Real-time conversations, threads, metadata, workflows.",
    tags: ["slack", "messaging"],
    category: "Productivity",
  },
  {
    name: "Cloudflare MCP",
    description: "16 sub-servers + Code Mode covering 2,500 APIs.",
    tags: ["cloud", "infrastructure"],
    category: "Cloud",
  },
  {
    name: "Zapier MCP",
    description: "Connect thousands of apps, trigger automated workflows.",
    tags: ["automation", "workflow"],
    category: "AI & Automation",
  },
  {
    name: "Memory MCP",
    description: "Persistent knowledge graph for cross-session memory. Official Anthropic.",
    tags: ["memory", "knowledge-graph", "official"],
    category: "AI & Automation",
  },
  {
    name: "Desktop Commander",
    description: "\"God mode\": terminal access + process management + ripgrep search.",
    tags: ["terminal", "filesystem"],
    category: "Dev Tools",
  },
  {
    name: "Linear MCP",
    description: "Issue tracking integration — create, update, search issues and projects.",
    tags: ["project-management", "issues"],
    category: "Productivity",
  },
  {
    name: "Sentry MCP",
    description: "Error monitoring — query issues, stack traces, and performance data.",
    tags: ["monitoring", "errors", "debugging"],
    category: "Dev Tools",
  },
  {
    name: "Vercel MCP",
    description: "Deploy previews, manage projects, check build logs from your agent.",
    tags: ["deployment", "vercel", "hosting"],
    category: "Cloud",
  },
  {
    name: "Stripe MCP",
    description: "Payment integration — manage products, prices, subscriptions, and invoices.",
    tags: ["payments", "stripe", "fintech"],
    category: "AI & Automation",
  },
  {
    name: "Puppeteer MCP",
    description: "Headless Chrome automation — navigate, screenshot, evaluate JS in pages.",
    stars: "3.8K",
    tags: ["browser", "automation", "chrome"],
    category: "Browser",
  },
  {
    name: "Obsidian MCP",
    description: "Read, search, and write notes in Obsidian vaults for knowledge management.",
    tags: ["notes", "knowledge", "obsidian"],
    category: "Productivity",
  },
];
