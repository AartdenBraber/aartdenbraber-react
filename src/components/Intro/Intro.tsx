import React, { useRef } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useParallax } from '../../utils/useParallax';
import { useRevealOnView } from '../../hooks/useRevealOnView';

/**
 * De kop en de alinea's komen na elkaar omhoog binnen zodra ze in beeld
 * scrollen. Ze worden hier op de opmaak aangewezen en niet met een attribuut
 * gemarkeerd, omdat de alinea's uit de taalbestanden komen.
 */
const TE_ONTHULLEN = '.entry-content-page > header, .entry-content-page > p';

const Intro: React.FC = () => {
    const { t } = useLanguage();

    const sectieRef = useRef<HTMLElement>(null);
    const achtergrondRef = useRef<HTMLDivElement>(null);

    useParallax(sectieRef, achtergrondRef);
    useRevealOnView(sectieRef, TE_ONTHULLEN);

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
