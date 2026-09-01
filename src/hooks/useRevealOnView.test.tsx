import React from 'react';
import { act, render } from '@testing-library/react';
import { useRevealOnView } from './useRevealOnView';

type ObserverCallback = ConstructorParameters<typeof IntersectionObserver>[0];

/** Zie Experience.test.tsx: jsdom kent IntersectionObserver niet. */
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

  enterView(elements: Element[]) {
    const entries = elements.map(
      (target) => ({ target, isIntersecting: true }) as IntersectionObserverEntry,
    );

    act(() => {
      this.callback(entries, this as unknown as IntersectionObserver);
    });
  }
}

/** Kijkt naar de hele pagina in plaats van naar één container. */
const Pagina: React.FC = () => {
  useRevealOnView(null, '[data-reveal-item]');

  return (
    <>
      <p data-reveal-item="">Eerste</p>
      <p data-reveal-item="">Tweede</p>
      <p>Zonder markering</p>
    </>
  );
};

describe('useRevealOnView zonder container', () => {
  const originalObserver = window.IntersectionObserver;

  beforeEach(() => {
    FakeIntersectionObserver.instances = [];
    window.IntersectionObserver = FakeIntersectionObserver as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    window.IntersectionObserver = originalObserver;
  });

  it('verbergt alleen de gemarkeerde elementen en toont ze zodra ze in beeld komen', () => {
    const { container } = render(<Pagina />);
    const gemarkeerd = Array.from(container.querySelectorAll<HTMLElement>('[data-reveal-item]'));
    const rest = container.querySelector<HTMLElement>('p:not([data-reveal-item])');

    expect(gemarkeerd).toHaveLength(2);
    expect(gemarkeerd.every((element) => element.dataset.reveal === 'pending')).toBe(true);
    expect(rest?.dataset.reveal).toBeUndefined();

    const observer = FakeIntersectionObserver.instances.find((instance) =>
      instance.observed.includes(gemarkeerd[0]),
    );

    observer?.enterView([gemarkeerd[0]]);

    expect(gemarkeerd[0].dataset.reveal).toBe('shown');
    expect(gemarkeerd[1].dataset.reveal).toBe('pending');
  });
});
