import { type FC } from "react";
import { VibeTipsCard } from "./VibeTipsCard";
import { SKILL_MARKETS, FEATURED_SKILLS } from "../../data/vibetips-data";
import { useI18n } from "../../i18n";

interface VibeTipsSkillsProps {
  readonly onOpenUrl: (url: string) => void;
}

export const VibeTipsSkills: FC<VibeTipsSkillsProps> = ({ onOpenUrl }) => {
  const { t } = useI18n();
  return (
    <div className="space-y-6">
      {/* Skill Marketplaces */}
      <section>
        <h3 className="text-xs font-bold uppercase tracking-wider mb-3 px-1" style={{ color: "var(--cp-text-muted)" }}>
          {t("vt.skillMarkets")}
        </h3>
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
          {SKILL_MARKETS.map((market, i) => (
            <VibeTipsCard
              key={market.name}
              title={market.name}
              description={market.description}
              icon={market.icon}
              gradient={market.gradient}
              count={market.count}
              onClick={() => onOpenUrl(market.url)}
              animationDelay={i * 50}
            />
          ))}
        </div>
      </section>

      {/* Featured Skills */}
      <section>
        <h3 className="text-xs font-bold uppercase tracking-wider mb-3 px-1" style={{ color: "var(--cp-text-muted)" }}>
          {t("vt.featuredSkills")}
        </h3>
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
          {FEATURED_SKILLS.map((skill, i) => (
            <VibeTipsCard
              key={skill.name}
              title={skill.name}
              description={skill.description}
              stars={skill.stars}
              tags={skill.tags}
              onClick={skill.url ? () => onOpenUrl(skill.url!) : undefined}
              animationDelay={(i + SKILL_MARKETS.length) * 50}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
