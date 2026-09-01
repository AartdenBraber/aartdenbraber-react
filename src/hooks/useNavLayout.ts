import { RefObject, useLayoutEffect, useState } from 'react';

export type NavLayout = 'rail' | 'bar';

/** Ruimte die de rail aan weerszijden vrij wil houden. */
export const NAV_GUTTER = 16;

/**
 * Past de rail naast de tekstkolom, met aan beide kanten lucht?
 *
 * `containerLeft` is de afstand van de linker vensterrand tot de tekstkolom.
 * Zolang de rail daar niet in past, valt hij over de tekst en moet hij naar
 * boven.
 */
export const fitsBeside = (railWidth: number, containerLeft: number, gutter = NAV_GUTTER): boolean =>
  railWidth > 0 && gutter + railWidth + gutter <= containerLeft;

/**
 * Kiest tussen de rail in de marge en de balk bovenaan, op basis van de
 * werkelijke breedte van beide in plaats van een vast breekpunt. De labels
 * verschillen per taal, dus wat bij "Aanbevelingen" past hoeft niet te passen
 * bij "Recommendations".
 *
 * Beginwaarde is de balk: die valt nooit over iets heen, dus vóór de eerste
 * meting is dat de veilige keuze.
 */
export const useNavLayout = (
  navRef: RefObject<HTMLElement>,
  contentSelector = '.container',
): NavLayout => {
  const [layout, setLayout] = useState<NavLayout>('bar');

  useLayoutEffect(() => {
    const nav = navRef.current;

    if (!nav) return;

    let frame: number | null = null;

    const decide = () => {
      frame = null;

      const content = document.querySelector(contentSelector);

      if (!content) return;

      // De rail is alleen op te meten in railstand. Dit gebeurt vóór de
      // browser tekent, dus er knippert niets.
      const shown = nav.dataset.layout;
      nav.dataset.layout = 'rail';
      const railWidth = nav.offsetWidth;
      if (shown) nav.dataset.layout = shown;

      const containerLeft = content.getBoundingClientRect().left;

      if (fitsBeside(railWidth, containerLeft)) {
        nav.style.setProperty('--rail-left', `${Math.round(containerLeft - railWidth - NAV_GUTTER)}px`);
        setLayout('rail');
      } else {
        setLayout('bar');
      }
    };

    const schedule = () => {
      if (frame === null) frame = requestAnimationFrame(decide);
    };

    decide();

    window.addEventListener('resize', schedule);

    // Lettertypes komen later binnen en maken de labels breder.
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule);
    observer?.observe(document.documentElement);

    return () => {
      window.removeEventListener('resize', schedule);
      observer?.disconnect();

      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [navRef, contentSelector]);

  return layout;
};
