import React from 'react';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import './CVDisplay.scss';
import PdfWithTextLayer from '../../utils/PdfWithTextLayer';

export const CVdocumentUrl = process.env.NODE_ENV === 'production'
    ? '/CV-Aart-den-Braber-EN.pdf'
    : '/CV-DUMMY.pdf'

const CVDisplay: React.FC = () => {
    return (
        <section className="page-content showcase" id="portfolio">
            <div className="js-pdf-cv pdf-cv">
                <div className="big-bad-button hide-outside-pdf-viewer"><span className="pdf-download-button-container js-pdf-download-button-container"> <a href={CVdocumentUrl} target="_blank" rel="noopener noreferrer"><span className="little-span"><span className="action-word">Download</span> CV as PDF</span></a></span></div>
            </div>

            <PdfWithTextLayer />
        </section>
    );
};

export default CVDisplay;

