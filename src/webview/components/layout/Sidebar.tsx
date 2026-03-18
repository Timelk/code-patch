import { type FC, useState } from "react";
import { SkillList } from "../skill/SkillList";
import { RemoteSkillPanel } from "../skill/RemoteSkillPanel";
import { SearchInput } from "../common/SearchInput";
import { McpList, type McpServer } from "../mcp/McpList";
import type { Skill } from "../../hooks/useSkills";
import type { RemoteSkill } from "../../services/remote-skill-api";

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
  // Remote skill props
  readonly remoteSkills: readonly RemoteSkill[];
  readonly remoteTotal: number;
  readonly remoteLoading: boolean;
  readonly remoteError: string | null;
  readonly onRemoteSearch: (sourceId: string, query?: string) => void;
  readonly installedSkillNames: ReadonlySet<string>;
  readonly onRemoteInstall: (sourceId: string, skill: RemoteSkill) => void;
  readonly onRemoteRemove: (skillName: string) => void;
  readonly pendingRemoteSkills: ReadonlySet<string>;
}

type SidebarTab = "skills" | "mcps";
type SkillSource = "local" | "remote";

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
  remoteSkills,
  remoteTotal,
  remoteLoading,
  remoteError,
  onRemoteSearch,
  installedSkillNames,
  onRemoteInstall,
  onRemoteRemove,
  pendingRemoteSkills,
}) => {
  const [activeTab, setActiveTab] = useState<SidebarTab>("skills");
  const [skillSource, setSkillSource] = useState<SkillSource>("local");

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
      {/* Tab buttons */}
      <div className="flex border-b" style={{ borderColor: "var(--cp-border)" }}>
        <button
          className="flex-1 py-2 text-xs font-semibold transition-colors"
          style={{
            color: activeTab === "skills" ? "var(--cp-primary)" : "var(--cp-text-muted)",
            borderBottom: activeTab === "skills" ? "2px solid var(--cp-primary)" : "2px solid transparent",
            background: activeTab === "skills" ? "rgba(14, 99, 156, 0.08)" : "transparent",
          }}
          onClick={() => handleTabChange("skills")}
        >
          Skills
        </button>
        <button
          className="flex-1 py-2 text-xs font-medium transition-colors"
          style={{
            color: activeTab === "mcps" ? "var(--cp-primary)" : "var(--cp-text-muted)",
            borderBottom: activeTab === "mcps" ? "2px solid var(--cp-primary)" : "2px solid transparent",
            background: activeTab === "mcps" ? "rgba(14, 99, 156, 0.08)" : "transparent",
          }}
          onClick={() => handleTabChange("mcps")}
        >
          MCPs
        </button>
      </div>

      {activeTab === "skills" ? (
        <>
          {/* Local / Remote toggle */}
          <div className="px-2 pt-2 pb-1">
            <div
              className="flex p-0.5 rounded"
              style={{ background: "var(--cp-input-bg)" }}
            >
              {(["local", "remote"] as const).map((src) => {
                const isActive = skillSource === src;
                return (
                  <button
                    key={src}
                    className="flex-1 px-2 py-1 rounded text-[11px] font-medium capitalize transition-all"
                    style={{
                      background: isActive ? "var(--cp-surface)" : "transparent",
                      color: isActive ? "var(--cp-text)" : "var(--cp-text-muted)",
                      boxShadow: isActive ? "0 1px 2px rgba(0,0,0,0.2)" : "none",
                    }}
                    onClick={() => setSkillSource(src)}
                  >
                    {src}
                  </button>
                );
              })}
            </div>
          </div>

          {skillSource === "local" ? (
            <>
              <div className="p-2 pt-1 flex gap-1">
                <div className="flex-1">
                  <SearchInput
                    value={searchQuery}
                    onChange={onSearchChange}
                    placeholder="Search skills..."
                  />
                </div>
                <button
                  className="shrink-0 w-7 h-7 flex items-center justify-center rounded transition-colors"
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
                  className="shrink-0 w-7 h-7 flex items-center justify-center rounded transition-colors"
                  style={{
                    background: "var(--cp-primary)",
                    color: "var(--cp-primary-fg)",
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
            <RemoteSkillPanel
              remoteSkills={remoteSkills}
              remoteTotal={remoteTotal}
              remoteLoading={remoteLoading}
              remoteError={remoteError}
              onSearch={onRemoteSearch}
              installedSkillNames={installedSkillNames}
              onInstall={onRemoteInstall}
              onRemove={onRemoteRemove}
              pendingSkills={pendingRemoteSkills}
            />
          )}
        </>
      ) : (
        <div className="flex-1 overflow-y-auto px-1 py-2">
          <McpList servers={mcpServers} loading={mcpLoading} />
        </div>
      )}
    </aside>
  );
};
