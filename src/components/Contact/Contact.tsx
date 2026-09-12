import React, { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import './Contact.scss';
import { SiteContent } from '../../content';
import { useRevealOnView } from '../../hooks/useRevealOnView';
import { useLanguage } from '../../i18n/LanguageContext';

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

/** Dezelfde foto als in de hero, dus die staat al in de cache; zie .contact-paneel-kop. */
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
                <p className="contact-verzonden-kop">{tekst.verzonden.titel}</p>
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

/** Wie om minder beweging vraagt, krijgt het paneel meteen weg in plaats van weggeschoven. */
const minderBeweging = (): boolean =>
    typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Iets langer dan het wegschuiven in Contact.scss: een vangnet voor als animationend uitblijft. */
const WEGSCHUIVEN_VANGNET_MS = 450;

/**
 * Het paneel dat over de pagina schuift. Een echte `<dialog>` met showModal:
 * de rest van de pagina is dan niet te bereiken met tab of een schermlezer, en
 * Escape sluit hem. Jsdom kent showModal niet; daar zet het `open` zelf.
 *
 * De dialoog beslaat het hele scherm en is zelf doorzichtig; wat je ziet is het
 * venster erin. Zo hoort de strook naast het venster bij de dialoog: die krijgt
 * een eigen cursor, en een klik daar is zeker een klik naast het venster.
 */
const Paneel: React.FC = () => {
    const { t } = useLanguage();
    const { open, sluitPaneel, bron } = useContactPaneel();
    const tekst = t.contact;

    const dialoogRef = useRef<HTMLDialogElement>(null);
    const vensterRef = useRef<HTMLDivElement>(null);
    const sluitknopRef = useRef<HTMLButtonElement>(null);
    const vorigeFocus = useRef<HTMLElement | null>(null);
    const drukBegonNaastVenster = useRef(false);
    const stopWegschuiven = useRef<(() => void) | null>(null);

    useEffect(() => {
        const dialoog = dialoogRef.current;
        if (!dialoog) return;

        const staatOpen = dialoog.hasAttribute('open');

        // Terug naar de knop waarmee het paneel openging, zodat wie met het
        // toetsenbord werkt verder kan waar hij was.
        const herstelFocus = () => {
            const terug = vorigeFocus.current;
            vorigeFocus.current = null;
            if (terug?.isConnected) terug.focus();
        };

        if (open) {
            // Weer geopend terwijl hij nog wegschoof: dan blijft hij gewoon staan.
            if (stopWegschuiven.current) {
                stopWegschuiven.current();
                return;
            }
            if (staatOpen) return;

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

        if (!staatOpen) {
            herstelFocus();
            return;
        }
        if (stopWegschuiven.current) return;

        const dicht = () => {
            stopWegschuiven.current?.();
            if (typeof dialoog.close === 'function') dialoog.close();
            else dialoog.removeAttribute('open');
            herstelFocus();
        };

        if (typeof dialoog.showModal !== 'function' || minderBeweging()) {
            dicht();
            return;
        }

        // Eerst wegschuiven, dan pas dicht. De dialoog blijft zo lang open, dus de
        // pagina eronder blijft ook zo lang op slot en springt niet.
        const venster = vensterRef.current;
        const opEinde = (event: AnimationEvent) => {
            if (event.target === venster) dicht();
        };
        const vangnet = window.setTimeout(dicht, WEGSCHUIVEN_VANGNET_MS);

        venster?.addEventListener('animationend', opEinde);
        dialoog.setAttribute('data-sluit', '');

        stopWegschuiven.current = () => {
            window.clearTimeout(vangnet);
            venster?.removeEventListener('animationend', opEinde);
            dialoog.removeAttribute('data-sluit');
            stopWegschuiven.current = null;
        };
    }, [open, bron]);

    // Verdwijnt het paneel uit de pagina terwijl het wegschuift, dan mag het
    // vangnet daarna niet alsnog afgaan.
    useEffect(() => {
        const wegschuiven = stopWegschuiven;
        return () => wegschuiven.current?.();
    }, []);

    // Escape: de browser zou de dialoog meteen weghalen. Hier schuift hij weg,
    // net als bij de andere manieren van sluiten. Staat de browser dat niet toe,
    // dan sluit hij toch, en die melding moet terug naar de staat.
    useEffect(() => {
        const dialoog = dialoogRef.current;
        if (!dialoog) return;

        const opEscape = (event: Event) => {
            event.preventDefault();
            sluitPaneel();
        };

        dialoog.addEventListener('cancel', opEscape);
        dialoog.addEventListener('close', sluitPaneel);
        return () => {
            dialoog.removeEventListener('cancel', opEscape);
            dialoog.removeEventListener('close', sluitPaneel);
        };
    }, [sluitPaneel]);

    // Een klik naast het venster sluit het paneel. Alleen als de klik daar ook
    // begon: wie tekst selecteert en naast het venster loslaat, wil het niet dicht.
    const drukOmlaag = (event: React.MouseEvent<HTMLDialogElement>) => {
        drukBegonNaastVenster.current = event.target === event.currentTarget;
    };
    const klik = (event: React.MouseEvent<HTMLDialogElement>) => {
        if (drukBegonNaastVenster.current && event.target === event.currentTarget) sluitPaneel();
        drukBegonNaastVenster.current = false;
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
            <div ref={vensterRef} className="contact-venster">
                {/* Bovenin een rustig stukje hero: dezelfde wazige foto, met de kop
                    tussen de dunne streepjes erboven en eronder. Het enige dat hier
                    beweegt is het venster zelf. */}
                <div
                    className="contact-paneel-kop"
                    style={{ '--kop-foto': `url(${HERO_FOTO})` } as React.CSSProperties}
                >
                    <div className="contact-paneel-kop-inhoud">
                        <h2 id="contact-kop" className="contact-kop">
                            {tekst.titel}
                        </h2>
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
