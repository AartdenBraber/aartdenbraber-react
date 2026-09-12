import React, { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import './Contact.scss';
import { SiteContent } from '../../content';
import { useRevealOnView } from '../../hooks/useRevealOnView';
import { useLanguage } from '../../i18n/LanguageContext';
import { Antwoord, ONDERWERPEN, Onderwerp, Veld, verstuurBericht } from './contactApi';
import { useContactformulier } from './ContactformulierContext';
import { useTurnstile } from './useTurnstile';

/** De kop en de inleiding komen binnen zoals die van de intro. Het formulier staat er meteen. */
const TE_ONTHULLEN = '.contact-kop, .contact-intro';

/**
 * Zo lang wacht het versturen op het token van Turnstile. Normaal is dat er
 * binnen een seconde, maar wie meteen op versturen klikt kan er net voor zitten.
 */
const TURNSTILE_WACHTTIJD_MS = 15000;

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

const Formulier: React.FC = () => {
    const { t, language } = useLanguage();
    const { haalToken, turnstileSitekey } = useContactformulier();
    const tekst = t.contact;

    const sectieRef = useRef<HTMLElement>(null);
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
    useRevealOnView(sectieRef, TE_ONTHULLEN);

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

    return (
        <section ref={sectieRef} id="contact" className="contact" aria-labelledby="contact-kop">
            <div className="contact-binnen">
                <h2 id="contact-kop" className="contact-kop">
                    {tekst.titel}
                </h2>
                <p className="contact-intro">{tekst.intro}</p>

                {fase === 'verzonden' ? (
                    <div ref={bevestigingRef} className="contact-verzonden" role="status" tabIndex={-1}>
                        <p className="contact-verzonden-kop">{tekst.verzonden.titel}</p>
                        <p>{tekst.verzonden.tekst}</p>
                    </div>
                ) : (
                    <form
                        ref={formulierRef}
                        className="contact-formulier"
                        onSubmit={verstuur}
                        onFocus={turnstile.start}
                    >
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
                                {tekst.velden.onderwerp}{' '}
                                <span className="contact-optioneel">{tekst.velden.optioneel}</span>
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

                        {/* Het lokveld; zie public/contact.php. Buiten beeld en niet
                            op display: none, want eenvoudige bots slaan velden over
                            die er verborgen uitzien. Niet te bereiken met tab, niet
                            voorgelezen en niet automatisch ingevuld. */}
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
                            </button>
                            <p className="contact-privacy">
                                {tekst.privacy}
                                {turnstileSitekey ? ` ${tekst.turnstile}` : ''}
                            </p>
                        </div>
                    </form>
                )}
            </div>
        </section>
    );
};

/** Het formulier staat er pas als contact.php klaarstaat; zie ContactformulierContext. */
const Contact: React.FC = () => {
    const { status } = useContactformulier();
    return status === 'beschikbaar' ? <Formulier /> : null;
};

export default Contact;
