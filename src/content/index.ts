import nl from './nl';
import en from './en';
import { Language, SiteContent } from './types';

export * from './types';
export * from './testimonials';

export const LANGUAGES: Language[] = ['nl', 'en'];

export const DEFAULT_LANGUAGE: Language = 'nl';

export const content: Record<Language, SiteContent> = { nl, en };

/**
 * In development staat alleen het dummy-cv in `public`, zodat er geen echte
 * persoonsgegevens in de repo komen. In productie staan de twee echte pdf's
 * naast elkaar op de server.
 */
export const cvUrl = (language: Language): string => {
  if (process.env.NODE_ENV !== 'production') {
    return `${process.env.PUBLIC_URL}/CV-DEV.pdf`;
  }

  return `${process.env.PUBLIC_URL}/CV-Aart-den-Braber-${language.toUpperCase()}.pdf`;
};
