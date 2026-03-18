import { type FC, useState, useEffect, useCallback } from "react";
import { SearchInput } from "../common/SearchInput";
import {
  getRemoteSources,
  type RemoteSkill,
} from "../../services/remote-skill-api";

// ─── Types ─────────────────────────────────────────────────────────

interface RemoteSkillPanelProps {
  /** Results received from extension host via postMessage */
  readonly remoteSkills: readonly RemoteSkill[];
  readonly remoteTotal: number;
  readonly remoteLoading: boolean;
  readonly remoteError: string | null;
  /** Called when a search should be triggered (parent handles loading state + postMessage) */
  readonly onSearch: (sourceId: string, query?: string) => void;
  /** Set of locally installed skill names (sanitized) for installed state detection */
  readonly installedSkillNames: ReadonlySet<string>;
  /** Called to install a remote skill */
  readonly onInstall: (sourceId: string, skill: RemoteSkill) => void;
  /** Called to remove an installed skill */
  readonly onRemove: (skillName: string) => void;
  /** Set of skill names currently being installed or removed */
  readonly pendingSkills: ReadonlySet<string>;
}

// ─── Helpers ───────────────────────────────────────────────────────

function formatDownloads(n: number): string {
  if (n >= 10000) return `${(n / 1000).toFixed(1)}k`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

/** Sanitize name to match extension host logic */
function sanitizeName(name: string): string {
  return name.replace(/[^a-z0-9_-]/gi, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

// ─── Component ─────────────────────────────────────────────────────

export const RemoteSkillPanel: FC<RemoteSkillPanelProps> = ({
  remoteSkills,
  remoteTotal,
  remoteLoading,
  remoteError,
  onSearch,
  installedSkillNames,
  onInstall,
  onRemove,
  pendingSkills,
}) => {
  const sources = getRemoteSources();
  const [activeSource, setActiveSource] = useState(sources[0].id);
  const [searchQuery, setSearchQuery] = useState("");

  // Trigger search on source/query change
  useEffect(() => {
    onSearch(activeSource, searchQuery || undefined);
  }, [activeSource, searchQuery, onSearch]);

  const handleSourceChange = useCallback((sourceId: string) => {
    setActiveSource(sourceId);
    setSearchQuery("");
  }, []);

  const activeHost = sources.find((s) => s.id === activeSource)?.host ?? "";

  return (
    <div className="flex flex-col h-full">
      {/* Source sub-tabs */}
      <div className="px-2 pt-2 pb-1">
        <div
          className="flex p-0.5 rounded gap-0.5"
          style={{ background: "var(--cp-input-bg)" }}
        >
          {sources.map((source) => {
            const isActive = activeSource === source.id;
            return (
              <button
                key={source.id}
                className="flex-1 px-1.5 py-1 rounded text-[10px] font-medium transition-all whitespace-nowrap"
                style={{
                  background: isActive ? "var(--cp-surface)" : "transparent",
                  color: isActive ? "var(--cp-text)" : "var(--cp-text-muted)",
                  boxShadow: isActive ? "0 1px 2px rgba(0,0,0,0.2)" : "none",
                }}
                onClick={() => handleSourceChange(source.id)}
                title={source.host}
              >
                {source.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Source host + total */}
      <div className="px-3 pb-1 flex items-center justify-between">
        <span
          className="text-[9px]"
          style={{ color: "var(--cp-text-muted)", opacity: 0.7 }}
        >
          {activeHost}
        </span>
        {remoteTotal > 0 && !remoteLoading && (
          <span
            className="text-[9px]"
            style={{ color: "var(--cp-text-muted)", opacity: 0.6 }}
          >
            {remoteTotal.toLocaleString()} results
          </span>
        )}
      </div>

      {/* Search */}
      <div className="px-2 pb-2">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search remote skills..."
        />
      </div>

      {/* Skill list */}
      <div className="flex-1 overflow-y-auto px-1 pb-2 space-y-1">
        {remoteLoading ? (
          <div
            className="p-3 text-xs text-center"
            style={{ color: "var(--cp-text-muted)" }}
          >
            Loading from {activeHost}...
          </div>
        ) : remoteError ? (
          <div className="p-3 text-xs text-center" style={{ color: "var(--cp-error)" }}>
            {remoteError}
            <button
              className="block mx-auto mt-2 px-2 py-1 rounded text-[10px] border transition-colors"
              style={{
                borderColor: "var(--cp-border)",
                color: "var(--cp-text-muted)",
              }}
              onClick={() => onSearch(activeSource, searchQuery || undefined)}
            >
              Retry
            </button>
          </div>
        ) : remoteSkills.length === 0 ? (
          <div
            className="p-3 text-xs text-center"
            style={{ color: "var(--cp-text-muted)" }}
          >
            No skills found
          </div>
        ) : (
          remoteSkills.map((skill) => {
            const safeName = sanitizeName(skill.name);
            const isInstalled = installedSkillNames.has(safeName);
            const isPending = pendingSkills.has(skill.name);

            return (
              <div
                key={skill.name}
                className="px-2 py-2 rounded border transition-colors"
                style={{
                  background: "var(--cp-bg)",
                  borderColor: isInstalled ? "var(--cp-primary)" : "var(--cp-border)",
                }}
              >
                {/* Name + version + action button */}
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1 min-w-0 flex-1">
                    <span
                      className="text-xs font-medium truncate"
                      style={{ color: "var(--cp-text)" }}
                    >
                      {skill.name}
                    </span>
                    {skill.version && (
                      <span
                        className="shrink-0 text-[9px] px-1 rounded"
                        style={{
                          background: "var(--cp-badge-bg)",
                          color: "var(--cp-badge-fg)",
                        }}
                      >
                        {skill.version}
                      </span>
                    )}
                  </div>
                  {/* Install / Remove button */}
                  <button
                    className="shrink-0 px-2 py-0.5 rounded text-[10px] font-medium transition-colors"
                    style={{
                      background: isInstalled ? "transparent" : "var(--cp-primary)",
                      color: isInstalled ? "var(--cp-error)" : "var(--cp-primary-fg)",
                      border: isInstalled ? "1px solid var(--cp-error)" : "none",
                      opacity: isPending ? 0.6 : 1,
                      cursor: isPending ? "not-allowed" : "pointer",
                    }}
                    disabled={isPending}
                    onClick={() => {
                      if (isInstalled) {
                        onRemove(safeName);
                      } else {
                        onInstall(activeSource, skill);
                      }
                    }}
                    title={isInstalled ? `Remove ${skill.name}` : `Install ${skill.name}`}
                  >
                    {isPending
                      ? (isInstalled ? "Removing..." : "Installing...")
                      : (isInstalled ? "Remove" : "Install")}
                  </button>
                </div>

                {/* Description */}
                <p
                  className="text-[10px] leading-tight mb-1.5"
                  style={{ color: "var(--cp-text-muted)" }}
                >
                  {skill.description}
                </p>

                {/* Meta row: author + downloads */}
                <div className="flex items-center justify-between">
                  <span
                    className="text-[9px]"
                    style={{ color: "var(--cp-text-muted)", opacity: 0.8 }}
                  >
                    @{skill.author}
                  </span>
                  <span
                    className="flex items-center gap-0.5 text-[9px]"
                    style={{ color: "var(--cp-text-muted)", opacity: 0.8 }}
                  >
                    <svg
                      className="w-2.5 h-2.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    {formatDownloads(skill.downloads)}
                  </span>
                </div>

                {/* Tags */}
                {skill.tags.length > 0 && (
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    {skill.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="text-[8px] px-1 py-0.5 rounded"
                        style={{
                          background: "var(--cp-badge-bg)",
                          color: "var(--cp-badge-fg)",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Homepage link */}
                {skill.homepage && (
                  <div className="mt-1.5">
                    <span
                      className="text-[9px] truncate block"
                      style={{ color: "var(--cp-primary)", opacity: 0.8 }}
                      title={skill.homepage}
                    >
                      {skill.homepage.replace(/^https?:\/\//, "").slice(0, 50)}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
