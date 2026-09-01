import React, { useMemo } from 'react';
import './Testimonials.scss';
import { sortTestimonials } from '../../content';
import { useLanguage } from '../../i18n/LanguageContext';

const Testimonials: React.FC = () => {
  const { language, t } = useLanguage();

  const items = useMemo(() => sortTestimonials(language), [language]);

  const formatDate = useMemo(
    () => new Intl.DateTimeFormat(language, { year: 'numeric', month: 'long' }),
    [language],
  );

  return (
    <section
      className="section section--sunken"
      id="aanbevelingen"
      aria-labelledby="aanbevelingen-titel"
    >
      <div className="container">
        <div className="section-header" data-reveal-item="">
          <h2 id="aanbevelingen-titel">{t.testimonials.heading}</h2>
          <p>{t.testimonials.intro}</p>
        </div>

        <div className="testimonials">
          {items.map((item, index) => (
            <figure
              className="testimonial"
              key={item.id}
              data-reveal-item=""
              style={{ '--reveal-step': Math.min(index, 4) } as React.CSSProperties}
            >
              <blockquote lang={item.language}>
                {item.quote.split('\n\n').map((paragraph) => (
                  <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                ))}
              </blockquote>

              <figcaption>
                <span className="testimonial__name">{item.name}</span>
                <span className="testimonial__meta">
                  {item.role}
                  <time dateTime={item.date}>{formatDate.format(new Date(item.date))}</time>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

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
