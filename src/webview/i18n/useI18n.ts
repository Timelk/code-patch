import { useContext } from "react";
import { I18nContext } from "./I18nContext";

/**
 * Access i18n translation function and locale state.
 *
 * @example
 * const { t, locale, setLocale } = useI18n();
 * t("header.refresh")            // "Refresh skills" | "刷新技能"
 * t("confirm.deleteMessageOne", { name: "my-skill" })  // interpolation
 */
export function useI18n() {
  return useContext(I18nContext);
}
