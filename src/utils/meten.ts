import { languageFromPath } from '../i18n/routes';

/**
 * Bezoekersstatistiek, alleen voor eigen gebruik. De site stuurt een paar
 * kleine berichten naar public/meet.php, dat ze per dag in een bestand boven de
 * webroot zet. Een dashboard is er niet: scripts/server_statistiek.py haalt ze
 * op en vat ze samen.
 *
 * Per paginalading gaan er deze berichten heen:
 *
 *   bezoek   bij het laden: pad, taal, ?rel= en de utm-velden, de hostnaam van
 *            de site waar de bezoeker vandaan kwam en de breedte van het venster
 *   klik     een klik op een link of knop, met de naam uit data-meet, anders
 *            de tekst, en de plek uit het dichtstbijzijnde data-meet-plek
 *   eind     als de pagina uit beeld gaat: hoe lang hij in beeld was, hoe ver er
 *            gescrold is en tot welke cv-pagina. Gaat hij weer in beeld en
 *            daarna weer uit, dan komt er een nieuw eind met de opgetelde tijd.
 *   bericht  het contactformulier is verstuurd, of gaf een fout
 *
 * Geen cookies, niets in localStorage of sessionStorage en geen vingerafdruk.
 * Een bezoek is één paginalading met een willekeurig nummer dat alleen in het
 * geheugen staat, dus herladen is een nieuw bezoek. Het IP-adres komt op de
 * server niet op schijf.
 */
export const MEET_URL = '/meet.php';

/** De parameters in het adres die zeggen waar een bezoeker vandaan komt. De rest gaat niet mee. */
const HERKOMST = ['rel', 'ref', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content'] as const;

const KLIKBAAR = 'a[href], button, [role="button"], summary, [data-meet]';

/** Wat meet.php per tekstveld nog aanneemt. */
const MAX_TEKST = 80;

type Velden = Record<string, string | number>;
type Stuur = (inhoud: string) => void;

let lopend: { bezoek: string; stuur: Stuur } | null = null;

const kort = (tekst: string, max = MAX_TEKST): string => tekst.replace(/\s+/g, ' ').trim().slice(0, max);

const nieuwBezoek = (): string => {
    const bytes = new Uint8Array(8);
    if (typeof window.crypto?.getRandomValues === 'function') {
        window.crypto.getRandomValues(bytes);
    } else {
        bytes.forEach((_, i) => (bytes[i] = Math.floor(Math.random() * 256)));
    }
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

const verstuur = (soort: string, velden: Velden): void => {
    if (!lopend) return;
    lopend.stuur(JSON.stringify({ s: soort, b: lopend.bezoek, ...velden }));
};

/**
 * De herkomstparameters uit het adres, plus de hostnaam van de verwijzer als
 * die van een andere site is. Alleen de hostnaam: in het pad of de query van
 * een verwijzer kan van alles staan.
 */
export const herkomst = (search: string, referrer: string, eigenHost: string): Velden => {
    const velden: Velden = {};
    const parameters = new URLSearchParams(search);

    HERKOMST.forEach((naam) => {
        const waarde = kort(parameters.get(naam) ?? '');
        if (waarde) velden[naam] = waarde;
    });

    try {
        const host = new URL(referrer).hostname;
        if (host && host !== eigenHost) velden.van = host;
    } catch {
        // Geen verwijzer, of een die geen adres is.
    }

    return velden;
};

/** Waar een link heen gaat, zonder e-mailadressen of querystrings. */
const bestemming = (link: HTMLAnchorElement): string => {
    const href = link.getAttribute('href') ?? '';
    if (/^(mailto|tel):/i.test(href)) return href.split(':')[0].toLowerCase();

    try {
        const adres = new URL(href, window.location.href);
        if (adres.origin === window.location.origin) return kort(adres.pathname + adres.hash, 120);
        return kort(adres.hostname + adres.pathname, 120);
    } catch {
        return '';
    }
};

/**
 * De naam en plek van wat er aangeklikt is, of null als het geen link of knop
 * was. Knoppen die ertoe doen hebben een vaste naam in data-meet, zodat een
 * klik in het Engels en het Nederlands op dezelfde regel uitkomt.
 */
export const klikdoel = (doel: EventTarget | null): Velden | null => {
    if (!(doel instanceof Element)) return null;

    const element = doel.closest(KLIKBAAR);
    if (!element) return null;

    const naam =
        kort(element.getAttribute('data-meet') ?? '') ||
        kort(element.getAttribute('aria-label') ?? '') ||
        kort(element.textContent ?? '') ||
        element.tagName.toLowerCase();

    const velden: Velden = { doel: naam };

    const plek = element.closest('[data-meet-plek]')?.getAttribute('data-meet-plek');
    if (plek) velden.plek = kort(plek, 30);

    if (element instanceof HTMLAnchorElement) {
        const naar = bestemming(element);
        if (naar) velden.naar = naar;
    }

    return velden;
};

/** Hoe ver er nu gescrold is, in procenten van de pagina, en welke cv-pagina er in beeld is gekomen. */
const huidigeDiepte = (): { diepte: number; cv: number; cvVan: number } => {
    const hoogte = Math.max(document.documentElement.scrollHeight, 1);
    const diepte = Math.min(100, Math.round(((window.scrollY + window.innerHeight) / hoogte) * 100));

    // Een cv-pagina telt als zijn bovenkant in de bovenste zestig procent van
    // het scherm is gekomen. Het cv tekent de pagina's pas na het laden, dus
    // het aantal kan in het begin nog nul zijn.
    const paginas = document.querySelectorAll('.pdf-page');
    let cv = 0;
    paginas.forEach((pagina, index) => {
        if (pagina.getBoundingClientRect().top < window.innerHeight * 0.6) cv = index + 1;
    });

    return { diepte, cv, cvVan: paginas.length };
};

/**
 * Begint met meten en geeft een functie terug die ermee stopt.
 *
 * Zonder `stuur` gaat alles met navigator.sendBeacon naar meet.php. Een
 * geautomatiseerde browser telt dan niet mee, zoals de headless Chrome waarmee
 * de site gecontroleerd wordt.
 */
export const startMeten = (stuur?: Stuur): (() => void) => {
    const navigatie = window.navigator;

    if (!stuur) {
        if (navigatie.webdriver || typeof navigatie.sendBeacon !== 'function') return () => undefined;

        stuur = (inhoud) => {
            try {
                navigatie.sendBeacon(MEET_URL, inhoud);
            } catch {
                // Dan telt dit bericht niet mee. De bezoeker merkt er niets van.
            }
        };
    }

    lopend = { bezoek: nieuwBezoek(), stuur };

    const { pathname, hash, search, hostname } = window.location;
    verstuur('bezoek', {
        pad: kort(pathname, 100),
        taal: languageFromPath(pathname),
        ...(hash ? { anker: kort(hash, 40) } : {}),
        breed: window.innerWidth,
        ...herkomst(search, document.referrer, hostname),
    });

    let zichtbaarSinds: number | null = document.visibilityState === 'visible' ? performance.now() : null;
    let zichtbaarMs = 0;
    const verst = { diepte: 0, cv: 0, cvVan: 0 };

    const werkDiepteBij = () => {
        const nu = huidigeDiepte();
        verst.diepte = Math.max(verst.diepte, nu.diepte);
        verst.cv = Math.max(verst.cv, nu.cv);
        verst.cvVan = Math.max(verst.cvVan, nu.cvVan);
    };

    let gepland = false;
    const bijScrollen = () => {
        if (gepland) return;
        gepland = true;
        window.requestAnimationFrame(() => {
            gepland = false;
            werkDiepteBij();
        });
    };

    // In de vangfase, zodat een knop die het event tegenhoudt of zichzelf
    // weghaalt, zoals het kruisje van het contactpaneel, toch meetelt.
    const bijKlik = (event: MouseEvent) => {
        const velden = klikdoel(event.target);
        if (velden) verstuur('klik', velden);
    };

    // Uit beeld gaan is het laatste moment dat zeker komt, ook op een telefoon
    // die het tabblad later zonder waarschuwing opruimt. pagehide vangt de
    // browsers die bij het wegnavigeren geen visibilitychange sturen; was de
    // pagina al uit beeld, dan is het eind al verstuurd.
    const uitBeeld = () => {
        if (zichtbaarSinds === null) return;

        zichtbaarMs += performance.now() - zichtbaarSinds;
        zichtbaarSinds = null;
        werkDiepteBij();
        verstuur('eind', { tijd: Math.round(zichtbaarMs / 1000), ...verst });
    };

    const bijZichtbaarheid = () => {
        if (document.visibilityState === 'visible') {
            if (zichtbaarSinds === null) zichtbaarSinds = performance.now();
        } else {
            uitBeeld();
        }
    };

    window.addEventListener('scroll', bijScrollen, { passive: true });
    document.addEventListener('click', bijKlik, true);
    document.addEventListener('visibilitychange', bijZichtbaarheid);
    window.addEventListener('pagehide', uitBeeld);

    return () => {
        window.removeEventListener('scroll', bijScrollen);
        document.removeEventListener('click', bijKlik, true);
        document.removeEventListener('visibilitychange', bijZichtbaarheid);
        window.removeEventListener('pagehide', uitBeeld);
        lopend = null;
    };
};

/** Voor wat geen klik is, zoals een verstuurd bericht. Doet niets zolang er niet gemeten wordt. */
export const meet = (soort: 'bericht', velden: Velden = {}): void => verstuur(soort, velden);
