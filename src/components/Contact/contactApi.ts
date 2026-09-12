/**
 * Praat met public/contact.php. Dat script staat op de server naast
 * index.html. De ontwikkelserver van Create React App draait geen PHP en geeft
 * het bestand als tekst terug, dus daar blijft het formulier weg. Hoe je het
 * lokaal test staat in de README.
 */
export const CONTACT_URL = '/contact.php';

export const ONDERWERPEN = ['opdracht', 'website', 'anders'] as const;
export type Onderwerp = (typeof ONDERWERPEN)[number];

export type Veld = 'naam' | 'email' | 'onderwerp' | 'bericht';

export interface Uitnodiging {
  token: string;
  /** Zo lang moet het token oud zijn voor de server het accepteert. */
  minLeeftijdMs: number;
  /** Alleen gevuld als Turnstile aanstaat. */
  turnstileSitekey: string | null;
}

export interface Bericht {
  naam: string;
  email: string;
  onderwerp: Onderwerp | '';
  bericht: string;
  taal: string;
  antibot: {
    challenge: string;
    honeypot: string;
    turnstile: string;
  };
}

export interface Antwoord {
  ok: boolean;
  /** De foutcode van de server, of `netwerk` als er geen bruikbaar antwoord kwam. */
  code?: string;
  /** Per veld een foutcode, zoals `leeg` of `te_lang`. */
  velden?: Partial<Record<Veld, string>>;
}

/**
 * Leest het antwoord alleen als JSON als het dat ook is. Draait er geen PHP,
 * dan komt hier de broncode van het script terug.
 */
const leesJson = async (antwoord: Response): Promise<Record<string, unknown> | null> => {
  if (!(antwoord.headers.get('content-type') ?? '').includes('application/json')) return null;

  try {
    const inhoud: unknown = await antwoord.json();
    return inhoud !== null && typeof inhoud === 'object' ? (inhoud as Record<string, unknown>) : null;
  } catch {
    return null;
  }
};

export const haalUitnodiging = async (signal?: AbortSignal): Promise<Uitnodiging> => {
  const antwoord = await fetch(CONTACT_URL, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
    signal,
  });
  const inhoud = await leesJson(antwoord);

  if (!inhoud) {
    throw new Error(`${CONTACT_URL} gaf geen JSON terug (status ${antwoord.status}).`);
  }
  if (inhoud.ok !== true || typeof inhoud.token !== 'string') {
    throw new Error(`${CONTACT_URL} gaf ${String(inhoud.code ?? 'geen token')} (status ${antwoord.status}).`);
  }

  return {
    token: inhoud.token,
    minLeeftijdMs: typeof inhoud.minLeeftijdMs === 'number' ? inhoud.minLeeftijdMs : 0,
    turnstileSitekey: typeof inhoud.turnstileSitekey === 'string' ? inhoud.turnstileSitekey : null,
  };
};

export const verstuurBericht = async (bericht: Bericht): Promise<Antwoord> => {
  let antwoord: Response;

  try {
    antwoord = await fetch(CONTACT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(bericht),
    });
  } catch {
    return { ok: false, code: 'netwerk' };
  }

  const inhoud = await leesJson(antwoord);
  if (!inhoud) return { ok: false, code: 'netwerk' };

  return {
    ok: antwoord.ok && inhoud.ok === true,
    code: typeof inhoud.code === 'string' ? inhoud.code : undefined,
    velden:
      inhoud.velden !== null && typeof inhoud.velden === 'object'
        ? (inhoud.velden as Antwoord['velden'])
        : undefined,
  };
};
