export type Language = 'nl' | 'en';

export interface NavContent {
  skipToContent: string;
  items: { href: string; label: string }[];
}

export interface HeroContent {
  greetings: { morning: string; afternoon: string; evening: string };
  name: string;
  role: string;
  title: string;
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  scrollLabel: string;
}

export interface AboutContent {
  heading: string;
  paragraphs: string[];
  facts: { label: string; value: string }[];
}

export interface ServicesContent {
  heading: string;
  intro: string;
  items: { title: string; body: string }[];
}

/**
 * Eén regel werkervaring. `via` maakt er een geneste opdracht van: de kaart
 * wordt dan ingesprongen getoond onder de werkgever waar de opdracht via liep.
 */
export interface ExperienceEntry {
  id: string;
  company: string;
  via?: string;
  role: string;
  location: string;
  period: string;
  current?: boolean;
  summary: string;
  highlights: string[];
  stack: string[];
}

export interface ExperienceContent {
  heading: string;
  intro: string;
  highlightsLabel: string;
  stackLabel: string;
  currentLabel: string;
  viaLabel: string;
  entries: ExperienceEntry[];
}

export interface TestimonialsContent {
  heading: string;
  intro: string;
  moreLabel: string;
  moreHref: string;
}

export interface FaqContent {
  heading: string;
  intro: string;
  /** Antwoorden mogen meerdere alinea's bevatten, gescheiden door een lege regel. */
  items: { id: string; question: string; answer: string }[];
}

export interface CvContent {
  heading: string;
  body: string;
  downloadLabel: string;
  fileName: string;
}

export interface ContactContent {
  heading: string;
  body: string;
  /**
   * Het adres staat bewust in twee helften. Zo komt het niet als
   * `mailto:`-link in de HTML te staan, waar oogstbots het zo weglezen.
   * Het wordt pas samengevoegd wanneer iemand op de knop klikt.
   */
  emailLabel: string;
  emailUser: string;
  emailDomain: string;
  linkedIn: string;
  linkedInLabel: string;
}

export interface MetaContent {
  title: string;
  description: string;
}

export interface SiteContent {
  meta: MetaContent;
  nav: NavContent;
  hero: HeroContent;
  about: AboutContent;
  services: ServicesContent;
  experience: ExperienceContent;
  testimonials: TestimonialsContent;
  faq: FaqContent;
  cv: CvContent;
  contact: ContactContent;
}
