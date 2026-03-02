import { type FC } from "react";

interface AgentTabsProps {
  readonly activeFilter: string | undefined;
  readonly onFilterChange: (filter: string | undefined) => void;
}

const TABS: readonly { label: string; value: string | undefined }[] = [
  { label: "Claude Code", value: "claude-code" },
  { label: "Codex", value: "codex" },
  { label: "OpenCode", value: "opencode" },
  { label: "All", value: undefined },
];

export const AgentTabs: FC<AgentTabsProps> = ({
  activeFilter,
  onFilterChange,
}) => {
  return (
    <div
      className="flex items-center p-0.5 rounded"
      style={{ background: "var(--cp-input-bg)" }}
    >
      {TABS.map((tab) => {
        const isActive = activeFilter === tab.value;
        return (
          <button
            key={tab.label}
            className="px-2.5 py-1 rounded text-[11px] font-medium transition-all"
            style={{
              background: isActive ? "var(--cp-surface)" : "transparent",
              color: isActive ? "var(--cp-text)" : "var(--cp-text-muted)",
              boxShadow: isActive ? "0 1px 2px rgba(0,0,0,0.2)" : "none",
            }}
            onClick={() => onFilterChange(tab.value)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
