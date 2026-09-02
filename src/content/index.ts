import nl from './nl';
import en from './en';
import { Language, SiteContent } from './types';

export * from './types';
export * from './testimonials';

export const LANGUAGES: Language[] = ['nl', 'en'];

export const DEFAULT_LANGUAGE: Language = 'nl';

export const content: Record<Language, SiteContent> = { nl, en };

/**
 * Beide cv's staan in `public` en gaan met de build mee. Ze zijn sowieso al
 * openbaar te downloaden vanaf de site zelf.
 */
export const cvUrl = (language: Language): string =>
  `${process.env.PUBLIC_URL}/CV-Aart-den-Braber-${language.toUpperCase()}.pdf`;
