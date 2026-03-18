import { type FC, useEffect } from "react";

export interface DiffEntry {
  readonly agentName: string;
  readonly agentDisplayName: string;
  readonly status: "identical" | "modified" | "missing" | "symlink";
  readonly canonicalSnippet?: string;
  readonly targetSnippet?: string;
}

interface DiffPreviewProps {
  readonly skillName: string;
  readonly entries: readonly DiffEntry[];
  readonly onClose: () => void;
}

const STATUS_LABELS: Record<DiffEntry["status"], { label: string; color: string }> = {
  identical: { label: "Identical", color: "var(--cp-success)" },
  modified: { label: "Modified", color: "var(--cp-error)" },
  missing: { label: "Missing", color: "var(--cp-text-muted)" },
  symlink: { label: "Symlink", color: "var(--cp-primary)" },
};

export const DiffPreview: FC<DiffPreviewProps> = ({ skillName, entries, onClose }) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

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
        aria-labelledby="diff-preview-title"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] max-h-[70vh] rounded-lg shadow-2xl z-50 border flex flex-col"
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
          <h3 id="diff-preview-title" className="text-sm font-semibold" style={{ color: "var(--cp-text)" }}>
            Diff: {skillName}
          </h3>
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {entries.length === 0 ? (
            <p className="text-xs text-center py-4" style={{ color: "var(--cp-text-muted)" }}>
              No agent directories found for comparison
            </p>
          ) : (
            entries.map((entry) => {
              const { label, color } = STATUS_LABELS[entry.status];
              return (
                <div
                  key={entry.agentName}
                  className="p-3 rounded border"
                  style={{
                    background: "var(--cp-bg)",
                    borderColor: "var(--cp-border)",
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium" style={{ color: "var(--cp-text)" }}>
                      {entry.agentDisplayName}
                    </span>
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                      style={{ color, background: `${color}15` }}
                    >
                      {label}
                    </span>
                  </div>

                  {entry.status === "modified" && entry.targetSnippet && (
                    <div className="mt-2 space-y-1">
                      {entry.canonicalSnippet && (
                        <div>
                          <div className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: "var(--cp-success)" }}>
                            Canonical
                          </div>
                          <pre
                            className="text-[10px] p-2 rounded overflow-x-auto whitespace-pre-wrap"
                            style={{
                              background: "var(--cp-input-bg)",
                              color: "var(--cp-text-muted)",
                              fontFamily: "var(--vscode-editor-font-family, monospace)",
                              maxHeight: "80px",
                            }}
                          >
                            {entry.canonicalSnippet}
                          </pre>
                        </div>
                      )}
                      <div>
                        <div className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: "var(--cp-error)" }}>
                          Target
                        </div>
                        <pre
                          className="text-[10px] p-2 rounded overflow-x-auto whitespace-pre-wrap"
                          style={{
                            background: "var(--cp-input-bg)",
                            color: "var(--cp-text-muted)",
                            fontFamily: "var(--vscode-editor-font-family, monospace)",
                            maxHeight: "80px",
                          }}
                        >
                          {entry.targetSnippet}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};
