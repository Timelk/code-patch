import { type FC } from "react";
import { AgentStatusBadge } from "../agent/AgentStatusBadge";
import type { AgentInfo } from "../../hooks/useAgents";
import { useI18n } from "../../i18n";

export interface SyncStats {
  readonly totalSyncs: number;
  readonly lastSyncTime: number | null;
  readonly lastSyncAgentCount: number;
  readonly lastSyncSkillName: string | null;
}

interface RightPanelProps {
  readonly agents: readonly AgentInfo[];
  readonly skillCount: number;
  readonly syncStats: SyncStats;
}

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export const RightPanel: FC<RightPanelProps> = ({ agents, skillCount, syncStats }) => {
  const installedAgents = agents.filter((a) => a.installed);
  const { t } = useI18n();

  return (
    <aside
      className="flex flex-col shrink-0 border-l h-full"
      style={{
        background: "var(--cp-surface)",
        borderColor: "var(--cp-border)",
      }}
    >
      {/* Stats Overview */}
      <div className="p-3 border-b" style={{ borderColor: "var(--cp-border)" }}>
        <h3
          className="text-[10px] font-bold uppercase tracking-wider mb-2 px-1"
          style={{ color: "var(--cp-text-muted)" }}
        >
          {t("right.overview")}
        </h3>
        <div className="grid grid-cols-2 gap-1.5">
          <StatCard label={t("right.skills")} value={String(skillCount)} />
          <StatCard label={t("right.agents")} value={String(installedAgents.length)} />
          <StatCard label={t("right.syncs")} value={String(syncStats.totalSyncs)} />
          <StatCard
            label={t("right.lastSync")}
            value={syncStats.lastSyncTime ? formatRelativeTime(syncStats.lastSyncTime) : "—"}
          />
        </div>
        {syncStats.lastSyncSkillName && (
          <div
            className="mt-2 px-2 py-1.5 rounded text-[10px] border"
            style={{
              background: "var(--cp-bg)",
              borderColor: "var(--cp-border)",
              color: "var(--cp-text-muted)",
            }}
          >
            {t("right.last")} <span style={{ color: "var(--cp-text)" }}>{syncStats.lastSyncSkillName}</span>
            {" → "}
            {syncStats.lastSyncAgentCount} {syncStats.lastSyncAgentCount !== 1 ? t("right.agents_plural") : t("right.agent")}
          </div>
        )}
      </div>

      {/* Active Features */}
      <div className="flex-1 overflow-y-auto p-3 border-b" style={{ borderColor: "var(--cp-border)" }}>
        <h3
          className="text-[10px] font-bold uppercase tracking-wider mb-2 px-1"
          style={{ color: "var(--cp-text-muted)" }}
        >
          {t("right.activeFeatures")}
        </h3>
        <div className="space-y-1.5">
          <FeatureRow name={t("right.contextAwareness")} description={t("right.contextAwarenessDesc")} active />
          <FeatureRow name={t("right.copySync")} description={t("right.copySyncDesc")} active />
          <FeatureRow name={t("right.fileWatcher")} description={t("right.fileWatcherDesc")} active />
          <FeatureRow name={t("right.mcpDiscovery")} description={t("right.mcpDiscoveryDesc")} active />
        </div>
      </div>

      {/* Detected Agents */}
      <div className="p-3">
        <h3
          className="text-[10px] font-bold uppercase tracking-wider mb-2 px-1"
          style={{ color: "var(--cp-text-muted)" }}
        >
          {t("right.detectedAgents")} ({installedAgents.length})
        </h3>
        <div className="space-y-1">
          {agents.map((agent) => (
            <AgentStatusBadge key={agent.name} agent={agent} />
          ))}
        </div>
      </div>
    </aside>
  );
};

const StatCard: FC<{ label: string; value: string }> = ({ label, value }) => (
  <div
    className="p-2 rounded border text-center"
    style={{
      background: "var(--cp-bg)",
      borderColor: "var(--cp-border)",
    }}
  >
    <div className="text-sm font-bold" style={{ color: "var(--cp-text)" }}>
      {value}
    </div>
    <div className="text-[9px] uppercase tracking-wider mt-0.5" style={{ color: "var(--cp-text-muted)" }}>
      {label}
    </div>
  </div>
);

const FeatureRow: FC<{ name: string; description: string; active: boolean }> = ({
  name,
  description,
  active,
}) => (
  <div
    className="p-2 rounded border transition-colors"
    style={{
      background: "var(--cp-bg)",
      borderColor: "var(--cp-border)",
      opacity: active ? 1 : 0.6,
    }}
  >
    <div className="flex justify-between items-start">
      <span className="text-xs font-medium" style={{ color: "var(--cp-text)" }}>
        {name}
      </span>
      <span
        className="w-1.5 h-1.5 rounded-full mt-1 shrink-0"
        style={{
          background: active ? "var(--cp-success)" : "var(--cp-text-muted)",
        }}
      />
    </div>
    <p className="text-[10px] mt-0.5 leading-tight" style={{ color: "var(--cp-text-muted)" }}>
      {description}
    </p>
  </div>
);
