import React, { useRef } from 'react';
import './Experience.scss';
import { useRevealOnView } from '../../hooks/useRevealOnView';
import { useStackDepth } from '../../hooks/useStackDepth';
import { useLanguage } from '../../i18n/LanguageContext';

/** Haakje dat aangeeft dat een opdracht onder de werkgever erboven hangt. */
const BranchIcon: React.FC = () => (
  <svg
    className="experience-card__branch"
    viewBox="0 0 16 16"
    width="14"
    height="14"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 2v6.5a2 2 0 0 0 2 2h8" />
    <path d="M10.5 8l2.5 2.5-2.5 2.5" />
  </svg>
);

const Experience: React.FC = () => {
  const { t } = useLanguage();
  const { entries, highlightsLabel, stackLabel, currentLabel, viaLabel, caseLinkLabel } =
    t.experience;
  const listRef = useRef<HTMLOListElement>(null);

  useRevealOnView(listRef, '.experience__item');
  useStackDepth(listRef, '.experience__item');

  return (
    <section className="section experience" id="werkervaring" aria-labelledby="werkervaring-titel">
      <div className="container">
        <div className="section-header">
          <h2 id="werkervaring-titel">{t.experience.heading}</h2>
          <p>{t.experience.intro}</p>
        </div>

        <ol className="experience__list" ref={listRef}>
          {entries.map((entry, index) => (
            <li
              key={entry.id}
              className={`experience__item${entry.via ? ' experience__item--nested' : ''}`}
              style={{ '--index': index } as React.CSSProperties}
            >
              {/* Tussenlaag voor het stapel-effect: de li zelf transformeren
                  zou de metingen van useStackDepth laten meebewegen. */}
              <div className="experience__motion">
                <article className="experience-card">
                  <div className="experience-card__head">
                    <div className="experience-card__titles">
                      {entry.via && (
                        <p className="experience-card__via">
                          <BranchIcon />
                          {viaLabel} {entry.via}
                        </p>
                      )}
                      <h3 className="experience-card__company">{entry.company}</h3>
                      <p className="experience-card__role">{entry.role}</p>
                    </div>

                    <div className="experience-card__meta">
                      {entry.current && (
                        <span className="experience-card__badge">
                          <span className="experience-card__pulse" aria-hidden="true" />
                          {currentLabel}
                        </span>
                      )}
                      <span className="experience-card__period tabular">{entry.period}</span>
                      <span className="experience-card__location">{entry.location}</span>
                    </div>
                  </div>

                  <p className="experience-card__summary">{entry.summary}</p>

                  {entry.highlights.length > 0 && (
                    <div className="experience-card__block">
                      <h4>{highlightsLabel}</h4>
                      <ul className="experience-card__highlights">
                        {entry.highlights.map((highlight) => (
                          <li key={highlight}>{highlight}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {entry.caseId && (
                    <p className="experience-card__case">
                      <a href={`#case-${entry.caseId}`}>{caseLinkLabel}</a>
                    </p>
                  )}

                  {entry.stack.length > 0 && (
                    <div className="experience-card__block">
                      <h4>{stackLabel}</h4>
                      <ul className="experience-card__stack">
                        {entry.stack.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </article>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default Experience;
