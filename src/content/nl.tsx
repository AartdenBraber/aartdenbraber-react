import React from 'react';
import { SiteContent } from './index';

export const nl: SiteContent = {
  meta: {
    title: 'Aart den Braber - developer',
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
    scrollLabel: 'Naar het volgende onderdeel',
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
          Hoewel ik ook ervaring heb met PHP en Python, richt ik me vooral op
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
  },
  languageSwitcher: {
    label: 'Taal',
    nl: 'Nederlands',
    en: 'Engels',
  },
};
