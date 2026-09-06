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
    emailVerborgen: '(email address is in the PDF)',
    zoomHint: 'Pinch to zoom in',
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
