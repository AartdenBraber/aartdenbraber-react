import React, { useEffect, useState } from 'react';
import './PinchHint.scss';
import { useLanguage } from '../../i18n/LanguageContext';

/**
 * Eén keer, zodra het cv in beeld komt: dat het te vergroten is.
 *
 * Op een telefoon staat het cv op ongeveer veertig procent van zijn eigen maat,
 * en nergens stond dat je er met twee vingers in kon. Dit is dus een
 * vindbaarheidsprobleem en geen bediening: er zit geen knop aan, hij vangt geen
 * tikken af, en hij gaat vanzelf weer weg.
 *
 * Alleen waar knijpen bestaat. Met een muis zegt hij niets en dan blijft hij weg.
 */
const PinchHint: React.FC = () => {
    const { t } = useLanguage();
    const [zichtbaar, setZichtbaar] = useState(false);

    useEffect(() => {
        if (typeof window.matchMedia !== 'function') return;
        if (!window.matchMedia('(pointer: coarse)').matches) return;
        if (typeof IntersectionObserver === 'undefined') return;

        const cv = document.querySelector('#portfolio');
        if (!cv) return;

        const waarnemer = new IntersectionObserver(
            ([item]) => {
                if (!item.isIntersecting) return;
                setZichtbaar(true);
                // Eén keer is genoeg; hij hoeft niet terug te komen bij elke
                // passage langs het cv.
                waarnemer.disconnect();
            },
            // Geen drempel op een deel van het blok: het cv is bijna
            // twintigduizend pixels hoog, dus daar past nooit vijf procent van
            // in een telefoonscherm en dan vuurt de waarnemer alleen zolang de
            // pagina's nog niet getekend zijn. Deze marge kijkt naar een strook
            // midden in beeld: de aanwijzing komt zodra het cv daar staat.
            { threshold: 0, rootMargin: '-45% 0px -45% 0px' },
        );
        waarnemer.observe(cv);

        return () => waarnemer.disconnect();
    }, []);

    // Weg bij de eerste aanraking, bij het zoomen zelf, en anders na een paar
    // seconden. Wie hem niet nodig heeft, houdt er niets aan over.
    useEffect(() => {
        if (!zichtbaar) return;

        const weg = () => setZichtbaar(false);
        const teller = setTimeout(weg, 6000);

        window.addEventListener('touchstart', weg, { passive: true });
        window.visualViewport?.addEventListener('resize', weg);

        return () => {
            clearTimeout(teller);
            window.removeEventListener('touchstart', weg);
            window.visualViewport?.removeEventListener('resize', weg);
        };
    }, [zichtbaar]);

    if (!zichtbaar) return null;

    return (
        /* Aria-hidden: dit gaat over een handgebaar om een tekening groter te
           maken. Wie de pagina laat voorlezen krijgt de tekst van het cv al
           rechtstreeks, en een blokje dat na zes seconden verdwijnt hoort niet
           in de leesvolgorde thuis. */
        <div className="pinch-hint" aria-hidden="true">
            <span className="pinch-hint__pil">
                <svg className="pinch-hint__icoon" viewBox="0 0 24 24" focusable="false">
                    {/* Twee pijlen uit elkaar: groter maken. */}
                    <path d="M10 4H4v6M4 4l6 6M14 20h6v-6M20 20l-6-6" />
                </svg>
                {t.cv.zoomHint}
            </span>
        </div>
    );
};

export default PinchHint;
