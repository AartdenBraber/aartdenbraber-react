import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.scss';
// Literata via de opsz-as, zodat een kop van 67px en een kaarttitel van 20px
// niet dezelfde tekening opgeblazen krijgen. De lopende tekst blijft Raleway,
// zoals de site die altijd had.
import '@fontsource-variable/literata/opsz.css';
import '@fontsource/raleway/400.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { startMeten } from './utils/meten';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Bezoekersstatistiek voor eigen gebruik, zie src/utils/meten.ts. Alleen in de
// build die live gaat: in de ontwikkelserver draait geen PHP.
if (process.env.NODE_ENV === 'production') startMeten();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
