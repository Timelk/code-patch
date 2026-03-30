import { type FC } from "react";
import { AgentTabs } from "../agent/AgentTabs";
import { ScopeToggle } from "../common/ScopeToggle";
import type { Scope } from "../../hooks/useSkills";
import type { AgentInfo } from "../../hooks/useAgents";
import { useI18n } from "../../i18n";

type SkillSource = "local" | "vibetips";

interface HeaderProps {
  readonly scope: Scope;
  readonly onScopeChange: (scope: Scope) => void;
  readonly agentFilter: string | undefined;
  readonly onAgentFilterChange: (filter: string | undefined) => void;
  readonly onRefresh: () => void;
  readonly onOpenSettings: () => void;
  readonly agents: readonly AgentInfo[];
  readonly source: SkillSource;
  readonly onSourceChange: (source: SkillSource) => void;
}

export const Header: FC<HeaderProps> = ({
  scope,
  onScopeChange,
  agentFilter,
  onAgentFilterChange,
  onRefresh,
  onOpenSettings,
  agents,
  source,
  onSourceChange,
}) => {
  const { t } = useI18n();
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
            vibe rules
          </h1>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            className="p-1.5 rounded"
            style={{ color: "var(--cp-text-muted)", transition: "background 150ms ease, color 150ms ease" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--cp-list-hover)";
              e.currentTarget.style.color = "var(--cp-text)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--cp-text-muted)";
            }}
            onClick={onRefresh}
            title={t("header.refresh")}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 4v6h-6" />
              <path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
          <button
            className="p-1.5 rounded"
            style={{ color: "var(--cp-text-muted)", transition: "background 150ms ease, color 150ms ease" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--cp-list-hover)";
              e.currentTarget.style.color = "var(--cp-text)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--cp-text-muted)";
            }}
            onClick={onOpenSettings}
            title={t("header.settings")}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Agent tabs + source toggle + scope toggle */}
      <div className="px-4 py-2 flex items-center justify-between flex-wrap gap-3">
        <AgentTabs
          agents={agents}
          activeFilter={agentFilter}
          onFilterChange={onAgentFilterChange}
        />
        <div className="flex items-center gap-3">
          {/* Local / VibeTips toggle */}
          <div
            className="flex p-0.5 rounded"
            style={{ background: "var(--cp-input-bg)" }}
          >
            <button
              className="px-2.5 py-0.5 rounded text-[11px] font-medium transition-all"
              style={{
                background: source === "local" ? "var(--cp-primary)" : "transparent",
                color: source === "local" ? "var(--cp-primary-fg)" : "var(--cp-text-muted)",
                borderRadius: "3px",
              }}
              onClick={() => onSourceChange("local")}
            >
              {t("header.local")}
            </button>
            <button
              className="px-2.5 py-0.5 rounded text-[11px] font-semibold transition-all flex items-center gap-1"
              style={{
                background: source === "vibetips"
                  ? "linear-gradient(135deg, #f97316, #ec4899)"
                  : "transparent",
                color: source === "vibetips" ? "#fff" : "var(--cp-text-muted)",
                borderRadius: "3px",
              }}
              onClick={() => onSourceChange("vibetips")}
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
                <defs>
                  <linearGradient id="vt-bolt" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
                <path
                  d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                  fill={source === "vibetips" ? "currentColor" : "url(#vt-bolt)"}
                  stroke="none"
                />
              </svg>
              VibeTips
            </button>
          </div>
          <ScopeToggle scope={scope} onScopeChange={onScopeChange} />
        </div>
      </div>
    </header>
  );
};
