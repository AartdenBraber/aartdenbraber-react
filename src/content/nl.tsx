import React from 'react';
import { SiteContent } from './index';

export const nl: SiteContent = {
  meta: {
    title: 'Aart den Braber - developer | Backend, frontend, test en UX',
    description: 'Freelance developer uit Nederland. Backend, frontend, test en UX.',
  },
  header: {
    siteDescription: 'Backend - frontend - test - UX',
  },
  hero: {
    greetings: {
      morning: 'Goedemorgen',
      afternoon: 'Goedemiddag',
      evening: 'Goedenavond',
    },
    title:
      'Mijn focus ligt op het bouwen van duurzame applicaties - technisch sterk, gebruiksvriendelijk en toekomstbestendig.',
    cta: 'Bekijk mijn cv',
  },
  intro: {
    pageTitle: 'Ontwikkeling begint bij visie.',
    body: (
      <>
        <p>
          Mijn naam is <strong>Aart den Braber</strong>, freelance developer uit Nederland. Ik ben
          gespecialiseerd in <strong>frontend development</strong> (Angular, TypeScript, UX) en
          <strong> backend development</strong> met <strong>Node.js en Java</strong>.
        </p>

        <p>
          Hoewel ik ook ervaring heb met PHP en Python, richt ik me vooral op{' '}
          <strong>JavaScript-gebaseerde en Java-backendomgevingen</strong>. Ik haal de meeste energie
          uit projecten die vragen om <strong>creatief denkwerk</strong> en{' '}
          <strong>doordachte architectuur</strong> - bij voorkeur in langdurige, remote opdrachten
          waar ik echt impact kan maken.
        </p>

        <p>
          Benieuwd of ik pas bij jouw project of opdrachtgever?
          <br />
          Bekijk gerust mijn CV hieronder om te zien hoe mijn ervaring aansluit bij je rol van senior
          freelance developer.
        </p>
      </>
    ),
  },
  cv: {
    url: '/CV-Aart-den-Braber-NL.pdf',
    actionWord: 'Download',
    rest: ' CV als PDF',
    sectionLabel: 'Het cv van Aart den Braber, pagina voor pagina',
    emailVerborgen: '(e-mailadres niet kopieerbaar, tegen bots)',
    zoomHint: 'Knijp om te vergroten',
  },
  contact: {
    link: 'Contact',
    introLink: 'Stuur me een bericht',
    sluiten: 'Sluiten',
    afsluiter: 'Heb je een opdracht voor een developer, of zoek je iemand die een nieuwe website voor je bouwt?',
    titel: 'Laten we kennismaken.',
    intro:
      'Heb je een opdracht voor een developer, of zoek je iemand die een nieuwe website voor je bouwt? Vertel hieronder waar het om gaat.',
    velden: {
      naam: 'Naam',
      email: 'E-mailadres',
      onderwerp: 'Waar gaat het over?',
      optioneel: '(niet verplicht)',
      bericht: 'Bericht',
    },
    onderwerpen: {
      opdracht: 'Een opdracht als developer',
      website: 'Een nieuwe website',
      anders: 'Iets anders',
    },
    versturen: 'Versturen',
    bezig: 'Bezig met versturen…',
    privacy: 'Ik gebruik je gegevens alleen om op dit bericht te reageren.',
    turnstile: 'Cloudflare Turnstile controleert of het bericht niet van een bot komt.',
    verzonden: {
      titel: 'Je bericht is verstuurd.',
      tekst: 'Bedankt. Ik reageer op het e-mailadres dat je hebt ingevuld.',
    },
    fouten: {
      naam: {
        leeg: 'Vul je naam in.',
        teLang: 'Je naam mag hooguit 100 tekens lang zijn.',
        ongeldig: 'Er staan tekens in je naam die niet kunnen.',
      },
      email: {
        leeg: 'Vul je e-mailadres in.',
        ongeldig: 'Dit e-mailadres klopt niet.',
      },
      onderwerp: {
        ongeldig: 'Kies een van de onderwerpen.',
      },
      bericht: {
        leeg: 'Schrijf een bericht.',
        teLang: 'Je bericht mag hooguit 5000 tekens lang zijn.',
        ongeldig: 'Er staan tekens in je bericht die niet kunnen.',
      },
      teVeel: 'Er zijn net te veel berichten verstuurd. Probeer het later nog eens.',
      botcheck: 'De controle op bots is niet gelukt. Laad de pagina opnieuw en probeer het nog een keer.',
      algemeen: 'Versturen is niet gelukt. Probeer het later nog eens.',
    },
  },
  nav: {
    skipToContent: 'Naar de inhoud',
    backToTop: 'Terug naar boven',
    noscript: 'Deze site heeft JavaScript nodig om het cv te tonen.',
  },
  languageSwitcher: {
    label: 'Taal',
    nl: 'Nederlands',
    en: 'Engels',
  },
};
