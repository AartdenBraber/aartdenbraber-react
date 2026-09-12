import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useContactformulier } from './ContactformulierContext';

/** Een link naar dit adres opent het paneel, ook van buiten de site. */
export const PANEEL_HASH = '#contact';

interface ContactPaneelWaarde {
    open: boolean;
    /**
     * De knop waarmee het paneel openging. Daar gaat de focus heen als het weer
     * dichtgaat. Safari geeft een knop bij een klik geen focus, dus
     * document.activeElement is daar de body; daarom geeft de knop zichzelf mee.
     */
    bron: React.MutableRefObject<HTMLElement | null>;
    openPaneel: (bron?: HTMLElement | null) => void;
    sluitPaneel: () => void;
}

const ContactPaneelContext = createContext<ContactPaneelWaarde>({
    open: false,
    bron: { current: null },
    openPaneel: () => undefined,
    sluitPaneel: () => undefined,
});

/**
 * Of het contactpaneel open is.
 *
 * Het formulier stond eerst onder het cv, ruim twintigduizend pixels verderop.
 * Wie halverwege het cv op de envelop in de balk tikte, sprong daarheen en was
 * zijn plek kwijt. Nu schuift het formulier over de pagina heen en blijft alles
 * eronder staan waar het stond.
 *
 * Het paneel gaat alleen open als het formulier ook werkt; zie
 * ContactformulierContext.
 */
export const ContactPaneelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { status } = useContactformulier();
    const [open, setOpen] = useState(false);

    const bron = useRef<HTMLElement | null>(null);

    const openPaneel = useCallback((knop?: HTMLElement | null) => {
        bron.current = knop ?? null;
        setOpen(true);
    }, []);

    const sluitPaneel = useCallback(() => {
        setOpen(false);

        // Wie via /#contact binnenkwam, krijgt het paneel niet opnieuw bij een
        // herlaad nadat hij het zelf dichtdeed. replaceState en geen nieuwe
        // geschiedenisregel: sluiten is geen stap die je terug wilt kunnen doen.
        if (window.location.hash === PANEEL_HASH) {
            const { pathname, search } = window.location;
            window.history.replaceState(window.history.state, '', pathname + search);
        }
    }, []);

    // Pas als het formulier klaarstaat. Anders zou /#contact een paneel openen
    // dat er niet is.
    useEffect(() => {
        if (status !== 'beschikbaar') return;

        const volgAdres = () => {
            if (window.location.hash !== PANEEL_HASH) return;
            bron.current = null;
            setOpen(true);
        };

        volgAdres();
        window.addEventListener('hashchange', volgAdres);

        return () => window.removeEventListener('hashchange', volgAdres);
    }, [status]);

    const waarde = useMemo(
        () => ({ open: open && status === 'beschikbaar', bron, openPaneel, sluitPaneel }),
        [open, status, openPaneel, sluitPaneel],
    );

    return <ContactPaneelContext.Provider value={waarde}>{children}</ContactPaneelContext.Provider>;
};

export const useContactPaneel = (): ContactPaneelWaarde => useContext(ContactPaneelContext);
