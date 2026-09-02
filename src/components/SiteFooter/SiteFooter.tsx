import React from 'react';
import './SiteFooter.scss';
import { useLanguage } from '../../i18n/LanguageContext';

const SiteFooter: React.FC = () => {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer" id="contact">
      <div className="container site-footer__inner">
        <div className="site-footer__intro" data-reveal-item="">
          <h2>{t.contact.heading}</h2>
          <p>{t.contact.body}</p>
        </div>

        <div
          className="site-footer__links"
          data-reveal-item=""
          style={{ '--reveal-step': 1 } as React.CSSProperties}
        >
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
