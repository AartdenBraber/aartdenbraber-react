/**
 * Het cv wordt met pdf.js getekend, en dat heeft een losse worker nodig. Die
 * stond eerst op unpkg. Een cdn dat wegvalt betekende dan een lege pagina waar
 * het cv hoort, want dat is zo'n beetje de hele site. Daarom zetten we de
 * worker die naast pdfjs-dist meekomt in public/, zodat hij van ons eigen
 * domein komt en altijd bij de versie past die we gebruiken.
 *
 * Draait vanzelf voor npm start en npm run build.
 */
const fs = require('fs');
const path = require('path');

const bron = path.join(__dirname, '..', 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.js');
const doel = path.join(__dirname, '..', 'public', 'pdf.worker.min.js');

if (!fs.existsSync(bron)) {
  console.error(`De pdf-worker staat niet op ${bron}. Draai eerst npm install.`);
  process.exit(1);
}

fs.copyFileSync(bron, doel);
console.log(`pdf-worker gekopieerd naar ${path.relative(process.cwd(), doel)}`);
