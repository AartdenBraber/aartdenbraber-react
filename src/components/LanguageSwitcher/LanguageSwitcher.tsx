import React from 'react';
import './LanguageSwitcher.scss';
import { useLanguage } from '../../i18n/LanguageContext';
import { Language } from '../../content';

/**
 * De knoppen zijn met opzet leeg: de opmaak zet het label erin met
 * `content: attr(data-lang)`, zodat er op een smal scherm EN en NL staat en
 * vanaf 616px de volle namen. Zie LanguageSwitcher.scss.
 *
 * Gegenereerde inhoud krijgt een schermlezer niet betrouwbaar te pakken, dus
 * de naam staat daarnaast in aria-label. Die namen staan in hun eigen taal en
 * vertalen niet mee: wie de site in het Engels leest en naar het Nederlands
 * wil, zoekt het woord "Nederlands" en niet "Dutch".
 */
const TALEN: { code: Language; naam: string }[] = [
  { code: 'en', naam: 'English' },
  { code: 'nl', naam: 'Nederlands' },
];

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="language-switcher-container">
      <div className="language-switcher" role="group" aria-label={t.languageSwitcher.label}>
        {TALEN.map(({ code, naam }) => (
          <button
            key={code}
            type="button"
            lang={code}
            className={code === language ? 'active' : ''}
            data-lang={code}
            aria-label={naam}
            aria-pressed={code === language}
            onClick={() => setLanguage(code)}
          />
        ))}
      </div>
    </div>
  );
};

export default LanguageSwitcher;
