import React from 'react';

import '@fontsource/raleway/400.css';
import '@fontsource/raleway/600.css';
import '@fontsource/raleway/700.css';
import '@fontsource/roboto-slab/500.css';

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
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';

const Page: React.FC = () => {
  const { t } = useLanguage();

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
