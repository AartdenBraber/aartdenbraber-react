import React from 'react';
import './ContactLink.scss';
import { useLanguage } from '../../i18n/LanguageContext';
import { useContactformulier } from './ContactformulierContext';

/**
 * Een link naar het formulier onder het cv. Staat er alleen als het formulier
 * er ook staat.
 *
 * `balk` hoort in de balk bovenin, naast de taalwisselaar. `intro` staat onder
 * de introductie, dus boven het cv: wie een website zoekt, hoeft niet eerst
 * langs ruim twintigduizend pixels cv om het formulier te vinden.
 */
const ContactLink: React.FC<{ variant: 'balk' | 'intro' }> = ({ variant }) => {
    const { t } = useLanguage();
    const { status } = useContactformulier();

    if (status !== 'beschikbaar') return null;

    if (variant === 'intro') {
        return (
            <a className="contact-link contact-link--intro" href="#contact">
                {t.contact.introLink}
            </a>
        );
    }

    return (
        <a className="contact-link contact-link--balk" href="#contact">
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
        </a>
    );
};

export default ContactLink;
