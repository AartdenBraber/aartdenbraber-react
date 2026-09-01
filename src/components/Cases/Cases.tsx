import React from 'react';
import './Cases.scss';
import { useLanguage } from '../../i18n/LanguageContext';

const paragraphs = (text: string) =>
  text.split('\n\n').map((paragraph) => <p key={paragraph.slice(0, 40)}>{paragraph}</p>);

const Cases: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="section cases" id="cases" aria-labelledby="cases-titel">
      <div className="container">
        <div className="section-header" data-reveal-item="">
          <h2 id="cases-titel">{t.cases.heading}</h2>
          <p>{t.cases.intro}</p>
        </div>

        <div className="cases__list">
          {t.cases.items.map((item) => (
            <article className="case" id={`case-${item.id}`} key={item.id}>
              {/* Een case is hoog, dus de drie blokken komen los binnen: wat je
                  nog niet ziet hoeft ook nog niet bewogen te hebben. */}
              <header className="case__head" data-reveal-item="">
                <p className="case__meta">
                  <span>{item.client}</span>
                  <span className="tabular">{item.period}</span>
                </p>
                <h3 className="case__title">{item.title}</h3>
              </header>

              <div className="case__body" data-reveal-item="">
                <div className="case__block">
                  <h4>{t.cases.situationLabel}</h4>
                  {paragraphs(item.situation)}
                </div>

                <div className="case__block">
                  <h4>{t.cases.actionsLabel}</h4>
                  <ul className="case__actions">
                    {item.actions.map((action) => (
                      <li key={action}>{action}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="case__result" data-reveal-item="">
                <h4>{t.cases.resultLabel}</h4>
                {paragraphs(item.result)}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Cases;
