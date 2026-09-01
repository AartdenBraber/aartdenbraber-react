import React from 'react';
import { act, render } from '@testing-library/react';
import App from '../../App';

type ObserverCallback = ConstructorParameters<typeof IntersectionObserver>[0];

/**
 * jsdom kent IntersectionObserver niet. Deze variant onthoudt wat er wordt
 * geobserveerd, zodat een test zelf kan bepalen wanneer iets in beeld komt.
 */
class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];

  observed: Element[] = [];

  constructor(private callback: ObserverCallback) {
    FakeIntersectionObserver.instances.push(this);
  }

  observe(element: Element) {
    this.observed.push(element);
  }

  unobserve(element: Element) {
    this.observed = this.observed.filter((candidate) => candidate !== element);
  }

  disconnect() {
    this.observed = [];
  }

  /** Meldt de opgegeven elementen als zichtbaar. */
  enterView(elements: Element[]) {
    const entries = elements.map(
      (target) => ({ target, isIntersecting: true }) as IntersectionObserverEntry,
    );

    act(() => {
      this.callback(entries, this as unknown as IntersectionObserver);
    });
  }
}

const items = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>('.experience__item'));

/**
 * De pagina zet meer dan één observer op. Pak dus niet de laatste, maar die
 * waar de kaarten van de werkervaring in zitten.
 */
const observerOf = (kaart: Element) => {
  const observer = FakeIntersectionObserver.instances.find((instance) =>
    instance.observed.includes(kaart),
  );

  if (!observer) throw new Error('Geen observer gevonden voor deze kaart');

  return observer;
};

describe('Werkervaring, binnenkomen in beeld', () => {
  const originalObserver = window.IntersectionObserver;

  beforeEach(() => {
    FakeIntersectionObserver.instances = [];
    window.IntersectionObserver = FakeIntersectionObserver as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    window.IntersectionObserver = originalObserver;
    jest.useRealTimers();
  });

  it('verbergt de kaarten tot ze in beeld komen en toont ze daarna', () => {
    const { container } = render(<App />);
    const kaarten = items(container);

    expect(kaarten.length).toBeGreaterThan(0);
    expect(kaarten.every((kaart) => kaart.dataset.reveal === 'pending')).toBe(true);

    observerOf(kaarten[0]).enterView([kaarten[0]]);

    expect(kaarten[0].dataset.reveal).toBe('shown');
    expect(kaarten[1].dataset.reveal).toBe('pending');
  });

  it('stopt met observeren zodra een kaart getoond is', () => {
    const { container } = render(<App />);
    const kaarten = items(container);
    const observer = observerOf(kaarten[0]);

    expect(observer.observed).toHaveLength(kaarten.length);

    observer.enterView([kaarten[0]]);

    expect(observer.observed).toHaveLength(kaarten.length - 1);
    expect(observer.observed).not.toContain(kaarten[0]);
  });

  it('toont alles alsnog wanneer de observer zich niet meldt', () => {
    jest.useFakeTimers();

    const { container } = render(<App />);
    const kaarten = items(container);

    expect(kaarten.every((kaart) => kaart.dataset.reveal === 'pending')).toBe(true);

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(kaarten.every((kaart) => kaart.dataset.reveal === undefined)).toBe(true);
  });
});
