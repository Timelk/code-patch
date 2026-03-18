import { type FC } from "react";
import { AgentTabs } from "../agent/AgentTabs";
import { ScopeToggle } from "../common/ScopeToggle";
import type { Scope } from "../../hooks/useSkills";

interface AgentInfo {
  readonly name: string;
  readonly displayName: string;
  readonly installed: boolean;
}

interface HeaderProps {
  readonly scope: Scope;
  readonly onScopeChange: (scope: Scope) => void;
  readonly agentFilter: string | undefined;
  readonly onAgentFilterChange: (filter: string | undefined) => void;
  readonly onOpenSettings: () => void;
  readonly agents: readonly AgentInfo[];
}

export const Header: FC<HeaderProps> = ({
  scope,
  onScopeChange,
  agentFilter,
  onAgentFilterChange,
  onOpenSettings,
  agents,
}) => {
  return (
    <header className="shrink-0 border-b" style={{ borderColor: "var(--cp-border)", background: "var(--cp-surface)" }}>
      {/* Top bar */}
      <div className="px-4 py-2 flex items-center justify-between border-b" style={{ borderColor: "var(--cp-border)" }}>
        <div className="flex items-center gap-2">
          <div className="p-1 rounded" style={{ background: "rgba(14, 99, 156, 0.15)" }}>
            <svg className="w-5 h-5" style={{ color: "var(--cp-primary)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
          </div>
          <h1 className="text-sm font-bold tracking-tight" style={{ color: "var(--cp-text)", fontFamily: "var(--vscode-editor-font-family, monospace)" }}>
            code patch
          </h1>
        </div>
        <button
          className="p-1.5 rounded transition-colors"
          style={{ color: "var(--cp-text-muted)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--cp-list-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
          onClick={onOpenSettings}
          title="Extension Settings"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>

      {/* Agent tabs + scope toggle */}
      <div className="px-4 py-2 flex items-center justify-between flex-wrap gap-3">
        <AgentTabs
          agents={agents}
          activeFilter={agentFilter}
          onFilterChange={onAgentFilterChange}
        />
        <ScopeToggle scope={scope} onScopeChange={onScopeChange} />
      </div>
    </header>
  );
};
