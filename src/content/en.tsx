import React from 'react';
import { SiteContent } from './index';

export const en: SiteContent = {
  meta: {
    title: 'Aart den Braber - developer | Backend, frontend, test and UX',
    description: 'Freelance developer from the Netherlands. Backend, frontend, test and UX.',
  },
  header: {
    siteDescription: 'Backend - frontend - test - UX',
  },
  hero: {
    greetings: {
      morning: 'Good morning',
      afternoon: 'Good afternoon',
      evening: 'Good evening',
    },
    title:
      'I focus on crafting sustainable applications - technically strong, user-friendly, and future-proof.',
    cta: 'View my CV',
  },
  intro: {
    pageTitle: 'From vision to value.',
    body: (
      <>
        <p>
          My name is <strong>Aart den Braber</strong>, a freelance developer from the Netherlands. I
          specialize in <strong>frontend development</strong> (Angular, TypeScript, UX) and
          <strong> backend development</strong> using <strong>Node.js and Java</strong>.
        </p>

        <p>
          While I also have experience with PHP and Python, I focus primarily on
          <strong> JavaScript-based and Java backend environments</strong>. I'm most energized by
          projects that require both <strong>creative problem-solving</strong> and{' '}
          <strong>thoughtful architecture</strong> - ideally in long-term, remote roles where I can
          contribute meaningful value over time.
        </p>

        <p>
          Curious if I'm the right fit for your project or client?
          <br />
          Feel free to review my CV below to see how my experience aligns with your needs for a
          senior freelance developer.
        </p>
      </>
    ),
  },
  cv: {
    url: '/CV-Aart-den-Braber-EN.pdf',
    actionWord: 'Download',
    rest: ' CV as PDF',
    sectionLabel: 'The CV of Aart den Braber, page by page',
    emailVerborgen: '(email address not copyable, to block bots)',
    zoomHint: 'Pinch to zoom in',
  },
  contact: {
    link: 'Contact',
    introLink: 'Send me a message',
    sluiten: 'Close',
    afsluiter: 'Do you have a project that needs a developer, or are you looking for someone to build a new website?',
    titel: "Let's talk.",
    intro:
      "Do you have a project that needs a developer, or are you looking for someone to build a new website? Tell me what it's about below.",
    velden: {
      naam: 'Name',
      email: 'Email address',
      onderwerp: 'What is it about?',
      optioneel: '(optional)',
      bericht: 'Message',
    },
    onderwerpen: {
      opdracht: 'Freelance developer work',
      website: 'A new website',
      anders: 'Something else',
    },
    versturen: 'Send',
    bezig: 'Sending…',
    privacy: 'I only use your details to reply to this message.',
    turnstile: "Cloudflare Turnstile checks that the message isn't coming from a bot.",
    verzonden: {
      titel: 'Your message has been sent.',
      tekst: "Thanks. I'll reply to the email address you entered.",
    },
    fouten: {
      naam: {
        leeg: 'Please enter your name.',
        teLang: 'Your name can be up to 100 characters long.',
        ongeldig: "Your name contains characters that aren't allowed.",
      },
      email: {
        leeg: 'Please enter your email address.',
        ongeldig: "This email address doesn't look right.",
      },
      onderwerp: {
        ongeldig: 'Please pick one of the topics.',
      },
      bericht: {
        leeg: 'Please write a message.',
        teLang: 'Your message can be up to 5,000 characters long.',
        ongeldig: "Your message contains characters that aren't allowed.",
      },
      teVeel: 'Too many messages were sent just now. Please try again later.',
      botcheck: 'The bot check failed. Reload the page and try again.',
      algemeen: "Your message couldn't be sent. Please try again later.",
    },
  },
  nav: {
    skipToContent: 'Skip to content',
    backToTop: 'Back to top',
    noscript: 'This site needs JavaScript to show the CV.',
  },
  languageSwitcher: {
    label: 'Language',
    nl: 'Dutch',
    en: 'English',
  },
};
