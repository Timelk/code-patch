import { type FC } from "react";

interface ConfirmDialogProps {
  readonly title: string;
  readonly message: string;
  readonly confirmLabel?: string;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}

export const ConfirmDialog: FC<ConfirmDialogProps> = ({
  title,
  message,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}) => {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.5)" }}
        onClick={onCancel}
      />

      {/* Dialog */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 rounded-lg shadow-2xl z-50 border"
        style={{
          background: "var(--cp-surface)",
          borderColor: "var(--cp-border)",
        }}
      >
        <div className="p-4">
          <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--cp-text)" }}>
            {title}
          </h3>
          <p className="text-xs leading-relaxed whitespace-pre-line" style={{ color: "var(--cp-text-muted)" }}>
            {message}
          </p>
        </div>

        <div
          className="flex justify-end gap-2 px-4 py-3 border-t"
          style={{ borderColor: "var(--cp-border)" }}
        >
          <button
            className="px-3 py-1.5 rounded text-xs border transition-colors"
            style={{
              borderColor: "var(--cp-border)",
              color: "var(--cp-text-muted)",
            }}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1.5 rounded text-xs font-medium transition-colors"
            style={{
              background: "var(--cp-error)",
              color: "#fff",
            }}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
};
