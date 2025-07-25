import React from 'react';
import './styles/bootstrap.scss';

import './App.scss'
import Hero from './components/Hero/Hero';
import Intro from './components/Intro/Intro';
import "typeface-roboto-slab";

function App() {

  return (
    <div className="site-content">
      <Hero />
      <Intro />


      <main className='container'>
      </main>
    </div>
  );
}

export default App;
