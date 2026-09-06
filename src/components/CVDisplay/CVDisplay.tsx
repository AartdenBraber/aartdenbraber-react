import React from 'react';
import './CVDisplay.scss';
import PdfWithTextLayer from '../../utils/PdfWithTextLayer';
import PinchZoom from '../PinchZoom/PinchZoom';
import { useLanguage } from '../../i18n/LanguageContext';

/**
 * De downloadknop doet met opzet niet mee aan het onthullen bij het scrollen.
 * Hij hoort boven het cv te blijven staan zolang je daarin bent, dus daar hoort
 * geen moment bij waarop hij er nog niet is.
 *
 * Hij stond daarvoor `position: fixed` op een lage laag, waarbij de hero en de
 * intro hem afdekten. Daardoor stond hij ook op de pagina's waar je hem niet
 * zag: onzichtbaar, maar wel als vierde stop in de tabvolgorde. Nu is het
 * `position: sticky` binnen dit blok zelf. Hij zweeft dus nog steeds boven de
 * cv-pagina's, maar hij bestaat alleen hier.
 */
const CVDisplay: React.FC = () => {
    const { t } = useLanguage();

    return (
        <section className="page-content showcase" id="portfolio" aria-label={t.cv.sectionLabel}>
            {/* Op een telefoon staat het cv op ongeveer veertig procent van zijn
                eigen maat. Met twee vingers is het te vergroten zonder dat de
                rest van de pagina meegroeit. */}
            <PinchZoom>
                <PdfWithTextLayer
                    url={t.cv.url}
                    label={t.cv.sectionLabel}
                    emailVervanging={t.cv.emailVerborgen}
                />
            </PinchZoom>

            <div className="big-bad-button">
                <span className="pdf-download-button-container js-pdf-download-button-container">
                    <a href={t.cv.url} target="_blank" rel="noopener noreferrer nofollow">
                        <span className="little-span">
                            <span className="action-word">{t.cv.actionWord}</span>
                            {t.cv.rest}
                        </span>
                    </a>
                </span>
            </div>
        </section>
    );
};

export default CVDisplay;
