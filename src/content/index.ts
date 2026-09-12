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
  contact: {
    /** De link in de balk bovenin. */
    link: string;
    /** De link onder de introductie, boven het cv. */
    introLink: string;
    titel: string;
    intro: string;
    velden: {
      naam: string;
      email: string;
      onderwerp: string;
      /** Staat achter de vraag naar het onderwerp, het enige veld dat leeg mag blijven. */
      optioneel: string;
      bericht: string;
    };
    /** De sleutels zijn wat de server krijgt; zie ONDERWERPEN in contactApi.ts. */
    onderwerpen: {
      opdracht: string;
      website: string;
      anders: string;
    };
    versturen: string;
    bezig: string;
    privacy: string;
    /** Komt achter de privacyregel, alleen als Turnstile aanstaat. */
    turnstile: string;
    verzonden: {
      titel: string;
      tekst: string;
    };
    /** Een tekst bij elke foutcode die public/contact.php kan teruggeven. */
    fouten: {
      naam: { leeg: string; teLang: string; ongeldig: string };
      email: { leeg: string; ongeldig: string };
      onderwerp: { ongeldig: string };
      bericht: { leeg: string; teLang: string; ongeldig: string };
      teVeel: string;
      botcheck: string;
      algemeen: string;
    };
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
