import { type FC, useMemo, useRef, useState, useEffect, useCallback } from "react";

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

/**
 * Agent filter tabs with animated sliding indicator.
 */
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

  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });

  const updateIndicator = useCallback(() => {
    const key = activeFilter ?? "__all__";
    const el = tabRefs.current.get(key);
    const container = containerRef.current;
    if (el && container) {
      const cRect = container.getBoundingClientRect();
      const eRect = el.getBoundingClientRect();
      setIndicator({
        left: eRect.left - cRect.left,
        width: eRect.width,
        ready: true,
      });
    }
  }, [activeFilter]);

  useEffect(() => {
    updateIndicator();
  }, [updateIndicator, tabs]);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center p-0.5 rounded-md gap-0.5 flex-wrap"
      style={{ background: "var(--cp-input-bg)" }}
    >
      {/* Sliding indicator */}
      {indicator.ready && (
        <div
          className="absolute top-0.5 bottom-0.5 rounded transition-all duration-200 ease-out pointer-events-none"
          style={{
            left: indicator.left,
            width: indicator.width,
            background: "var(--cp-surface)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
          }}
        />
      )}
      {tabs.map((tab) => {
        const key = tab.value ?? "__all__";
        const isActive = activeFilter === tab.value;
        return (
          <button
            key={key}
            ref={(el) => {
              if (el) tabRefs.current.set(key, el);
              else tabRefs.current.delete(key);
            }}
            className="relative z-10 px-2.5 py-1 rounded text-[11px] font-medium transition-colors duration-150 whitespace-nowrap"
            style={{
              color: isActive ? "var(--cp-text)" : "var(--cp-text-muted)",
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
