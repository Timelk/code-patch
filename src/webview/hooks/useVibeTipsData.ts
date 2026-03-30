import { useMemo } from "react";
import { useI18n } from "../i18n";
import {
  FRAMEWORKS, TIPS, SKILL_MARKETS, FEATURED_SKILLS, MCP_MARKETS, FEATURED_MCPS,
  type Framework, type Tip, type Market, type Featured,
} from "../data/vibetips-data";
import {
  ZH_FRAMEWORKS, ZH_TIPS, ZH_SKILL_MARKETS, ZH_FEATURED_SKILLS, ZH_MCP_MARKETS, ZH_FEATURED_MCPS,
} from "../data/vibetips-data-zh";

function localizeDesc<T extends { readonly name: string; readonly description: string }>(
  items: readonly T[],
  zhMap: Record<string, string>,
  locale: string,
): readonly T[] {
  if (locale !== "zh") return items;
  return items.map((item) => ({
    ...item,
    description: zhMap[item.name] ?? item.description,
  }));
}

function localizeTips(items: readonly Tip[], locale: string): readonly Tip[] {
  if (locale !== "zh") return items;
  return items.map((tip) => {
    const zh = ZH_TIPS[tip.title];
    if (!zh) return tip;
    return {
      ...tip,
      summary: zh.summary,
      detail: zh.detail ?? tip.detail,
    };
  });
}

export function useVibeTipsData() {
  const { locale } = useI18n();

  return useMemo(() => ({
    frameworks: localizeDesc<Framework>(FRAMEWORKS, ZH_FRAMEWORKS, locale),
    tips: localizeTips(TIPS, locale),
    skillMarkets: localizeDesc<Market>(SKILL_MARKETS, ZH_SKILL_MARKETS, locale),
    featuredSkills: localizeDesc<Featured>(FEATURED_SKILLS, ZH_FEATURED_SKILLS, locale),
    mcpMarkets: localizeDesc<Market>(MCP_MARKETS, ZH_MCP_MARKETS, locale),
    featuredMcps: localizeDesc<Featured>(FEATURED_MCPS, ZH_FEATURED_MCPS, locale),
  }), [locale]);
}
