import { RefObject, useEffect } from 'react';

/** Meer kaarten bovenop dan dit maakt visueel geen verschil meer. */
const MAX_DEPTH = 3;

/**
 * Zoveel pixels loopt een bedolven kaart door achter de bovenrand van de
 * kaart ervoor. Ruim meer dan de hoekafronding van de kaarten (--radius-l,
 * 22px), anders piept de rechte kniprand door die ronde hoeken heen.
 */
const CORNER_OVERLAP = 26;

/** Wegknippen "uit" als negatieve inset, zodat de schaduw met rust wordt gelaten. */
export const NO_CLIP = -99;

export interface StackCardBounds {
  /** Bovenkant in de viewport, inclusief de sticky-verschuiving. */
  top: number;
  height: number;
  /** De `top`-offset waarop de kaart vastplakt. */
  stickyTop: number;
}

export interface StackCardDepth {
  /** 0..1: hoe ver de volgende kaart hier al overheen ligt. */
  covered: number;
  /** Hoeveel kaarten er cumulatief bovenop liggen, afgekapt op MAX_DEPTH. */
  depth: number;
  /** Pixels die van de onderkant af moeten, of NO_CLIP wanneer niets weg hoeft. */
  clip: number;
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/**
 * Bepaalt per kaart hoe diep hij in de stapel ligt.
 *
 * Een kaart raakt bedekt zodra de volgende kaart zijn onderrand raakt en is
 * volledig bedekt zodra die volgende kaart op zijn eigen plakpositie ligt. De
 * diepte telt de bedekking van alle kaarten erboven bij elkaar op, zodat elke
 * nieuwe kaart de hele stapel iets verder wegduwt.
 *
 * De kaarten verschillen flink in hoogte, dus een lange bedolven kaart zou
 * onder een korte kaart ervoor uitsteken. Daarom knipt `clip` de onderkant
 * mee met de bedekking weg, tot er alleen nog het zichtbare randje over is
 * plus een klein stuk dat achter de ronde hoeken van de opvolger schuilgaat.
 * De kniprand zelf blijft tijdens het overschuiven altijd achter de opvolger
 * verborgen: hij trekt langzamer op dan de kaart die eroverheen schuift.
 *
 * Het vertrek aan het einde van de sectie staat hier los van: dat regelen de
 * staartjes van resolveStackTails volledig native in de layout.
 *
 * Los van de DOM gehouden: dit is het enige stuk waar iets te beslissen valt,
 * en zo is het te testen zonder een browser die frames produceert.
 */
export const resolveStackDepths = (cards: StackCardBounds[]): StackCardDepth[] => {
  const covered = cards.map((card, index) => {
    const next = cards[index + 1];

    if (!next) return 0;

    const start = card.stickyTop + card.height;
    const range = start - next.stickyTop;

    // Een kaart die korter is dan de plak-offset kent geen overgang.
    if (range <= 0) return next.top <= next.stickyTop ? 1 : 0;

    return clamp01((start - next.top) / range);
  });

  const depths: StackCardDepth[] = new Array(cards.length);
  let sum = 0;

  for (let index = cards.length - 1; index >= 0; index -= 1) {
    const card = cards[index];
    const next = cards[index + 1];

    sum += covered[index];

    let visible = card.height;

    if (next) {
      const lip = next.stickyTop - card.stickyTop;
      const target = Math.min(card.height, lip + CORNER_OVERLAP);

      visible = card.height - covered[index] * (card.height - target);
    }

    const clip = card.height - visible;

    depths[index] = {
      covered: covered[index],
      depth: Math.min(MAX_DEPTH, sum),
      clip: clip > 0 ? clip : NO_CLIP,
    };
  }

  return depths;
};

/**
 * Onzichtbare staart per kaart die alle plak-onderkanten gelijktrekt.
 *
 * De browser laat een vastgeplakte kaart los zodra de onderkant van de lijst
 * zijn onderrand raakt; hoge kaarten dus eerder dan lage, en die schoven dan
 * boven de stapel uit. Elke poging om dat per scrollframe met JavaScript te
 * corrigeren, wipt: de browser verschuift sticky-kaarten op de
 * compositor-thread en de correctie komt een frame later. Met een staart als
 * ondermarge eindigt elke kaart even diep, laat alles op exact hetzelfde
 * moment los en vertrekt de stapel als één blok, zonder JavaScript per frame.
 * De klem rekent met de marge-box (padding met negatieve marge valt er dus
 * tegen elkaar weg); de flow blijft op maat doordat de opvolger de staart
 * opvangt met een negatieve bovenmarge, die het pinnen zelf niet raakt.
 */
export const resolveStackTails = (
  cards: Pick<StackCardBounds, 'height' | 'stickyTop'>[],
): number[] => {
  if (cards.length === 0) return [];

  const slot = Math.max(...cards.map((card) => card.stickyTop + card.height));

  return cards.map((card) => slot - card.stickyTop - card.height);
};

/**
 * Zet tijdens het scrollen per kaart twee CSS-variabelen voor het
 * stapel-effect: `--stack-covered` en `--stack-depth`.
 *
 * De waarden gaan als CSS-variabele rechtstreeks naar het element, niet via
 * state: een re-render per scrollframe zou niets toevoegen en wel kosten
 * (zelfde afweging als useSectionProgress). Zonder JavaScript blijven de
 * variabelen op hun standaardwaarde 0 en staat alles gewoon zichtbaar.
 */
export const useStackDepth = (
  containerRef: RefObject<HTMLElement>,
  itemSelector: string,
): void => {
  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const items = Array.from(container.querySelectorAll<HTMLElement>(itemSelector));

    if (items.length === 0) return;

    let frame: number | null = null;
    let sticky = false;
    let stickyTops: number[] = [];
    let heights: number[] = [];
    let written: string[] = [];

    const reset = () => {
      items.forEach((item) => {
        item.style.removeProperty('--stack-covered');
        item.style.removeProperty('--stack-depth');
        item.style.removeProperty('--stack-clip');
        item.style.removeProperty('--stack-tail');
        item.style.removeProperty('--stack-pull');
      });
      container.style.removeProperty('--stack-runout');
      written = [];
    };

    // De plakposities en hoogtes veranderen alleen bij resize of laat
    // binnenkomende fonts, dus die meten we los van het scrollen. Onder de
    // mobiele breakpoint plakt er niets en is er geen stapel om weg te duwen.
    const measure = () => {
      sticky = window.getComputedStyle(items[0]).position === 'sticky';

      if (!sticky) {
        reset();
        return;
      }

      stickyTops = items.map((item) => parseFloat(window.getComputedStyle(item).top) || 0);
      // Hoogte van de kaartlaag, niet van de li: de li krijgt hieronder een
      // staart aan padding, en offsetHeight in plaats van
      // getBoundingClientRect omdat die laatste meekrimpt met de scale van
      // het stapel-effect zelf.
      heights = items.map((item) => (item.firstElementChild as HTMLElement)?.offsetHeight ?? 0);

      const tails = resolveStackTails(
        items.map((_, index) => ({ height: heights[index], stickyTop: stickyTops[index] })),
      );

      tails.forEach((tail, index) => {
        items[index].style.setProperty('--stack-tail', tail.toFixed(1));
        // De opvolger vangt de staart in de flow op met zijn bovenmarge.
        items[index + 1]?.style.setProperty('--stack-pull', tail.toFixed(1));
      });

      container.style.setProperty('--stack-runout', tails[tails.length - 1].toFixed(1));
    };

    const update = () => {
      frame = null;

      if (!sticky) return;

      const bounds = items.map((item, index) => ({
        top: item.getBoundingClientRect().top,
        height: heights[index],
        stickyTop: stickyTops[index],
      }));

      resolveStackDepths(bounds).forEach(({ covered, depth, clip }, index) => {
        const value = `${covered.toFixed(3)}/${depth.toFixed(3)}/${clip.toFixed(1)}`;

        if (written[index] === value) return;

        written[index] = value;
        items[index].style.setProperty('--stack-covered', covered.toFixed(3));
        items[index].style.setProperty('--stack-depth', depth.toFixed(3));
        items[index].style.setProperty('--stack-clip', clip.toFixed(1));
      });
    };

    const schedule = () => {
      if (frame === null) frame = requestAnimationFrame(update);
    };

    const remeasure = () => {
      measure();
      schedule();
    };

    measure();
    update();

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', remeasure);

    // De vragenlijst klapt open en dicht, lettertypes komen later binnen.
    // Beide veranderen kaarthoogtes, dus opnieuw meten in plaats van gokken.
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(remeasure);
    observer?.observe(container);

    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', remeasure);
      observer?.disconnect();

      if (frame !== null) cancelAnimationFrame(frame);

      reset();
    };
  }, [containerRef, itemSelector]);
};
