import { type FC, useState } from "react";
import { VibeTipsCard } from "./VibeTipsCard";
import { useI18n } from "../../i18n";
import { useVibeTipsData } from "../../hooks/useVibeTipsData";

interface VibeTipsHotsProps {
  readonly onOpenUrl: (url: string) => void;
}

export const VibeTipsHots: FC<VibeTipsHotsProps> = ({ onOpenUrl }) => {
  const { t } = useI18n();
  const { frameworks, tips } = useVibeTipsData();
  const [expandedTip, setExpandedTip] = useState<number | null>(null);

  const hero = frameworks[0]; // Superpowers

  return (
    <div className="space-y-6">
      {/* Hero Banner — Superpowers */}
      {hero && (
        <button
          className="vibetips-card w-full text-left rounded-xl p-6 transition-all duration-150 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #f97316, #ec4899, #8b5cf6)",
          }}
          onClick={() => onOpenUrl(hero.url)}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 12px 32px rgba(249, 115, 22, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          {/* Decorative glow */}
          <div
            className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-30"
            style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }}
          />
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{"\u26A1"}</span>
              <h3 className="text-lg font-bold text-white">{hero.name}</h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
                {"\u2605"} {hero.stars}
              </span>
            </div>
            <p className="text-sm text-white/85 mb-3 max-w-2xl">{hero.description}</p>
            {hero.install && (
              <code className="text-[11px] px-2 py-1 rounded" style={{ background: "rgba(0,0,0,0.25)", color: "rgba(255,255,255,0.9)" }}>
                {hero.install}
              </code>
            )}
          </div>
        </button>
      )}

      {/* Vibe Coding Tips */}
      <section>
        <h3 className="text-xs font-bold uppercase tracking-wider mb-3 px-1" style={{ color: "var(--cp-text-muted)" }}>
          {t("vt.tips")}
        </h3>
        <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
          {tips.map((tip, i) => (
            <button
              key={tip.title}
              className="vibetips-card text-left rounded-lg p-3 transition-all duration-150 border"
              style={{
                borderColor: expandedTip === i ? "var(--cp-primary)" : "var(--cp-border)",
                background: expandedTip === i ? "var(--cp-list-active)" : "var(--cp-surface)",
                animationDelay: `${i * 50}ms`,
              }}
              onClick={() => setExpandedTip(expandedTip === i ? null : i)}
              onMouseEnter={(e) => {
                if (expandedTip !== i) e.currentTarget.style.background = "var(--cp-list-hover)";
              }}
              onMouseLeave={(e) => {
                if (expandedTip !== i) e.currentTarget.style.background = "var(--cp-surface)";
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{tip.emoji}</span>
                <span className="text-xs font-semibold" style={{ color: "var(--cp-text)" }}>{tip.title}</span>
              </div>
              <p className="text-[11px] leading-relaxed" style={{ color: "var(--cp-text-muted)" }}>
                {tip.summary}
              </p>
              {expandedTip === i && tip.detail && (
                <p className="text-[11px] leading-relaxed mt-2 pt-2 border-t" style={{ borderColor: "var(--cp-border)", color: "var(--cp-text)" }}>
                  {tip.detail}
                </p>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Hot Frameworks */}
      <section>
        <h3 className="text-xs font-bold uppercase tracking-wider mb-3 px-1" style={{ color: "var(--cp-text-muted)" }}>
          {t("vt.frameworks")}
        </h3>
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
          {frameworks.slice(1).map((fw, i) => (
            <VibeTipsCard
              key={fw.name}
              title={fw.name}
              description={fw.description}
              stars={fw.stars}
              icon={"\u{1F680}"}
              onClick={() => onOpenUrl(fw.url)}
              animationDelay={(i + tips.length) * 50}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
