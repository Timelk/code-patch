import { type FC, useEffect, useCallback, useState, useRef } from "react";
import { Header } from "./components/layout/Header";
import { Sidebar } from "./components/layout/Sidebar";
import { MainContent } from "./components/layout/MainContent";
import { RightPanel, type SyncStats } from "./components/layout/RightPanel";
import { ResizeHandle } from "./components/common/ResizeHandle";
import { CreateSkillDialog } from "./components/skill/CreateSkillDialog";
import { ConfirmDialog } from "./components/common/ConfirmDialog";
import { DiffPreview, type DiffEntry } from "./components/skill/DiffPreview";
import { SyncHistory, type SyncHistoryEntry } from "./components/skill/SyncHistory";
import { SyncDialog } from "./components/skill/SyncDialog";
import { SettingsPanel } from "./components/settings/SettingsPanel";
import { useSkills } from "./hooks/useSkills";
import { useAgents, type AgentInfo } from "./hooks/useAgents";
import { useVSCodeApi } from "./hooks/useVSCodeApi";
import { postMessage } from "./services/vscode-message";
import type { Skill, Scope } from "./hooks/useSkills";
import type { McpServer } from "./components/mcp/McpList";

interface SyncReport {
  readonly results: readonly {
    readonly skillName: string;
    readonly targetAgent: string;
    readonly success: boolean;
    readonly mode: "symlink" | "copy";
    readonly error?: string;
  }[];
  readonly timestamp: number;
}

interface DiffReport {
  readonly skillName: string;
  readonly entries: readonly DiffEntry[];
}

type ExtensionMessage =
  | { type: "skills:loaded"; payload: Skill[] }
  | { type: "agents:detected"; payload: AgentInfo[] }
  | { type: "sync:result"; payload: SyncReport }
  | { type: "skill:fileChanged"; payload: { path: string; event: "create" | "change" | "delete" } }
  | { type: "mcps:loaded"; payload: McpServer[] }
  | { type: "diff:result"; payload: DiffReport }
  | { type: "history:loaded"; payload: SyncHistoryEntry[] }
  | { type: "skill:agentsWithSkill"; payload: string[] };

export const App: FC = () => {
  const {
    skills,
    allSkills,
    selectedSkill,
    setSelectedSkill,
    scope,
    changeScope,
    agentFilter,
    changeAgentFilter,
    loading,
    handleSkillsLoaded,
    searchQuery,
    setSearchQuery,
  } = useSkills();

  const { agents, handleAgentsDetected } = useAgents();

  // Sync notification
  const [syncNotification, setSyncNotification] = useState<string | null>(null);

  // Sync stats (AC-16)
  const [syncStats, setSyncStats] = useState<SyncStats>({
    totalSyncs: 0,
    lastSyncTime: null,
    lastSyncAgentCount: 0,
    lastSyncSkillName: null,
  });

  // Create skill dialog (AC-13)
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Delete confirmation (AC-14) — supports batch delete from multi-select
  const [deleteTargets, setDeleteTargets] = useState<readonly { name: string; filePath: string }[] | null>(null);

  // MCP state (AC-17)
  const [mcpServers, setMcpServers] = useState<readonly McpServer[]>([]);
  const [mcpLoading, setMcpLoading] = useState(false);

  // Multi-select for batch sync (AC-18)
  const [multiSelect, setMultiSelect] = useState(false);
  const [selectedSkillNames, setSelectedSkillNames] = useState<Set<string>>(new Set());

  // Diff preview (AC-19)
  const [diffReport, setDiffReport] = useState<DiffReport | null>(null);

  // Sync history (AC-21)
  const [showHistory, setShowHistory] = useState(false);
  const [historyEntries, setHistoryEntries] = useState<readonly SyncHistoryEntry[]>([]);

  // Resizable panel widths (default 224px = w-56)
  const [sidebarWidth, setSidebarWidth] = useState(224);
  const [rightPanelWidth, setRightPanelWidth] = useState(224);

  // Settings panel
  const [showSettings, setShowSettings] = useState(false);

  // Pending sync from context menu — triggers sync dialog for a single skill
  const [pendingSyncSkill, setPendingSyncSkill] = useState<Skill | null>(null);

  // Loading states for async operations
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDiffLoading, setIsDiffLoading] = useState(false);

  // Notification timer ref to prevent premature clearing on rapid syncs
  const notificationTimerRef = useRef<ReturnType<typeof setTimeout>>();
  // Safety timeouts: reset loading flags if the extension never responds (crash / disconnect)
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const diffTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Clean up all timers on unmount
  useEffect(() => () => {
    clearTimeout(notificationTimerRef.current);
    clearTimeout(syncTimeoutRef.current);
    clearTimeout(diffTimeoutRef.current);
  }, []);
  const [agentsWithSkill, setAgentsWithSkill] = useState<Set<string>>(new Set());

  // Disable right-click globally (except sidebar handles it locally)
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      // Allow context menu only inside sidebar skill list (handled by SkillList component)
      const target = e.target as HTMLElement;
      if (target.closest("[data-allow-context-menu]")) {
        return;
      }
      e.preventDefault();
    };
    document.addEventListener("contextmenu", handleContextMenu);
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, []);

  const handleExtensionMessage = useCallback(
    (message: ExtensionMessage) => {
      switch (message.type) {
        case "skills:loaded":
          handleSkillsLoaded(message.payload);
          break;
        case "agents:detected":
          handleAgentsDetected(message.payload);
          break;
        case "sync:result": {
          clearTimeout(syncTimeoutRef.current);
          setIsSyncing(false);
          const report = message.payload;
          const successCount = report.results.filter((r) => r.success).length;
          const failCount = report.results.length - successCount;
          const msg = failCount > 0
            ? `Synced to ${successCount} agents, ${failCount} failed`
            : `Synced to ${successCount} agents`;
          setSyncNotification(msg);
          clearTimeout(notificationTimerRef.current);
          notificationTimerRef.current = setTimeout(() => setSyncNotification(null), 3000);

          // Update sync stats (AC-16)
          if (report.results.length > 0) {
            setSyncStats((prev) => ({
              totalSyncs: prev.totalSyncs + 1,
              lastSyncTime: report.timestamp,
              lastSyncAgentCount: successCount,
              lastSyncSkillName: report.results[0]?.skillName ?? null,
            }));
          }

          // Clear multi-select after batch sync
          if (multiSelect) {
            setSelectedSkillNames(new Set());
          }
          break;
        }
        case "skill:fileChanged":
          postMessage({
            type: "skills:load",
            payload: { scope, agentFilter },
          });
          break;
        case "mcps:loaded":
          setMcpServers(message.payload);
          setMcpLoading(false);
          break;
        case "diff:result":
          clearTimeout(diffTimeoutRef.current);
          setIsDiffLoading(false);
          setDiffReport(message.payload);
          break;
        case "history:loaded":
          setHistoryEntries(message.payload);
          break;
        case "skill:agentsWithSkill":
          setAgentsWithSkill(new Set(message.payload));
          break;
      }
    },
    [handleSkillsLoaded, handleAgentsDetected, scope, agentFilter, multiSelect]
  );

  useVSCodeApi(handleExtensionMessage);

  // Signal ready to extension host
  useEffect(() => {
    postMessage({ type: "webview:ready" });
  }, []);

  // ─── Handlers ──────────────────────────────────────────────────────

  // Wrap scope/filter changes to also clear multi-select state
  const handleScopeChange = useCallback(
    (newScope: Scope) => {
      changeScope(newScope);
      setSelectedSkillNames(new Set());
      setMultiSelect(false);
    },
    [changeScope]
  );

  const handleAgentFilterChange = useCallback(
    (filter: string | undefined) => {
      changeAgentFilter(filter);
      setSelectedSkillNames(new Set());
      setMultiSelect(false);
    },
    [changeAgentFilter]
  );

  const handleSync = useCallback(
    (skillName: string, targetAgents: string[]) => {
      setIsSyncing(true);
      clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = setTimeout(() => setIsSyncing(false), 60_000);
      postMessage({
        type: "sync:execute",
        payload: { skillName, targetAgents, scope },
      });
    },
    [scope]
  );

  const handleBatchSync = useCallback(
    (skillNames: string[], targetAgents: string[]) => {
      setIsSyncing(true);
      clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = setTimeout(() => setIsSyncing(false), 60_000);
      postMessage({
        type: "sync:batch",
        payload: { skillNames, targetAgents, scope },
      });
    },
    [scope]
  );

  const handleCreateSkill = useCallback(
    (name: string, content: string) => {
      postMessage({
        type: "skill:create",
        payload: { name, content, agentFilter },
      });
      setShowCreateDialog(false);
    },
    [agentFilter]
  );

  const handleBatchDelete = useCallback(() => {
    // Collect full skill objects for all selected skills to capture filePaths
    const targets = skills
      .filter((s) => selectedSkillNames.has(s.name))
      .map((s) => ({ name: s.name, filePath: s.filePath }));
    if (targets.length > 0) {
      setDeleteTargets(targets);
    }
  }, [skills, selectedSkillNames]);

  // Context-menu delete for a single skill from sidebar
  const handleDeleteSkill = useCallback((skill: Skill) => {
    setDeleteTargets([{ name: skill.name, filePath: skill.filePath }]);
  }, []);

  // Context-menu sync for a single skill from sidebar — opens sync dialog directly
  const handleSyncSkill = useCallback((skill: Skill) => {
    setSelectedSkill(skill);
    postMessage({ type: "skill:checkAgents", payload: { skillName: skill.name, scope } });
    setPendingSyncSkill(skill);
  }, [setSelectedSkill, scope]);

  const handleConfirmDelete = useCallback(() => {
    if (deleteTargets) {
      for (const target of deleteTargets) {
        postMessage({
          type: "skill:delete",
          payload: { name: target.name, filePath: target.filePath },
        });
      }
      setDeleteTargets(null);
      setSelectedSkill(null);
      setSelectedSkillNames(new Set());
    }
  }, [deleteTargets, setSelectedSkill]);

  const handleLoadMcps = useCallback(() => {
    setMcpLoading(true);
    postMessage({ type: "mcps:load" });
  }, []);

  const handleToggleMultiSelect = useCallback(() => {
    setMultiSelect((prev) => {
      if (prev) setSelectedSkillNames(new Set());
      return !prev;
    });
  }, []);

  const handleToggleSkillSelection = useCallback((name: string) => {
    setSelectedSkillNames((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    const allNames = skills.map((s) => s.name);
    setSelectedSkillNames((prev) => {
      const allSelected = allNames.length > 0 && allNames.every((n) => prev.has(n));
      return allSelected ? new Set<string>() : new Set(allNames);
    });
  }, [skills]);

  const handleCheckAgentsForSync = useCallback((skillName: string) => {
    postMessage({
      type: "skill:checkAgents",
      payload: { skillName, scope },
    });
  }, [scope]);

  const handleDiffRequest = useCallback((skillName: string) => {
    setIsDiffLoading(true);
    clearTimeout(diffTimeoutRef.current);
    diffTimeoutRef.current = setTimeout(() => setIsDiffLoading(false), 30_000);
    postMessage({
      type: "diff:request",
      payload: { skillName },
    });
  }, []);

  const handleShowHistory = useCallback(() => {
    postMessage({ type: "history:load" });
    setShowHistory(true);
  }, []);

  const handleClearHistory = useCallback(() => {
    postMessage({ type: "history:clear" });
  }, []);

  const handleOpenSettings = useCallback(() => {
    setShowSettings(true);
  }, []);

  const handleSidebarResize = useCallback((deltaX: number) => {
    setSidebarWidth((prev) => Math.max(160, Math.min(400, prev + deltaX)));
  }, []);

  const handleRightPanelResize = useCallback((deltaX: number) => {
    setRightPanelWidth((prev) => Math.max(160, Math.min(400, prev - deltaX)));
  }, []);

  // ─── Render ────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full">
      <Header
        scope={scope}
        onScopeChange={handleScopeChange}
        agentFilter={agentFilter}
        onAgentFilterChange={handleAgentFilterChange}
        onOpenSettings={handleOpenSettings}
      />

      <div className="flex-1 flex overflow-hidden">
        <div style={{ width: sidebarWidth, flexShrink: 0 }} data-allow-context-menu>
          <Sidebar
            skills={skills}
            selectedSkill={selectedSkill}
            onSelectSkill={setSelectedSkill}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            loading={loading}
            onCreateSkill={() => setShowCreateDialog(true)}
            mcpServers={mcpServers}
            mcpLoading={mcpLoading}
            onLoadMcps={handleLoadMcps}
            multiSelect={multiSelect}
            onToggleMultiSelect={handleToggleMultiSelect}
            selectedSkillNames={selectedSkillNames}
            onToggleSkillSelection={handleToggleSkillSelection}
            onSelectAll={handleSelectAll}
            onDeleteSkill={handleDeleteSkill}
            onSyncSkill={handleSyncSkill}
            showBadge={agentFilter === undefined}
          />
        </div>
        <ResizeHandle onDrag={handleSidebarResize} />
        <MainContent
          selectedSkill={selectedSkill}
          agents={agents}
          onSync={handleSync}
          onBatchSync={handleBatchSync}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onBatchDelete={handleBatchDelete}
          onDiffRequest={handleDiffRequest}
          onShowHistory={handleShowHistory}
          multiSelect={multiSelect}
          selectedSkillNames={selectedSkillNames}
          agentsWithSkill={agentsWithSkill}
          onCheckAgentsForSync={handleCheckAgentsForSync}
          isSyncing={isSyncing}
          isDiffLoading={isDiffLoading}
        />
        <ResizeHandle onDrag={handleRightPanelResize} />
        <div style={{ width: rightPanelWidth, flexShrink: 0 }}>
          <RightPanel
            agents={agents}
            skillCount={allSkills.length}
            syncStats={syncStats}
          />
        </div>
      </div>

      {/* Create Skill Dialog (AC-13) */}
      {showCreateDialog && (
        <CreateSkillDialog
          onCreateSkill={handleCreateSkill}
          onClose={() => setShowCreateDialog(false)}
        />
      )}

      {/* Delete Confirmation Dialog (AC-14) */}
      {deleteTargets && (
        <ConfirmDialog
          title={deleteTargets.length === 1 ? "Delete Skill" : `Delete ${deleteTargets.length} Skills`}
          message={
            deleteTargets.length === 1
              ? `Are you sure you want to delete "${deleteTargets[0].name}"? This action cannot be undone.`
              : `Are you sure you want to delete the following ${deleteTargets.length} skills? This action cannot be undone.\n\n${deleteTargets.map((t) => `• ${t.name}`).join("\n")}`
          }
          confirmLabel="Delete"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTargets(null)}
        />
      )}

      {/* Diff Preview (AC-19) */}
      {diffReport && (
        <DiffPreview
          skillName={diffReport.skillName}
          entries={diffReport.entries}
          onClose={() => setDiffReport(null)}
        />
      )}

      {/* Sync History (AC-21) */}
      {showHistory && (
        <SyncHistory
          entries={historyEntries}
          onClose={() => setShowHistory(false)}
          onClear={handleClearHistory}
        />
      )}

      {/* Settings Panel */}
      {showSettings && (
        <SettingsPanel
          agents={agents}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Context-menu Sync Dialog */}
      {pendingSyncSkill && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setPendingSyncSkill(null);
          }}
        >
          <div
            className="rounded-lg shadow-xl border p-4 w-[320px]"
            style={{
              background: "var(--cp-surface)",
              borderColor: "var(--cp-border)",
            }}
          >
            <SyncDialog
              skillName={pendingSyncSkill.name}
              agents={agents}
              agentsWithSkill={agentsWithSkill}
              onSync={(targetAgents) => {
                handleSync(pendingSyncSkill.name, targetAgents);
                setPendingSyncSkill(null);
              }}
              onClose={() => setPendingSyncSkill(null)}
            />
          </div>
        </div>
      )}

      {/* Sync notification toast */}
      {syncNotification && (
        <div
          className="fixed bottom-4 right-4 px-3 py-2 rounded-lg shadow-lg text-xs font-medium z-50 animate-pulse"
          style={{
            background: "var(--cp-primary)",
            color: "var(--cp-primary-fg)",
          }}
        >
          {syncNotification}
        </div>
      )}
    </div>
  );
};
