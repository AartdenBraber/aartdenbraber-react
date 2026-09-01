import { RefObject, useEffect, useState } from 'react';

/** Waar in het beeld de scheidslijn ligt tussen "vorige sectie" en "deze sectie". */
const READING_LINE = 0.35;

/** Vanaf hoeveel van een schermhoogte de navigatie tevoorschijn komt. */
const REVEAL_AFTER = 0.6;

export interface SectionBounds {
  id: string;
  top: number;
  height: number;
}

export interface SectionState {
  activeId: string | null;
  progress: number;
  visible: boolean;
}

/**
 * Bepaalt in welke sectie de lezer zit en hoe ver erdoorheen.
 *
 * Los van de DOM gehouden: dit is het enige stuk waar iets te beslissen valt,
 * en zo is het te testen zonder een browser die frames produceert.
 */
export const resolveSectionState = (
  sections: SectionBounds[],
  scrollY: number,
  viewportHeight: number,
): SectionState => {
  const visible = scrollY > viewportHeight * REVEAL_AFTER;

  if (sections.length === 0) {
    return { activeId: null, progress: 0, visible };
  }

  const line = scrollY + viewportHeight * READING_LINE;

  let current = sections[0];
  sections.forEach((section) => {
    if (section.top <= line) current = section;
  });

  const through = (line - current.top) / Math.max(current.height, 1);

  return {
    activeId: current.id,
    progress: Math.min(1, Math.max(0, through)),
    visible,
  };
};

/**
 * De voortgang gaat als CSS-variabele rechtstreeks naar het element, niet via
 * state. Een re-render per scrollframe zou niets toevoegen en wel kosten. De
 * actieve sectie en de zichtbaarheid zitten wél in state, want die veranderen
 * hooguit een paar keer per pagina.
 */
export const useSectionProgress = (
  ids: string[],
  targetRef: RefObject<HTMLElement>,
): Omit<SectionState, 'progress'> => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  const key = ids.join(',');

  useEffect(() => {
    let sections: SectionBounds[] = [];
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
    };

    const update = () => {
      frame = null;

      const state = resolveSectionState(sections, window.scrollY, window.innerHeight);

      setActiveId(state.activeId);
      setVisible(state.visible);
      targetRef.current?.style.setProperty('--progress', state.progress.toFixed(4));
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
  }, [key, targetRef]);

  return { activeId, visible };
};
