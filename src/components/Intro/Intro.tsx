import React, { useRef } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useParallax } from '../../utils/useParallax';

const Intro: React.FC = () => {
    const { t } = useLanguage();

    const sectieRef = useRef<HTMLElement>(null);
    const achtergrondRef = useRef<HTMLDivElement>(null);

    useParallax(sectieRef, achtergrondRef);

    return (
        <section ref={sectieRef} className="page-content homepage-intro parallax clearfix">
            <div ref={achtergrondRef} className="parallax-bg background-cover"></div>

            <div className="entry-content content parallax-content">
                <div className="entry-content-page">
                    <header>
                        <h2 className="page-title">{t.intro.pageTitle}</h2>
                    </header>

                    {t.intro.body}
                </div>
            </div>
        </section>
    );
};

export default Intro;
