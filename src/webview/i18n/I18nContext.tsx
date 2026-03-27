import { createContext, type FC, type ReactNode, useState, useCallback, useMemo } from "react";
import { en } from "./locales/en";
import { zh } from "./locales/zh";

export type Locale = "en" | "zh";

interface I18nContextValue {
  readonly locale: Locale;
  readonly setLocale: (locale: Locale) => void;
  readonly t: (key: string, params?: Record<string, string | number>) => string;
}

const locales: Record<Locale, Record<string, string>> = { en, zh };

export const I18nContext = createContext<I18nContextValue>({
  locale: "en",
  setLocale: () => {},
  t: (key) => key,
});

interface I18nProviderProps {
  readonly initialLocale?: Locale;
  readonly children: ReactNode;
}

export const I18nProvider: FC<I18nProviderProps> = ({ initialLocale = "en", children }) => {
  const [locale, setLocale] = useState<Locale>(initialLocale);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      let value = locales[locale]?.[key] ?? locales.en[key] ?? key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          value = value.replace(`{${k}}`, String(v));
        }
      }
      return value;
    },
    [locale]
  );

  const ctx = useMemo<I18nContextValue>(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={ctx}>{children}</I18nContext.Provider>;
};
