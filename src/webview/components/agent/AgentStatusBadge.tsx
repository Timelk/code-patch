import { type FC } from "react";
import type { AgentInfo } from "../../hooks/useAgents";

interface AgentStatusBadgeProps {
  readonly agent: AgentInfo;
}

export const AgentStatusBadge: FC<AgentStatusBadgeProps> = ({ agent }) => {
  return (
    <div
      className="flex items-center justify-between px-2 py-1 rounded text-xs"
      style={{
        color: agent.installed ? "var(--cp-text)" : "var(--cp-text-muted)",
        opacity: agent.installed ? 1 : 0.5,
      }}
    >
      <span className="truncate">{agent.displayName}</span>
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0 ml-2"
        style={{
          background: agent.installed
            ? "var(--cp-success)"
            : "var(--cp-text-muted)",
        }}
      />
    </div>
  );
};
