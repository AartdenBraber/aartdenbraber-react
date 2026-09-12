import { RefObject, useCallback, useEffect, useMemo, useRef } from 'react';

interface TurnstileApi {
  render: (element: HTMLElement, opties: Record<string, unknown>) => string | undefined;
  getResponse: (widgetId: string) => string | undefined;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

let scriptLaden: Promise<TurnstileApi> | null = null;

const laadScript = (): Promise<TurnstileApi> => {
  if (window.turnstile) return Promise.resolve(window.turnstile);

  if (!scriptLaden) {
    scriptLaden = new Promise((klaar, mislukt) => {
      const script = document.createElement('script');
      script.src = SCRIPT_URL;
      script.async = true;
      script.onload = () =>
        window.turnstile ? klaar(window.turnstile) : mislukt(new Error('Turnstile laadde zonder api.'));
      script.onerror = () => {
        // Een volgende poging mag het opnieuw proberen.
        scriptLaden = null;
        script.remove();
        mislukt(new Error('Het script van Turnstile laadde niet.'));
      };
      document.head.appendChild(script);
    });
  }

  return scriptLaden;
};

const slaap = (ms: number) => new Promise<void>((klaar) => window.setTimeout(klaar, ms));

export interface Turnstile {
  /** Laadt het script en zet de widget neer. Mag vaker aangeroepen worden. */
  start: () => Promise<void>;
  /** Het token van de widget, of een lege tekst als dat er binnen `maxMs` niet is. */
  wachtOpToken: (maxMs: number) => Promise<string>;
  /** Een token werkt maar één keer, dus na elke poging moet de widget een nieuw halen. */
  vernieuw: () => void;
  /** Haalt de widget weg. Nodig voordat het formulier uit de pagina verdwijnt. */
  verwijder: () => void;
}

/**
 * De widget van Cloudflare Turnstile, stil: hij laat zich alleen zien als
 * Cloudflare twijfelt.
 *
 * Het script komt pas binnen als iemand het formulier aanraakt. Wie alleen het
 * cv leest, maakt zo geen verbinding met Cloudflare.
 *
 * Zonder sitekey doet dit niets en is het token leeg. De server vraagt er dan
 * ook niet om.
 */
export const useTurnstile = (
  sitekey: string | null,
  taal: string,
  plek: RefObject<HTMLDivElement>,
): Turnstile => {
  const widget = useRef<{ api: TurnstileApi; id: string } | null>(null);
  const starten = useRef<Promise<void> | null>(null);
  const fout = useRef(false);

  const start = useCallback((): Promise<void> => {
    if (!sitekey) return Promise.resolve();
    if (starten.current) return starten.current;

    const bezig = laadScript()
      .then((api) => {
        const element = plek.current;
        if (!element || widget.current) return;

        const id = api.render(element, {
          sitekey,
          action: 'contact',
          appearance: 'interaction-only',
          language: taal,
          'refresh-expired': 'auto',
          'response-field': false,
          callback: () => {
            fout.current = false;
          },
          'error-callback': (code: string) => {
            fout.current = true;
            console.error(
              `Turnstile gaf foutcode ${code}. Zie developers.cloudflare.com/turnstile/troubleshooting/client-side-errors.`,
            );
          },
        });

        if (id) widget.current = { api, id };
      })
      .catch((reden: Error) => {
        fout.current = true;
        starten.current = null;
        console.error(reden.message);
      });

    starten.current = bezig;
    return bezig;
  }, [sitekey, taal, plek]);

  const wachtOpToken = useCallback(
    async (maxMs: number): Promise<string> => {
      if (!sitekey) return '';

      await start();

      // Heeft Cloudflare al een fout gemeld, dan heeft wachten geen zin. Het
      // bericht gaat dan zonder token en de server beslist.
      const tot = Date.now() + maxMs;
      for (;;) {
        const huidig = widget.current;
        const token = huidig ? huidig.api.getResponse(huidig.id) ?? '' : '';
        if (token || fout.current || Date.now() >= tot) return token;

        await slaap(150);
      }
    },
    [sitekey, start],
  );

  const vernieuw = useCallback(() => {
    const huidig = widget.current;
    if (!huidig) return;

    fout.current = false;
    try {
      huidig.api.reset(huidig.id);
    } catch {
      // De widget is al weg.
    }
  }, []);

  // Een widget waarvan de plek uit de pagina verdwijnt, blijft doorlopen en
  // meldt dan in de console dat hij zijn element niet meer vindt.
  const verwijder = useCallback(() => {
    const huidig = widget.current;
    widget.current = null;
    starten.current = null;
    if (!huidig) return;

    try {
      huidig.api.remove(huidig.id);
    } catch {
      // De widget is al weg.
    }
  }, []);

  useEffect(() => verwijder, [verwijder]);

  return useMemo(
    () => ({ start, wachtOpToken, vernieuw, verwijder }),
    [start, wachtOpToken, vernieuw, verwijder],
  );
};
