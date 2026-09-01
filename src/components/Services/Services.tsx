import React from 'react';
import './Services.scss';
import { useLanguage } from '../../i18n/LanguageContext';

const Services: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="section section--sunken" id="wat-ik-doe" aria-labelledby="wat-ik-doe-titel">
      <div className="container">
        <div className="section-header" data-reveal-item="">
          <h2 id="wat-ik-doe-titel">{t.services.heading}</h2>
          <p>{t.services.intro}</p>
        </div>

        <dl className="services">
          {t.services.items.map((item, index) => (
            <div
              className="services__row"
              key={item.title}
              data-reveal-item=""
              // De trap loopt niet door tot achteren: bij een lange lijst zou
              // de laatste rij anders merkbaar achterblijven.
              style={{ '--reveal-step': Math.min(index, 4) } as React.CSSProperties}
            >
              <dt className="services__term">{item.title}</dt>
              <dd className="services__body">
                {item.body}
                {item.link && (
                  <a
                    className="content-link"
                    href={item.link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item.link.label}
                  </a>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
};

export default Services;
