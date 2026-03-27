import { type FC, useState, useEffect } from "react";
import type { AgentInfo } from "../../hooks/useAgents";
import type { Scope } from "../../hooks/useSkills";
import { useI18n } from "../../i18n";

interface SyncDialogProps {
  readonly skillName: string;
  readonly agents: readonly AgentInfo[];
  readonly agentsWithSkill: ReadonlySet<string>;
  readonly scope: Scope;
  readonly onSync: (targetAgents: string[], alsoSyncToProject?: boolean) => void;
  readonly onClose: () => void;
  /** When true, render as inline panel (no backdrop / no absolute positioning) */
  readonly centered?: boolean;
}

export const SyncDialog: FC<SyncDialogProps> = ({
  skillName,
  agents,
  agentsWithSkill,
  scope,
  onSync,
  onClose,
  centered = false,
}) => {
  const { t } = useI18n();
  // Only show installed agents that do NOT already have this skill
  const availableAgents = agents.filter(
    (a) => a.installed && !agentsWithSkill.has(a.name)
  );
  const [selectedAgents, setSelectedAgents] = useState<Set<string>>(new Set());
  const [alsoSyncToProject, setAlsoSyncToProject] = useState(false);

  // Derive allSelected from actual state instead of tracking independently
  const allSelected = availableAgents.length > 0 &&
    availableAgents.every((a) => selectedAgents.has(a.name));

  const toggleAgent = (name: string) => {
    setSelectedAgents((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelectedAgents(new Set());
    } else {
      setSelectedAgents(new Set(availableAgents.map((a) => a.name)));
    }
  };

  const handleSync = () => {
    if (selectedAgents.size > 0) {
      onSync(
        Array.from(selectedAgents),
        scope === "global" ? alsoSyncToProject : undefined
      );
    }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Shared dialog content rendered by both modes
  const dialogContent = (
    <>
      <p id="sync-dialog-title" className="text-[10px] mb-2 font-medium" style={{ color: "var(--cp-text-muted)" }}>
        {t("sync.titlePrefix")} "{skillName}" {t("sync.titleSuffix")}
      </p>

        {availableAgents.length === 0 ? (
          <p className="text-xs py-2 text-center" style={{ color: "var(--cp-text-muted)" }}>
            {t("sync.allHaveSkill")}
          </p>
        ) : (
          <div className="space-y-1.5 mb-3">
            {availableAgents.map((agent) => (
              <label
                key={agent.name}
                className="flex items-center gap-2 text-xs cursor-pointer py-0.5"
                style={{ color: "var(--cp-text)" }}
              >
                <input
                  type="checkbox"
                  checked={selectedAgents.has(agent.name)}
                  onChange={() => toggleAgent(agent.name)}
                  className="rounded"
                  style={{ accentColor: "var(--cp-primary)" }}
                />
                {agent.displayName}
              </label>
            ))}

            {availableAgents.length > 1 && (
              <>
                <div className="border-t my-1" style={{ borderColor: "var(--cp-border)" }} />
                <label
                  className="flex items-center gap-2 text-xs font-semibold cursor-pointer py-0.5"
                  style={{ color: "var(--cp-primary)" }}
                >
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="rounded"
                    style={{ accentColor: "var(--cp-primary)" }}
                  />
                  {t("sync.allAgents")}
                </label>
              </>
            )}
          </div>
        )}

        {/* Also sync to project scope — only shown in global mode */}
        {scope === "global" && availableAgents.length > 0 && (
          <div
            className="mb-3 px-2.5 py-2 rounded-md border"
            style={{
              borderColor: alsoSyncToProject ? "var(--cp-primary)" : "var(--cp-border)",
              background: alsoSyncToProject ? "rgba(14, 99, 156, 0.08)" : "var(--cp-bg)",
              transition: "border-color 150ms ease, background 150ms ease",
            }}
          >
            <label
              className="flex items-center gap-2 text-xs cursor-pointer"
              style={{ color: "var(--cp-text)" }}
            >
              <input
                type="checkbox"
                checked={alsoSyncToProject}
                onChange={() => setAlsoSyncToProject((v) => !v)}
                className="rounded"
                style={{ accentColor: "var(--cp-primary)" }}
              />
              <div>
                <div className="font-medium">{t("sync.alsoProject")}</div>
                <div className="text-[10px] mt-0.5" style={{ color: "var(--cp-text-muted)" }}>
                  {t("sync.alsoProjectDesc")}
                </div>
              </div>
            </label>
          </div>
        )}

        {/* Already synced agents info */}
        {agentsWithSkill.size > 0 && (
          <div className="mb-3 text-[10px]" style={{ color: "var(--cp-text-muted)" }}>
            {t("sync.alreadySynced")} {Array.from(agentsWithSkill).join(", ")}
          </div>
        )}

        <div className="flex gap-2">
          <button
            className="flex-1 px-2 py-1 rounded text-xs font-medium transition-colors"
            style={{
              background: selectedAgents.size > 0 ? "var(--cp-primary)" : "var(--cp-badge-bg)",
              color: selectedAgents.size > 0 ? "var(--cp-primary-fg)" : "var(--cp-text-muted)",
              cursor: selectedAgents.size > 0 ? "pointer" : "default",
            }}
            onClick={handleSync}
            disabled={selectedAgents.size === 0}
          >
            {t("main.sync")} ({selectedAgents.size})
            {alsoSyncToProject && scope === "global" ? " + " + t("scope.project") : ""}
          </button>
          <button
            className="px-2 py-1 rounded text-xs transition-colors border"
            style={{
              borderColor: "var(--cp-border)",
              color: "var(--cp-text-muted)",
            }}
            onClick={onClose}
          >
            {t("sync.cancel")}
          </button>
        </div>
    </>
  );

  // Centered mode: render as inline panel (parent provides backdrop + centering)
  if (centered) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sync-dialog-title"
        className="cp-dialog-enter w-72 rounded-lg shadow-xl p-3 border"
        style={{
          background: "var(--cp-surface)",
          borderColor: "var(--cp-border)",
        }}
      >
        {dialogContent}
      </div>
    );
  }

  // Dropdown mode: own backdrop + absolute positioning (used in toolbar)
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sync-dialog-title"
        className="cp-dialog-enter absolute top-full left-0 mt-1 w-64 rounded-lg shadow-xl z-50 p-3 border"
        style={{
          background: "var(--cp-surface)",
          borderColor: "var(--cp-border)",
        }}
      >
        {dialogContent}
      </div>
    </>
  );
};
