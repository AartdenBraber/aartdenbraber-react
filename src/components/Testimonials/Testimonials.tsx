import React from 'react';
import './Testimonials.scss';
import { useLanguage } from '../../i18n/LanguageContext';

const Testimonials: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="section section--sunken" id="aanbevelingen" aria-labelledby="aanbevelingen-titel">
      <div className="container">
        <div className="section-header">
          <h2 id="aanbevelingen-titel">{t.testimonials.heading}</h2>
          <p>{t.testimonials.intro}</p>
        </div>

        <ul className="testimonials__grid">
          {t.testimonials.items.map((item) => (
            <li key={item.name}>
              <figure className="testimonial">
                <blockquote>
                  <p>{item.quote}</p>
                </blockquote>
                <figcaption>
                  <span className="testimonial__name">{item.name}</span>
                  <span className="testimonial__role">{item.role}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>

        <p className="testimonials__more">
          <a href={t.testimonials.moreHref} target="_blank" rel="noopener noreferrer">
            {t.testimonials.moreLabel}
          </a>
        </p>
      </div>
    </section>
  );
};

export default Testimonials;
