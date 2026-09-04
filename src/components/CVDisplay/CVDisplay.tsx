import React from 'react';
import './CVDisplay.scss';
import PdfWithTextLayer from '../../utils/PdfWithTextLayer';
import PinchZoom from '../PinchZoom/PinchZoom';
import { useLanguage } from '../../i18n/LanguageContext';

/**
 * De downloadknop doet met opzet niet mee aan het onthullen bij het scrollen.
 * Hij staat vast onderin beeld boven het cv, dus daar hoort geen moment bij
 * waarop hij er nog niet is; hij moet altijd zichtbaar zijn.
 */
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

            {/* Op een telefoon staat het cv op ongeveer veertig procent van zijn
                eigen maat. Met twee vingers is het te vergroten zonder dat de
                rest van de pagina meegroeit. */}
            <PinchZoom>
                <PdfWithTextLayer url={t.cv.url} />
            </PinchZoom>
        </section>
    );
};

export default CVDisplay;
