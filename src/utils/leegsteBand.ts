/** Een strook van een pagina, van boven naar onder in delen van de paginahoogte (0 tot 1). */
export interface Band {
    van: number;
    tot: number;
}

/**
 * Lichter dan dit telt als papier. Een rij met een regel tekst of een lijn heeft
 * altijd pixels die veel donkerder zijn, dus deze marge kost niets en een vel
 * dat net niet helemaal wit getekend is, strandt er niet op.
 */
const PAPIER = 240;

/** Minder dekkend dan dit telt ook als papier, voor een vel zonder witte grond. */
const DOORZICHTIG = 16;

/**
 * Zoekt op een getekende pdf-pagina de hoogste strook waar niets op staat.
 *
 * Dit kijkt naar de pixels en niet naar de tekst van pdf.js: de lijnen onder
 * de koppen en de foto zijn geen tekst, maar er mag evengoed niets overheen.
 * Om de andere kolom is genoeg, want een letter of een lijn is altijd breder
 * dan één pixel.
 *
 * Alleen de kolommen tussen `links` en `rechts` tellen mee, in delen van de
 * breedte. Het cv heeft over de hele hoogte een donkere balk langs de
 * linkerrand: wie de volle breedte bekijkt, vindt geen enkele lege rij.
 *
 * Geeft null als er geen enkele lege rij is.
 */
export const leegsteBand = (
    pixels: ArrayLike<number>,
    breedte: number,
    hoogte: number,
    links = 0,
    rechts = 1,
): Band | null => {
    const vanX = Math.floor(links * breedte);
    const totX = Math.ceil(rechts * breedte);

    let besteVan = 0;
    let besteTot = 0;
    let begin = -1;

    // Eén rij voorbij de onderrand, die nooit leeg is: zo sluit ook een strook
    // die tot de onderrand doorloopt netjes af.
    for (let y = 0; y <= hoogte; y++) {
        let leeg = y < hoogte;

        for (let x = vanX; leeg && x < totX; x += 2) {
            const i = (y * breedte + x) * 4;
            if (
                pixels[i + 3] > DOORZICHTIG &&
                Math.min(pixels[i], pixels[i + 1], pixels[i + 2]) < PAPIER
            ) {
                leeg = false;
            }
        }

        if (leeg) {
            if (begin < 0) begin = y;
        } else if (begin >= 0) {
            if (y - begin > besteTot - besteVan) {
                besteVan = begin;
                besteTot = y;
            }
            begin = -1;
        }
    }

    return besteTot > besteVan ? { van: besteVan / hoogte, tot: besteTot / hoogte } : null;
};
