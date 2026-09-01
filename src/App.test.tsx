import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { content, Language } from './content';

const renderIn = (language: Language) => {
  window.localStorage.setItem('adb.language', language);
  return render(<App />);
};

describe('App', () => {
  beforeEach(() => {
    window.localStorage.clear();
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

    await user.click(screen.getByRole('button', { name: /english/i }));

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(content.en.hero.title);
    expect(document.documentElement.lang).toBe('en');
  });

  it('onthoudt de taalkeuze', async () => {
    const user = userEvent.setup();
    const { unmount } = renderIn('nl');

    await user.click(screen.getByRole('button', { name: /english/i }));
    unmount();

    render(<App />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(content.en.hero.title);
  });
});
