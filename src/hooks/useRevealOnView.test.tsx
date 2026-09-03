import React, { useRef } from 'react';
import { render, screen, act } from '@testing-library/react';
import { useRevealOnView } from './useRevealOnView';

// jsdom kent geen IntersectionObserver, dus zetten we er zelf een neer waar we
// de terugroep van in handen hebben.
type Terugroep = (entries: { target: Element; isIntersecting: boolean }[]) => void;

let laatsteTerugroep: Terugroep | null = null;
let bekeken: Element[] = [];
let losgelaten: Element[] = [];

class NepWaarnemer {
  constructor(cb: Terugroep) {
    laatsteTerugroep = cb;
  }
  observe(el: Element) {
    bekeken.push(el);
  }
  unobserve(el: Element) {
    losgelaten.push(el);
  }
  disconnect() {
    /* de test kijkt naar unobserve */
  }
}

const Proefpagina: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  useRevealOnView(ref, 'p');

  return (
    <div ref={ref}>
      <p>een</p>
      <p>twee</p>
      <p>drie</p>
    </div>
  );
};

const alinea = (tekst: string) => screen.getByText(tekst);

describe('useRevealOnView', () => {
  const echteWaarnemer = window.IntersectionObserver;
  const echteMatchMedia = window.matchMedia;

  beforeEach(() => {
    laatsteTerugroep = null;
    bekeken = [];
    losgelaten = [];
    (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver = NepWaarnemer;
    delete (window as { matchMedia?: unknown }).matchMedia;
  });

  afterEach(() => {
    (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver = echteWaarnemer;
    window.matchMedia = echteMatchMedia;
    jest.useRealTimers();
  });

  it('verbergt de alinea\'s en geeft ze een plek in de rij', () => {
    render(<Proefpagina />);

    expect(alinea('een').dataset.reveal).toBe('pending');
    expect(alinea('drie').dataset.reveal).toBe('pending');
    expect(alinea('een').style.getPropertyValue('--reveal-step')).toBe('0');
    expect(alinea('drie').style.getPropertyValue('--reveal-step')).toBe('2');
    expect(bekeken).toHaveLength(3);
  });

  it('toont een alinea zodra hij in beeld komt, en laat hem daarna los', () => {
    render(<Proefpagina />);

    act(() => {
      laatsteTerugroep!([{ target: alinea('twee'), isIntersecting: true }]);
    });

    expect(alinea('twee').dataset.reveal).toBe('shown');
    expect(alinea('een').dataset.reveal).toBe('pending');
    expect(losgelaten).toContain(alinea('twee'));
  });

  it('doet niets als er om minder beweging gevraagd wordt', () => {
    window.matchMedia = ((query: string) => ({
      matches: true,
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    })) as unknown as typeof window.matchMedia;

    render(<Proefpagina />);

    expect(alinea('een').dataset.reveal).toBeUndefined();
    expect(bekeken).toHaveLength(0);
  });

  it('toont alles als de waarnemer zich nooit meldt', () => {
    jest.useFakeTimers();
    render(<Proefpagina />);

    expect(alinea('een').dataset.reveal).toBe('pending');

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(alinea('een').dataset.reveal).toBeUndefined();
    expect(alinea('drie').dataset.reveal).toBeUndefined();
  });

  it('laat de pagina met rust als de browser geen IntersectionObserver heeft', () => {
    delete (window as { IntersectionObserver?: unknown }).IntersectionObserver;

    render(<Proefpagina />);

    expect(alinea('een').dataset.reveal).toBeUndefined();
  });
});
