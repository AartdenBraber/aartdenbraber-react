import React from 'react';
import './LanguageSwitcher.scss';
import { Language, LANGUAGES } from '../../content';
import { useLanguage } from '../../i18n/LanguageContext';
import { pathForLanguage } from '../../i18n/routes';

const LABELS: Record<Language, string> = {
  nl: 'Nederlands',
  en: 'English',
};

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="language-switcher" role="group" aria-label="Taal / Language">
      {LANGUAGES.map((option) => (
        // Echte links, geen knoppen: zo kan een zoekmachine de andere taal
        // vinden en volgen. De klik wordt onderschept zodat de pagina niet
        // opnieuw laadt.
        <a
          key={option}
          className="language-switcher__option"
          href={pathForLanguage(option)}
          hrefLang={option}
          lang={option}
          aria-label={LABELS[option]}
          aria-current={option === language ? 'true' : undefined}
          onClick={(event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;

            event.preventDefault();
            setLanguage(option);
          }}
        >
          {option.toUpperCase()}
        </a>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
