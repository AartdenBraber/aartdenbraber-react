import React from 'react';
import { render, screen } from '@testing-library/react';
import WordReveal from './WordReveal';

describe('WordReveal', () => {
  it('blijft een doorlopende regel voor wie hem voorgelezen krijgt', () => {
    render(<WordReveal text="Mijn focus ligt op duurzame applicaties" />);

    // De naam van de kop is wat een schermlezer eruit maakt: de woorden aan
    // elkaar, met de spaties ertussen.
    expect(
      screen.getByRole('heading', { name: 'Mijn focus ligt op duurzame applicaties' }),
    ).toBeInTheDocument();
  });

  it('zet elk woord in een eigen venstertje', () => {
    const { container } = render(<WordReveal text="een twee drie" />);

    const woorden = Array.from(container.querySelectorAll('.word-mask .word'));
    expect(woorden.map((w) => w.textContent)).toEqual(['een', 'twee', 'drie']);
  });

  it('geeft elk woord zijn plek in de regel mee, zodat ze na elkaar binnenvallen', () => {
    const { container } = render(<WordReveal text="een twee drie" />);

    const stappen = Array.from(container.querySelectorAll<HTMLElement>('.word')).map((w) =>
      w.style.getPropertyValue('--word-step'),
    );
    expect(stappen).toEqual(['0', '1', '2']);
  });

  it('zet de aanloop van de hele kop op het element zelf', () => {
    render(<WordReveal text="een twee" delay={150} />);

    const kop = screen.getByRole('heading');
    expect(kop.style.getPropertyValue('--word-base')).toBe('150ms');
  });
});
