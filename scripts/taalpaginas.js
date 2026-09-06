/**
 * Zet na de build de kop van het document goed voor beide talen:
 * build/index.html krijgt de Nederlandse titel, omschrijving en noscript-tekst,
 * build/en.html de Engelse, met een eigen canonical, og-velden en lang-attribuut.
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

/**
 * Leest een tekst tussen enkele quotes uit een blok van een taalbestand. Het
 * patroon laat ontsnapte tekens toe en haalt de backslashes er daarna af: met
 * een simpel `[^']+` stopte het bij de eerste apostrof in de tekst zelf, en dan
 * kwam er zonder enige melding een afgekapte titel in de pagina te staan.
 */
const leesTekst = (blok, veld) => {
    const patroon = new RegExp(veld + ":\\s*'((?:[^'\\\\]|\\\\.)*)'");
    const treffer = blok.match(patroon);
    return treffer ? treffer[1].replace(/\\(.)/g, '$1') : null;
};

/** Haalt de teksten die in de kop en in het noscript-blok terechtkomen. */
const teksten = (taal) => {
    const bestand = path.join(wortel, 'src', 'content', `${taal}.tsx`);
    const inhoud = fs.readFileSync(bestand, 'utf8');
    const deel = (van, tot) => inhoud.slice(inhoud.indexOf(van), inhoud.indexOf(tot));

    const kop = deel('meta:', 'header:');
    const titel = leesTekst(kop, 'title');
    const omschrijving = leesTekst(kop, 'description');
    const heroKop = leesTekst(deel('hero:', 'intro:'), 'title');
    const zonderJs = leesTekst(deel('nav:', 'languageSwitcher:'), 'noscript');

    if (!titel || !omschrijving || !heroKop || !zonderJs) {
        console.error(`Kon title, description, hero.title of nav.noscript niet uit ${taal}.tsx halen.`);
        process.exit(1);
    }

    return { titel, omschrijving, heroKop, zonderJs };
};

/** Voor tekst in een attribuut tussen dubbele quotes. */
const ontsnap = (tekst) => tekst.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** Voor tekst tussen tags; daar hoeven quotes niet ontsnapt. */
const ontsnapTekst = (tekst) => tekst.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const TALEN = [
    { code: 'nl', bestand: 'index.html', pad: '/', locale: 'nl_NL' },
    { code: 'en', bestand: 'en.html', pad: '/en', locale: 'en_GB' },
];

const sjabloon = fs.readFileSync(bron, 'utf8');

for (const taal of TALEN) {
    const { titel, omschrijving, heroKop, zonderJs } = teksten(taal.code);
    const adres = `https://aartdenbraber.nl${taal.pad}`;

    // Het noscript-blok is het enige dat een crawler zonder javascript te lezen
    // krijgt. Stond daar de Nederlandse tekst, dan sprak /en zichzelf tegen:
    // een Engelse kop met Nederlandse inhoud eronder.
    const noscript = [
        '<noscript>',
        '      <h1>Aart den Braber</h1>',
        `      <p>${ontsnapTekst(omschrijving)}</p>`,
        `      <p>${ontsnapTekst(heroKop)}</p>`,
        `      <p>${ontsnapTekst(zonderJs)}</p>`,
        '    </noscript>',
    ].join('\n      ');

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
        [/<noscript>[\s\S]*?<\/noscript>/, noscript],
    ];

    let html = sjabloon;
    for (const [patroon, nieuw] of vervangingen) {
        if (!patroon.test(html)) {
            console.error(`Patroon niet gevonden in build/index.html: ${patroon}`);
            process.exit(1);
        }
        // Een functie en geen string: in een vervangingstekst leest javascript
        // een dollarteken als opdracht. Een titel met `$&` plakt de hele
        // gevonden tag terug in het attribuut, en met een dollar plus apostrof
        // komt de rest van het document erin, inclusief de scripttags. De build
        // blijft daarbij groen en het gaat zo live.
        html = html.replace(patroon, () => nieuw);
    }

    fs.writeFileSync(path.join(wortel, 'build', taal.bestand), html);
    console.log(`build/${taal.bestand}: lang="${taal.code}", canonical ${taal.pad}, "${titel}"`);
}
