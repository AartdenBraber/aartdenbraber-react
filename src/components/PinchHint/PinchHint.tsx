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
/** weg -> aan -> verdwijnt -> weg. De middelste stap is het uitvagen. */
type Fase = 'weg' | 'aan' | 'verdwijnt';

const PinchHint: React.FC = () => {
    const { t } = useLanguage();
    const [fase, setFase] = useState<Fase>('weg');

    useEffect(() => {
        if (typeof window.matchMedia !== 'function') return;
        if (!window.matchMedia('(pointer: coarse)').matches) return;
        if (typeof IntersectionObserver === 'undefined') return;

        const cv = document.querySelector('#portfolio');
        if (!cv) return;

        let waarnemer: IntersectionObserver | null = null;
        let opbouw: MutationObserver | null = null;

        const kijkOfHetInBeeldStaat = () => {
            waarnemer = new IntersectionObserver(
                (meldingen) => {
                    // De laatste melding en niet de eerste; zie StickyBar.
                    if (!meldingen[meldingen.length - 1].isIntersecting) return;
                    setFase('aan');
                    // Eén keer is genoeg; hij hoeft niet terug te komen bij elke
                    // passage langs het cv.
                    waarnemer?.disconnect();
                },
                // Geen drempel op een deel van het blok: het cv is bijna
                // twintigduizend pixels hoog, dus daar past nooit vijf procent
                // van in een telefoonscherm. Deze marge kijkt naar een strook
                // midden in beeld: de aanwijzing komt zodra het cv daar staat.
                { threshold: 0, rootMargin: '-45% 0px -45% 0px' },
            );
            waarnemer.observe(cv);
        };

        // Er moet eerst iets te vergroten zijn. Sinds het cv-blok een
        // minimumhoogte van een scherm heeft, staat het er namelijk al voordat
        // de pagina's getekend zijn: zonder deze wachtstap ging de aanwijzing
        // af boven een lege donkere vlakte en was hij weer verdwenen tegen de
        // tijd dat er een cv stond.
        const heeftPaginas = () => cv.querySelector('.pdf-page') !== null;

        if (heeftPaginas() || typeof MutationObserver === 'undefined') {
            kijkOfHetInBeeldStaat();
        } else {
            opbouw = new MutationObserver(() => {
                if (!heeftPaginas()) return;
                opbouw?.disconnect();
                kijkOfHetInBeeldStaat();
            });
            opbouw.observe(cv, { childList: true, subtree: true });
        }

        return () => {
            waarnemer?.disconnect();
            opbouw?.disconnect();
        };
    }, []);

    useEffect(() => {
        if (fase !== 'aan') return;

        // Zonder aanraken gaat hij vanzelf na zes seconden.
        const vanzelf = setTimeout(() => setFase('verdwijnt'), 6000);
        let naspel: ReturnType<typeof setTimeout>;

        // Wie het cv aanraakt of gaat zoomen heeft hem gezien. Hij gaat dan
        // weg, maar niet op slag: onder je vinger vandaan schieten leest als
        // iets kapotmaken, en je kunt hem dan ook niet meer uitlezen.
        const gezien = () => {
            clearTimeout(vanzelf);
            naspel = setTimeout(() => setFase('verdwijnt'), 3000);
        };

        window.addEventListener('touchstart', gezien, { passive: true, once: true });
        window.visualViewport?.addEventListener('resize', gezien, { once: true });

        return () => {
            clearTimeout(vanzelf);
            clearTimeout(naspel);
            window.removeEventListener('touchstart', gezien);
            window.visualViewport?.removeEventListener('resize', gezien);
        };
    }, [fase]);

    // Het opruimen hangt aan een teller en niet aan het einde van de animatie:
    // met beweging uit loopt die animatie niet en bleef hij anders staan.
    useEffect(() => {
        if (fase !== 'verdwijnt') return;
        const teller = setTimeout(() => setFase('weg'), 450);
        return () => clearTimeout(teller);
    }, [fase]);

    if (fase === 'weg') return null;

    return (
        /* Aria-hidden: dit gaat over een handgebaar om een tekening groter te
           maken. Wie de pagina laat voorlezen krijgt de tekst van het cv al
           rechtstreeks, en een blokje dat na zes seconden verdwijnt hoort niet
           in de leesvolgorde thuis. */
        <div
            className={`pinch-hint${fase === 'verdwijnt' ? ' pinch-hint--verdwijnt' : ''}`}
            aria-hidden="true"
        >
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
