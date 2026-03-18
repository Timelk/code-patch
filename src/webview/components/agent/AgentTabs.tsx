import { type FC, useMemo } from "react";

interface AgentInfo {
  readonly name: string;
  readonly displayName: string;
  readonly installed: boolean;
}

interface AgentTabsProps {
  readonly agents: readonly AgentInfo[];
  readonly activeFilter: string | undefined;
  readonly onFilterChange: (filter: string | undefined) => void;
}

export const AgentTabs: FC<AgentTabsProps> = ({
  agents,
  activeFilter,
  onFilterChange,
}) => {
  const tabs = useMemo(() => {
    const installed = agents
      .filter((a) => a.installed)
      .map((a) => ({ label: a.displayName, value: a.name }));
    return [...installed, { label: "All", value: undefined as string | undefined }];
  }, [agents]);

  return (
    <div
      className="flex items-center p-0.5 rounded gap-0.5 flex-wrap"
      style={{ background: "var(--cp-input-bg)" }}
    >
      {tabs.map((tab) => {
        const isActive = activeFilter === tab.value;
        return (
          <button
            key={tab.label}
            className="px-2.5 py-1 rounded text-[11px] font-medium transition-all whitespace-nowrap"
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
