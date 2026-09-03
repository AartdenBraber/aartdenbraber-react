import React from 'react';
import './CVDisplay.scss';
import PdfWithTextLayer from '../../utils/PdfWithTextLayer';
import { useLanguage } from '../../i18n/LanguageContext';

const CVDisplay: React.FC = () => {
    const { t } = useLanguage();

    return (
        <section className="page-content showcase" id="portfolio">
            <div className="js-pdf-cv pdf-cv">
                <div className="big-bad-button hide-outside-pdf-viewer">
                    <span className="pdf-download-button-container js-pdf-download-button-container">
                        {' '}
                        <a href={t.cv.url} target="_blank" rel="noopener noreferrer">
                            <span className="little-span">
                                <span className="action-word">{t.cv.actionWord}</span>
                                {t.cv.rest}
                            </span>
                        </a>
                    </span>
                </div>
            </div>

            <PdfWithTextLayer url={t.cv.url} />
        </section>
    );
};

export default CVDisplay;
