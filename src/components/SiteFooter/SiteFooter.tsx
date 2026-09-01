import React from 'react';
import './SiteFooter.scss';
import { useLanguage } from '../../i18n/LanguageContext';

const SiteFooter: React.FC = () => {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  // Het adres wordt pas op het moment van klikken samengesteld, zodat het niet
  // in de HTML of in een mailto-link staat waar bots het uit oogsten.
  const openMailClient = () => {
    const { emailUser, emailDomain } = t.contact;
    window.location.href = `mailto:${emailUser}@${emailDomain}`;
  };

  return (
    <footer className="site-footer" id="contact">
      <div className="container site-footer__inner">
        <div className="site-footer__intro">
          <h2>{t.contact.heading}</h2>
          <p>{t.contact.body}</p>
        </div>

        <div className="site-footer__links">
          <button type="button" className="button button--ghost-light" onClick={openMailClient}>
            {t.contact.emailLabel}
          </button>
          <a
            className="button button--ghost-light"
            href={t.contact.linkedIn}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.contact.linkedInLabel}
          </a>
        </div>
      </div>

      <p className="site-footer__legal">
        &copy; {year} {t.hero.name}
      </p>
    </footer>
  );
};

export default SiteFooter;
