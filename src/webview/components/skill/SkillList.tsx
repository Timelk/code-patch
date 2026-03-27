import { type FC, useCallback, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import type { Skill } from "../../hooks/useSkills";
import { useI18n } from "../../i18n";

interface SkillListProps {
  readonly skills: readonly Skill[];
  readonly selectedSkill: Skill | null;
  readonly onSelectSkill: (skill: Skill) => void;
  readonly multiSelect?: boolean;
  readonly selectedSkillNames?: ReadonlySet<string>;
  readonly onToggleSkillSelection?: (skillName: string) => void;
  readonly onSelectAll?: () => void;
  readonly onDeleteSkill?: (skill: Skill) => void;
  readonly onSyncSkill?: (skill: Skill) => void;
  /** Show agent badge prefix — only in ALL mode where skills come from multiple agents */
  readonly showBadge?: boolean;
}

/** Shorten absolute file path for display (replace home dir with ~) */
function shortenPath(filePath: string): string {
  return filePath
    .replace(/^\/home\/[^/]+/, "~")
    .replace(/^\/Users\/[^/]+/, "~")
    .replace(/^C:\\Users\\[^\\]+/i, "~");
}

/** Get a short badge label from sourceAgent */
function getAgentBadge(sourceAgent: string): string {
  const map: Record<string, string> = {
    "claude-code": "CC",
    codex: "CX",
    opencode: "OC",
    cursor: "CU",
    windsurf: "WS",
    "gemini-cli": "GE",
    "github-copilot": "CP",
    cline: "CL",
    roo: "RO",
    augment: "AU",
    continue: "CO",
    goose: "GO",
    kilo: "KI",
    trae: "TR",
    amp: "AM",
    "kimi-cli": "KM",
    junie: "JU",
    "qwen-code": "QW",
  };
  return map[sourceAgent] ?? sourceAgent.slice(0, 2).toUpperCase();
}

interface ContextMenuState {
  readonly x: number;
  readonly y: number;
  readonly skill: Skill;
}

export const SkillList: FC<SkillListProps> = ({
  skills,
  selectedSkill,
  onSelectSkill,
  multiSelect = false,
  selectedSkillNames,
  onToggleSkillSelection,
  onSelectAll,
  onDeleteSkill,
  onSyncSkill,
  showBadge = false,
}) => {
  const { t } = useI18n();
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close context menu on outside click
  useEffect(() => {
    if (!contextMenu) return;
    const handleClick = () => setContextMenu(null);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [contextMenu]);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, skill: Skill) => {
      e.preventDefault();
      e.stopPropagation();
      // Viewport boundary checking to prevent menu from going off-screen
      const menuWidth = 140;
      const menuHeight = 76;
      const x = Math.min(e.clientX, window.innerWidth - menuWidth - 4);
      const y = Math.min(e.clientY, window.innerHeight - menuHeight - 4);
      setContextMenu({ x: Math.max(4, x), y: Math.max(4, y), skill });
    },
    []
  );

  if (skills.length === 0) {
    return (
      <div className="p-3 text-xs text-center" style={{ color: "var(--cp-text-muted)" }}>
        {t("sidebar.noSkills")}
      </div>
    );
  }

  const allSelected =
    multiSelect &&
    skills.length > 0 &&
    skills.every((s) => selectedSkillNames?.has(s.filePath));

  return (
    <div className="space-y-0.5">
      {multiSelect && (
        <div
          className="flex items-center gap-1 px-2 py-1.5 mb-0.5 border-b"
          style={{ borderColor: "var(--cp-border)" }}
        >
          <input
            type="checkbox"
            checked={allSelected}
            onChange={() => onSelectAll?.()}
            className="ml-1 shrink-0"
            style={{ accentColor: "var(--cp-primary)" }}
          />
          <span
            className="text-[10px] font-medium"
            style={{ color: "var(--cp-text-muted)" }}
          >
            {allSelected ? t("sidebar.deselectAll") : t("sidebar.selectAll")} ({skills.length})
          </span>
        </div>
      )}
      {skills.map((skill) => {
        const isSelected = selectedSkill?.filePath === skill.filePath;
        const isChecked = selectedSkillNames?.has(skill.filePath) ?? false;
        return (
          <div key={skill.filePath} className="flex items-center gap-1">
            {multiSelect && (
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => onToggleSkillSelection?.(skill.filePath)}
                className="ml-1 shrink-0"
                style={{ accentColor: "var(--cp-primary)" }}
              />
            )}
            <button
              className="flex-1 text-left px-2 py-1.5 rounded text-xs font-medium min-w-0"
              style={{
                background: isSelected
                  ? "var(--cp-list-active)"
                  : "transparent",
                color: isSelected
                  ? "var(--cp-list-active-fg)"
                  : "var(--cp-text)",
                borderLeft: isSelected
                  ? "2px solid var(--cp-primary)"
                  : "2px solid transparent",
                transition: "background 150ms ease, border-color 150ms ease",
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = "var(--cp-list-hover)";
                  e.currentTarget.style.borderLeftColor = "var(--cp-text-muted)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderLeftColor = "transparent";
                }
              }}
              onClick={() => onSelectSkill(skill)}
              onContextMenu={(e) => handleContextMenu(e, skill)}
            >
              <div className="flex items-center gap-1.5 truncate">
                {showBadge && (
                  <span
                    className="shrink-0 text-[8px] font-bold px-1 py-0.5 rounded"
                    style={{
                      background: "var(--cp-badge-bg)",
                      color: "var(--cp-badge-fg)",
                    }}
                    title={skill.sourceAgent}
                  >
                    {getAgentBadge(skill.sourceAgent)}
                  </span>
                )}
                <span className="truncate">{skill.name}</span>
              </div>
              {skill.description && (
                <div
                  className={`text-[10px] truncate mt-0.5 ${showBadge ? "ml-6" : ""}`}
                  style={{
                    color: isSelected
                      ? "var(--cp-list-active-fg)"
                      : "var(--cp-text-muted)",
                  }}
                >
                  {skill.description}
                </div>
              )}
              <div
                className={`text-[9px] truncate mt-0.5 ${showBadge ? "ml-6" : ""}`}
                style={{
                  color: isSelected
                    ? "var(--cp-list-active-fg)"
                    : "var(--cp-text-muted)",
                  opacity: 0.6,
                }}
                title={skill.filePath}
              >
                {shortenPath(skill.filePath)}
              </div>
            </button>
          </div>
        );
      })}

      {/* Context menu — portal to body to escape overflow clipping */}
      {contextMenu && createPortal(
        <div
          ref={menuRef}
          className="fixed z-50 rounded shadow-lg border py-1 min-w-[120px]"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
            background: "var(--cp-surface)",
            borderColor: "var(--cp-border)",
          }}
        >
          <button
            className="w-full text-left px-3 py-1.5 text-xs transition-colors flex items-center gap-2"
            style={{ color: "var(--cp-text)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--cp-list-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
            onClick={() => {
              onSyncSkill?.(contextMenu.skill);
              setContextMenu(null);
            }}
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            {t("ctx.sync")}
          </button>
          <button
            className="w-full text-left px-3 py-1.5 text-xs transition-colors flex items-center gap-2"
            style={{ color: "var(--cp-error)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--cp-list-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
            onClick={() => {
              onDeleteSkill?.(contextMenu.skill);
              setContextMenu(null);
            }}
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            {t("ctx.delete")}
          </button>
        </div>,
        document.body
      )}
    </div>
  );
};
