import { type FC } from "react";
import type { AgentInfo } from "../../hooks/useAgents";
import { postMessage } from "../../services/vscode-message";

interface SettingsPanelProps {
  readonly agents: readonly AgentInfo[];
  readonly onClose: () => void;
}

/**
 * Visual settings panel overlay — replaces direct JSON config opening.
 * Shows agent status, key paths, and provides quick access to VSCode settings.
 */
export const SettingsPanel: FC<SettingsPanelProps> = ({ agents, onClose }) => {
  const installedAgents = agents.filter((a) => a.installed);

  const handleOpenJsonSettings = () => {
    postMessage({ type: "settings:open" });
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="rounded-lg shadow-xl border w-[480px] max-h-[80vh] flex flex-col"
        style={{
          background: "var(--cp-surface)",
          borderColor: "var(--cp-border)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b shrink-0"
          style={{ borderColor: "var(--cp-border)" }}
        >
          <h2 className="text-sm font-bold" style={{ color: "var(--cp-text)" }}>
            Settings
          </h2>
          <button
            className="p-1 rounded transition-colors"
            style={{ color: "var(--cp-text-muted)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--cp-list-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
            onClick={onClose}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Agents Section */}
          <SettingsSection title="Agents">
            <div className="space-y-1.5">
              {agents.map((agent) => (
                <div
                  key={agent.name}
                  className="flex items-center justify-between px-3 py-2 rounded border"
                  style={{
                    background: "var(--cp-bg)",
                    borderColor: "var(--cp-border)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        background: agent.installed
                          ? "var(--cp-success)"
                          : "var(--cp-text-muted)",
                      }}
                    />
                    <span className="text-xs font-medium" style={{ color: "var(--cp-text)" }}>
                      {agent.displayName}
                    </span>
                  </div>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded"
                    style={{
                      background: agent.installed
                        ? "rgba(0,128,0,0.1)"
                        : "var(--cp-badge-bg)",
                      color: agent.installed
                        ? "var(--cp-success)"
                        : "var(--cp-text-muted)",
                    }}
                  >
                    {agent.installed ? "Installed" : "Not found"}
                  </span>
                </div>
              ))}
            </div>
          </SettingsSection>

          {/* Sync Section */}
          <SettingsSection title="Sync">
            <SettingsRow
              label="Sync Mode"
              description="How skills are synced to agent directories"
              value="Copy"
            />
            <SettingsRow
              label="Active Agents"
              description="Number of agents detected on this machine"
              value={`${installedAgents.length} / ${agents.length}`}
            />
          </SettingsSection>

          {/* About Section */}
          <SettingsSection title="About">
            <SettingsRow
              label="Extension"
              description="Code Patch — AI agent skill manager"
              value="v0.1.0"
            />
            <SettingsRow
              label="Sync Engine"
              description="Copy-based sync for cross-platform safety"
              value="Copy"
            />
          </SettingsSection>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-4 py-3 border-t shrink-0"
          style={{ borderColor: "var(--cp-border)" }}
        >
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-colors border"
            style={{
              borderColor: "var(--cp-border)",
              color: "var(--cp-text-muted)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--cp-list-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
            onClick={handleOpenJsonSettings}
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            Open JSON Settings
          </button>
          <button
            className="px-4 py-1.5 rounded text-xs font-medium transition-colors"
            style={{
              background: "var(--cp-primary)",
              color: "var(--cp-primary-fg)",
            }}
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

const SettingsSection: FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h3
      className="text-[10px] font-bold uppercase tracking-wider mb-2 px-1"
      style={{ color: "var(--cp-text-muted)" }}
    >
      {title}
    </h3>
    {children}
  </div>
);

const SettingsRow: FC<{
  label: string;
  description: string;
  value: string;
}> = ({ label, description, value }) => (
  <div
    className="flex items-center justify-between px-3 py-2 rounded border"
    style={{
      background: "var(--cp-bg)",
      borderColor: "var(--cp-border)",
    }}
  >
    <div>
      <div className="text-xs font-medium" style={{ color: "var(--cp-text)" }}>
        {label}
      </div>
      <div className="text-[10px] mt-0.5" style={{ color: "var(--cp-text-muted)" }}>
        {description}
      </div>
    </div>
    <span
      className="text-[10px] px-1.5 py-0.5 rounded shrink-0 ml-2"
      style={{
        background: "var(--cp-badge-bg)",
        color: "var(--cp-badge-fg)",
      }}
    >
      {value}
    </span>
  </div>
);
