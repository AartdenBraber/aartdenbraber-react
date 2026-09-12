import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Contact from './Contact';
import { ContactformulierProvider } from './ContactformulierContext';
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
                <Contact />
            </ContactformulierProvider>
        </LanguageProvider>,
    );

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

describe('het contactformulier', () => {
    it('blijft weg als contact.php geen JSON teruggeeft', async () => {
        const waarschuwing = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
        zetServer([{ status: 200, inhoud: null, type: 'application/x-httpd-php' }]);

        toon();

        await waitFor(() => expect(waarschuwing).toHaveBeenCalled());
        expect(screen.queryByRole('heading', { name: 'Laten we kennismaken.' })).not.toBeInTheDocument();
        waarschuwing.mockRestore();
    });

    it('verstuurt het bericht met het token en een leeg lokveld', async () => {
        zetServer([uitnodiging('token-1')], [{ status: 200, inhoud: { ok: true } }]);
        toon();
        await screen.findByRole('heading', { name: 'Laten we kennismaken.' });

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
        await screen.findByRole('heading', { name: 'Laten we kennismaken.' });

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
        await screen.findByRole('heading', { name: 'Laten we kennismaken.' });

        vulIn();
        verstuur();

        expect(await screen.findByText('Je bericht is verstuurd.')).toBeInTheDocument();
        expect(verstuurd.map((bericht) => bericht.antibot.challenge)).toEqual(['oud', 'vers']);
    });

    it('meldt het als er te veel berichten verstuurd zijn', async () => {
        zetServer([uitnodiging('token-1')], [{ status: 429, inhoud: { ok: false, code: 'te_veel' } }]);
        toon();
        await screen.findByRole('heading', { name: 'Laten we kennismaken.' });

        vulIn();
        verstuur();

        expect(await screen.findByRole('alert')).toHaveTextContent('Er zijn net te veel berichten verstuurd.');
        expect(screen.getByLabelText('Naam')).toHaveValue('Jan Jansen');
    });
});
