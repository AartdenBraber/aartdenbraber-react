import { useEffect } from 'react';

/**
 * Hoe ver van de knop de muis het licht al laat binnenvallen. Gelijk aan de
 * straal van de gloed in src/styles/_zoeklicht.scss: verder weg valt er van de
 * cirkel toch niets meer binnen de knop.
 */
export const BEREIK = 130;

type Vak = Pick<DOMRect, 'left' | 'top' | 'right' | 'bottom'>;

/**
 * 1 op of in de knop, aflopend naar 0 op BEREIK pixels van de dichtstbijzijnde
 * rand.
 */
export const nabijheid = (vak: Vak, x: number, y: number, bereik = BEREIK): number => {
    const dx = Math.max(vak.left - x, 0, x - vak.right);
    const dy = Math.max(vak.top - y, 0, y - vak.bottom);
    return Math.max(0, 1 - Math.hypot(dx, dy) / bereik);
};

/**
 * Zet de plek van de muis ten opzichte van de knop als --muis-x en --muis-y, en
 * hoe dichtbij hij is als --licht-nabij. Buiten bereik blijft de plek staan
 * waar hij was, zodat de gloed daar uitdooft en niet eerst wegspringt.
 */
export const zetLicht = (knop: HTMLElement, x: number, y: number) => {
    const vak = knop.getBoundingClientRect();
    const nabij = vak.width > 0 ? nabijheid(vak, x, y) : 0;

    if (nabij > 0) {
        knop.style.setProperty('--muis-x', `${Math.round(x - vak.left)}px`);
        knop.style.setProperty('--muis-y', `${Math.round(y - vak.top)}px`);
    }
    doof(knop, nabij);
};

const doof = (knop: HTMLElement, nabij: number) => {
    const waarde = nabij.toFixed(3);
    if (knop.style.getPropertyValue('--licht-nabij') !== waarde) {
        knop.style.setProperty('--licht-nabij', waarde);
    }
};

/**
 * Laat de gloed in de knoppen met `data-zoeklicht` de muis al volgen voordat hij
 * op de knop staat: het licht valt binnen aan de kant waar de muis nadert, net
 * zoals het zoeklicht in de hero de muis volgt. Eén luisteraar voor de hele
 * pagina, en per frame hooguit één keer rekenen.
 *
 * Alleen voor een muis of pen. Een vinger heeft geen plek zolang hij het scherm
 * niet raakt, en bij een tik is de knop al ingedrukt. Staat het paneel open,
 * dan gloeien alleen de knoppen daarin; de rest ligt onder de grond.
 */
export const useZoeklichtNabij = () => {
    useEffect(() => {
        let x = 0;
        let y = 0;
        let binnen = false;
        let frame = 0;

        const teken = () => {
            frame = 0;
            const paneel = document.querySelector('dialog[open]');
            document.querySelectorAll<HTMLElement>('[data-zoeklicht]').forEach((knop) => {
                if (!binnen || (paneel && !paneel.contains(knop))) {
                    doof(knop, 0);
                } else {
                    zetLicht(knop, x, y);
                }
            });
        };
        const plan = () => {
            if (!frame) frame = requestAnimationFrame(teken);
        };

        const beweeg = (event: PointerEvent) => {
            if (event.pointerType === 'touch') return;
            x = event.clientX;
            y = event.clientY;
            binnen = true;
            plan();
        };
        // Zonder relatedTarget ging de muis het venster uit.
        const uit = (event: PointerEvent) => {
            if (event.relatedTarget) return;
            binnen = false;
            plan();
        };
        const weg = () => {
            binnen = false;
            plan();
        };
        // Bij scrollen staat de muis stil en schuiven de knoppen eronder door.
        // Capture, zodat ook het scrollen in het paneel meetelt.
        const scroll = () => {
            if (binnen) plan();
        };

        document.addEventListener('pointermove', beweeg, { passive: true });
        document.addEventListener('pointerout', uit);
        window.addEventListener('blur', weg);
        window.addEventListener('scroll', scroll, { passive: true, capture: true });

        return () => {
            document.removeEventListener('pointermove', beweeg);
            document.removeEventListener('pointerout', uit);
            window.removeEventListener('blur', weg);
            window.removeEventListener('scroll', scroll, { capture: true });
            if (frame) cancelAnimationFrame(frame);
        };
    }, []);
};
