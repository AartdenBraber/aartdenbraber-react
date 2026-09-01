import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { content, DEFAULT_LANGUAGE, Language, LANGUAGES, SiteContent } from '../content';

const STORAGE_KEY = 'adb.language';

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: SiteContent;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const isLanguage = (value: unknown): value is Language =>
  typeof value === 'string' && (LANGUAGES as string[]).includes(value);

/**
 * Bepaalt de starttaal: eerst een eerdere keuze, daarna de browsertaal.
 * localStorage kan gooien in private mode, vandaar de try.
 */
const detectLanguage = (): Language => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLanguage(stored)) {
      return stored;
    }
  } catch {
    // Geen opgeslagen voorkeur beschikbaar, val terug op de browsertaal.
  }

  return window.navigator.language.toLowerCase().startsWith('nl') ? 'nl' : 'en';
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);

  useEffect(() => {
    setLanguageState(detectLanguage());
  }, []);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);

    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Voorkeur niet kunnen opslaan is niet erg genoeg om iets mee te doen.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = content[language].meta.title;

    const description = document.querySelector('meta[name="description"]');
    description?.setAttribute('content', content[language].meta.description);
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
