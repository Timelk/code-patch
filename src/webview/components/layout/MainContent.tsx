import { type FC, useState } from "react";
import { SkillDetail } from "../skill/SkillDetail";
import { SyncDialog } from "../skill/SyncDialog";
import { SearchInput } from "../common/SearchInput";
import type { Skill } from "../../hooks/useSkills";
import type { AgentInfo } from "../../hooks/useAgents";

interface MainContentProps {
  readonly selectedSkill: Skill | null;
  readonly agents: readonly AgentInfo[];
  readonly onSync: (skillName: string, targetAgents: string[]) => void;
  readonly onBatchSync: (skillNames: string[], targetAgents: string[]) => void;
  readonly searchQuery: string;
  readonly onSearchChange: (query: string) => void;
  readonly onBatchDelete: () => void;
  readonly onDiffRequest: (skillName: string) => void;
  readonly onShowHistory: () => void;
  readonly multiSelect: boolean;
  readonly selectedSkillNames: ReadonlySet<string>;
  readonly agentsWithSkill: ReadonlySet<string>;
  readonly onCheckAgentsForSync: (skillName: string) => void;
  readonly isSyncing?: boolean;
  readonly isDiffLoading?: boolean;
}

export const MainContent: FC<MainContentProps> = ({
  selectedSkill,
  agents,
  onSync,
  onBatchSync,
  searchQuery,
  onSearchChange,
  onBatchDelete,
  onDiffRequest,
  onShowHistory,
  multiSelect,
  selectedSkillNames,
  agentsWithSkill,
  onCheckAgentsForSync,
  isSyncing = false,
  isDiffLoading = false,
}) => {
  const [showSyncDialog, setShowSyncDialog] = useState(false);

  const hasBatchSelection = multiSelect && selectedSkillNames.size > 0;

  return (
    <section className="flex-1 flex flex-col min-w-0" style={{ background: "var(--cp-bg)" }}>
      {/* Toolbar */}
      <div
        className="px-4 py-2 flex items-center justify-between gap-3 border-b shrink-0"
        style={{
          borderColor: "var(--cp-border)",
          background: "var(--cp-surface)",
        }}
      >
        <div className="flex items-center gap-2">
          {/* Sync button */}
          <div className="relative">
            <button
              className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors"
              style={{
                background: (selectedSkill || hasBatchSelection) ? "var(--cp-primary)" : "var(--cp-badge-bg)",
                color: (selectedSkill || hasBatchSelection) ? "var(--cp-primary-fg)" : "var(--cp-text-muted)",
                cursor: (selectedSkill || hasBatchSelection) && !isSyncing ? "pointer" : "default",
                opacity: (selectedSkill || hasBatchSelection) ? 1 : 0.6,
              }}
              onClick={() => {
                if ((selectedSkill || hasBatchSelection) && !isSyncing) {
                  if (selectedSkill && !hasBatchSelection) {
                    onCheckAgentsForSync(selectedSkill.name);
                  }
                  setShowSyncDialog(true);
                }
              }}
              disabled={(!selectedSkill && !hasBatchSelection) || isSyncing}
            >
              {isSyncing ? (
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 4v6h-6M1 20v-6h6" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
              )}
              {isSyncing ? "Syncing..." : hasBatchSelection ? `Sync (${selectedSkillNames.size})` : "Sync"}
            </button>

            {showSyncDialog && (selectedSkill || hasBatchSelection) && (
              <SyncDialog
                skillName={hasBatchSelection ? `${selectedSkillNames.size} skills` : selectedSkill!.name}
                agents={agents}
                agentsWithSkill={hasBatchSelection ? new Set<string>() : agentsWithSkill}
                onSync={(targetAgents) => {
                  if (hasBatchSelection) {
                    onBatchSync(Array.from(selectedSkillNames), targetAgents);
                  } else if (selectedSkill) {
                    onSync(selectedSkill.name, targetAgents);
                  }
                  setShowSyncDialog(false);
                }}
                onClose={() => setShowSyncDialog(false)}
              />
            )}
          </div>

          {/* Diff button */}
          <button
            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-colors border"
            style={{
              borderColor: "var(--cp-border)",
              color: "var(--cp-text-muted)",
              opacity: selectedSkill && !isDiffLoading ? 1 : 0.4,
              cursor: selectedSkill && !isDiffLoading ? "pointer" : "default",
            }}
            onClick={() => selectedSkill && !isDiffLoading && onDiffRequest(selectedSkill.name)}
            disabled={!selectedSkill || isDiffLoading}
            title="Compare across agents"
          >
            {isDiffLoading ? (
              <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            ) : (
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            )}
            {isDiffLoading ? "Loading..." : "Diff"}
          </button>

          {/* History button */}
          <button
            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-colors border"
            style={{
              borderColor: "var(--cp-border)",
              color: "var(--cp-text-muted)",
            }}
            onClick={onShowHistory}
            title="Sync history"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            History
          </button>

          {/* Delete button — visible in multi-select mode */}
          {hasBatchSelection && (
            <button
              className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors"
              style={{
                color: "var(--cp-error)",
                border: "1px solid var(--cp-error)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--cp-error)";
                e.currentTarget.style.color = "var(--cp-primary-fg)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--cp-error)";
              }}
              onClick={onBatchDelete}
              title={`Delete ${selectedSkillNames.size} selected skills`}
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Delete ({selectedSkillNames.size})
            </button>
          )}
        </div>

        <div className="w-56">
          <SearchInput
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Search skills..."
          />
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-y-auto p-6">
        {selectedSkill ? (
          <SkillDetail skill={selectedSkill} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center" style={{ color: "var(--cp-text-muted)" }}>
              <svg className="w-12 h-12 mx-auto mb-3 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
              <p className="text-sm">Select a skill to view details</p>
              {multiSelect && (
                <p className="text-xs mt-1">
                Use checkboxes to select skills for batch sync or delete
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
