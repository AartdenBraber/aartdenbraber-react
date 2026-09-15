import React from 'react';
import { act, render } from '@testing-library/react';
import { BEREIK, NA_LOSLATEN_MS, nabijheid, useZoeklichtNabij, zetLicht } from './zoeklicht';

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

    const wijzer = (type: string, clientX: number, clientY: number, pointerType = 'mouse') => {
        const event = new MouseEvent(type, { clientX, clientY, relatedTarget: null, bubbles: true });
        Object.defineProperty(event, 'pointerType', { value: pointerType });
        act(() => {
            document.dispatchEvent(event);
        });
    };

    // jsdom kent geen Touch, dus de vingers gaan als gewone objecten mee.
    const vinger = (type: string, ...plekken: Array<[number, number]>) => {
        const event = new Event(type, { bubbles: true });
        Object.defineProperty(event, 'touches', {
            value: plekken.map(([clientX, clientY]) => ({ clientX, clientY })),
        });
        act(() => {
            document.dispatchEvent(event);
        });
    };

    const knopOpDePagina = () => {
        const { getByRole } = render(React.createElement(Pagina));
        const knop = getByRole('button');
        knop.getBoundingClientRect = () => vak;
        return knop;
    };

    const vangUitstel = () => {
        const uitgesteld: Array<() => void> = [];
        const echteTimeout = window.setTimeout;
        jest.spyOn(window, 'setTimeout').mockImplementation(((terug: () => void, wacht?: number) => {
            if (wacht !== NA_LOSLATEN_MS) return echteTimeout.call(window, terug, wacht);
            uitgesteld.push(terug);
            return 0;
        }) as unknown as typeof window.setTimeout);
        return uitgesteld;
    };

    it('laat het licht al binnenvallen als de muis de knop nadert', () => {
        const knop = knopOpDePagina();

        wijzer('pointermove', 300 + BEREIK / 2, 65);

        expect(knop.style.getPropertyValue('--licht-nabij')).toBe('0.500');
        expect(knop.style.getPropertyValue('--muis-x')).toBe(`${200 + BEREIK / 2}px`);
    });

    it('laat het licht komen waar een vinger het scherm raakt, ook naast de knop', () => {
        const knop = knopOpDePagina();

        vinger('touchstart', [300 + BEREIK / 2, 65]);

        expect(knop.style.getPropertyValue('--licht-nabij')).toBe('0.500');
    });

    it('laat het licht meebewegen als de vinger sleept', () => {
        const knop = knopOpDePagina();

        vinger('touchstart', [120, 65]);
        // De browser neemt het slepen over als scrollen; daarna komt er geen
        // pointermove meer, wel touchmove.
        wijzer('pointercancel', 120, 65, 'touch');
        vinger('touchmove', [200, 70]);
        vinger('touchmove', [280, 75]);

        expect(knop.style.getPropertyValue('--muis-x')).toBe('180px');
        expect(knop.style.getPropertyValue('--muis-y')).toBe('35px');
        expect(knop.style.getPropertyValue('--licht-nabij')).toBe('1.000');
    });

    it('houdt het licht na het loslaten van een vinger nog even vast en dooft dan', () => {
        const knop = knopOpDePagina();
        const uitgesteld = vangUitstel();

        vinger('touchstart', [170, 65]);
        vinger('touchend');
        // Na elke keer loslaten meldt een vinger ook dat hij "weg" is.
        wijzer('pointerout', 170, 65, 'touch');

        expect(knop.style.getPropertyValue('--licht-nabij')).toBe('1.000');
        expect(uitgesteld).toHaveLength(1);

        act(() => uitgesteld[0]());
        expect(knop.style.getPropertyValue('--licht-nabij')).toBe('0.000');
    });

    it('blijft aan zolang er nog een vinger op het scherm ligt', () => {
        knopOpDePagina();
        const uitgesteld = vangUitstel();

        vinger('touchstart', [170, 65], [400, 400]);
        vinger('touchend', [400, 400]);

        expect(uitgesteld).toHaveLength(0);
    });

    it('dooft als de muis het venster uit gaat', () => {
        const knop = knopOpDePagina();

        wijzer('pointermove', 170, 65);
        wijzer('pointerout', 170, 65);

        expect(knop.style.getPropertyValue('--licht-nabij')).toBe('0.000');
    });
});
