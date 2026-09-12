import React, { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import './Contact.scss';
import { SiteContent } from '../../content';
import { useRevealOnView } from '../../hooks/useRevealOnView';
import { useLanguage } from '../../i18n/LanguageContext';
import FocusSpotlight from '../FocusSpotlight/FocusSpotlight';
import WordReveal from '../WordReveal/WordReveal';
import '../WordReveal/WordReveal.scss';
import { Antwoord, ONDERWERPEN, Onderwerp, Veld, verstuurBericht } from './contactApi';
import ContactLink from './ContactLink';
import { useContactformulier } from './ContactformulierContext';
import { PANEEL_HASH, useContactPaneel } from './ContactPaneelContext';
import { useTurnstile } from './useTurnstile';

/** De afsluiter onder het cv komt binnen zoals de intro. */
const TE_ONTHULLEN = '.contact-afsluiter-kop, .contact-afsluiter-tekst, .contact-link';

/**
 * Zo lang wacht het versturen op het token van Turnstile. Normaal is dat er
 * binnen een seconde, maar wie meteen op versturen klikt kan er net voor zitten.
 */
const TURNSTILE_WACHTTIJD_MS = 15000;

/** Dezelfde foto als in de hero, dus die staat al in de cache. */
const HERO_FOTO = '/images/top-bg.jpg';

const VELDEN: Veld[] = ['naam', 'email', 'onderwerp', 'bericht'];

interface Waarden {
    naam: string;
    email: string;
    onderwerp: Onderwerp | '';
    bericht: string;
}

type Fase = 'invullen' | 'versturen' | 'verzonden';
type Fouten = SiteContent['contact']['fouten'];

/** De server stuurt per veld een code; de tekst erbij staat per taal in content. */
const veldfout = (fouten: Fouten, veld: Veld, code: string): string => {
    const perVeld: Record<string, string> = fouten[veld];
    return perVeld[code === 'te_lang' ? 'teLang' : code] ?? perVeld.ongeldig;
};

const melding = (fouten: Fouten, code: string): string => {
    if (code === 'te_veel') return fouten.teVeel;
    if (code === 'botcheck_mislukt') return fouten.botcheck;
    return fouten.algemeen;
};

/**
 * Het formulier zelf. Het blijft in de pagina staan als het paneel dicht is,
 * zodat wie het per ongeluk sluit zijn tekst niet kwijt is.
 */
const Formulier: React.FC = () => {
    const { t, language } = useLanguage();
    const { haalToken, turnstileSitekey } = useContactformulier();
    const tekst = t.contact;

    const formulierRef = useRef<HTMLFormElement>(null);
    const faxRef = useRef<HTMLInputElement>(null);
    const turnstileRef = useRef<HTMLDivElement>(null);
    const bevestigingRef = useRef<HTMLDivElement>(null);
    const bezig = useRef(false);

    const [waarden, setWaarden] = useState<Waarden>({ naam: '', email: '', onderwerp: '', bericht: '' });
    const [fase, setFase] = useState<Fase>('invullen');
    const [veldfouten, setVeldfouten] = useState<NonNullable<Antwoord['velden']>>({});
    const [foutcode, setFoutcode] = useState<string | null>(null);

    const turnstile = useTurnstile(turnstileSitekey, language, turnstileRef);

    // Het formulier verdwijnt na het versturen. Zonder dit staat de focus
    // nergens meer en hoort een schermlezer niet dat het gelukt is.
    useEffect(() => {
        if (fase === 'verzonden') bevestigingRef.current?.focus();
    }, [fase]);

    const wijzig =
        (veld: keyof Waarden) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const waarde = event.target.value;
            setWaarden((vorige) => ({ ...vorige, [veld]: waarde }));

            // De fout van dit veld verdwijnt zodra je het aanpast.
            setVeldfouten((vorige) => {
                if (!vorige[veld as Veld]) return vorige;
                const zonder = { ...vorige };
                delete zonder[veld as Veld];
                return zonder;
            });
        };

    const verstuur = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // Een ref en niet de fase: twee klikken in hetzelfde frame zien allebei
        // nog de oude fase.
        if (bezig.current) return;
        bezig.current = true;

        setFase('versturen');
        setVeldfouten({});
        setFoutcode(null);

        let antwoord: Antwoord = { ok: false, code: 'netwerk' };

        // Wijst de server het token af, bijvoorbeeld omdat het tabblad langer
        // dan zes uur openstond, dan nog één keer met een vers token.
        for (let poging = 0; poging < 2; poging += 1) {
            let token: string;
            try {
                token = await haalToken(poging > 0);
            } catch {
                break;
            }

            const turnstileToken = await turnstile.wachtOpToken(TURNSTILE_WACHTTIJD_MS);
            antwoord = await verstuurBericht({
                ...waarden,
                taal: language,
                antibot: {
                    challenge: token,
                    honeypot: faxRef.current?.value ?? '',
                    turnstile: turnstileToken,
                },
            });
            if (antwoord.ok) break;

            turnstile.vernieuw();
            if (!antwoord.code?.startsWith('challenge_')) break;
        }

        bezig.current = false;

        if (antwoord.ok) {
            // Het formulier en daarmee de plek van de widget verdwijnen zo meteen.
            turnstile.verwijder();
            setFase('verzonden');
            return;
        }

        const velden = antwoord.code === 'ongeldig' ? antwoord.velden ?? {} : {};
        const eersteFout = VELDEN.find((veld) => velden[veld]);
        const code = antwoord.code ?? 'netwerk';

        // Eerst de foutregels in de pagina, dan pas de focus. Anders staat de
        // beschrijving er nog niet als het veld voorgelezen wordt.
        flushSync(() => {
            setFase('invullen');
            setVeldfouten(velden);
            setFoutcode(eersteFout ? null : code);
        });

        if (eersteFout) {
            formulierRef.current?.querySelector<HTMLElement>(`[name="${eersteFout}"]`)?.focus();
        }
    };

    const foutId = (veld: Veld) => `contact-${veld}-fout`;
    const beschrijving = (veld: Veld) => (veldfouten[veld] ? foutId(veld) : undefined);
    const foutregel = (veld: Veld) => {
        const code = veldfouten[veld];
        if (!code) return null;

        return (
            <p id={foutId(veld)} className="contact-fout">
                {veldfout(tekst.fouten, veld, code)}
            </p>
        );
    };

    if (fase === 'verzonden') {
        return (
            <div ref={bevestigingRef} className="contact-verzonden" role="status" tabIndex={-1}>
                {/* Komt als één regel omhoog uit een venstertje, met dezelfde
                    beweging als de koppen; zie WordReveal.scss. */}
                <p className="contact-verzonden-kop">
                    <span className="word-mask">
                        <span className="word">{tekst.verzonden.titel}</span>
                    </span>
                </p>
                <p>{tekst.verzonden.tekst}</p>
            </div>
        );
    }

    return (
        <form ref={formulierRef} className="contact-formulier" onSubmit={verstuur} onFocus={turnstile.start}>
            <div className="contact-rij">
                <div className="contact-veld">
                    <label className="contact-label" htmlFor="contact-naam">
                        {tekst.velden.naam}
                    </label>
                    <input
                        id="contact-naam"
                        className="contact-invoer"
                        name="naam"
                        type="text"
                        autoComplete="name"
                        required
                        maxLength={100}
                        value={waarden.naam}
                        onChange={wijzig('naam')}
                        aria-invalid={veldfouten.naam ? true : undefined}
                        aria-describedby={beschrijving('naam')}
                    />
                    {foutregel('naam')}
                </div>

                <div className="contact-veld">
                    <label className="contact-label" htmlFor="contact-email">
                        {tekst.velden.email}
                    </label>
                    <input
                        id="contact-email"
                        className="contact-invoer"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        maxLength={254}
                        value={waarden.email}
                        onChange={wijzig('email')}
                        aria-invalid={veldfouten.email ? true : undefined}
                        aria-describedby={beschrijving('email')}
                    />
                    {foutregel('email')}
                </div>
            </div>

            <fieldset className="contact-veld contact-onderwerpen" aria-describedby={beschrijving('onderwerp')}>
                <legend className="contact-label">
                    {tekst.velden.onderwerp} <span className="contact-optioneel">{tekst.velden.optioneel}</span>
                </legend>
                <div className="contact-keuzes">
                    {ONDERWERPEN.map((onderwerp) => (
                        <label key={onderwerp} className="contact-keuze">
                            <input
                                type="radio"
                                name="onderwerp"
                                value={onderwerp}
                                checked={waarden.onderwerp === onderwerp}
                                onChange={wijzig('onderwerp')}
                            />
                            <span>{tekst.onderwerpen[onderwerp]}</span>
                        </label>
                    ))}
                </div>
                {foutregel('onderwerp')}
            </fieldset>

            <div className="contact-veld">
                <label className="contact-label" htmlFor="contact-bericht">
                    {tekst.velden.bericht}
                </label>
                <textarea
                    id="contact-bericht"
                    className="contact-invoer contact-bericht"
                    name="bericht"
                    required
                    maxLength={5000}
                    rows={6}
                    value={waarden.bericht}
                    onChange={wijzig('bericht')}
                    aria-invalid={veldfouten.bericht ? true : undefined}
                    aria-describedby={beschrijving('bericht')}
                />
                {foutregel('bericht')}
            </div>

            {/* Het lokveld; zie public/contact.php. Buiten beeld en niet op
                display: none, want eenvoudige bots slaan velden over die er
                verborgen uitzien. Niet te bereiken met tab, niet voorgelezen en
                niet automatisch ingevuld. */}
            <div className="contact-fax" aria-hidden="true">
                <label>
                    Fax
                    <input ref={faxRef} type="text" name="fax" tabIndex={-1} autoComplete="off" defaultValue="" />
                </label>
            </div>

            <div ref={turnstileRef} className="contact-turnstile" />

            {foutcode && (
                <p className="contact-fout contact-melding" role="alert">
                    {melding(tekst.fouten, foutcode)}
                </p>
            )}

            <div className="contact-verstuur">
                <button type="submit" className="contact-knop" aria-disabled={fase === 'versturen'}>
                    {fase === 'versturen' ? tekst.bezig : tekst.versturen}
                    {fase !== 'versturen' && <span className="contact-knop-pijl" aria-hidden="true" />}
                </button>
                <p className="contact-privacy">{tekst.privacy}</p>
            </div>
        </form>
    );
};

/**
 * Het paneel dat over de pagina schuift. Een echte `<dialog>` met showModal:
 * de rest van de pagina is dan niet te bereiken met tab of een schermlezer, en
 * Escape sluit hem. Jsdom kent showModal niet; daar zet het `open` zelf.
 */
const Paneel: React.FC = () => {
    const { t } = useLanguage();
    const { open, sluitPaneel, bron } = useContactPaneel();
    const tekst = t.contact;

    const dialoogRef = useRef<HTMLDialogElement>(null);
    const sluitknopRef = useRef<HTMLButtonElement>(null);
    const vorigeFocus = useRef<HTMLElement | null>(null);
    const drukBegonOpAchtergrond = useRef(false);

    useEffect(() => {
        const dialoog = dialoogRef.current;
        if (!dialoog) return;

        const staatOpen = dialoog.hasAttribute('open');

        if (open && !staatOpen) {
            vorigeFocus.current =
                bron.current ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);

            // De breedte van de schuifbalk, gemeten voordat die verdwijnt als de
            // pagina op slot gaat; zie Contact.scss.
            const schuifbalk = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
            document.documentElement.style.setProperty('--contact-schuifbalk', `${schuifbalk}px`);

            if (typeof dialoog.showModal === 'function') dialoog.showModal();
            else dialoog.setAttribute('open', '');

            // De sluitknop en niet het eerste veld: op een telefoon zou dat
            // meteen het toetsenbord over de helft van het paneel leggen.
            sluitknopRef.current?.focus();
            return;
        }

        if (!open) {
            if (staatOpen) {
                if (typeof dialoog.close === 'function') dialoog.close();
                else dialoog.removeAttribute('open');
            }

            // Terug naar de knop waarmee het paneel openging, zodat wie met het
            // toetsenbord werkt verder kan waar hij was.
            const terug = vorigeFocus.current;
            vorigeFocus.current = null;
            if (terug?.isConnected) terug.focus();
        }
    }, [open, bron]);

    // Escape sluit de dialoog in de browser zelf. Die melding moet terug naar de
    // staat, anders denkt de pagina dat het paneel nog open is.
    useEffect(() => {
        const dialoog = dialoogRef.current;
        if (!dialoog) return;

        dialoog.addEventListener('close', sluitPaneel);
        return () => dialoog.removeEventListener('close', sluitPaneel);
    }, [sluitPaneel]);

    // Een klik op de donkere achtergrond sluit het paneel. Alleen als de klik
    // daar ook begon: wie tekst selecteert en buiten het paneel loslaat, wil
    // het niet dicht.
    const drukOmlaag = (event: React.MouseEvent<HTMLDialogElement>) => {
        drukBegonOpAchtergrond.current = event.target === event.currentTarget;
    };
    const klik = (event: React.MouseEvent<HTMLDialogElement>) => {
        if (drukBegonOpAchtergrond.current && event.target === event.currentTarget) sluitPaneel();
        drukBegonOpAchtergrond.current = false;
    };

    return (
        <dialog
            ref={dialoogRef}
            id={PANEEL_HASH.slice(1)}
            className="contact-paneel"
            aria-labelledby="contact-kop"
            onMouseDown={drukOmlaag}
            onClick={klik}
        >
            {/* Bovenin een stukje hero: dezelfde wazige foto met het zoeklicht,
                de kop die woord voor woord binnenkomt en de dunne streepjes
                erboven en eronder. Dat speelt bij elke keer openen opnieuw, want
                een dichte dialoog staat op display: none. */}
            <div className="contact-paneel-kop">
                <FocusSpotlight image={HERO_FOTO} />
                <div className="contact-paneel-kop-inhoud">
                    <WordReveal as="h2" id="contact-kop" className="contact-kop" text={tekst.titel} delay={180} />
                </div>
                <button
                    ref={sluitknopRef}
                    type="button"
                    className="contact-sluit"
                    aria-label={tekst.sluiten}
                    onClick={sluitPaneel}
                >
                    <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    >
                        <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                </button>
            </div>
            <div className="contact-paneel-binnen">
                <p className="contact-intro">{tekst.intro}</p>

                <Formulier />
            </div>
        </dialog>
    );
};

/**
 * Onder het cv. Wie het hele cv doorlas, komt hier uit en kan van daaruit het
 * paneel openen.
 */
const Afsluiter: React.FC = () => {
    const { t } = useLanguage();
    const sectieRef = useRef<HTMLElement>(null);

    useRevealOnView(sectieRef, TE_ONTHULLEN);

    return (
        <section ref={sectieRef} className="contact-afsluiter" aria-labelledby="contact-afsluiter-kop">
            <h2 id="contact-afsluiter-kop" className="contact-afsluiter-kop">
                {t.contact.titel}
            </h2>
            <p className="contact-afsluiter-tekst">{t.contact.afsluiter}</p>
            <ContactLink variant="intro" />
        </section>
    );
};

/** Beide staan er pas als contact.php klaarstaat; zie ContactformulierContext. */
export const ContactAfsluiter: React.FC = () => {
    const { status } = useContactformulier();
    return status === 'beschikbaar' ? <Afsluiter /> : null;
};

const ContactPaneel: React.FC = () => {
    const { status } = useContactformulier();
    return status === 'beschikbaar' ? <Paneel /> : null;
};

export default ContactPaneel;
