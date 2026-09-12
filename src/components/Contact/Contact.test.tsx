import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ContactPaneel from './Contact';
import ContactLink from './ContactLink';
import { ContactformulierProvider } from './ContactformulierContext';
import { ContactPaneelProvider } from './ContactPaneelContext';
import { LanguageProvider } from '../../i18n/LanguageContext';

interface Nepantwoord {
    status: number;
    inhoud: unknown;
    type?: string;
}

/** Wat het formulier naar contact.php stuurde, per POST. */
let verstuurd: Array<Record<string, any>> = [];

/** Een contact.php die de antwoorden in volgorde teruggeeft. */
const zetServer = (get: Nepantwoord[], post: Nepantwoord[] = []) => {
    verstuurd = [];

    const antwoord = ({ status, inhoud, type = 'application/json; charset=utf-8' }: Nepantwoord) => ({
        ok: status >= 200 && status < 300,
        status,
        headers: { get: (naam: string) => (naam.toLowerCase() === 'content-type' ? type : null) },
        json: async () => inhoud,
    });

    window.fetch = jest.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
        const rij = init?.method === 'POST' ? post : get;
        if (init?.method === 'POST') verstuurd.push(JSON.parse(String(init.body)));

        const volgende = rij.shift();
        if (!volgende) throw new Error(`Onverwacht verzoek: ${init?.method ?? 'GET'}`);
        return antwoord(volgende);
    }) as unknown as typeof fetch;
};

const uitnodiging = (token: string): Nepantwoord => ({
    status: 200,
    inhoud: { ok: true, token, minLeeftijdMs: 0, turnstileSitekey: null },
});

const toon = () =>
    render(
        <LanguageProvider>
            <ContactformulierProvider>
                <ContactPaneelProvider>
                    <ContactLink variant="intro" />
                    <ContactPaneel />
                </ContactPaneelProvider>
            </ContactformulierProvider>
        </LanguageProvider>,
    );

const paneel = () => document.getElementById('contact');

const openPaneel = async () => {
    fireEvent.click(await screen.findByRole('button', { name: 'Stuur me een bericht' }));
    await waitFor(() => expect(paneel()).toHaveAttribute('open'));
};

const vulIn = () => {
    fireEvent.change(screen.getByLabelText('Naam'), { target: { value: 'Jan Jansen' } });
    fireEvent.change(screen.getByLabelText('E-mailadres'), { target: { value: 'jan@example.com' } });
    fireEvent.click(screen.getByRole('radio', { name: 'Een nieuwe website' }));
    fireEvent.change(screen.getByLabelText('Bericht'), { target: { value: 'Ik zoek een nieuwe website.' } });
};

const verstuur = () => fireEvent.click(screen.getByRole('button', { name: 'Versturen' }));

beforeEach(() => window.history.pushState({}, '', '/'));
afterEach(() => {
    delete (window as { fetch?: unknown }).fetch;
});

describe('het contactpaneel', () => {
    it('blijft weg, met de knop, als contact.php geen JSON teruggeeft', async () => {
        const waarschuwing = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
        zetServer([{ status: 200, inhoud: null, type: 'application/x-httpd-php' }]);

        toon();

        await waitFor(() => expect(waarschuwing).toHaveBeenCalled());
        expect(screen.queryByRole('button', { name: 'Stuur me een bericht' })).not.toBeInTheDocument();
        expect(paneel()).toBeNull();
        waarschuwing.mockRestore();
    });

    it('gaat open met de knop en zet de focus op sluiten', async () => {
        zetServer([uitnodiging('token-1')]);
        toon();

        await openPaneel();

        expect(screen.getByRole('button', { name: 'Sluiten' })).toHaveFocus();
    });

    it('gaat dicht met sluiten en geeft de focus terug aan de knop', async () => {
        zetServer([uitnodiging('token-1')]);
        toon();
        await openPaneel();

        fireEvent.click(screen.getByRole('button', { name: 'Sluiten' }));

        await waitFor(() => expect(paneel()).not.toHaveAttribute('open'));
        expect(screen.getByRole('button', { name: 'Stuur me een bericht' })).toHaveFocus();
    });

    it('gaat dicht bij een klik naast het venster', async () => {
        zetServer([uitnodiging('token-1')]);
        toon();
        await openPaneel();

        const dialoog = paneel() as HTMLElement;
        fireEvent.mouseDown(dialoog);
        fireEvent.click(dialoog);

        await waitFor(() => expect(paneel()).not.toHaveAttribute('open'));
    });

    it('blijft open bij een klik in het venster', async () => {
        zetServer([uitnodiging('token-1')]);
        toon();
        await openPaneel();

        const naam = screen.getByLabelText('Naam');
        fireEvent.mouseDown(naam);
        fireEvent.click(naam);

        expect(paneel()).toHaveAttribute('open');
    });

    it('bewaart wat je invulde als je het paneel sluit en weer opent', async () => {
        zetServer([uitnodiging('token-1')]);
        toon();
        await openPaneel();

        fireEvent.change(screen.getByLabelText('Bericht'), { target: { value: 'Half af' } });
        fireEvent.click(screen.getByRole('button', { name: 'Sluiten' }));
        await waitFor(() => expect(paneel()).not.toHaveAttribute('open'));
        await openPaneel();

        expect(screen.getByLabelText('Bericht')).toHaveValue('Half af');
    });

    it('gaat vanzelf open bij /#contact, en na sluiten is dat adres weg', async () => {
        window.history.pushState({}, '', '/#contact');
        zetServer([uitnodiging('token-1')]);
        toon();

        await waitFor(() => expect(paneel()).toHaveAttribute('open'));

        fireEvent.click(screen.getByRole('button', { name: 'Sluiten' }));
        await waitFor(() => expect(paneel()).not.toHaveAttribute('open'));
        expect(window.location.hash).toBe('');
    });

    it('verstuurt het bericht met het token en een leeg lokveld', async () => {
        zetServer([uitnodiging('token-1')], [{ status: 200, inhoud: { ok: true } }]);
        toon();
        await openPaneel();

        vulIn();
        verstuur();

        expect(await screen.findByText('Je bericht is verstuurd.')).toBeInTheDocument();
        expect(verstuurd).toEqual([
            {
                naam: 'Jan Jansen',
                email: 'jan@example.com',
                onderwerp: 'website',
                bericht: 'Ik zoek een nieuwe website.',
                taal: 'nl',
                antibot: { challenge: 'token-1', honeypot: '', turnstile: '' },
            },
        ]);
    });

    it('zet een fout van de server onder het veld en de focus erop', async () => {
        zetServer(
            [uitnodiging('token-1')],
            [{ status: 400, inhoud: { ok: false, code: 'ongeldig', velden: { email: 'ongeldig' } } }],
        );
        toon();
        await openPaneel();

        vulIn();
        verstuur();

        const email = screen.getByLabelText('E-mailadres');
        await waitFor(() => expect(email).toHaveFocus());
        expect(email).toHaveAttribute('aria-invalid', 'true');
        expect(email).toHaveAccessibleDescription('Dit e-mailadres klopt niet.');

        fireEvent.change(email, { target: { value: 'jan@example.nl' } });
        expect(email).not.toHaveAttribute('aria-invalid');
    });

    it('haalt een vers token en probeert het nog een keer als het oude verlopen is', async () => {
        zetServer(
            [uitnodiging('oud'), uitnodiging('vers')],
            [
                { status: 400, inhoud: { ok: false, code: 'challenge_verlopen' } },
                { status: 200, inhoud: { ok: true } },
            ],
        );
        toon();
        await openPaneel();

        vulIn();
        verstuur();

        expect(await screen.findByText('Je bericht is verstuurd.')).toBeInTheDocument();
        expect(verstuurd.map((bericht) => bericht.antibot.challenge)).toEqual(['oud', 'vers']);
    });

    it('meldt het als er te veel berichten verstuurd zijn', async () => {
        zetServer([uitnodiging('token-1')], [{ status: 429, inhoud: { ok: false, code: 'te_veel' } }]);
        toon();
        await openPaneel();

        vulIn();
        verstuur();

        expect(await screen.findByRole('alert')).toHaveTextContent('Er zijn net te veel berichten verstuurd.');
        expect(screen.getByLabelText('Naam')).toHaveValue('Jan Jansen');
    });
});
