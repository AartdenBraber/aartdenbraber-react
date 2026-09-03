import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

// Het cv wordt met pdfjs op een canvas getekend. Dat kan jsdom niet en het
// hoort ook niet bij wat deze test nagaat, dus zetten we er een lege pdf voor
// in de plaats.
jest.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: { workerSrc: '' },
  getDocument: () => ({ promise: Promise.resolve({ numPages: 0, getPage: jest.fn() }) }),
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
