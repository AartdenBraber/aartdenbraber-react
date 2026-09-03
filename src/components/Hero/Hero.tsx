import React, { useEffect, useState } from 'react';
import './Hero.scss';
import logo from '../../assets/images/logo.png';
import FocusSpotlight from '../FocusSpotlight/FocusSpotlight';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import { useLanguage } from '../../i18n/LanguageContext';
import { SiteContent } from '../../content';

const topBg = '/images/top-bg.jpg';

const getGreeting = (greetings: SiteContent['hero']['greetings']) => {
    const hour = new Date().getHours();
    if (hour <= 11) return greetings.morning;
    if (hour <= 17) return greetings.afternoon;
    return greetings.evening;
};

const Hero: React.FC = () => {
    const { t } = useLanguage();
    const [hour, setHour] = useState(() => new Date().getHours());

    // De groet verandert met de klok mee. We houden het uur bij in plaats van
    // de tekst, zodat een taalwissel meteen de juiste groet oplevert zonder
    // dat we op de volgende minuut hoeven te wachten.
    useEffect(() => {
        const updateHour = () => setHour(new Date().getHours());

        const now = new Date();
        const msToNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

        let interval: ReturnType<typeof setInterval> | undefined;

        const timeout = setTimeout(() => {
            updateHour();
            interval = setInterval(updateHour, 60000);
        }, msToNextMinute);

        return () => {
            clearTimeout(timeout);
            if (interval) clearInterval(interval);
        };
    }, []);

    const greeting = getGreeting(t.hero.greetings);

    return (
        <section className="top-hero js-top-hero clearfix" data-hour={hour}>
            <FocusSpotlight image={topBg} />

            <div className="hero-content">
                <header className="site-header">
                    <a className="site-branding">
                        <div className="logo-container">
                            <img className="logo" src={logo} alt="Logo" />
                        </div>
                        <div className="site-title-container">
                            <h1 className="site-title">Aart den Braber</h1>
                            <p className="site-description">{t.header.siteDescription}</p>
                        </div>
                        <LanguageSwitcher />
                    </a>
                </header>

                <main className="hero-title-container">
                    <div className="hero-title-wrapper">
                        <div className="hero-title-inside">
                            <p id="hero-greeting" className="hero-greeting">{greeting}!</p>
                            <h1 className="hero-title">{t.hero.title}</h1>
                        </div>
                    </div>
                </main>

                <footer className="scroll-to-next-section-container">
                    <a
                        tabIndex={0}
                        role="button"
                        aria-label={t.hero.scrollLabel}
                        onClick={() => {
                            window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
                        }}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
                            }
                        }}
                        className="scroll-to-next-section">
                        <span className="scroll-icon"></span>
                    </a>
                </footer>
            </div>
        </section>
    );
};

export default Hero;
