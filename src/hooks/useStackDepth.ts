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
  /** Pixels die de kaart visueel moet verschuiven (positief is omlaag). */
  shift: number;
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
 * Aan het einde vertrekt de stapel als één geheel. De laatste kaart plakt
 * nooit (zijn onderkant is de onderkant van de lijst) en scrolt gewoon door;
 * zodra hij voorbij zijn plakpositie komt, schuift `shift` alle andere
 * kaarten exact evenveel mee omhoog. Datzelfde getal corrigeert ook het
 * uitduwen door de lijstonderkant, dat de hoogste kaarten eerder raakt dan
 * de rest: `shift` is het verschil tussen wat de browser de kaart al heeft
 * opgeschoven en waar hij in de vertrekkende stapel hoort te liggen.
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

  // Hoe ver de laatste kaart al voorbij zijn plakpositie is gescrold: de
  // vertreksnelheid van de hele stapel.
  const last = cards[cards.length - 1];
  const departure = last ? Math.max(0, last.stickyTop - last.top) : 0;

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
    const pushedUp = next ? Math.max(0, card.stickyTop - card.top) : 0;

    depths[index] = {
      covered: covered[index],
      depth: Math.min(MAX_DEPTH, sum),
      clip: clip > 0 ? clip : NO_CLIP,
      shift: next ? pushedUp - departure : 0,
    };
  }

  return depths;
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
        item.style.removeProperty('--stack-shift');
      });
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
      // offsetHeight in plaats van getBoundingClientRect: die laatste krimpt
      // mee met de scale van het stapel-effect zelf.
      heights = items.map((item) => item.offsetHeight);
    };

    const update = () => {
      frame = null;

      if (!sticky) return;

      const bounds = items.map((item, index) => ({
        top: item.getBoundingClientRect().top,
        height: heights[index],
        stickyTop: stickyTops[index],
      }));

      resolveStackDepths(bounds).forEach(({ covered, depth, clip, shift }, index) => {
        const value = `${covered.toFixed(3)}/${depth.toFixed(3)}/${clip.toFixed(1)}/${shift.toFixed(1)}`;

        if (written[index] === value) return;

        written[index] = value;
        items[index].style.setProperty('--stack-covered', covered.toFixed(3));
        items[index].style.setProperty('--stack-depth', depth.toFixed(3));
        items[index].style.setProperty('--stack-clip', clip.toFixed(1));
        items[index].style.setProperty('--stack-shift', shift.toFixed(1));
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
