import React, { useEffect, useRef, useState } from 'react';
import { getDocument, GlobalWorkerOptions, PDFDocumentProxy } from 'pdfjs-dist';
import { CVdocumentUrl } from '../components/CVDisplay/CVDisplay';

GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

const PdfWithTextLayer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const hasRenderedRef = useRef(false);

  useEffect(() => {
    getDocument(CVdocumentUrl).promise.then(setPdf);
  }, []);

  useEffect(() => {
    if (!pdf || !containerRef.current || hasRenderedRef.current) return;

    hasRenderedRef.current = true;
    containerRef.current.innerHTML = ''; // clear previous render

    const renderAllPages = async () => {
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const scale = 1.5;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;
        containerRef.current!.appendChild(canvas);
      }
    };

    renderAllPages();
  }, [pdf]);

  return <div ref={containerRef} />;
};

export default PdfWithTextLayer;
