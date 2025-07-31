import React, { useEffect, useState } from 'react';
import './Hero.scss';
import logo from '../../assets/images/logo.png';
import FocusSpotlight from '../FocusSpotlight/FocusSpotlight'; // pas pad aan indien nodig

const Hero: React.FC = () => {
    const [greeting, setGreeting] = useState(getGreeting());

    const topBg = process.env.NODE_ENV === 'production'
        ? '/images/top-bg.jpg'
        : '/images/top-bg-DEV.jpg';

    useEffect(() => {
        const updateGreeting = () => setGreeting(getGreeting());

        const now = new Date();
        const msToNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

        const timeout = setTimeout(() => {
            updateGreeting();
            const interval = setInterval(updateGreeting, 60000);
            return () => clearInterval(interval);
        }, msToNextMinute);

        return () => clearTimeout(timeout);
    }, []);

    return (
        <section className="top-hero js-top-hero clearfix">
            <FocusSpotlight image={topBg} />

            <div className="hero-content">
                <header className="site-header">
                    <a className="site-branding">
                        <div className="logo-container">
                            <img className="logo" src={logo} alt="Logo" />
                        </div>
                        <div className="site-title-container">
                            <h1 className="site-title">Aart den Braber</h1>
                            <p className="site-description">Frontend - backend - test - UX</p>
                        </div>
                    </a>
                </header>

                <main className="hero-title-container">
                    <div className="hero-title-wrapper">
                        <div className="hero-title-inside">
                            <p id="hero-greeting" className="hero-greeting">{greeting}!</p>
                            <h1 className="hero-title">
                                I focus on crafting sustainable applications — technically strong, user-friendly, and future-proof.
                            </h1>
                        </div>
                    </div>
                </main>

                <footer className="scroll-to-next-section-container">
                    <a
                        onClick={() => {
                            window.scrollBy({
                                top: window.innerHeight,
                                behavior: 'smooth',
                            });
                        }}
                        className="scroll-to-next-section">
                        <span className="scroll-icon"></span>
                    </a>
                </footer>
            </div>
        </section>
    );
};

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour <= 11) return 'Good morning';
    if (hour <= 17) return 'Good afternoon';
    return 'Good evening';
};

export default Hero;
