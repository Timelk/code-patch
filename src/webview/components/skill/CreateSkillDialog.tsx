import { type FC, useState, useEffect } from "react";

interface CreateSkillDialogProps {
  readonly onCreateSkill: (name: string, description: string, content: string) => void;
  readonly onClose: () => void;
}

export const CreateSkillDialog: FC<CreateSkillDialogProps> = ({
  onCreateSkill,
  onClose,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");

  const isValid = name.trim().length > 0;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSubmit = () => {
    if (!isValid) return;
    const slug = name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    onCreateSkill(slug, description.trim(), content.trim());
  };

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
        aria-labelledby="create-skill-title"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 rounded-lg shadow-2xl z-50 border"
        style={{
          background: "var(--cp-surface)",
          borderColor: "var(--cp-border)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: "var(--cp-border)" }}
        >
          <h3 id="create-skill-title" className="text-sm font-semibold" style={{ color: "var(--cp-text)" }}>
            New Skill
          </h3>
          <button
            className="w-5 h-5 flex items-center justify-center rounded transition-colors"
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
        <div className="p-4 space-y-3">
          {/* Name */}
          <div>
            <label
              className="block text-[10px] font-semibold uppercase tracking-wider mb-1"
              style={{ color: "var(--cp-text-muted)" }}
            >
              Name *
            </label>
            <input
              type="text"
              className="w-full px-2.5 py-1.5 rounded text-xs border outline-none"
              style={{
                background: "var(--cp-input-bg)",
                borderColor: "var(--cp-input-border)",
                color: "var(--cp-text)",
              }}
              placeholder="my-skill-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label
              className="block text-[10px] font-semibold uppercase tracking-wider mb-1"
              style={{ color: "var(--cp-text-muted)" }}
            >
              Description
            </label>
            <input
              type="text"
              className="w-full px-2.5 py-1.5 rounded text-xs border outline-none"
              style={{
                background: "var(--cp-input-bg)",
                borderColor: "var(--cp-input-border)",
                color: "var(--cp-text)",
              }}
              placeholder="What this skill does..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Content */}
          <div>
            <label
              className="block text-[10px] font-semibold uppercase tracking-wider mb-1"
              style={{ color: "var(--cp-text-muted)" }}
            >
              Content
            </label>
            <textarea
              className="w-full px-2.5 py-1.5 rounded text-xs border outline-none resize-y min-h-[100px]"
              style={{
                background: "var(--cp-input-bg)",
                borderColor: "var(--cp-input-border)",
                color: "var(--cp-text)",
                fontFamily: "var(--vscode-editor-font-family, monospace)",
              }}
              placeholder="# Skill Title&#10;&#10;Skill instructions here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
            />
          </div>
        </div>

        {/* Footer */}
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
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1.5 rounded text-xs font-medium transition-colors"
            style={{
              background: isValid ? "var(--cp-primary)" : "var(--cp-badge-bg)",
              color: isValid ? "var(--cp-primary-fg)" : "var(--cp-text-muted)",
              cursor: isValid ? "pointer" : "default",
            }}
            onClick={handleSubmit}
            disabled={!isValid}
          >
            Create
          </button>
        </div>
      </div>
    </>
  );
};
