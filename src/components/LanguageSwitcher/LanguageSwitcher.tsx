import React from 'react';
import './LanguageSwitcher.scss';
import { Language, LANGUAGES } from '../../content';
import { useLanguage } from '../../i18n/LanguageContext';

const LABELS: Record<Language, string> = {
  nl: 'Nederlands',
  en: 'English',
};

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="language-switcher" role="group" aria-label="Taal / Language">
      {LANGUAGES.map((option) => (
        <button
          key={option}
          type="button"
          className="language-switcher__option"
          lang={option}
          aria-label={LABELS[option]}
          aria-pressed={option === language}
          onClick={() => setLanguage(option)}
        >
          {option.toUpperCase()}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
