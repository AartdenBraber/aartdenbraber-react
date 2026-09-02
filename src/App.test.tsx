import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { content, Language } from './content';

/** De taal hangt aan het adres: / is Nederlands, /en is Engels. */
const renderIn = (language: Language) => {
  window.history.replaceState(null, '', language === 'en' ? '/en' : '/');
  return render(<App />);
};

describe('App', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
    document.documentElement.lang = '';
  });

  it('toont één h1, met de hero-titel van de gekozen taal', () => {
    renderIn('nl');

    const headings = screen.getAllByRole('heading', { level: 1 });

    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(content.nl.hero.title);
  });

  it('rendert elke werkervaring uit de content', () => {
    renderIn('nl');

    const experience = screen.getByRole('region', { name: content.nl.experience.heading });
    const { entries } = content.nl.experience;

    expect(within(experience).getAllByRole('listitem')).toHaveLength(
      entries.length + entries.flatMap((entry) => [...entry.highlights, ...entry.stack]).length,
    );

    entries.forEach((entry) => {
      expect(within(experience).getByText(entry.summary)).toBeInTheDocument();
    });
  });

  it('zet het lang-attribuut op de gekozen taal', () => {
    renderIn('nl');

    expect(document.documentElement.lang).toBe('nl');
  });

  it('schakelt de hele pagina om naar Engels', async () => {
    const user = userEvent.setup();
    renderIn('nl');

    await user.click(screen.getByRole('link', { name: /english/i }));

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(content.en.hero.title);
    expect(document.documentElement.lang).toBe('en');
  });

  it('neemt het adres mee bij het wisselen van taal', async () => {
    const user = userEvent.setup();
    renderIn('nl');

    await user.click(screen.getByRole('link', { name: /english/i }));
    expect(window.location.pathname).toBe('/en');

    await user.click(screen.getByRole('link', { name: /nederlands/i }));
    expect(window.location.pathname).toBe('/');
  });

  it('start in het Engels wanneer het adres daarom vraagt', () => {
    renderIn('en');

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(content.en.hero.title);
    expect(document.documentElement.lang).toBe('en');
  });

  it('biedt de andere taal aan als een volgbare link', () => {
    renderIn('nl');

    const engels = screen.getByRole('link', { name: /english/i });

    expect(engels).toHaveAttribute('href', '/en');
    expect(engels).toHaveAttribute('hreflang', 'en');
  });
});
