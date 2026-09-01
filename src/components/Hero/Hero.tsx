import React, { useEffect, useState } from 'react';
import './Hero.scss';
import logo from '../../assets/images/logo.png';
import FocusSpotlight from '../FocusSpotlight/FocusSpotlight';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import { cvUrl } from '../../content';
import { useLanguage } from '../../i18n/LanguageContext';

type TimeOfDay = 'morning' | 'afternoon' | 'evening';

const getTimeOfDay = (): TimeOfDay => {
  const hour = new Date().getHours();

  if (hour <= 11) return 'morning';
  if (hour <= 17) return 'afternoon';
  return 'evening';
};

const backgroundImage =
  process.env.NODE_ENV === 'production'
    ? `${process.env.PUBLIC_URL}/images/top-bg.jpg`
    : `${process.env.PUBLIC_URL}/images/top-bg-DEV.jpg`;

const Hero: React.FC = () => {
  const { language, t } = useLanguage();
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(getTimeOfDay);

  // De begroeting kan op het hele uur wisselen. Eerst uitlijnen op de volgende
  // hele minuut, daarna elke minuut opnieuw kijken.
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const now = new Date();
    const msToNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

    const timeout = setTimeout(() => {
      setTimeOfDay(getTimeOfDay());
      interval = setInterval(() => setTimeOfDay(getTimeOfDay()), 60_000);
    }, msToNextMinute);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  const scrollToNextSection = () => {
    document.getElementById('over-mij')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="hero">
      <FocusSpotlight image={backgroundImage} />
      <div className="hero__scrim" aria-hidden="true" />

      <div className="hero__inner">
        <header className="hero__bar">
          <div className="hero__identity">
            <img className="hero__logo" src={logo} alt="" width={44} height={44} />
            <div>
              <p className="hero__name">{t.hero.name}</p>
              <p className="hero__role">{t.hero.role}</p>
            </div>
          </div>

          <div className="hero__bar-end">
            <p className="hero__greeting">{t.hero.greetings[timeOfDay]}</p>
            <LanguageSwitcher />
          </div>
        </header>

        <div className="hero__content">
          <h1 className="hero__title">{t.hero.title}</h1>

          <p className="hero__subtitle">{t.hero.subtitle}</p>

          <div className="hero__actions">
            <a className="button button--primary" href={t.hero.primaryCta.href}>
              {t.hero.primaryCta.label}
            </a>
            <a
              className="button button--ghost-light"
              href={cvUrl(language)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.hero.secondaryCta.label}
            </a>
          </div>
        </div>

        <button type="button" className="hero__scroll" onClick={scrollToNextSection}>
          <span className="visually-hidden">{t.hero.scrollLabel}</span>
          <svg
            className="hero__scroll-icon"
            viewBox="0 0 24 24"
            width="26"
            height="26"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 4v15" />
            <path d="M5.5 12.5 12 19l6.5-6.5" />
          </svg>
        </button>
      </div>
    </section>
  );
};

export default Hero;
