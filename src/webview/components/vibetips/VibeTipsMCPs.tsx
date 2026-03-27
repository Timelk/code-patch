import { type FC, useMemo } from "react";
import { VibeTipsCard } from "./VibeTipsCard";
import { MCP_MARKETS, FEATURED_MCPS } from "../../data/vibetips-data";
import { useI18n } from "../../i18n";

interface VibeTipsMCPsProps {
  readonly onOpenUrl: (url: string) => void;
}

export const VibeTipsMCPs: FC<VibeTipsMCPsProps> = ({ onOpenUrl }) => {
  const { t } = useI18n();
  // Group featured MCPs by category
  const categorized = useMemo(() => {
    const groups = new Map<string, typeof FEATURED_MCPS[number][]>();
    for (const mcp of FEATURED_MCPS) {
      const cat = mcp.category ?? "Other";
      const list = groups.get(cat) ?? [];
      list.push(mcp);
      groups.set(cat, list);
    }
    return Array.from(groups.entries());
  }, []);

  return (
    <div className="space-y-6">
      {/* MCP Marketplaces */}
      <section>
        <h3 className="text-xs font-bold uppercase tracking-wider mb-3 px-1" style={{ color: "var(--cp-text-muted)" }}>
          {t("vt.mcpMarkets")}
        </h3>
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
          {MCP_MARKETS.map((market, i) => (
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

      {/* Featured MCPs by Category */}
      {categorized.map(([category, mcps], catIdx) => (
        <section key={category}>
          <h3 className="text-xs font-bold uppercase tracking-wider mb-3 px-1" style={{ color: "var(--cp-text-muted)" }}>
            {category}
          </h3>
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
            {mcps.map((mcp, i) => (
              <VibeTipsCard
                key={mcp.name}
                title={mcp.name}
                description={mcp.description}
                stars={mcp.stars}
                tags={mcp.tags}
                onClick={mcp.url ? () => onOpenUrl(mcp.url!) : undefined}
                animationDelay={(catIdx * 4 + i + MCP_MARKETS.length) * 50}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};
