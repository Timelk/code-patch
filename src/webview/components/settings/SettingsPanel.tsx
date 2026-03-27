import { type FC, useEffect } from "react";
import type { AgentInfo } from "../../hooks/useAgents";
import { postMessage } from "../../services/vscode-message";
import { useI18n, type Locale } from "../../i18n";

interface AllAgentInfo extends AgentInfo {
  readonly enabled: boolean;
}

interface SettingsPanelProps {
  readonly allAgents: readonly AllAgentInfo[];
  readonly onAgentToggle: (agentName: string, enabled: boolean) => void;
  readonly onClose: () => void;
  readonly locale: Locale;
  readonly onLanguageChange: (locale: Locale) => void;
}

/**
 * Settings panel overlay with agent toggle switches and extension info.
 */
export const SettingsPanel: FC<SettingsPanelProps> = ({ allAgents, onAgentToggle, onClose, locale, onLanguageChange }) => {
  const { t } = useI18n();
  const installedCount = allAgents.filter((a) => a.installed).length;
  const enabledCount = allAgents.filter((a) => a.enabled).length;

  const handleOpenJsonSettings = () => {
    postMessage({ type: "settings:open" });
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        className="cp-dialog-enter rounded-lg shadow-xl border w-[520px] max-h-[80vh] flex flex-col"
        style={{
          background: "var(--cp-surface)",
          borderColor: "var(--cp-border)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3.5 border-b shrink-0"
          style={{ borderColor: "var(--cp-border)" }}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1 rounded" style={{ background: "rgba(14, 99, 156, 0.12)" }}>
              <svg className="w-4 h-4" style={{ color: "var(--cp-primary)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
            <h2 id="settings-title" className="text-sm font-bold" style={{ color: "var(--cp-text)" }}>
              {t("settings.title")}
            </h2>
          </div>
          <button
            className="p-1.5 rounded transition-colors duration-150"
            style={{ color: "var(--cp-text-muted)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--cp-list-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
            onClick={onClose}
            aria-label="Close dialog"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Agents Section */}
          <SettingsSection
            title={t("settings.agents")}
            badge={`${enabledCount} enabled · ${installedCount} installed`}
          >
            <div className="space-y-1">
              {allAgents.map((agent, i) => (
                <div
                  key={agent.name}
                  className="flex items-center justify-between px-3 py-2.5 rounded-md border transition-all duration-150"
                  style={{
                    background: agent.enabled ? "var(--cp-bg)" : "transparent",
                    borderColor: agent.enabled ? "var(--cp-border)" : "transparent",
                    opacity: agent.enabled ? 1 : 0.55,
                    animationDelay: `${i * 20}ms`,
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-2 h-2 rounded-full shrink-0 transition-colors duration-200"
                      style={{
                        background: !agent.enabled
                          ? "var(--cp-text-muted)"
                          : agent.installed
                            ? "var(--cp-success)"
                            : "var(--cp-error)",
                      }}
                    />
                    <div>
                      <div
                        className="text-xs font-medium transition-colors duration-150"
                        style={{ color: agent.enabled ? "var(--cp-text)" : "var(--cp-text-muted)" }}
                      >
                        {agent.displayName}
                      </div>
                      <div className="text-[10px] mt-0.5" style={{ color: "var(--cp-text-muted)" }}>
                        {agent.installed ? t("settings.installed") : t("settings.notFound")}
                      </div>
                    </div>
                  </div>
                  <ToggleSwitch
                    checked={agent.enabled}
                    onChange={() => onAgentToggle(agent.name, !agent.enabled)}
                  />
                </div>
              ))}
            </div>
          </SettingsSection>

          {/* Sync Section */}
          <SettingsSection title={t("settings.sync")}>
            <SettingsRow
              label={t("settings.syncMode")}
              description={t("settings.syncModeDesc")}
              value={t("settings.copy")}
            />
            <SettingsRow
              label={t("settings.activeAgents")}
              description={t("settings.activeAgentsDesc")}
              value={`${enabledCount} / ${allAgents.length}`}
            />
          </SettingsSection>

          {/* Language Section */}
          <SettingsSection title={t("settings.language")}>
            <div
              className="flex items-center justify-between px-3 py-2.5 rounded-md border"
              style={{
                background: "var(--cp-bg)",
                borderColor: "var(--cp-border)",
              }}
            >
              <div>
                <div className="text-xs font-medium" style={{ color: "var(--cp-text)" }}>
                  {t("settings.language")}
                </div>
                <div className="text-[10px] mt-0.5" style={{ color: "var(--cp-text-muted)" }}>
                  {t("settings.languageDesc")}
                </div>
              </div>
              <div
                className="flex p-0.5 rounded"
                style={{ background: "var(--cp-input-bg)" }}
              >
                <button
                  className="px-2 py-1 rounded text-[11px] font-medium transition-all duration-150"
                  style={{
                    background: locale === "en" ? "var(--cp-primary)" : "transparent",
                    color: locale === "en" ? "var(--cp-primary-fg)" : "var(--cp-text-muted)",
                  }}
                  onClick={() => onLanguageChange("en")}
                >
                  English
                </button>
                <button
                  className="px-2 py-1 rounded text-[11px] font-medium transition-all duration-150"
                  style={{
                    background: locale === "zh" ? "var(--cp-primary)" : "transparent",
                    color: locale === "zh" ? "var(--cp-primary-fg)" : "var(--cp-text-muted)",
                  }}
                  onClick={() => onLanguageChange("zh")}
                >
                  中文
                </button>
              </div>
            </div>
          </SettingsSection>

          {/* About Section */}
          <SettingsSection title={t("settings.about")}>
            <SettingsRow
              label={t("settings.extension")}
              description={t("settings.extensionDesc")}
              value={t("settings.version")}
            />
            <SettingsRow
              label={t("settings.syncEngine")}
              description={t("settings.syncEngineDesc")}
              value={t("settings.copy")}
            />
          </SettingsSection>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-5 py-3 border-t shrink-0"
          style={{ borderColor: "var(--cp-border)" }}
        >
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-colors duration-150 border"
            style={{
              borderColor: "var(--cp-border)",
              color: "var(--cp-text-muted)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--cp-list-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
            onClick={handleOpenJsonSettings}
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            {t("settings.openJson")}
          </button>
          <button
            className="px-4 py-1.5 rounded text-xs font-medium transition-colors duration-150"
            style={{
              background: "var(--cp-primary)",
              color: "var(--cp-primary-fg)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--cp-primary-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--cp-primary)";
            }}
            onClick={onClose}
          >
            {t("settings.done")}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Toggle Switch ─────────────────────────────────────────────── */

const ToggleSwitch: FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
  <button
    role="switch"
    aria-checked={checked}
    className="relative shrink-0 rounded-full transition-colors duration-200"
    style={{
      width: 34,
      height: 18,
      background: checked ? "var(--cp-primary)" : "var(--cp-badge-bg)",
    }}
    onClick={onChange}
  >
    <span
      className="absolute rounded-full transition-all duration-200 ease-out"
      style={{
        width: 14,
        height: 14,
        top: 2,
        left: checked ? 18 : 2,
        background: "#fff",
        boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
      }}
    />
  </button>
);

/* ─── Sub-components ────────────────────────────────────────────── */

const SettingsSection: FC<{
  title: string;
  badge?: string;
  children: React.ReactNode;
}> = ({ title, badge, children }) => (
  <div>
    <div className="flex items-center gap-2 mb-2 px-1">
      <h3
        className="text-[10px] font-bold uppercase tracking-wider"
        style={{ color: "var(--cp-text-muted)" }}
      >
        {title}
      </h3>
      {badge && (
        <span
          className="text-[9px] px-1.5 py-0.5 rounded-full"
          style={{ background: "var(--cp-badge-bg)", color: "var(--cp-badge-fg)" }}
        >
          {badge}
        </span>
      )}
    </div>
    {children}
  </div>
);

const SettingsRow: FC<{
  label: string;
  description: string;
  value: string;
}> = ({ label, description, value }) => (
  <div
    className="flex items-center justify-between px-3 py-2.5 rounded-md border"
    style={{
      background: "var(--cp-bg)",
      borderColor: "var(--cp-border)",
    }}
  >
    <div>
      <div className="text-xs font-medium" style={{ color: "var(--cp-text)" }}>
        {label}
      </div>
      <div className="text-[10px] mt-0.5" style={{ color: "var(--cp-text-muted)" }}>
        {description}
      </div>
    </div>
    <span
      className="text-[10px] px-1.5 py-0.5 rounded shrink-0 ml-2"
      style={{
        background: "var(--cp-badge-bg)",
        color: "var(--cp-badge-fg)",
      }}
    >
      {value}
    </span>
  </div>
);
