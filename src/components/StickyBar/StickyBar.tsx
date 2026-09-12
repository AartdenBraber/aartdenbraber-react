import React, { useEffect, useState } from 'react';
import './StickyBar.scss';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import ContactLink from '../Contact/ContactLink';
import { useLanguage } from '../../i18n/LanguageContext';

/**
 * Een smalle balk die verschijnt zodra de hero uit beeld is.
 *
 * De header staat absoluut in de hero en is daarna voorgoed weg. Op een pagina
 * van ruim twintigduizend pixels betekende dat: geen naam meer, geen weg terug
 * naar boven, en geen taalwissel. Wie halverwege het cv merkte dat hij liever
 * Engels leest, moest helemaal terugscrollen.
 *
 * De balk staat er alleen als hij nodig is. `hidden` en niet alleen een andere
 * kleur, zodat de knoppen erin ook echt niet in de tabvolgorde staan zolang de
 * hero in beeld is.
 */
const StickyBar: React.FC = () => {
    const { t } = useLanguage();
    const [zichtbaar, setZichtbaar] = useState(false);

    useEffect(() => {
        const hero = document.querySelector('.top-hero');
        if (!hero) return;

        // Zonder waarnemer blijft de balk weg. Dat is de veilige kant: de
        // pagina werkt zonder hem, hij zou alleen boven de hero komen te hangen
        // waar hij niets toevoegt.
        if (typeof IntersectionObserver === 'undefined') return;

        const waarnemer = new IntersectionObserver(
            // De laatste melding en niet de eerste: een waarnemer kan er
            // meerdere tegelijk afleveren als de hoofdthread bezet was met het
            // tekenen van het cv, en dan is de oudste achterhaald.
            (meldingen) => setZichtbaar(!meldingen[meldingen.length - 1].isIntersecting),
            { threshold: 0 },
        );
        waarnemer.observe(hero);

        return () => waarnemer.disconnect();
    }, []);

    return (
        <div className="sticky-bar" hidden={!zichtbaar}>
            <a className="sticky-bar-naam" href="#top">
                <span className="sticky-bar-pijl" aria-hidden="true"></span>
                <span className="sticky-bar-tekst">Aart den Braber</span>
                <span className="visueel-verborgen">, {t.nav.backToTop.toLowerCase()}</span>
            </a>
            <div className="sticky-bar-acties">
                <ContactLink variant="balk" />
                <LanguageSwitcher />
            </div>
        </div>
    );
};

export default StickyBar;
