import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { content, Language, SiteContent } from '../content';
import { canonicalForLanguage, languageFromPath, urlForLanguage } from './routes';

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: SiteContent;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const setMeta = (selector: string, attribute: string, value: string) => {
  document.querySelector(selector)?.setAttribute(attribute, value);
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Meteen uit het adres, niet pas na de eerste render. Anders flitst er even
  // de verkeerde taal voorbij.
  const [language, setLanguageState] = useState<Language>(() =>
    languageFromPath(window.location.pathname),
  );

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);

    const { search, hash } = window.location;
    window.history.pushState(null, '', urlForLanguage(next, search, hash));
  }, []);

  // De terugknop hoort ook van taal te wisselen.
  useEffect(() => {
    const syncWithUrl = () => setLanguageState(languageFromPath(window.location.pathname));

    window.addEventListener('popstate', syncWithUrl);

    return () => window.removeEventListener('popstate', syncWithUrl);
  }, []);

  useEffect(() => {
    const { meta } = content[language];
    const canonical = canonicalForLanguage(language);

    document.documentElement.lang = language;
    document.title = meta.title;

    setMeta('meta[name="description"]', 'content', meta.description);
    setMeta('link[rel="canonical"]', 'href', canonical);
    setMeta('meta[property="og:url"]', 'content', canonical);
    setMeta('meta[property="og:title"]', 'content', meta.title);
    setMeta('meta[property="og:description"]', 'content', meta.description);
    setMeta('meta[property="og:locale"]', 'content', language === 'en' ? 'en_GB' : 'nl_NL');
  }, [language]);

  const value = useMemo(
    () => ({ language, setLanguage, t: content[language] }),
    [language, setLanguage],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextValue => {
  const value = useContext(LanguageContext);

  if (!value) {
    throw new Error('useLanguage moet binnen een LanguageProvider gebruikt worden');
  }

  return value;
};
