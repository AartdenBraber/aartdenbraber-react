import React from 'react';
import './styles/bootstrap.scss';

import './App.scss'
import Hero from './components/Hero/Hero';
import Intro from './components/Intro/Intro';
// Literata via de opsz-as, zodat een kop van 67px en een kaarttitel van 20px
// niet dezelfde tekening opgeblazen krijgen. De lopende tekst blijft Raleway,
// zoals de site die altijd had.
import '@fontsource-variable/literata/opsz.css';
import '@fontsource/raleway/400.css';

import CVDisplay from './components/CVDisplay/CVDisplay';
import { LanguageProvider } from './i18n/LanguageContext';

function App() {

  return (
    <LanguageProvider>
      <div className="site-content">
        <Hero />
        <Intro />
        <CVDisplay />

        <main className='container'>
        </main>
      </div>
    </LanguageProvider>
  );
}

export default App;
