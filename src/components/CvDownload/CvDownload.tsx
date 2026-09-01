import React from 'react';
import './CvDownload.scss';
import { cvUrl } from '../../content';
import { useLanguage } from '../../i18n/LanguageContext';

const CvDownload: React.FC = () => {
  const { language, t } = useLanguage();

  return (
    <section className="section cv" id="cv" aria-labelledby="cv-titel">
      <div className="container cv__panel" data-reveal-item="">
        <div>
          <h2 id="cv-titel">{t.cv.heading}</h2>
          <p>{t.cv.body}</p>
        </div>

        <a
          className="button button--primary"
          href={cvUrl(language)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t.cv.downloadLabel}
        </a>
      </div>
    </section>
  );
};

export default CvDownload;
