import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import './PinchZoom.scss';

interface PinchZoomProps {
    children: React.ReactNode;
    /**
     * Verder inzoomen dan dit levert geen scherpere tekst meer op, want dan
     * rekt het canvas uit boven de maat waarop het getekend is.
     */
    maxZoom?: number;
    className?: string;
}

const afstand = (a: Touch, b: Touch) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);

/**
 * Laat de bezoeker met twee vingers op de inhoud inzoomen, zonder dat de rest
 * van de pagina meegroeit.
 *
 * Het zoomen gebeurt door de inhoud breder te maken, niet met een transform.
 * Daardoor blijft alles gewoon schuiven met de browser zelf: opzij binnen het
 * venster, omlaag met de pagina. Er is dus geen eigen sleepcode nodig en je
 * komt niet vast te zitten in een ingezoomd blok.
 */
const PinchZoom: React.FC<PinchZoomProps> = ({ children, maxZoom = 2.4, className }) => {
    const vensterRef = useRef<HTMLDivElement | null>(null);
    const [zoom, setZoom] = useState(1);

    // Tijdens een knijpbeweging: de stand bij het neerzetten van de vingers.
    const knijpRef = useRef<{ afstand: number; zoom: number } | null>(null);
    const zoomRef = useRef(1);
    zoomRef.current = zoom;

    /** Waar de vingers stonden, zodat dat punt na het zoomen op zijn plek blijft. */
    const ankerRef = useRef<{
        deelX: number;
        deelY: number;
        binnenX: number;
        binnenY: number;
        vensterTop: number;
    } | null>(null);

    /**
     * Zet de nieuwe zoom en onthoudt welk punt van de inhoud onder de vingers
     * lag. Het terugschuiven gebeurt in de layout-stap hieronder, als de
     * nieuwe maten er staan.
     */
    const zoomNaar = useCallback((nieuw: number, midX: number, midY: number) => {
        const venster = vensterRef.current;
        if (!venster) return;

        const rect = venster.getBoundingClientRect();
        const binnenX = midX - rect.left;
        const binnenY = midY - rect.top;

        ankerRef.current = {
            deelX: (venster.scrollLeft + binnenX) / venster.scrollWidth,
            deelY: binnenY / venster.offsetHeight,
            binnenX,
            binnenY,
            vensterTop: rect.top + window.scrollY,
        };

        setZoom(nieuw);
    }, []);

    // Na het opnieuw tekenen kloppen de nieuwe maten pas. Dit loopt voor het
    // schilderen, dus de bezoeker ziet geen sprong.
    useLayoutEffect(() => {
        const venster = vensterRef.current;
        const anker = ankerRef.current;
        if (!venster || !anker) return;
        ankerRef.current = null;

        venster.scrollLeft = anker.deelX * venster.scrollWidth - anker.binnenX;
        window.scrollTo(
            window.scrollX,
            anker.vensterTop + anker.deelY * venster.offsetHeight - anker.binnenY
        );
    }, [zoom]);

    useEffect(() => {
        const venster = vensterRef.current;
        if (!venster) return;

        const begin = (e: TouchEvent) => {
            if (e.touches.length !== 2) return;
            knijpRef.current = {
                afstand: afstand(e.touches[0], e.touches[1]),
                zoom: zoomRef.current,
            };
        };

        const beweeg = (e: TouchEvent) => {
            const knijp = knijpRef.current;
            if (!knijp || e.touches.length !== 2) return;

            // Zonder dit gaat de browser er zelf mee aan de haal.
            e.preventDefault();

            const nu = afstand(e.touches[0], e.touches[1]);
            if (knijp.afstand === 0) return;

            const nieuw = Math.min(maxZoom, Math.max(1, (knijp.zoom * nu) / knijp.afstand));
            if (Math.abs(nieuw - zoomRef.current) < 0.01) return;

            zoomNaar(
                nieuw,
                (e.touches[0].clientX + e.touches[1].clientX) / 2,
                (e.touches[0].clientY + e.touches[1].clientY) / 2
            );
        };

        const eind = (e: TouchEvent) => {
            if (e.touches.length < 2) knijpRef.current = null;
        };

        // passive: false, anders mag preventDefault niet en zoomt de pagina mee.
        venster.addEventListener('touchstart', begin, { passive: false });
        venster.addEventListener('touchmove', beweeg, { passive: false });
        venster.addEventListener('touchend', eind);
        venster.addEventListener('touchcancel', eind);

        return () => {
            venster.removeEventListener('touchstart', begin);
            venster.removeEventListener('touchmove', beweeg);
            venster.removeEventListener('touchend', eind);
            venster.removeEventListener('touchcancel', eind);
        };
    }, [maxZoom, zoomNaar]);

    /** Twee keer tikken schakelt heen en weer, voor wie het knijpen niet vindt. */
    const dubbeltik = (e: React.MouseEvent) => {
        zoomNaar(zoom > 1 ? 1 : Math.min(2, maxZoom), e.clientX, e.clientY);
    };

    return (
        <div
            ref={vensterRef}
            className={['pinch-zoom', className].filter(Boolean).join(' ')}
            onDoubleClick={dubbeltik}
        >
            <div className="pinch-zoom__inhoud" style={{ width: `${zoom * 100}%` }}>
                {children}
            </div>
        </div>
    );
};

export default PinchZoom;
