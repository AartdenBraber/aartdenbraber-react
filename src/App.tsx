import React from 'react';

// Literata via /opsz.css, niet kaal. Het kale pakket levert alleen de
// gewichtsas; de optische maat zit in dit aparte bestand. Zonder dit pad doet
// font-optical-sizing stilletjes niets.
import '@fontsource-variable/literata/opsz.css';
import '@fontsource-variable/source-sans-3';

import About from './components/About/About';
import Cases from './components/Cases/Cases';
import CvDownload from './components/CvDownload/CvDownload';
import Experience from './components/Experience/Experience';
import Faq from './components/Faq/Faq';
import Hero from './components/Hero/Hero';
import SectionNav from './components/SectionNav/SectionNav';
import Services from './components/Services/Services';
import SiteFooter from './components/SiteFooter/SiteFooter';
import Testimonials from './components/Testimonials/Testimonials';
import { useRevealOnView } from './hooks/useRevealOnView';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';

const Page: React.FC = () => {
  const { t } = useLanguage();

  // Alles met data-reveal-item komt één keer omhoog binnen zodra het in beeld
  // scrolt. De werkervaring regelt zijn eigen kaarten, want die stapelen.
  useRevealOnView(null, '[data-reveal-item]');

  return (
    <>
      <a className="skip-link" href="#over-mij">
        {t.nav.skipToContent}
      </a>

      <Hero />

      <SectionNav />

      <main id="hoofdinhoud">
        <About />
        <Services />
        <Cases />
        <Experience />
        <Testimonials />
        <Faq />
        <CvDownload />
      </main>

      <SiteFooter />
    </>
  );
};

const App: React.FC = () => (
  <LanguageProvider>
    <Page />
  </LanguageProvider>
);

export default App;
