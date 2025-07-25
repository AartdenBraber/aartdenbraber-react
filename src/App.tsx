import React from 'react';
import './styles/bootstrap.scss';

import './App.scss'
import Hero from './components/Hero/Hero';
import Intro from './components/Intro/Intro';
import '@fontsource/roboto-slab/500.css';
import '@fontsource/raleway/400.css';

import CVDisplay from './components/CVDisplay/CVDisplay';

function App() {

  return (
    <div className="site-content">
      <Hero />
      <Intro />
      <CVDisplay />

      <main className='container'>
      </main>
    </div>
  );
}

export default App;
