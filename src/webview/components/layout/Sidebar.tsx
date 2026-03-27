import { type FC, useState, useRef, useEffect, useCallback } from "react";
import { SkillList } from "../skill/SkillList";
import { SearchInput } from "../common/SearchInput";
import { McpList, type McpServer } from "../mcp/McpList";
import type { Skill } from "../../hooks/useSkills";

interface SidebarProps {
  readonly skills: readonly Skill[];
  readonly selectedSkill: Skill | null;
  readonly onSelectSkill: (skill: Skill) => void;
  readonly searchQuery: string;
  readonly onSearchChange: (query: string) => void;
  readonly loading: boolean;
  readonly onCreateSkill: () => void;
  readonly mcpServers: readonly McpServer[];
  readonly mcpLoading: boolean;
  readonly onLoadMcps: () => void;
  readonly multiSelect: boolean;
  readonly onToggleMultiSelect: () => void;
  readonly selectedSkillNames: ReadonlySet<string>;
  readonly onToggleSkillSelection: (name: string) => void;
  readonly onSelectAll: () => void;
  readonly onDeleteSkill: (skill: Skill) => void;
  readonly onSyncSkill: (skill: Skill) => void;
  /** Show agent badge in skill list — only in ALL mode */
  readonly showBadge: boolean;
}

type SidebarTab = "skills" | "mcps";

export const Sidebar: FC<SidebarProps> = ({
  skills,
  selectedSkill,
  onSelectSkill,
  searchQuery,
  onSearchChange,
  loading,
  onCreateSkill,
  mcpServers,
  mcpLoading,
  onLoadMcps,
  multiSelect,
  onToggleMultiSelect,
  selectedSkillNames,
  onToggleSkillSelection,
  onSelectAll,
  onDeleteSkill,
  onSyncSkill,
  showBadge,
}) => {
  const [activeTab, setActiveTab] = useState<SidebarTab>("skills");
  const containerRef = useRef<HTMLDivElement>(null);
  const skillsTabRef = useRef<HTMLButtonElement>(null);
  const mcpsTabRef = useRef<HTMLButtonElement>(null);
  const [underline, setUnderline] = useState({ left: 0, width: 0, ready: false });

  const updateUnderline = useCallback(() => {
    const el = activeTab === "skills" ? skillsTabRef.current : mcpsTabRef.current;
    const container = containerRef.current;
    if (el && container) {
      const cRect = container.getBoundingClientRect();
      const eRect = el.getBoundingClientRect();
      setUnderline({
        left: eRect.left - cRect.left,
        width: eRect.width,
        ready: true,
      });
    }
  }, [activeTab]);

  useEffect(() => {
    updateUnderline();
  }, [updateUnderline]);

  const handleTabChange = (tab: SidebarTab) => {
    setActiveTab(tab);
    if (tab === "mcps" && mcpServers.length === 0) {
      onLoadMcps();
    }
  };

  return (
    <aside
      className="flex flex-col shrink-0 border-r h-full"
      style={{
        background: "var(--cp-surface)",
        borderColor: "var(--cp-border)",
      }}
    >
      {/* Tab buttons with animated underline */}
      <div
        ref={containerRef}
        className="relative flex border-b"
        style={{ borderColor: "var(--cp-border)" }}
      >
        <button
          ref={skillsTabRef}
          className="flex-1 py-2 text-xs font-semibold transition-colors duration-150"
          style={{
            color: activeTab === "skills" ? "var(--cp-primary)" : "var(--cp-text-muted)",
            background: activeTab === "skills" ? "rgba(14, 99, 156, 0.06)" : "transparent",
          }}
          onClick={() => handleTabChange("skills")}
        >
          Skills
        </button>
        <button
          ref={mcpsTabRef}
          className="flex-1 py-2 text-xs font-medium transition-colors duration-150"
          style={{
            color: activeTab === "mcps" ? "var(--cp-primary)" : "var(--cp-text-muted)",
            background: activeTab === "mcps" ? "rgba(14, 99, 156, 0.06)" : "transparent",
          }}
          onClick={() => handleTabChange("mcps")}
        >
          MCPs
        </button>
        {/* Sliding underline */}
        {underline.ready && (
          <div
            className="absolute bottom-0 h-[2px] cp-tab-indicator"
            style={{
              left: underline.left,
              width: underline.width,
              background: "var(--cp-primary)",
            }}
          />
        )}
      </div>

      {activeTab === "skills" ? (
        <>
          <div className="p-2 flex gap-1">
            <div className="flex-1">
              <SearchInput
                value={searchQuery}
                onChange={onSearchChange}
                placeholder="Search skills..."
              />
            </div>
            <button
              className="shrink-0 w-7 h-7 flex items-center justify-center rounded transition-all duration-150"
              style={{
                background: multiSelect ? "var(--cp-primary)" : "transparent",
                color: multiSelect ? "var(--cp-primary-fg)" : "var(--cp-text-muted)",
                border: multiSelect ? "none" : "1px solid var(--cp-border)",
              }}
              onClick={onToggleMultiSelect}
              title={multiSelect ? "Exit multi-select" : "Multi-select"}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 11 12 14 22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </button>
            <button
              className="shrink-0 w-7 h-7 flex items-center justify-center rounded transition-all duration-150"
              style={{
                background: "var(--cp-primary)",
                color: "var(--cp-primary-fg)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--cp-primary-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--cp-primary)";
              }}
              onClick={onCreateSkill}
              title="New Skill"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-1 pb-2">
            {loading ? (
              <div className="p-3 text-xs text-center" style={{ color: "var(--cp-text-muted)" }}>
                Loading...
              </div>
            ) : (
              <SkillList
                skills={skills}
                selectedSkill={selectedSkill}
                onSelectSkill={onSelectSkill}
                multiSelect={multiSelect}
                selectedSkillNames={selectedSkillNames}
                onToggleSkillSelection={onToggleSkillSelection}
                onSelectAll={onSelectAll}
                onDeleteSkill={onDeleteSkill}
                onSyncSkill={onSyncSkill}
                showBadge={showBadge}
              />
            )}
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto px-1 py-2">
          <McpList servers={mcpServers} loading={mcpLoading} />
        </div>
      )}
    </aside>
  );
};
