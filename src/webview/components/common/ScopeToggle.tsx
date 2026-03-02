import { type FC } from "react";
import type { Scope } from "../../hooks/useSkills";

interface ScopeToggleProps {
  readonly scope: Scope;
  readonly onScopeChange: (scope: Scope) => void;
}

export const ScopeToggle: FC<ScopeToggleProps> = ({ scope, onScopeChange }) => {
  return (
    <div
      className="flex p-0.5 rounded text-[11px]"
      style={{ background: "var(--cp-input-bg)" }}
    >
      {(["global", "project"] as const).map((s) => {
        const isActive = scope === s;
        return (
          <button
            key={s}
            className="px-2.5 py-1 rounded font-medium capitalize transition-all"
            style={{
              background: isActive ? "var(--cp-surface)" : "transparent",
              color: isActive ? "var(--cp-text)" : "var(--cp-text-muted)",
              boxShadow: isActive ? "0 1px 2px rgba(0,0,0,0.2)" : "none",
            }}
            onClick={() => onScopeChange(s)}
          >
            {s}
          </button>
        );
      })}
    </div>
  );
};
