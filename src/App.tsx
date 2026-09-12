import React from 'react';
import './App.scss';
import Hero from './components/Hero/Hero';
import Intro from './components/Intro/Intro';
import CVDisplay from './components/CVDisplay/CVDisplay';
import StickyBar from './components/StickyBar/StickyBar';
import Contact from './components/Contact/Contact';
import { ContactformulierProvider } from './components/Contact/ContactformulierContext';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';

/**
 * De hero vult het hele scherm. Wie met een toetsenbord of een schermlezer
 * binnenkomt, moet daar niet eerst helemaal doorheen; deze link staat als
 * eerste in de tabvolgorde en wordt zichtbaar zodra hij focus krijgt.
 */
const SkipLink: React.FC = () => {
  const { t } = useLanguage();
  return (
    <a className="skip-link" href="#inhoud">
      {t.nav.skipToContent}
    </a>
  );
};

const Pagina: React.FC = () => (
  <div className="site-content">
    <SkipLink />
    <StickyBar />

    {/* Eén main om de hele pagina. Er stonden er twee: deze en een lege
        container onderaan. */}
    <main>
      <Hero />
      <Intro />
      <CVDisplay />
      <Contact />
    </main>
  </div>
);

function App() {
  return (
    <LanguageProvider>
      <ContactformulierProvider>
        <Pagina />
      </ContactformulierProvider>
    </LanguageProvider>
  );
}

export default App;
