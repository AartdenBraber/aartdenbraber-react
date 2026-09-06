/**
 * Zet na de build de kop van het document goed voor beide talen:
 * build/index.html krijgt de Nederlandse titel en omschrijving, build/en.html
 * de Engelse, met een eigen canonical, og-velden en lang-attribuut.
 *
 * De site is één react-app die zelf ziet welke taal bij het adres hoort, maar
 * dat gebeurt pas als het javascript draait. Alles wat geen javascript draait,
 * zoals het deelvenster van LinkedIn of een chat, kreeg op /en dus de
 * Nederlandse tekst te zien.
 *
 * De teksten komen uit src/content, zodat ze op één plek staan en de kop in
 * public/index.html er niet stilletjes naast kan gaan lopen. Klopt de vorm daar
 * niet meer, dan stopt dit script met een melding.
 */
const fs = require('fs');
const path = require('path');

const wortel = path.resolve(__dirname, '..');
const bron = path.join(wortel, 'build', 'index.html');

if (!fs.existsSync(bron)) {
    console.error('build/index.html bestaat niet; draai eerst de build.');
    process.exit(1);
}

/** Haalt title en description uit het meta-blok bovenaan een taalbestand. */
const teksten = (taal) => {
    const bestand = path.join(wortel, 'src', 'content', `${taal}.tsx`);
    const inhoud = fs.readFileSync(bestand, 'utf8');
    const blok = inhoud.slice(inhoud.indexOf('meta:'), inhoud.indexOf('header:'));
    const titel = (blok.match(/title:\s*'([^']+)'/) || [])[1];
    const omschrijving = (blok.match(/description:\s*'([^']+)'/) || [])[1];

    if (!titel || !omschrijving) {
        console.error(`Kon title of description niet uit het meta-blok van ${taal}.tsx halen.`);
        process.exit(1);
    }

    return { titel, omschrijving };
};

const ontsnap = (tekst) => tekst.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const TALEN = [
    { code: 'nl', bestand: 'index.html', pad: '/', locale: 'nl_NL' },
    { code: 'en', bestand: 'en.html', pad: '/en', locale: 'en_GB' },
];

const sjabloon = fs.readFileSync(bron, 'utf8');

for (const taal of TALEN) {
    const { titel, omschrijving } = teksten(taal.code);
    const adres = `https://aartdenbraber.nl${taal.pad}`;

    const vervangingen = [
        [/<html lang="[a-z-]+">/, `<html lang="${taal.code}">`],
        [/<title>[^<]*<\/title>/, `<title>${ontsnap(titel)}</title>`],
        [
            /<meta name="description" content="[^"]*"\s*\/>/,
            `<meta name="description" content="${ontsnap(omschrijving)}"/>`,
        ],
        [/<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${adres}"/>`],
        [
            /<meta property="og:locale" content="[^"]*"\s*\/>/,
            `<meta property="og:locale" content="${taal.locale}"/>`,
        ],
        [/<meta property="og:url" content="[^"]*"\s*\/>/, `<meta property="og:url" content="${adres}"/>`],
        [
            /<meta property="og:title" content="[^"]*"\s*\/>/,
            `<meta property="og:title" content="${ontsnap(titel)}"/>`,
        ],
        [
            /<meta property="og:description" content="[^"]*"\s*\/>/,
            `<meta property="og:description" content="${ontsnap(omschrijving)}"/>`,
        ],
    ];

    let html = sjabloon;
    for (const [patroon, nieuw] of vervangingen) {
        if (!patroon.test(html)) {
            console.error(`Patroon niet gevonden in build/index.html: ${patroon}`);
            process.exit(1);
        }
        html = html.replace(patroon, nieuw);
    }

    fs.writeFileSync(path.join(wortel, 'build', taal.bestand), html);
    console.log(`build/${taal.bestand}: lang="${taal.code}", canonical ${taal.pad}, "${titel}"`);
}
