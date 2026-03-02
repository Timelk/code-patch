/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/webview/**/*.{tsx,ts,html}"],
  theme: {
    extend: {
      colors: {
        "vscode-bg": "var(--vscode-editor-background)",
        "vscode-surface": "var(--vscode-sideBar-background)",
        "vscode-border": "var(--vscode-panel-border)",
        "vscode-text": "var(--vscode-editor-foreground)",
        "vscode-text-muted": "var(--vscode-descriptionForeground)",
        "vscode-primary": "var(--vscode-button-background)",
        "vscode-primary-hover": "var(--vscode-button-hoverBackground)",
        "vscode-primary-fg": "var(--vscode-button-foreground)",
        "vscode-input-bg": "var(--vscode-input-background)",
        "vscode-input-border": "var(--vscode-input-border)",
        "vscode-badge-bg": "var(--vscode-badge-background)",
        "vscode-badge-fg": "var(--vscode-badge-foreground)",
        "vscode-list-hover": "var(--vscode-list-hoverBackground)",
        "vscode-list-active": "var(--vscode-list-activeSelectionBackground)",
        "vscode-list-active-fg": "var(--vscode-list-activeSelectionForeground)",
        "vscode-focus-border": "var(--vscode-focusBorder)",
        "vscode-success": "var(--vscode-terminal-ansiGreen)",
        "vscode-error": "var(--vscode-errorForeground)",
        "vscode-warning": "var(--vscode-editorWarning-foreground)",
      },
      fontFamily: {
        vscode: "var(--vscode-font-family)",
        "vscode-mono": "var(--vscode-editor-font-family)",
      },
      fontSize: {
        "vscode-base": "var(--vscode-font-size)",
        "vscode-editor": "var(--vscode-editor-font-size)",
      },
    },
  },
  plugins: [],
};
