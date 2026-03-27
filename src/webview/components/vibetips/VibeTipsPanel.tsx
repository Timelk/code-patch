import { type FC, useState, useRef, useEffect } from "react";
import { VibeTipsHots } from "./VibeTipsHots";
import { VibeTipsSkills } from "./VibeTipsSkills";
import { VibeTipsMCPs } from "./VibeTipsMCPs";
import { useI18n } from "../../i18n";

type VibeTipsTab = "hots" | "skills" | "mcps";

interface VibeTipsPanelProps {
  readonly onOpenUrl: (url: string) => void;
}

export const VibeTipsPanel: FC<VibeTipsPanelProps> = ({ onOpenUrl }) => {
  const { t } = useI18n();
  const TABS: readonly { key: VibeTipsTab; label: string; icon: string }[] = [
    { key: "hots", label: t("vt.hots"), icon: "\u{1F525}" },
    { key: "skills", label: t("vt.skills"), icon: "\u{1F4E6}" },
    { key: "mcps", label: t("vt.mcps"), icon: "\u{1F50C}" },
  ];
  const [activeTab, setActiveTab] = useState<VibeTipsTab>("hots");
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [contentVisible, setContentVisible] = useState(true);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Update sliding indicator position
  useEffect(() => {
    const el = tabRefs.current.get(activeTab);
    if (el) {
      const parent = el.parentElement;
      if (parent) {
        const parentRect = parent.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        setIndicatorStyle({
          left: elRect.left - parentRect.left,
          width: elRect.width,
        });
      }
    }
  }, [activeTab]);

  const handleTabChange = (tab: VibeTipsTab) => {
    if (tab === activeTab) return;
    // Fade out → switch → fade in
    setContentVisible(false);
    setTimeout(() => {
      setActiveTab(tab);
      setContentVisible(true);
    }, 150);
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--cp-bg)" }}>
      {/* Tab Bar */}
      <div
        className="shrink-0 px-6 pt-4 pb-0 border-b relative"
        style={{ borderColor: "var(--cp-border)", background: "var(--cp-surface)" }}
      >
        <div className="flex items-center gap-1 relative">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                ref={(el) => {
                  if (el) tabRefs.current.set(tab.key, el);
                }}
                className="px-4 py-2.5 text-xs font-semibold transition-colors relative z-10"
                style={{
                  color: isActive ? "var(--cp-text)" : "var(--cp-text-muted)",
                }}
                onClick={() => handleTabChange(tab.key)}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = "var(--cp-text)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = "var(--cp-text-muted)";
                }}
              >
                <span className="mr-1.5">{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
          {/* Sliding indicator */}
          <div
            className="absolute bottom-0 h-[2px] transition-all duration-300 ease-out rounded-full"
            style={{
              left: indicatorStyle.left,
              width: indicatorStyle.width,
              background: "linear-gradient(90deg, #f97316, #ec4899)",
            }}
          />
        </div>
      </div>

      {/* Content Area */}
      <div
        className="flex-1 overflow-y-auto p-6 transition-opacity duration-150 ease-in-out"
        style={{ opacity: contentVisible ? 1 : 0 }}
      >
        {activeTab === "hots" && <VibeTipsHots onOpenUrl={onOpenUrl} />}
        {activeTab === "skills" && <VibeTipsSkills onOpenUrl={onOpenUrl} />}
        {activeTab === "mcps" && <VibeTipsMCPs onOpenUrl={onOpenUrl} />}
      </div>
    </div>
  );
};
