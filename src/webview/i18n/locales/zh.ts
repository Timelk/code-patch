// Chinese locale strings
export const zh: Record<string, string> = {
  // App
  "app.title": "vibe rules",

  // Header
  "header.refresh": "刷新技能",
  "header.settings": "扩展设置",
  "header.local": "本地",
  "header.vibetips": "VibeTips",

  // Scope
  "scope.global": "全局",
  "scope.project": "项目",

  // Sidebar
  "sidebar.skills": "技能",
  "sidebar.mcps": "MCPs",
  "sidebar.search": "搜索技能...",
  "sidebar.multiSelect": "多选",
  "sidebar.exitMultiSelect": "退出多选",
  "sidebar.newSkill": "新建技能",
  "sidebar.loading": "加载中...",
  "sidebar.noSkills": "未找到技能",
  "sidebar.selectAll": "全选",
  "sidebar.deselectAll": "取消全选",

  // Context menu
  "ctx.sync": "同步",
  "ctx.delete": "删除",

  // Main content
  "main.sync": "同步",
  "main.history": "历史",
  "main.emptyTitle": "选择一个技能查看详情",
  "main.emptyHint": "点击侧栏中的技能开始使用",
  "main.emptyMultiHint": "使用复选框选择技能进行批量同步或删除",

  // Skill detail
  "detail.edit": "编辑",
  "detail.promptTemplate": "提示词模板",
  "detail.symlink": "符号链接",

  // Sync dialog
  "sync.titlePrefix": "同步",
  "sync.titleSuffix": "到：",
  "sync.allHaveSkill": "所有代理已拥有此技能",
  "sync.allAgents": "全部代理",
  "sync.alsoProject": "同时同步到项目",
  "sync.alsoProjectDesc": "复制到工作区级别的代理目录",
  "sync.alreadySynced": "已同步：",
  "sync.cancel": "取消",

  // Create skill
  "create.title": "新建技能",
  "create.name": "名称",
  "create.namePlaceholder": "my-skill-name",
  "create.description": "描述",
  "create.descPlaceholder": "这个技能的功能...",
  "create.content": "内容",
  "create.contentPlaceholder": "# 技能标题\n\n技能说明...",
  "create.submit": "创建",
  "create.cancel": "取消",

  // Confirm dialog
  "confirm.deleteOne": "删除技能",
  "confirm.deleteMessageOne": '确定要删除 "{name}" 吗？此操作无法撤销。',
  "confirm.deleteMessageMulti":
    "确定要删除以下 {count} 个技能吗？此操作无法撤销。",

  // Settings
  "settings.title": "设置",
  "settings.agents": "代理",
  "settings.installed": "已安装",
  "settings.notFound": "未找到",
  "settings.sync": "同步",
  "settings.syncMode": "同步模式",
  "settings.syncModeDesc": "技能同步到代理目录的方式",
  "settings.copy": "复制",
  "settings.activeAgents": "活跃代理",
  "settings.activeAgentsDesc": "本机检测到的代理数量",
  "settings.about": "关于",
  "settings.extension": "扩展",
  "settings.extensionDesc": "Vibe Rules — AI 代理技能管理器",
  "settings.version": "v0.2.6",
  "settings.syncEngine": "同步引擎",
  "settings.syncEngineDesc": "基于复制的同步，确保跨平台安全",
  "settings.openJson": "打开 JSON 设置",
  "settings.done": "完成",
  "settings.language": "语言",
  "settings.languageDesc": "界面显示语言",

  // Right panel
  "right.overview": "概览",
  "right.skills": "技能",
  "right.agents": "代理",
  "right.syncs": "同步",
  "right.lastSync": "上次同步",
  "right.activeFeatures": "活跃功能",
  "right.contextAwareness": "上下文感知",
  "right.contextAwarenessDesc": "自动包含导入的文件引用",
  "right.copySync": "复制同步",
  "right.copySyncDesc": "安全的跨平台复制同步",
  "right.fileWatcher": "文件监听",
  "right.fileWatcherDesc": "SKILL.md 变更自动刷新",
  "right.mcpDiscovery": "MCP 发现",
  "right.mcpDiscoveryDesc": "扫描代理 MCP 配置",
  "right.detectedAgents": "检测到的代理",
  "right.justNow": "刚刚",
  "right.last": "上次：",
  "right.agent": "个代理",
  "right.agents_plural": "个代理",

  // Agent tabs
  "agent.all": "全部",

  // MCP list
  "mcp.scanning": "扫描中...",
  "mcp.noServers": "未发现 MCP 服务器",

  // Sync history
  "history.title": "同步历史",
  "history.clear": "清除历史",
  "history.empty": "暂无同步记录",
  "history.close": "关闭",

  // VibeTips
  "vt.hots": "热门",
  "vt.skills": "技能",
  "vt.mcps": "MCPs",
  "vt.tips": "Vibe 编程技巧",
  "vt.frameworks": "热门框架和工具",
  "vt.skillMarkets": "技能市场",
  "vt.featuredSkills": "精选技能",
  "vt.mcpMarkets": "MCP 市场",
  "vt.featuredMcps": "精选 MCPs",
  "vt.install": "安装",
  "vt.visit": "访问",
};
