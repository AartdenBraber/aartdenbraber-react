import React from 'react';
import './About.scss';
import { useLanguage } from '../../i18n/LanguageContext';

const About: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="section about" id="over-mij" aria-labelledby="over-mij-titel">
      <div className="container about__grid">
        <div className="about__prose">
          <h2 id="over-mij-titel">{t.about.heading}</h2>
          {t.about.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </div>

        <dl className="about__facts">
          {t.about.facts.map((fact) => (
            <div className="about__fact" key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
};

export default About;
