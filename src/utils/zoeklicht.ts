import { useEffect } from 'react';

/**
 * Hoe ver van de knop de muis het licht al laat binnenvallen. Gelijk aan de
 * straal van de gloed in src/styles/_zoeklicht.scss: verder weg valt er van de
 * cirkel toch niets meer binnen de knop.
 */
export const BEREIK = 130;

/**
 * Zo lang blijft het licht staan nadat een vinger het scherm loslaat. Een tik
 * duurt korter dan de gloed nodig heeft om op te komen, dus zonder deze tijd
 * zag je van een tik niets.
 */
export const NA_LOSLATEN_MS = 450;

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
 * Een vinger doet hetzelfde: het licht komt waar hij het scherm raakt, ook naast
 * de knop, en volgt hem zolang hij erop blijft. Eerst deed dit alleen iets met
 * een muis, en op een telefoon bleef na een tik :hover aan de knop plakken met
 * het licht in het midden. Staat het paneel open, dan gloeien alleen de knoppen
 * daarin; de rest ligt onder de grond.
 */
export const useZoeklichtNabij = () => {
    useEffect(() => {
        let x = 0;
        let y = 0;
        let binnen = false;
        let frame = 0;
        let loslaten = 0;

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
        const doven = () => {
            binnen = false;
            plan();
        };

        // Bij pointerdown komt de plek van een vinger binnen; die heeft er pas
        // een als hij het scherm raakt. Een muis komt hier ook langs, en dat kan
        // geen kwaad.
        const wijs = (event: PointerEvent) => {
            if (event.pointerType === 'touch') window.clearTimeout(loslaten);
            x = event.clientX;
            y = event.clientY;
            binnen = true;
            plan();
        };
        // Een vinger laat los, of gaat scrollen: dan komt pointercancel. Het
        // licht blijft nog even staan en dooft dan.
        const los = (event: PointerEvent) => {
            if (event.pointerType !== 'touch') return;
            window.clearTimeout(loslaten);
            loslaten = window.setTimeout(doven, NA_LOSLATEN_MS);
        };
        // Zonder relatedTarget ging de muis het venster uit. Een vinger meldt
        // dat na elke keer loslaten; die dooft via `los`.
        const uit = (event: PointerEvent) => {
            if (event.pointerType === 'touch' || event.relatedTarget) return;
            doven();
        };
        // Bij scrollen staat de muis stil en schuiven de knoppen eronder door.
        // Capture, zodat ook het scrollen in het paneel meetelt.
        const scroll = () => {
            if (binnen) plan();
        };

        document.addEventListener('pointerdown', wijs, { passive: true });
        document.addEventListener('pointermove', wijs, { passive: true });
        document.addEventListener('pointerup', los, { passive: true });
        document.addEventListener('pointercancel', los, { passive: true });
        document.addEventListener('pointerout', uit);
        window.addEventListener('blur', doven);
        window.addEventListener('scroll', scroll, { passive: true, capture: true });

        return () => {
            document.removeEventListener('pointerdown', wijs);
            document.removeEventListener('pointermove', wijs);
            document.removeEventListener('pointerup', los);
            document.removeEventListener('pointercancel', los);
            document.removeEventListener('pointerout', uit);
            window.removeEventListener('blur', doven);
            window.removeEventListener('scroll', scroll, { capture: true });
            window.clearTimeout(loslaten);
            if (frame) cancelAnimationFrame(frame);
        };
    }, []);
};
