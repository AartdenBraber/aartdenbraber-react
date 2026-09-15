import React from 'react';
import { act, render } from '@testing-library/react';
import { BEREIK, nabijheid, useZoeklichtNabij, zetLicht } from './zoeklicht';

const vak = { left: 100, top: 40, right: 300, bottom: 90, width: 200, height: 50 } as DOMRect;

describe('nabijheid', () => {
    it('is 1 op de knop, half op de halve straal en 0 daarbuiten', () => {
        expect(nabijheid(vak, 170, 65)).toBe(1);
        expect(nabijheid(vak, 300 + BEREIK / 2, 65)).toBeCloseTo(0.5);
        expect(nabijheid(vak, 300 + BEREIK + 1, 65)).toBe(0);
    });

    it('rekent vanaf de dichtstbijzijnde hoek', () => {
        // 30 rechts en 40 onder de hoek: 50 pixels.
        expect(nabijheid(vak, 330, 130, 100)).toBeCloseTo(0.5);
    });
});

describe('zetLicht', () => {
    it('zet de plek van de muis ten opzichte van de knop en hoe dichtbij hij is', () => {
        const knop = document.createElement('button');
        knop.getBoundingClientRect = () => vak;

        zetLicht(knop, 170, 65);

        expect(knop.style.getPropertyValue('--muis-x')).toBe('70px');
        expect(knop.style.getPropertyValue('--muis-y')).toBe('25px');
        expect(knop.style.getPropertyValue('--licht-nabij')).toBe('1.000');
    });

    it('laat de plek staan als de muis buiten bereik gaat, zodat de gloed daar uitdooft', () => {
        const knop = document.createElement('button');
        knop.getBoundingClientRect = () => vak;

        zetLicht(knop, 170, 65);
        zetLicht(knop, 900, 600);

        expect(knop.style.getPropertyValue('--muis-x')).toBe('70px');
        expect(knop.style.getPropertyValue('--licht-nabij')).toBe('0.000');
    });
});

describe('useZoeklichtNabij', () => {
    const Pagina: React.FC = () => {
        useZoeklichtNabij();
        return React.createElement('button', { 'data-zoeklicht': true }, 'Versturen');
    };

    beforeEach(() => {
        // Meteen tekenen, en dan 0 teruggeven: een echt frame komt pas na de
        // aanroep, dus daar staat de teller na het tekenen weer op nul.
        jest.spyOn(window, 'requestAnimationFrame').mockImplementation((terug) => {
            terug(0);
            return 0;
        });
    });
    afterEach(() => jest.restoreAllMocks());

    const beweeg = (clientX: number, clientY: number, pointerType = 'mouse') => {
        const event = new MouseEvent('pointermove', { clientX, clientY, bubbles: true });
        Object.defineProperty(event, 'pointerType', { value: pointerType });
        act(() => {
            document.dispatchEvent(event);
        });
    };

    it('laat het licht al binnenvallen als de muis de knop nadert', () => {
        const { getByRole } = render(React.createElement(Pagina));
        const knop = getByRole('button');
        knop.getBoundingClientRect = () => vak;

        beweeg(300 + BEREIK / 2, 65);

        expect(knop.style.getPropertyValue('--licht-nabij')).toBe('0.500');
        expect(knop.style.getPropertyValue('--muis-x')).toBe(`${200 + BEREIK / 2}px`);
    });

    it('doet niets met een vinger', () => {
        const { getByRole } = render(React.createElement(Pagina));
        const knop = getByRole('button');
        knop.getBoundingClientRect = () => vak;

        beweeg(170, 65, 'touch');

        expect(knop.style.getPropertyValue('--licht-nabij')).toBe('');
    });

    it('dooft als de muis het venster uit gaat', () => {
        const { getByRole } = render(React.createElement(Pagina));
        const knop = getByRole('button');
        knop.getBoundingClientRect = () => vak;

        beweeg(170, 65);
        act(() => {
            document.dispatchEvent(new MouseEvent('pointerout', { relatedTarget: null }));
        });

        expect(knop.style.getPropertyValue('--licht-nabij')).toBe('0.000');
    });
});
