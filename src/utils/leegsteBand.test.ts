import { leegsteBand } from './leegsteBand';

const BREEDTE = 10;
const HOOGTE = 100;

/** Een wit vel met op de opgegeven rijen een volle regel in `kleur`. */
const vel = (volleRijen: number[], kleur: number[] = [0, 0, 0, 255]) => {
    const pixels = new Uint8ClampedArray(BREEDTE * HOOGTE * 4).fill(255);
    volleRijen.forEach((y) => {
        for (let x = 0; x < BREEDTE; x++) pixels.set(kleur, (y * BREEDTE + x) * 4);
    });
    return pixels;
};

const rijen = (van: number, tot: number) => Array.from({ length: tot - van }, (_, i) => van + i);

describe('leegsteBand', () => {
    it('kiest de hoogste lege strook en geeft die in delen van de pagina', () => {
        const pixels = vel([...rijen(0, 10), ...rijen(30, 35), ...rijen(90, 100)]);
        expect(leegsteBand(pixels, BREEDTE, HOOGTE)).toEqual({ van: 0.35, tot: 0.9 });
    });

    it('laat een strook doorlopen tot de onderrand', () => {
        expect(leegsteBand(vel(rijen(0, 40)), BREEDTE, HOOGTE)).toEqual({ van: 0.4, tot: 1 });
    });

    it('telt een lijn van één pixel hoog als inhoud', () => {
        const pixels = vel([...rijen(0, 10), 50]);
        expect(leegsteBand(pixels, BREEDTE, HOOGTE)).toEqual({ van: 0.51, tot: 1 });
    });

    it('ziet bijna-wit als papier en lichtgrijs als inhoud', () => {
        expect(leegsteBand(vel(rijen(0, 100), [245, 245, 245, 255]), BREEDTE, HOOGTE)).toEqual({
            van: 0,
            tot: 1,
        });
        expect(leegsteBand(vel(rijen(0, 100), [200, 200, 200, 255]), BREEDTE, HOOGTE)).toBeNull();
    });

    it('ziet doorzichtig als papier', () => {
        const pixels = vel([...rijen(0, 20), ...rijen(80, 100)]);
        rijen(20, 80).forEach((y) => {
            for (let x = 0; x < BREEDTE; x++) pixels.set([0, 0, 0, 0], (y * BREEDTE + x) * 4);
        });
        expect(leegsteBand(pixels, BREEDTE, HOOGTE)).toEqual({ van: 0.2, tot: 0.8 });
    });

    it('kijkt alleen naar de opgegeven kolommen', () => {
        // Een donkere balk langs de linkerrand, over de hele hoogte, zoals op het cv.
        const pixels = vel(rijen(0, 30));
        rijen(30, 100).forEach((y) => pixels.set([40, 40, 40, 255], y * BREEDTE * 4));
        expect(leegsteBand(pixels, BREEDTE, HOOGTE)).toBeNull();
        expect(leegsteBand(pixels, BREEDTE, HOOGTE, 0.2, 1)).toEqual({ van: 0.3, tot: 1 });
    });
});
