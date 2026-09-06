import { ReactNode } from 'react';
import { nl } from './nl';
import { en } from './en';

export type Language = 'nl' | 'en';

export interface SiteContent {
  meta: {
    title: string;
    description: string;
  };
  header: {
    siteDescription: string;
  };
  hero: {
    /** Welke groet je krijgt hangt af van het uur; zie getGreeting in Hero. */
    greetings: {
      morning: string;
      afternoon: string;
      evening: string;
    };
    title: string;
    /** Zichtbaar label op de knop onderin de hero. */
    cta: string;
  };
  intro: {
    pageTitle: string;
    body: ReactNode;
  };
  cv: {
    url: string;
    actionWord: string;
    rest: string;
    /** Naam van het cv-blok voor een schermlezer. */
    sectionLabel: string;
    /** Komt in de tekstlaag te staan op de plek van het e-mailadres. */
    emailVerborgen: string;
    /** Eenmalige aanwijzing bij het cv, alleen op een aanraakscherm. */
    zoomHint: string;
  };
  nav: {
    skipToContent: string;
    backToTop: string;
    /** Staat in het noscript-blok; zie scripts/taalpaginas.js. */
    noscript: string;
  };
  languageSwitcher: {
    label: string;
    nl: string;
    en: string;
  };
}

export const content: Record<Language, SiteContent> = { nl, en };
