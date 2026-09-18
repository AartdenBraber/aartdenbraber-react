import { herkomst, klikdoel, meet, startMeten } from './meten';

describe('herkomst', () => {
    it('neemt rel en de utm-velden mee, en verder niets uit het adres', () => {
        expect(herkomst('?rel=cgbuitenpost&utm_source=linkedin&fbclid=abc', '', 'aartdenbraber.nl')).toEqual({
            rel: 'cgbuitenpost',
            utm_source: 'linkedin',
        });
    });

    it('geeft van een andere site alleen de hostnaam', () => {
        expect(herkomst('', 'https://www.linkedin.com/in/iemand?trk=abc', 'aartdenbraber.nl')).toEqual({
            van: 'www.linkedin.com',
        });
    });

    it('laat de eigen site en een lege verwijzer weg', () => {
        expect(herkomst('', 'https://aartdenbraber.nl/en', 'aartdenbraber.nl')).toEqual({});
        expect(herkomst('', '', 'aartdenbraber.nl')).toEqual({});
    });
});

describe('klikdoel', () => {
    const maak = (html: string): HTMLElement => {
        const houder = document.createElement('div');
        houder.innerHTML = html;
        document.body.appendChild(houder);
        return houder;
    };

    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('neemt de naam uit data-meet en de plek van het dichtstbijzijnde blok', () => {
        const houder = maak(
            '<section data-meet-plek="cv"><a href="/CV-Aart-den-Braber-NL.pdf" data-meet="cv downloaden"><span>Download CV als PDF</span></a></section>',
        );

        expect(klikdoel(houder.querySelector('span'))).toEqual({
            doel: 'cv downloaden',
            plek: 'cv',
            naar: '/CV-Aart-den-Braber-NL.pdf',
        });
    });

    it('valt terug op aria-label en daarna op de tekst', () => {
        const houder = maak('<button aria-label="Sluiten">×</button><button>  Nog   een  knop </button>');
        const [eerste, tweede] = Array.from(houder.querySelectorAll('button'));

        expect(klikdoel(eerste)).toEqual({ doel: 'Sluiten' });
        expect(klikdoel(tweede)).toEqual({ doel: 'Nog een knop' });
    });

    it('geeft van een link naar buiten de host en het pad, en van mailto geen adres', () => {
        const houder = maak(
            '<a href="https://www.linkedin.com/in/iemand?trk=x">LinkedIn</a><a href="mailto:iemand@example.com">Mail</a>',
        );
        const [linkedin, mail] = Array.from(houder.querySelectorAll('a'));

        expect(klikdoel(linkedin)?.naar).toBe('www.linkedin.com/in/iemand');
        expect(klikdoel(mail)?.naar).toBe('mailto');
    });

    it('telt een klik naast een link of knop niet', () => {
        const houder = maak('<p>Gewone tekst</p>');

        expect(klikdoel(houder.querySelector('p'))).toBeNull();
        expect(klikdoel(null)).toBeNull();
    });
});

describe('startMeten', () => {
    const verstuurd: Record<string, unknown>[] = [];
    let stop: () => void = () => undefined;

    const zichtbaarheid = (stand: 'visible' | 'hidden') => {
        Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => stand });
        document.dispatchEvent(new Event('visibilitychange'));
    };

    beforeEach(() => {
        verstuurd.length = 0;
        window.history.pushState(null, '', '/en?rel=cgbuitenpost#contact');
        stop = startMeten((inhoud) => verstuurd.push(JSON.parse(inhoud)));
    });

    afterEach(() => {
        stop();
        document.body.innerHTML = '';
        Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' });
        window.history.pushState(null, '', '/');
    });

    it('meldt het bezoek met pad, taal, anker en herkomst', () => {
        expect(verstuurd).toHaveLength(1);
        expect(verstuurd[0]).toMatchObject({
            s: 'bezoek',
            pad: '/en',
            taal: 'en',
            anker: '#contact',
            rel: 'cgbuitenpost',
        });
        expect(verstuurd[0].b).toMatch(/^[0-9a-f]{16}$/);
    });

    it('meldt een klik met hetzelfde bezoeknummer, ook als de knop het event tegenhoudt', () => {
        document.body.innerHTML = '<div data-meet-plek="balk"><button data-meet="taal nl">NL</button></div>';
        const knop = document.querySelector('button') as HTMLButtonElement;
        knop.addEventListener('click', (event) => event.stopPropagation());

        knop.click();

        expect(verstuurd[1]).toEqual({ s: 'klik', b: verstuurd[0].b, doel: 'taal nl', plek: 'balk' });
    });

    it('meldt het eind als de pagina uit beeld gaat, en maar één keer tot hij terugkomt', () => {
        zichtbaarheid('hidden');
        window.dispatchEvent(new Event('pagehide'));

        const einden = verstuurd.filter((g) => g.s === 'eind');
        expect(einden).toHaveLength(1);
        expect(einden[0]).toMatchObject({ b: verstuurd[0].b, tijd: expect.any(Number), diepte: expect.any(Number), cv: 0 });

        zichtbaarheid('visible');
        zichtbaarheid('hidden');
        expect(verstuurd.filter((g) => g.s === 'eind')).toHaveLength(2);
    });

    it('stuurt een bericht mee, en na het stoppen niets meer', () => {
        meet('bericht', { onderwerp: 'opdracht' });
        expect(verstuurd[1]).toEqual({ s: 'bericht', b: verstuurd[0].b, onderwerp: 'opdracht' });

        stop();
        meet('bericht', { onderwerp: 'anders' });
        document.body.innerHTML = '<button>Knop</button>';
        (document.querySelector('button') as HTMLButtonElement).click();

        expect(verstuurd).toHaveLength(2);
    });
});

describe('meet zonder startMeten', () => {
    it('doet niets, zodat de tests van het formulier er geen last van hebben', () => {
        expect(() => meet('bericht', { onderwerp: 'opdracht' })).not.toThrow();
    });
});
