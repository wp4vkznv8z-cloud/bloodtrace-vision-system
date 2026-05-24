import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { dict, type Locale, type Dict } from "./i18n";

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Dict;
  dir: "ltr" | "rtl";
};

const LocaleContext = createContext<Ctx | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("bt_locale")) as Locale | null;
    if (saved && saved in dict) setLocaleState(saved);
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
      document.documentElement.dir = dict[locale].dir;
    }
  }, [locale]);

  const value = useMemo<Ctx>(
    () => ({
      locale,
      setLocale: (l) => {
        setLocaleState(l);
        if (typeof window !== "undefined") localStorage.setItem("bt_locale", l);
      },
      t: dict[locale] as Dict,
      dir: dict[locale].dir as "ltr" | "rtl",
    }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside LocaleProvider");
  return ctx;
}
