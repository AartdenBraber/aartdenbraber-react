import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './PinchHint.scss';
import { useLanguage } from '../../i18n/LanguageContext';
import { Band, leegsteBand } from '../../utils/leegsteBand';

/**
 * Een aanwijzing op het papier van het cv zelf: dat het te vergroten is, en hoe.
 *
 * Op een telefoon staat het cv op ongeveer de helft van zijn drukformaat, en
 * nergens stond dat je er met twee vingers in kon. Dit is dus een
 * vindbaarheidsprobleem en geen bediening: er zit geen knop aan en hij vangt
 * geen tikken af.
 *
 * Hij stond eerst vast in beeld onder de balk bovenin en ging na zes seconden
 * weg. Gemeten lag hij daardoor overal behalve op het cv: over de intro, na
 * "Bekijk mijn cv" over de titel naast de foto, en wie snel terug naar boven
 * ging, zag hem los boven de hero hangen. De veeg waarmee je begint te lezen
 * startte bovendien de aftelling, zodat hij in de praktijk 3,5 seconde bestond.
 *
 * Nu ligt hij in de lege strook van de eerste pagina en schuift hij mee met het
 * papier. Hij gaat weg als je echt inzoomt, of als je hem gezien hebt en de
 * eerste pagina uit beeld is.
 *
 * Alleen op een aanraakscherm. Met een muis zegt hij niets en dan blijft hij weg.
 */

/**
 * Zoveel ruimte vraagt de aanwijzing in de lege strook, in CSS-pixels: het
 * gebaar, de regel eronder en lucht aan beide kanten. Is de strook lager, dan
 * komt hij er niet: liever geen aanwijzing dan een over de tekst van het cv.
 */
const NODIGE_HOOGTE = 124;

/**
 * Vanaf deze zoom heeft iemand het gebaar gevonden. De werkbalk van de browser
 * die in- of uitklapt verandert de hoogte van het beeld, maar niet de zoom.
 */
const ECHT_INGEZOOMD = 1.05;

/** Zo lang moet hij helemaal in beeld staan voordat hij als gezien telt. */
const GEZIEN_NA_MS = 1500;

/** Gelijk aan de overgang in PinchHint.scss. */
const UITVAGEN_MS = 300;

/** aan -> verdwijnt -> weg, of meteen weg zodra de eerste pagina uit beeld is. */
type Fase = 'aan' | 'verdwijnt' | 'weg';

const aanraakscherm = () =>
    typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;

const PinchHint: React.FC = () => {
    const { t } = useLanguage();
    const [fase, setFase] = useState<Fase>('aan');
    const [pagina, setPagina] = useState<HTMLElement | null>(null);
    const [band, setBand] = useState<Band | null>(null);
    const [paginaHoogte, setPaginaHoogte] = useState(0);
    const [hint, setHint] = useState<HTMLDivElement | null>(null);
    const [heelInBeeld, setHeelInBeeld] = useState(false);
    const gezien = useRef(false);

    const actief = fase !== 'weg';

    // De eerste pagina van het cv dat nu staat. Bij een taalwissel ligt het cv
    // van de vorige taal er nog even bovenop terwijl het wegvaagt; de
    // aanwijzing verhuist dan meteen naar het nieuwe.
    useEffect(() => {
        if (!actief || !aanraakscherm()) return;

        // Wie al ingezoomd binnenkomt, weet het al.
        if ((window.visualViewport?.scale ?? 1) > ECHT_INGEZOOMD) {
            setFase('weg');
            return;
        }

        const cv = document.querySelector('#portfolio');
        if (!cv) return;

        const zoek = () =>
            setPagina(
                cv.querySelector<HTMLElement>('.pdf-stand:not(.pdf-stand--verdwijnt) > .pdf-page'),
            );
        zoek();

        if (typeof MutationObserver === 'undefined') return;
        const opbouw = new MutationObserver(zoek);
        opbouw.observe(cv, { childList: true, subtree: true });
        return () => opbouw.disconnect();
    }, [actief]);

    // Waar op die pagina niets staat. Het canvas is op dit moment al af: een
    // pagina komt pas in de stand als hij helemaal getekend is.
    useEffect(() => {
        const canvas = pagina?.querySelector('canvas');
        const context = canvas?.getContext('2d');
        if (!canvas || !context) {
            setBand(null);
            return;
        }
        try {
            const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
            // Alleen het middenstuk, waar de aanwijzing komt. Langs de
            // linkerrand van het cv loopt een donkere balk over de hele hoogte,
            // en met die balk erbij is geen enkele rij leeg.
            setBand(leegsteBand(data, canvas.width, canvas.height, 0.15, 0.85));
        } catch {
            // Niet uit te lezen, dan weten we niet waar het leeg is.
            setBand(null);
        }
    }, [pagina]);

    // De hoogte van de pagina verandert met het draaien van de telefoon, en
    // daarmee of de aanwijzing in de strook past.
    useEffect(() => {
        if (!pagina) return;
        const meet = () => setPaginaHoogte(pagina.clientHeight);
        meet();
        if (typeof ResizeObserver === 'undefined') return;
        const meter = new ResizeObserver(meet);
        meter.observe(pagina);
        return () => meter.disconnect();
    }, [pagina]);

    // Het gebaar speelt zodra de aanwijzing helemaal in beeld komt, en opnieuw
    // bij elke keer dat hij terugkomt. Heeft hij lang genoeg gestaan, dan gaat
    // hij weg zodra de eerste pagina uit beeld is.
    useEffect(() => {
        if (!hint || !pagina || fase !== 'aan' || typeof IntersectionObserver === 'undefined') {
            return;
        }

        let teller: ReturnType<typeof setTimeout> | undefined;

        const opHint = new IntersectionObserver(
            (meldingen) => {
                // De laatste melding en niet de eerste; zie StickyBar.
                const heel = meldingen[meldingen.length - 1].intersectionRatio >= 0.99;
                setHeelInBeeld(heel);
                clearTimeout(teller);
                if (heel) {
                    teller = setTimeout(() => {
                        gezien.current = true;
                    }, GEZIEN_NA_MS);
                }
            },
            { threshold: 0.99 },
        );

        const opPagina = new IntersectionObserver((meldingen) => {
            if (gezien.current && !meldingen[meldingen.length - 1].isIntersecting) setFase('weg');
        });

        opHint.observe(hint);
        opPagina.observe(pagina);
        return () => {
            clearTimeout(teller);
            opHint.disconnect();
            opPagina.disconnect();
        };
    }, [hint, pagina, fase]);

    useEffect(() => {
        const beeld = window.visualViewport;
        if (fase !== 'aan' || !pagina || !beeld) return;
        const bijZoom = () => {
            if (beeld.scale > ECHT_INGEZOOMD) setFase('verdwijnt');
        };
        beeld.addEventListener('resize', bijZoom);
        return () => beeld.removeEventListener('resize', bijZoom);
    }, [fase, pagina]);

    // Het opruimen hangt aan een teller en niet aan het einde van de overgang,
    // zodat het ook gebeurt als die overgang om wat voor reden niet loopt.
    useEffect(() => {
        if (fase !== 'verdwijnt') return;
        const teller = setTimeout(() => setFase('weg'), UITVAGEN_MS);
        return () => clearTimeout(teller);
    }, [fase]);

    if (!actief || !pagina || !band) return null;
    if ((band.tot - band.van) * paginaHoogte < NODIGE_HOOGTE) return null;

    const klassen = [
        'pinch-hint',
        heelInBeeld && fase === 'aan' ? 'pinch-hint--speelt' : '',
        fase === 'verdwijnt' ? 'pinch-hint--verdwijnt' : '',
    ]
        .filter(Boolean)
        .join(' ');

    return createPortal(
        /* Aria-hidden: dit gaat over een handgebaar om een tekening groter te
           maken. Wie de pagina laat voorlezen krijgt de tekst van het cv al
           rechtstreeks uit de tekstlaag. */
        <div
            ref={setHint}
            className={klassen}
            style={{ top: `${((band.van + band.tot) / 2) * 100}%` }}
            aria-hidden="true"
        >
            <svg
                className="pinch-hint__gebaar"
                viewBox="0 0 96 64"
                width="96"
                height="64"
                focusable="false"
            >
                {/* Twee vingertoppen die schuin uit elkaar gaan, over een
                    stippellijn die de weg laat zien, met aan elk eind een pijl. */}
                <path className="pinch-hint__spoor" d="M28 45 68 19" />
                <path className="pinch-hint__pijl" d="M78 17.9 80.6 10.8 73.1 10.3M23 53.7 15.4 53.2 17.9 46.1" />
                <circle className="pinch-hint__vinger pinch-hint__vinger--a" cx="68" cy="19" r="6.5" />
                <circle className="pinch-hint__vinger pinch-hint__vinger--b" cx="28" cy="45" r="6.5" />
            </svg>
            <span className="pinch-hint__tekst">{t.cv.zoomHint}</span>
        </div>,
        pagina,
    );
};

export default PinchHint;
