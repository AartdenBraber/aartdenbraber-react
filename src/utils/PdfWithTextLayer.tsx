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
}

/** Waarop het canvas getekend wordt. Hoger levert scherpere letters bij zoomen. */
const TEKEN_SCHAAL = 1.5;

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
const PdfWithTextLayer: React.FC<PdfWithTextLayerProps> = ({ url, label }) => {
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

        const laadEnTeken = async () => {
            const pdf = await getDocument(url).promise;
            if (geannuleerd) return;

            // Meteen leegmaken, zodat bij een taalwissel niet het oude cv blijft
            // staan terwijl het nieuwe nog getekend wordt.
            meter?.disconnect();
            container.innerHTML = '';

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

                await renderTextLayer({
                    textContentSource: tekst,
                    container: tekstlaag,
                    viewport: basis,
                }).promise;
                if (geannuleerd) return;

                container.appendChild(pagina);
                meter?.observe(pagina);
            }

            schaalTekstlagen();
        };

        // Zonder dit mislukt het tekenen in stilte en zie je alleen een lege
        // plek waar het cv hoort.
        laadEnTeken().catch((fout) => {
            if (geannuleerd) return;
            console.error('Het cv kon niet getekend worden:', fout);
        });

        return () => {
            geannuleerd = true;
            meter?.disconnect();
        };
    }, [url]);

    return <div className="pdf-pages" ref={containerRef} aria-label={label} />;
};

export default PdfWithTextLayer;
