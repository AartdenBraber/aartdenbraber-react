import React, { useEffect, useRef } from 'react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

// De worker komt van ons eigen domein en niet van een cdn. Valt zo'n cdn weg,
// dan blijft de plek waar het cv hoort namelijk leeg, en dat is vrijwel de hele
// pagina. scripts/copy-pdf-worker.js zet het bestand voor elke build klaar.
GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.js`;

interface PdfWithTextLayerProps {
    url: string;
}

/**
 * Tekent elke pagina van het pdf op een eigen canvas. Bij een taalwissel komt
 * er een ander adres binnen; dan moet het oude canvas weg en het nieuwe cv
 * ervoor in de plaats. De vlag `geannuleerd` zorgt dat een halfklare tekening
 * van het vorige pdf niet alsnog tussen de nieuwe pagina's belandt.
 */
const PdfWithTextLayer: React.FC<PdfWithTextLayerProps> = ({ url }) => {
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        let geannuleerd = false;

        const container = containerRef.current;
        if (!container) return;

        const laadEnTeken = async () => {
            const pdf = await getDocument(url).promise;
            if (geannuleerd) return;

            // Meteen leegmaken, zodat bij een taalwissel niet het oude cv blijft
            // staan terwijl het nieuwe nog getekend wordt.
            container.innerHTML = '';

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                if (geannuleerd) return;

                const viewport = page.getViewport({ scale: 1.5 });

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d')!;
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                await page.render({ canvasContext: context, viewport }).promise;
                if (geannuleerd) return;

                container.appendChild(canvas);
            }
        };

        // Zonder dit mislukt het tekenen in stilte en zie je alleen een lege
        // plek waar het cv hoort.
        laadEnTeken().catch((fout) => {
            if (geannuleerd) return;
            console.error('Het cv kon niet getekend worden:', fout);
        });

        return () => {
            geannuleerd = true;
        };
    }, [url]);

    return <div ref={containerRef} />;
};

export default PdfWithTextLayer;
