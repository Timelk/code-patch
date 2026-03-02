import { type FC, useState } from "react";
import type { AgentInfo } from "../../hooks/useAgents";

interface SyncDialogProps {
  readonly skillName: string;
  readonly agents: readonly AgentInfo[];
  readonly agentsWithSkill: ReadonlySet<string>;
  readonly onSync: (targetAgents: string[]) => void;
  readonly onClose: () => void;
}

export const SyncDialog: FC<SyncDialogProps> = ({
  skillName,
  agents,
  agentsWithSkill,
  onSync,
  onClose,
}) => {
  // Only show installed agents that do NOT already have this skill
  const availableAgents = agents.filter(
    (a) => a.installed && !agentsWithSkill.has(a.name)
  );
  const [selectedAgents, setSelectedAgents] = useState<Set<string>>(new Set());

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
      onSync(Array.from(selectedAgents));
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className="absolute top-full left-0 mt-1 w-60 rounded-lg shadow-xl z-50 p-3 border"
        style={{
          background: "var(--cp-surface)",
          borderColor: "var(--cp-border)",
        }}
      >
        <p className="text-[10px] mb-2 font-medium" style={{ color: "var(--cp-text-muted)" }}>
          Sync "{skillName}" to:
        </p>

        {availableAgents.length === 0 ? (
          <p className="text-xs py-2 text-center" style={{ color: "var(--cp-text-muted)" }}>
            All agents already have this skill
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
                  All Agents
                </label>
              </>
            )}
          </div>
        )}

        {/* Already synced agents info */}
        {agentsWithSkill.size > 0 && (
          <div className="mb-3 text-[10px]" style={{ color: "var(--cp-text-muted)" }}>
            Already synced: {Array.from(agentsWithSkill).join(", ")}
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
            Sync ({selectedAgents.size})
          </button>
          <button
            className="px-2 py-1 rounded text-xs transition-colors border"
            style={{
              borderColor: "var(--cp-border)",
              color: "var(--cp-text-muted)",
            }}
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
};
