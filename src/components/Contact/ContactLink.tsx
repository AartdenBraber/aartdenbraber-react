import React from 'react';
import './ContactLink.scss';
import { useLanguage } from '../../i18n/LanguageContext';
import { useContactformulier } from './ContactformulierContext';
import { useContactPaneel } from './ContactPaneelContext';

/**
 * Het zoeklicht in de knop volgt de muis. De plek gaat als twee eigen
 * eigenschappen naar de opmaak; zie ContactLink.scss. Zonder muis, bij focus
 * met het toetsenbord, staat het licht in het midden.
 */
const volgMuis = (event: React.PointerEvent<HTMLButtonElement>) => {
    const knop = event.currentTarget;
    const vak = knop.getBoundingClientRect();
    knop.style.setProperty('--licht-x', `${event.clientX - vak.left}px`);
    knop.style.setProperty('--licht-y', `${event.clientY - vak.top}px`);
};

/**
 * Een knop die het contactpaneel opent. Staat er alleen als het formulier er
 * ook staat.
 *
 * Een knop en geen link: hij gaat nergens heen, hij opent iets op deze plek.
 * `balk` hoort in de balk bovenin, naast de taalwisselaar. `intro` staat onder
 * de introductie en onder het cv.
 */
const ContactLink: React.FC<{ variant: 'balk' | 'intro' }> = ({ variant }) => {
    const { t } = useLanguage();
    const { status } = useContactformulier();
    const { openPaneel } = useContactPaneel();

    if (status !== 'beschikbaar') return null;

    if (variant === 'intro') {
        return (
            <button
                type="button"
                className="contact-link contact-link--intro"
                aria-haspopup="dialog"
                onClick={(event) => openPaneel(event.currentTarget)}
                onPointerMove={volgMuis}
            >
                <span className="contact-link-tekst">{t.contact.introLink}</span>
                <span className="contact-link-pijl" aria-hidden="true" />
            </button>
        );
    }

    return (
        <button
            type="button"
            className="contact-link contact-link--balk"
            aria-haspopup="dialog"
            onClick={(event) => openPaneel(event.currentTarget)}
        >
            <svg
                className="contact-link-icoon"
                aria-hidden="true"
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3.5 7 8.5 6 8.5-6" />
            </svg>
            <span className="contact-link-label">{t.contact.link}</span>
        </button>
    );
};

export default ContactLink;
