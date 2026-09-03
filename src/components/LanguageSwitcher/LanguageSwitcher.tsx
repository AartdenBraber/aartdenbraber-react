import React from 'react';
import './LanguageSwitcher.scss';
import { useLanguage } from '../../i18n/LanguageContext';
import { Language } from '../../content';

/**
 * De knoppen stonden op de oude site zonder tekst in de opmaak. Dat leverde
 * knoppen op zonder naam, waar een schermlezer niets mee kan, dus staat het
 * kortje er nu zichtbaar in met een volledig label eronder.
 */
const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  const knop = (code: Language, kort: string, naam: string) => (
    <button
      type="button"
      className={code === language ? 'active' : ''}
      data-lang={code}
      aria-label={naam}
      aria-pressed={code === language}
      onClick={() => setLanguage(code)}
    >
      {kort}
    </button>
  );

  return (
    <div className="language-switcher-container">
      <div className="language-switcher" role="group" aria-label={t.languageSwitcher.label}>
        {knop('en', 'EN', t.languageSwitcher.en)}
        {knop('nl', 'NL', t.languageSwitcher.nl)}
      </div>
    </div>
  );
};

export default LanguageSwitcher;
