import { Language } from '../content';

export const SITE_URL = 'https://aartdenbraber.nl';

/**
 * De taal hangt aan het adres en niet aan een voorkeur in de browser. Alleen zo
 * krijgt elke taal een eigen adres dat een zoekmachine kan indexeren, en klopt
 * wat een bezoeker deelt met wat hij zag.
 *
 * `/` is Nederlands, `/en` is Engels. De server stuurt voor beide dezelfde
 * index.html terug; dat regelt de rewrite in public/.htaccess.
 */
export const languageFromPath = (pathname: string): Language =>
  /^\/en(\/|$)/i.test(pathname) ? 'en' : 'nl';

export const pathForLanguage = (language: Language): string =>
  language === 'en' ? '/en' : '/';

export const canonicalForLanguage = (language: Language): string =>
  `${SITE_URL}${pathForLanguage(language)}`;

/** Bij het wisselen blijft de rest van het adres staan, zoals #portfolio. */
export const urlForLanguage = (language: Language, search: string, hash: string): string =>
  `${pathForLanguage(language)}${search}${hash}`;
