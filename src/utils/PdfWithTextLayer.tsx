import React, { useEffect, useRef } from 'react';
import { getDocument, GlobalWorkerOptions, renderTextLayer } from 'pdfjs-dist';

// De worker komt van ons eigen domein en niet van een cdn. Valt zo'n cdn weg,
// dan blijft de plek waar het cv hoort namelijk leeg, en dat is vrijwel de hele
// pagina. scripts/copy-pdf-worker.js zet het bestand voor elke build klaar.
GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.js`;

interface PdfWithTextLayerProps {
    url: string;
    /** Naam van het hele blok, voor wie de pagina laat voorlezen. */
    label?: string;
    /**
     * Wat er in de tekstlaag komt te staan waar in het pdf een e-mailadres
     * staat. Zonder dit staat het adres leesbaar in de pagina en halen
     * spamrobots en zoekmachines het daar zo weg.
     */
    emailVervanging?: string;
}

/** Waarop het canvas getekend wordt. Hoger levert scherpere letters bij zoomen. */
const TEKEN_SCHAAL = 1.5;

// De laatste groep moet met letters eindigen. Anders valt `react@18.2.0` uit een
// technische opsomming er ook onder, en dan staat er in de tekstlaag een melding
// over een e-mailadres boven een versienummer.
const EMAIL = /[\w.+-]+@[\w-]+(?:\.[\w-]+)*\.[a-z]{2,}/gi;

/**
 * Haalt e-mailadressen uit de tekst-items van een pagina en zet er de opgegeven
 * tekst voor in de plaats.
 *
 * Het gewone geval is één item met het hele adres erin. Maar pdf.js hakt een
 * regel in meerdere items zodra font of tracking wisselt, en dan matcht geen
 * enkel los item terwijl het adres in de laag wel gewoon aaneengesloten te
 * selecteren is. Daarom kijken we daarna ook naar de items achter elkaar: valt
 * daar alsnog een adres in, dan gaan alle items die eraan meedoen leeg. Half
 * maskeren is hier hetzelfde als niet maskeren.
 */
const zonderEmail = <T extends { str?: string }>(items: T[], vervanging: string): T[] => {
    const schoon = items.map((item) =>
        typeof item.str === 'string' && item.str.includes('@')
            ? // Een functie en geen string: een dollarteken in de vervanging
              // is anders een opdracht, en met `$&` zou het gevonden adres er
              // juist weer in komen te staan.
              { ...item, str: item.str.replace(EMAIL, () => vervanging) }
            : item,
    );

    const grenzen: { i: number; van: number; tot: number }[] = [];
    let tekst = '';
    schoon.forEach((item, i) => {
        const str = typeof item.str === 'string' ? item.str : '';
        grenzen.push({ i, van: tekst.length, tot: tekst.length + str.length });
        tekst += str;
    });

    const raak = new Set<number>();
    for (const treffer of Array.from(tekst.matchAll(EMAIL))) {
        const van = treffer.index ?? 0;
        const tot = van + treffer[0].length;
        grenzen.forEach((g) => {
            if (g.van < tot && g.tot > van) raak.add(g.i);
        });
    }

    if (raak.size === 0) return schoon;

    // Luid falen: dit hoort niet voor te komen, en als het toch gebeurt zit het
    // pdf anders in elkaar dan gedacht en wil je dat weten.
    console.warn('Een e-mailadres liep over meerdere tekst-items heen; die items zijn leeggemaakt.');

    const eerste = Math.min(...Array.from(raak));
    return schoon.map((item, i) =>
        raak.has(i) ? { ...item, str: i === eerste ? vervanging : '' } : item,
    );
};

/**
 * Tekent elke pagina van het pdf op een eigen canvas en legt daar de tekst van
 * die pagina overheen.
 *
 * Die tekstlaag is onzichtbaar en staat precies over de letters in de tekening.
 * Daardoor is het cv te selecteren, met ctrl+F te doorzoeken en voor te lezen;
 * op een canvas alleen is het een plaatje en bestaat de inhoud niet. De laag
 * rekent in procenten van de pagina op schaal 1 en schaalt mee met
 * `--scale-factor`, die we zetten zodra de breedte verandert.
 *
 * Bij een taalwissel komt er een ander adres binnen; dan moet het oude cv weg
 * en het nieuwe ervoor in de plaats. De vlag `geannuleerd` zorgt dat een
 * halfklare tekening van het vorige pdf niet alsnog tussen de nieuwe pagina's
 * belandt.
 */
const PdfWithTextLayer: React.FC<PdfWithTextLayerProps> = ({ url, label, emailVervanging }) => {
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        let geannuleerd = false;

        const container = containerRef.current;
        if (!container) return;

        const schaalTekstlagen = () => {
            container.querySelectorAll<HTMLElement>('.pdf-page').forEach((pagina) => {
                const basisBreedte = Number(pagina.dataset.basisbreedte);
                if (!basisBreedte) return;
                pagina.style.setProperty(
                    '--scale-factor',
                    String(pagina.clientWidth / basisBreedte),
                );
            });
        };

        // Zonder ResizeObserver schalen we één keer na het tekenen. De laag
        // klopt dan bij de maat van dat moment en niet meer na het draaien van
        // een telefoon; het cv blijft wel gewoon staan.
        const meter =
            typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schaalTekstlagen);

        // Staat er al iets van dit pdf? Zo niet, dan is wat er hangt van de
        // vorige taal en moet het weg als het misgaat; staat er al wel wat, dan
        // laten we die pagina's staan in plaats van ze alsnog te wissen.
        let nieuweStandBegonnen = false;

        // pdf.js start per getDocument een eigen worker. Zonder destroy blijft
        // die leven met het hele geparste cv erin: gemeten liep dat op van één
        // worker en 8MB naar zes workers en 23MB na vijf taalwissels.
        let taak: ReturnType<typeof getDocument> | null = null;

        const laadEnTeken = async () => {
            taak = getDocument(url);
            const pdf = await taak.promise;
            if (geannuleerd) return;

            // Pas leegmaken nu het nieuwe cv binnen is, zodat er bij een trage
            // verbinding niet eerst een gat valt. De hoogte houden we vast tot
            // de nieuwe pagina's er staan: zonder dat stort het document in van
            // ruim twintigduizend pixels naar een paar honderd, klemt de
            // browser de scrollpositie, en staat wie op pagina acht van taal
            // wisselde ineens weer bovenaan.
            const hoogte = container.getBoundingClientRect().height;
            meter?.disconnect();
            if (hoogte > 0) container.style.minHeight = `${hoogte}px`;
            container.innerHTML = '';
            nieuweStandBegonnen = true;

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                if (geannuleerd) return;

                const viewport = page.getViewport({ scale: TEKEN_SCHAAL });
                const basis = page.getViewport({ scale: 1 });

                const pagina = document.createElement('div');
                pagina.className = 'pdf-page';
                pagina.dataset.basisbreedte = String(basis.width);

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d')!;
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                await page.render({ canvasContext: context, viewport }).promise;
                if (geannuleerd) return;
                pagina.appendChild(canvas);

                const tekstlaag = document.createElement('div');
                tekstlaag.className = 'textLayer';
                pagina.appendChild(tekstlaag);

                const tekst = await page.getTextContent();
                if (geannuleerd) return;

                // Het adres blijft gewoon in de tekening staan; het gaat alleen
                // niet mee de tekstlaag in, want die is machineleesbaar.
                const items = emailVervanging
                    ? zonderEmail(tekst.items as { str?: string }[], emailVervanging)
                    : tekst.items;

                await renderTextLayer({
                    textContentSource: { ...tekst, items } as typeof tekst,
                    container: tekstlaag,
                    viewport: basis,
                }).promise;
                if (geannuleerd) return;

                container.appendChild(pagina);
                meter?.observe(pagina);
            }

            container.style.minHeight = '';
            schaalTekstlagen();
        };

        // Zonder dit mislukt het tekenen in stilte en zie je alleen een lege
        // plek waar het cv hoort. Het oude cv gaat er dan ook uit: bij een
        // taalwissel die strandt bleef anders het vorige cv staan onder een
        // downloadknop en een aria-label van de andere taal.
        laadEnTeken().catch((fout) => {
            if (geannuleerd) return;
            if (!nieuweStandBegonnen) container.innerHTML = '';
            container.style.minHeight = '';
            console.error('Het cv kon niet getekend worden:', fout);
        });

        return () => {
            geannuleerd = true;
            meter?.disconnect();
            // Stopt de worker en gooit het geparste document weg. De lopende
            // render verwerpt daardoor; dat is precies wat we willen en de
            // catch hierboven zwijgt erover omdat `geannuleerd` al staat.
            taak?.destroy().catch(() => undefined);
        };
    }, [url, emailVervanging]);

    return <div className="pdf-pages" ref={containerRef} aria-label={label} />;
};

export default PdfWithTextLayer;
