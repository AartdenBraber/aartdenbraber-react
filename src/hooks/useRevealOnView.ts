import { RefObject, useLayoutEffect } from 'react';

/** Hoe lang we wachten op het eerste bericht van de observer voordat we opgeven. */
const OBSERVER_TIMEOUT_MS = 2000;

/**
 * Laat elementen binnen `containerRef` één keer omhoog binnenkomen zodra ze in
 * beeld scrollen. Geef `null` mee om de hele pagina af te zoeken.
 *
 * De verborgen begintoestand wordt pas door JavaScript gezet, dus zonder
 * JavaScript of IntersectionObserver staat alles gewoon zichtbaar. Bij
 * `prefers-reduced-motion` gebeurt er niets.
 *
 * Een IntersectionObserver meldt zich normaal binnen één frame, ook voor
 * elementen die nog buiten beeld staan. Blijft dat eerste bericht uit, dan
 * produceert de browser geen frames en zouden de elementen onzichtbaar blijven
 * hangen. In dat geval laten we de animatie vallen en tonen we alles.
 */
export const useRevealOnView = (
  containerRef: RefObject<HTMLElement> | null,
  itemSelector: string,
): void => {
  useLayoutEffect(() => {
    const container = containerRef ? containerRef.current : document.body;

    if (!container) return;
    if (typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const items = Array.from(container.querySelectorAll<HTMLElement>(itemSelector));

    if (items.length === 0) return;

    const showAll = () => {
      items.forEach((item) => {
        delete item.dataset.reveal;
      });
    };

    items.forEach((item) => {
      item.dataset.reveal = 'pending';
    });

    let heardFromObserver = false;

    const observer = new IntersectionObserver(
      (entries) => {
        heardFromObserver = true;

        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          (entry.target as HTMLElement).dataset.reveal = 'shown';
          observer.unobserve(entry.target);
        });
      },
      // Iets voorbij de onderrand, zodat een kaart al beweegt terwijl hij
      // binnenkomt in plaats van pas als hij er half staat.
      { rootMargin: '0px 0px -10% 0px' },
    );

    items.forEach((item) => observer.observe(item));

    const failsafe = window.setTimeout(() => {
      if (heardFromObserver) return;

      observer.disconnect();
      showAll();
    }, OBSERVER_TIMEOUT_MS);

    return () => {
      window.clearTimeout(failsafe);
      observer.disconnect();
      showAll();
    };
  }, [containerRef, itemSelector]);
};
