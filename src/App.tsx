import React from 'react';
import './App.scss';
import Hero from './components/Hero/Hero';
import Intro from './components/Intro/Intro';
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
