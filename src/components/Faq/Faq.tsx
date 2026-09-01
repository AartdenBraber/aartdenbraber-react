import React from 'react';
import './Faq.scss';
import { useLanguage } from '../../i18n/LanguageContext';

const Faq: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="section faq" id="vragen" aria-labelledby="vragen-titel">
      <div className="container">
        <div className="section-header">
          <h2 id="vragen-titel">{t.faq.heading}</h2>
          <p>{t.faq.intro}</p>
        </div>

        <div className="faq__list">
          {t.faq.items.map((item) => (
            <details className="faq__item" key={item.id}>
              <summary className="faq__question">
                <span>{item.question}</span>
                <svg
                  className="faq__chevron"
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </summary>

              <div className="faq__answer">
                {item.answer.split('\n\n').map((paragraph) => (
                  <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                ))}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Faq;
