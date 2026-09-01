import { RefObject, useEffect, useState } from 'react';

/** Waar in het beeld de scheidslijn ligt tussen "vorige sectie" en "deze sectie". */
const READING_LINE = 0.35;

/** Over hoeveel pixels de navigatie in- en uitschuift zodra de hero voorbij is. */
const REVEAL_RAMP = 140;

export interface SectionBounds {
  id: string;
  top: number;
  height: number;
}

export interface SectionState {
  activeId: string | null;
  progress: number;
  /** 0 zolang de hero in beeld staat, 1 als hij helemaal voorbij is. */
  reveal: number;
}

const clamp = (value: number) => Math.min(1, Math.max(0, value));

/**
 * Bepaalt in welke sectie de lezer zit, hoe ver erdoorheen, en hoe ver de
 * navigatie tevoorschijn mag komen.
 *
 * Los van de DOM gehouden: dit is het enige stuk waar iets te beslissen valt,
 * en zo is het te testen zonder een browser die frames produceert.
 *
 * `heroBottom` is de onderkant van de hero ten opzichte van de bovenkant van
 * het beeld. Positief betekent dat de hero nog in beeld staat.
 */
export const resolveSectionState = (
  sections: SectionBounds[],
  scrollY: number,
  viewportHeight: number,
  heroBottom: number,
): SectionState => {
  const reveal = clamp(-heroBottom / REVEAL_RAMP);

  if (sections.length === 0) {
    return { activeId: null, progress: 0, reveal };
  }

  const line = scrollY + viewportHeight * READING_LINE;

  let current = sections[0];
  sections.forEach((section) => {
    if (section.top <= line) current = section;
  });

  const through = (line - current.top) / Math.max(current.height, 1);

  return { activeId: current.id, progress: clamp(through), reveal };
};

/**
 * De voortgang en het tevoorschijn komen gaan als CSS-variabelen rechtstreeks
 * naar het element, niet via state. Een re-render per scrollframe zou niets
 * toevoegen en wel kosten. Alleen de actieve sectie en de zichtbaarheid zitten
 * in state, want die veranderen hooguit een paar keer per pagina.
 */
export const useSectionProgress = (
  ids: string[],
  targetRef: RefObject<HTMLElement>,
  heroSelector = '.hero',
): { activeId: string | null; visible: boolean } => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  const key = ids.join(',');

  useEffect(() => {
    let sections: SectionBounds[] = [];
    let heroEnd = 0;
    let frame: number | null = null;

    const measure = () => {
      sections = key
        .split(',')
        .map((id) => document.getElementById(id))
        .filter((element): element is HTMLElement => element !== null)
        .map((element) => {
          const rect = element.getBoundingClientRect();

          return { id: element.id, top: rect.top + window.scrollY, height: rect.height };
        });

      const hero = document.querySelector(heroSelector);
      heroEnd = hero ? hero.getBoundingClientRect().bottom + window.scrollY : 0;
    };

    const update = () => {
      frame = null;

      const state = resolveSectionState(
        sections,
        window.scrollY,
        window.innerHeight,
        heroEnd - window.scrollY,
      );

      setActiveId(state.activeId);
      setVisible(state.reveal > 0);
      targetRef.current?.style.setProperty('--progress', state.progress.toFixed(4));
      targetRef.current?.style.setProperty('--reveal', state.reveal.toFixed(4));
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

    // De vragenlijst klapt open en dicht, lettertypes komen later binnen. Beide
    // verschuiven alles eronder, dus opnieuw meten in plaats van gokken.
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(remeasure);
    observer?.observe(document.documentElement);

    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', remeasure);
      observer?.disconnect();

      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [key, targetRef, heroSelector]);

  return { activeId, visible };
};
