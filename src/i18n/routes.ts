import { Language } from '../content';

export const SITE_URL = 'https://aartdenbraber.nl';

/**
 * De taal hangt aan de URL en niet aan een voorkeur in de browser. Alleen zo
 * krijgt elke taal een eigen adres dat een zoekmachine kan indexeren, en klopt
 * wat een bezoeker deelt met wat hij zag.
 *
 * `/` is Nederlands, `/en` is Engels. De server stuurt voor beide dezelfde
 * index.html terug, dus er is geen serverconfiguratie voor nodig.
 */
export const languageFromPath = (pathname: string): Language =>
  /^\/en(\/|$)/i.test(pathname) ? 'en' : 'nl';

export const pathForLanguage = (language: Language): string =>
  language === 'en' ? '/en' : '/';

export const canonicalForLanguage = (language: Language): string =>
  `${SITE_URL}${pathForLanguage(language)}`;

/**
 * Bij het wisselen van taal blijft de rest van de URL staan, zodat iemand die
 * vanuit de navigatie op #werkervaring zit daar ook blijft.
 */
export const urlForLanguage = (language: Language, search: string, hash: string): string =>
  `${pathForLanguage(language)}${search}${hash}`;
