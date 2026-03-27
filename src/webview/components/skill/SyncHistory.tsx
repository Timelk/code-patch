import { type FC, useEffect } from "react";
import { useI18n } from "../../i18n";

export interface SyncHistoryEntry {
  readonly id: string;
  readonly skillName: string;
  readonly targetAgents: readonly string[];
  readonly mode: "symlink" | "copy";
  readonly successCount: number;
  readonly failCount: number;
  readonly timestamp: number;
}

interface SyncHistoryProps {
  readonly entries: readonly SyncHistoryEntry[];
  readonly onClose: () => void;
  readonly onClear: () => void;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const SyncHistory: FC<SyncHistoryProps> = ({ entries, onClose, onClear }) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);
  const { t } = useI18n();

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.5)" }}
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sync-history-title"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[460px] max-h-[70vh] rounded-lg shadow-2xl z-50 border flex flex-col"
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
          <h3 id="sync-history-title" className="text-sm font-semibold" style={{ color: "var(--cp-text)" }}>
            {t("history.title")}
          </h3>
          <div className="flex items-center gap-2">
            {entries.length > 0 && (
              <button
                className="text-[10px] px-2 py-0.5 rounded transition-colors"
                style={{ color: "var(--cp-error)", border: "1px solid var(--cp-border)" }}
                onClick={onClear}
              >
                {t("history.clear")}
              </button>
            )}
            <button
              className="w-5 h-5 flex items-center justify-center rounded"
              style={{ color: "var(--cp-text-muted)" }}
              onClick={onClose}
              aria-label="Close dialog"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {entries.length === 0 ? (
            <p className="text-xs text-center py-8" style={{ color: "var(--cp-text-muted)" }}>
              {t("history.empty")}
            </p>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.id}
                className="p-2.5 rounded border"
                style={{
                  background: "var(--cp-bg)",
                  borderColor: "var(--cp-border)",
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium truncate max-w-[260px]" style={{ color: "var(--cp-text)" }}>
                    {entry.skillName}
                  </span>
                  <span className="text-[10px] shrink-0" style={{ color: "var(--cp-text-muted)" }}>
                    {formatTime(entry.timestamp)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <span style={{ color: "var(--cp-success)" }}>
                    {entry.successCount} OK
                  </span>
                  {entry.failCount > 0 && (
                    <span style={{ color: "var(--cp-error)" }}>
                      {entry.failCount} failed
                    </span>
                  )}
                  <span
                    className="px-1 py-0.5 rounded"
                    style={{ background: "var(--cp-badge-bg)", color: "var(--cp-badge-fg)" }}
                  >
                    {entry.mode}
                  </span>
                  <span className="truncate" style={{ color: "var(--cp-text-muted)" }}>
                    → {entry.targetAgents.join(", ")}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};
