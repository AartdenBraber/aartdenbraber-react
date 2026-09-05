import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/bootstrap.scss';
import './styles/global.scss';
// Literata via de opsz-as, zodat een kop van 67px en een kaarttitel van 20px
// niet dezelfde tekening opgeblazen krijgen. De lopende tekst blijft Raleway,
// zoals de site die altijd had.
import '@fontsource-variable/literata/opsz.css';
import '@fontsource/raleway/400.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
