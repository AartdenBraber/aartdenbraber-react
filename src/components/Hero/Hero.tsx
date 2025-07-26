import React, { useEffect, useState } from 'react';
import './Hero.scss';
import logo from '../../assets/images/logo.png';
import FocusSpotlight from '../FocusSpotlight/FocusSpotlight'; // pas pad aan indien nodig
import topBg from '../../assets/images/top-bg.jpg';

const Hero: React.FC = () => {
    const [greeting, setGreeting] = useState(getGreeting());

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
                    <a className="site-branding" href="https://aartdenbraber.nl/" rel="home">
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
                                My focus is on crafting unique ideas with elegance
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
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
};

export default Hero;
