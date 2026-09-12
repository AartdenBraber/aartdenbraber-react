import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

// Het cv wordt met pdfjs op een canvas getekend. Dat kan jsdom niet en het
// hoort ook niet bij wat deze test nagaat, dus zetten we er een lege pdf voor
// in de plaats.
jest.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: { workerSrc: '' },
  getDocument: () => ({
    promise: Promise.resolve({ numPages: 0, getPage: jest.fn() }),
    // De echte laadtaak heeft deze ook, en de component roept hem aan bij het
    // opruimen om de worker te stoppen. Stond hij hier niet, dan dekte de test
    // dat pad niet af.
    destroy: jest.fn(() => Promise.resolve()),
  }),
}));

const ga = (pad: string) => window.history.pushState({}, '', pad);

describe('de taal volgt het adres', () => {
  beforeEach(() => ga('/'));

  it('toont Nederlands op de hoofdpagina', async () => {
    render(<App />);

    expect(await screen.findByRole('heading', { name: /Mijn focus ligt op het bouwen/ })).toBeInTheDocument();
    expect(screen.getByText('Ontwikkeling begint bij visie.')).toBeInTheDocument();
    expect(document.documentElement.lang).toBe('nl');
  });

  it('toont Engels op /en', async () => {
    ga('/en');
    render(<App />);

    expect(
      await screen.findByRole('heading', { name: /I focus on crafting sustainable applications/ }),
    ).toBeInTheDocument();
    expect(screen.getByText('From vision to value.')).toBeInTheDocument();
    expect(document.documentElement.lang).toBe('en');
  });

  it('wisselt van taal en past het adres aan', async () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'English' }));

    expect(
      await screen.findByRole('heading', { name: /I focus on crafting sustainable applications/ }),
    ).toBeInTheDocument();
    await waitFor(() => expect(window.location.pathname).toBe('/en'));
  });

  it('wijst het cv naar het pdf in de juiste taal', async () => {
    render(<App />);

    const nederlands = await screen.findByRole('link', { name: /Download CV als PDF/ });
    expect(nederlands).toHaveAttribute('href', '/CV-Aart-den-Braber-NL.pdf');

    fireEvent.click(screen.getByRole('button', { name: 'English' }));

    const engels = await screen.findByRole('link', { name: /Download CV as PDF/ });
    expect(engels).toHaveAttribute('href', '/CV-Aart-den-Braber-EN.pdf');
  });
});

describe('het contactformulier op de pagina', () => {
  beforeEach(() => ga('/'));
  afterEach(() => {
    delete (window as { fetch?: unknown }).fetch;
  });

  it('staat er met de link onder de intro als contact.php klaarstaat', async () => {
    window.fetch = jest.fn(async () => ({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => ({ ok: true, token: 'token', minLeeftijdMs: 0, turnstileSitekey: null }),
    })) as unknown as typeof fetch;

    render(<App />);

    expect(await screen.findByRole('link', { name: 'Stuur me een bericht' })).toHaveAttribute('href', '#contact');
    expect(screen.getByRole('heading', { name: 'Laten we kennismaken.' })).toBeInTheDocument();
  });

  it('staat er niet, en de link ook niet, zonder contact.php', async () => {
    render(<App />);

    await screen.findByRole('heading', { name: /Mijn focus ligt op het bouwen/ });
    expect(screen.queryByRole('link', { name: 'Stuur me een bericht' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Laten we kennismaken.' })).not.toBeInTheDocument();
  });
});
