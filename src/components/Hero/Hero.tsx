import React, { useEffect, useState } from 'react';
import './Hero.scss';
import logo from '../../assets/images/logo.png'


export interface HeroProps {
    anything?: string;
}

const Hero: React.FC<HeroProps> = () => {
    const [greeting, setGreeting] = useState(getGreeting());

    useEffect(() => {
        const updateGreeting = () => setGreeting(getGreeting());

        // Bepaal hoe lang tot de volgende volle minuut
        const now = new Date();
        const msToNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

        // Eerst een timeout tot de volgende volle minuut
        const timeout = setTimeout(() => {
            updateGreeting();

            // Daarna elke minuut opnieuw updaten
            const interval = setInterval(updateGreeting, 60000);

            return () => clearInterval(interval);
        }, msToNextMinute);

        return () => clearTimeout(timeout);
    }, []);

    return (
        <section className="top-hero js-top-hero clearfix">
            <div className="background-image background-cover"></div>

            <div className="circle">
                <div className="inside blur-big background-cover"></div>
                <div className="inside blur-small background-cover"></div>
                <div className="inside clear background-cover"></div>
            </div>

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
                    <a href="#main" className="scroll-to-next-section">
                        <span className="scroll-icon"></span>
                    </a>
                </footer>
            </div>


        </section>
    );
};

const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) {
        return 'Good morning';
    } else if (hour < 18) {
        return 'Good afternoon';
    } else {
        return 'Good evening';
    }
};

export default Hero;