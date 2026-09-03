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
    scrollLabel: string;
  };
  intro: {
    pageTitle: string;
    /** De leeftijd staat in de lopende tekst en wordt uitgerekend, niet ingetypt. */
    body: (age: number) => ReactNode;
  };
  cv: {
    url: string;
    actionWord: string;
    rest: string;
  };
  languageSwitcher: {
    label: string;
    nl: string;
    en: string;
  };
}

export const content: Record<Language, SiteContent> = { nl, en };
