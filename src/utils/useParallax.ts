import { RefObject, useEffect } from 'react';

/**
 * Hoeveel de achtergrondlaag verschoven moet staan, in pixels.
 *
 * De uitkomst loopt van +sterkte*hoogte als de sectie net onder het venster
 * hangt, via nul als hij precies in het midden staat, naar -sterkte*hoogte als
 * hij er net boven zit. Daarbuiten blijft hij op zijn uiterste stand, zodat de
 * rand van de laag nooit in beeld komt.
 */
export const parallaxVerschuiving = (
  top: number,
  hoogte: number,
  kijkhoogte: number,
  sterkte: number,
): number => {
  const noemer = kijkhoogte / 2 + hoogte / 2;
  if (noemer === 0) return 0;

  const ruw = (top + hoogte / 2 - kijkhoogte / 2) / noemer;
  const voortgang = Math.max(-1, Math.min(1, ruw));

  return voortgang * sterkte * hoogte;
};

/** Niet elke omgeving kent matchMedia; jsdom bijvoorbeeld niet. */
const minderBewegingGevraagd = (): MediaQueryList | null =>
  typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;

/**
 * Verschuift een achtergrondlaag langzamer dan de pagina zelf, zodat de sectie
 * diepte krijgt. De laag moet hoger zijn dan zijn sectie, anders komt bij het
 * schuiven de rand in beeld; zie `.homepage-intro .parallax-bg` in App.scss.
 *
 * Het rekenwerk hangt aan requestAnimationFrame, zodat een scrollstroom van
 * tientallen gebeurtenissen hooguit een keer per frame iets doet. Wie in zijn
 * systeem heeft aangegeven minder beweging te willen, krijgt een stilstaande
 * achtergrond.
 */
export const useParallax = (
  sectieRef: RefObject<HTMLElement>,
  laagRef: RefObject<HTMLElement>,
  sterkte = 0.2,
) => {
  useEffect(() => {
    const sectie = sectieRef.current;
    const laag = laagRef.current;
    if (!sectie || !laag) return;

    const voorkeur = minderBewegingGevraagd();

    let frame: number | null = null;
    let losmaken: (() => void) | null = null;

    const teken = () => {
      frame = null;

      const rect = sectie.getBoundingClientRect();
      const kijkhoogte = window.innerHeight || document.documentElement.clientHeight;

      laag.style.transform =
        `translate3d(0, ${parallaxVerschuiving(rect.top, rect.height, kijkhoogte, sterkte).toFixed(1)}px, 0)`;
    };

    const plan = () => {
      if (frame === null) frame = requestAnimationFrame(teken);
    };

    const aanzetten = () => {
      if (losmaken) return;

      window.addEventListener('scroll', plan, { passive: true });
      window.addEventListener('resize', plan);
      plan();

      losmaken = () => {
        window.removeEventListener('scroll', plan);
        window.removeEventListener('resize', plan);
      };
    };

    const uitzetten = () => {
      losmaken?.();
      losmaken = null;
      laag.style.transform = '';
    };

    const volgVoorkeur = () => (voorkeur?.matches ? uitzetten() : aanzetten());

    volgVoorkeur();

    // Safari kende addEventListener op een MediaQueryList pas laat.
    voorkeur?.addEventListener?.('change', volgVoorkeur);

    return () => {
      voorkeur?.removeEventListener?.('change', volgVoorkeur);
      losmaken?.();
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [sectieRef, laagRef, sterkte]);
};
