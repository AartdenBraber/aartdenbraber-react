/**
 * Zet na de build een Engelse variant van index.html klaar op build/en.html.
 *
 * De site is één react-app die zelf ziet welke taal bij het adres hoort, maar
 * dat gebeurt pas als het javascript draait. Alles wat geen javascript draait,
 * zoals het deelvenster van LinkedIn of een chat, kreeg op /en dus de
 * Nederlandse titel en omschrijving te zien. Dit bestand lost dat op zonder een
 * tweede build: dezelfde app, andere kop.
 *
 * De teksten komen uit src/content/en.tsx, zodat ze op één plek staan. Klopt de
 * vorm daar niet meer, dan stopt dit script met een duidelijke melding in
 * plaats van stilletjes de Nederlandse tekst te laten staan.
 */
const fs = require('fs');
const path = require('path');

const wortel = path.resolve(__dirname, '..');
const bron = path.join(wortel, 'build', 'index.html');
const doel = path.join(wortel, 'build', 'en.html');
const engelsBestand = path.join(wortel, 'src', 'content', 'en.tsx');

if (!fs.existsSync(bron)) {
    console.error('build/index.html bestaat niet; draai eerst de build.');
    process.exit(1);
}

const engels = fs.readFileSync(engelsBestand, 'utf8');

const meta = engels.slice(engels.indexOf('meta:'), engels.indexOf('header:'));
const titel = (meta.match(/title:\s*'([^']+)'/) || [])[1];
const omschrijving = (meta.match(/description:\s*'([^']+)'/) || [])[1];

if (!titel || !omschrijving) {
    console.error('Kon de titel of omschrijving niet uit het meta-blok van en.tsx halen.');
    process.exit(1);
}

const ontsnap = (tekst) => tekst.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

let html = fs.readFileSync(bron, 'utf8');
const vervangingen = [
    [/<html lang="nl">/, '<html lang="en">'],
    [/<title>[^<]*<\/title>/, `<title>${ontsnap(titel)}</title>`],
    [
        /<meta name="description" content="[^"]*"\s*\/>/,
        `<meta name="description" content="${ontsnap(omschrijving)}"/>`,
    ],
    [
        /<link rel="canonical" href="[^"]*"\s*\/>/,
        '<link rel="canonical" href="https://aartdenbraber.nl/en"/>',
    ],
    [/<meta property="og:locale" content="[^"]*"\s*\/>/, '<meta property="og:locale" content="en_GB"/>'],
    [
        /<meta property="og:url" content="[^"]*"\s*\/>/,
        '<meta property="og:url" content="https://aartdenbraber.nl/en"/>',
    ],
    [
        /<meta property="og:title" content="[^"]*"\s*\/>/,
        `<meta property="og:title" content="${ontsnap(titel)}"/>`,
    ],
    [
        /<meta property="og:description" content="[^"]*"\s*\/>/,
        `<meta property="og:description" content="${ontsnap(omschrijving)}"/>`,
    ],
];

for (const [patroon, nieuw] of vervangingen) {
    if (!patroon.test(html)) {
        console.error(`Patroon niet gevonden in build/index.html: ${patroon}`);
        process.exit(1);
    }
    html = html.replace(patroon, nieuw);
}

fs.writeFileSync(doel, html);
console.log(`build/en.html klaar: "${titel}" / lang="en" / canonical /en`);
