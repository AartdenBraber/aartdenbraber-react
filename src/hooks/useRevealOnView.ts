import { RefObject, useLayoutEffect } from 'react';
import './useRevealOnView.scss';

/** Hoe lang we wachten op het eerste bericht van de waarnemer voor we opgeven. */
const WAARNEMER_TIMEOUT_MS = 2000;

/** Niet elke omgeving kent matchMedia; jsdom bijvoorbeeld niet. */
const minderBewegingGevraagd = (): boolean =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Laat de elementen die `selector` aanwijst een keer omhoog binnenkomen zodra
 * ze in beeld scrollen. Ze krijgen `data-reveal="pending"` en daarna "shown";
 * de bijbehorende opmaak staat in useRevealOnView.scss hiernaast.
 *
 * De verborgen begintoestand wordt pas door javascript gezet, dus zonder
 * javascript of zonder IntersectionObserver staat alles er gewoon. Wie om
 * minder beweging vraagt krijgt niets te zien bewegen.
 *
 * Een IntersectionObserver meldt zich normaal binnen een frame, ook voor
 * elementen die nog buiten beeld staan. Blijft dat eerste bericht uit, dan
 * maakt de browser geen frames en zou de tekst onzichtbaar blijven hangen. In
 * dat geval laten we de animatie vallen en tonen we alles.
 */
export const useRevealOnView = (containerRef: RefObject<HTMLElement>, selector: string): void => {
  useLayoutEffect(() => {
    const container = containerRef.current;

    if (!container) return;
    if (typeof IntersectionObserver === 'undefined') return;
    if (minderBewegingGevraagd()) return;

    const items = Array.from(container.querySelectorAll<HTMLElement>(selector));
    if (items.length === 0) return;

    const toonAlles = () => {
      items.forEach((item) => {
        delete item.dataset.reveal;
        item.style.removeProperty('--reveal-step');
      });
    };

    items.forEach((item, index) => {
      item.dataset.reveal = 'pending';
      // Laat ze na elkaar binnenkomen in plaats van als blok.
      item.style.setProperty('--reveal-step', String(index));
    });

    let ietsGehoord = false;

    const waarnemer = new IntersectionObserver(
      (entries) => {
        ietsGehoord = true;

        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          (entry.target as HTMLElement).dataset.reveal = 'shown';
          waarnemer.unobserve(entry.target);
        });
      },
      // Iets voorbij de onderrand, zodat een alinea al beweegt terwijl hij
      // binnenkomt in plaats van pas als hij er half staat.
      { rootMargin: '0px 0px -10% 0px' },
    );

    items.forEach((item) => waarnemer.observe(item));

    const noodrem = window.setTimeout(() => {
      if (ietsGehoord) return;

      waarnemer.disconnect();
      toonAlles();
    }, WAARNEMER_TIMEOUT_MS);

    return () => {
      window.clearTimeout(noodrem);
      waarnemer.disconnect();
      toonAlles();
    };
  }, [containerRef, selector]);
};
