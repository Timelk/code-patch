import { type FC } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Skill } from "../../hooks/useSkills";
import { postMessage } from "../../services/vscode-message";

interface SkillDetailProps {
  readonly skill: Skill;
}

export const SkillDetail: FC<SkillDetailProps> = ({ skill }) => {
  const handleOpenInEditor = () => {
    postMessage({
      type: "skill:openInEditor",
      payload: { path: skill.filePath },
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Title + meta */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold" style={{ color: "var(--cp-text)" }}>
            {skill.name}
          </h2>
          <button
            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-colors"
            style={{
              color: "var(--cp-text-muted)",
              border: "1px solid var(--cp-border)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--cp-list-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
            onClick={handleOpenInEditor}
            title="Open in editor"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Edit
          </button>
        </div>

        {skill.description && (
          <p className="text-xs mb-3" style={{ color: "var(--cp-text-muted)" }}>
            {skill.description}
          </p>
        )}

        {/* Metadata badges */}
        <div className="flex items-center gap-2 text-[10px]">
          <span
            className="px-1.5 py-0.5 rounded"
            style={{ background: "var(--cp-badge-bg)", color: "var(--cp-badge-fg)" }}
          >
            {skill.sourceAgent}
          </span>
          {skill.isSymlink && (
            <span
              className="px-1.5 py-0.5 rounded"
              style={{ background: "rgba(14, 99, 156, 0.2)", color: "var(--cp-primary)" }}
            >
              symlink
            </span>
          )}
        </div>
      </div>

      {/* Frontmatter display */}
      {skill.rawContent.startsWith("---") && (
        <div
          className="rounded p-3 mb-4 text-xs border"
          style={{
            background: "var(--cp-input-bg)",
            borderColor: "var(--cp-border)",
            fontFamily: "var(--vscode-editor-font-family, monospace)",
          }}
        >
          <div
            className="flex items-center justify-between mb-1.5 pb-1.5 border-b text-[10px] uppercase font-bold tracking-wider"
            style={{
              borderColor: "var(--cp-border)",
              color: "var(--cp-text-muted)",
            }}
          >
            Prompt Template
          </div>
          <pre className="whitespace-pre-wrap" style={{ color: "var(--cp-success)" }}>
            {skill.content.slice(0, 500)}
            {skill.content.length > 500 ? "\n..." : ""}
          </pre>
        </div>
      )}

      {/* Full markdown content */}
      <div className="markdown-body">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {skill.content}
        </ReactMarkdown>
      </div>
    </div>
  );
};
