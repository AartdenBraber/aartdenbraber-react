import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { haalUitnodiging } from './contactApi';

type Status = 'laden' | 'beschikbaar' | 'uit';

interface ContactformulierWaarde {
  /**
   * Het formulier en de links ernaartoe staan er pas bij `beschikbaar`. Zolang
   * de instellingen op de server ontbreken, of er geen PHP draait, ziet een
   * bezoeker dus niets dat het niet doet.
   */
  status: Status;
  turnstileSitekey: string | null;
  /**
   * Het token voor het volgende bericht. Met `vers` komt er altijd een nieuw.
   * Wacht zo nodig tot de tijdval van de server voorbij is.
   */
  haalToken: (vers?: boolean) => Promise<string>;
}

const UIT: ContactformulierWaarde = {
  status: 'uit',
  turnstileSitekey: null,
  haalToken: () => Promise.reject(new Error('Het contactformulier staat uit.')),
};

const ContactformulierContext = createContext<ContactformulierWaarde>(UIT);

const slaap = (ms: number) => new Promise<void>((klaar) => window.setTimeout(klaar, ms));

/**
 * Haalt bij het laden van de pagina een token op bij contact.php. Dat vertelt
 * meteen of het formulier werkt, en het zorgt dat de tijdval van drie seconden
 * voorbij is tegen de tijd dat iemand op versturen klikt.
 */
export const ContactformulierProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<Status>('laden');
  const [turnstileSitekey, setTurnstileSitekey] = useState<string | null>(null);

  const token = useRef<{ waarde: string; bruikbaarVanaf: number } | null>(null);
  const lopend = useRef<Promise<void> | null>(null);

  const haalOp = useCallback((signal?: AbortSignal): Promise<void> => {
    const verzoek: Promise<void> = haalUitnodiging(signal)
      .then((uitnodiging) => {
        token.current = {
          waarde: uitnodiging.token,
          bruikbaarVanaf: Date.now() + uitnodiging.minLeeftijdMs,
        };
        setTurnstileSitekey(uitnodiging.turnstileSitekey);
        setStatus('beschikbaar');
      })
      .finally(() => {
        // Een afgebroken verzoek mag het verzoek dat na hem kwam niet wissen.
        if (lopend.current === verzoek) lopend.current = null;
      });

    lopend.current = verzoek;
    return verzoek;
  }, []);

  useEffect(() => {
    // Zonder fetch, zoals in jsdom, blijft het formulier weg.
    if (typeof fetch !== 'function') {
      setStatus('uit');
      return;
    }

    const afbreken = new AbortController();

    haalOp(afbreken.signal).catch((fout: Error) => {
      if (afbreken.signal.aborted) return;

      console.warn(`Het contactformulier staat uit. ${fout.message}`);
      setStatus('uit');
    });

    return () => afbreken.abort();
  }, [haalOp]);

  const haalToken = useCallback(
    async (vers = false): Promise<string> => {
      if (!lopend.current && (vers || !token.current)) haalOp();
      if (lopend.current) await lopend.current;

      const huidig = token.current;
      if (!huidig) throw new Error('Er is geen token.');

      const wachten = huidig.bruikbaarVanaf - Date.now();
      if (wachten > 0 && wachten <= 60000) await slaap(wachten + 100);

      return huidig.waarde;
    },
    [haalOp],
  );

  const waarde = useMemo(
    () => ({ status, turnstileSitekey, haalToken }),
    [status, turnstileSitekey, haalToken],
  );

  return <ContactformulierContext.Provider value={waarde}>{children}</ContactformulierContext.Provider>;
};

/** Buiten de provider staat het formulier uit. */
export const useContactformulier = (): ContactformulierWaarde => useContext(ContactformulierContext);
