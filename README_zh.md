# Vibe Rules

[English](./README.md) | [中文](#vibe-rules)

**一个面板管理所有 AI 编程代理的技能。**

Vibe Rules 是一个 VSCode 插件，让你在一个面板中浏览、同步和管理 18 个 AI 编程代理的 SKILL.md 文件——Claude Code、Cursor、Codex、Gemini CLI、Windsurf、GitHub Copilot 等。

写一次技能，同步到所有代理。

## 为什么用 Vibe Rules？

每个 AI 编程代理都有自己的技能目录。如果你同时使用多个代理，就得在 `~/.claude/skills/`、`~/.cursor/skills/`、`~/.codex/skills/` 之间手动复制 SKILL.md 文件……很快就会烦了。

Vibe Rules 给你一个统一面板，一眼看到所有代理的技能，一键同步。

## 功能特性

**技能管理**
- 自动发现 18 个代理中的所有 SKILL.md 文件
- Markdown 预览查看和编辑技能
- 在面板中直接创建新技能
- 全局 (`~/`) 和项目 (`./`) 范围切换

**一键同步**
- 瞬间复制技能到其他代理
- 批量同步——选中多个技能，同步到多个代理
- 差异预览——同步前对比各代理间的技能版本
- 同步历史——追踪所有同步操作记录

![技能管理与同步](skills.gif)

**技能市场**
- 浏览 SkillHub、SkillsMP 等在线来源的技能
- 直接安装远程技能到任意代理

**MCP 发现**
- 一个视图扫描和查看所有代理的 MCP 服务器配置

**VibeTips**
- 精选 vibe coding 技巧、热门框架、推荐技能和 MCP
- 中英文双语支持

![VibeTips](vibetips.gif)

## 支持的代理

Claude Code、Codex、OpenCode、Cursor、Windsurf、Gemini CLI、GitHub Copilot、Cline、Roo Code、Augment、Continue、Goose、Kilo Code、Trae、Amp、Kimi Code CLI、Junie、Qwen Code

## 快速开始

1. 在 VSCode 中安装插件
2. 打开命令面板 (`Ctrl+Shift+P` / `Cmd+Shift+P`)
3. 运行 **Vibe Rules: Open Dashboard**
4. 已检测到的代理技能会自动显示

## 快速上手

- **代理标签** 在顶部，按代理筛选技能或查看全部
- **侧栏** 列出技能，支持搜索和多选
- **主面板** 以 Markdown 渲染展示技能内容
- **同步按钮** 将技能复制到你选择的其他代理
- **差异按钮** 显示技能在各代理间的差异
- **VibeTips 标签** 提供精选技巧、工具和技能推荐

## 设置

在 VSCode 设置中自定义代理目录或禁用特定代理：

```jsonc
{
  "vibeRules.agents": {
    "claude-code": {
      "enabled": true,
      "globalSkillsDir": "${home}/.claude/skills"
    },
    "windsurf": {
      "enabled": false
    }
  }
}
```

## 许可证

MIT
