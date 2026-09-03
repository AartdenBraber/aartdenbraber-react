import React from 'react';
import './WordReveal.scss';

interface WordRevealProps {
  text: string;
  className?: string;
  /** Milliseconden die het eerste woord wacht op wat ervoor binnenkomt. */
  delay?: number;
}

/**
 * Kop die woord voor woord uit een eigen venstertje omhoog draait.
 *
 * De spaties staan als gewone tekst tussen de venstertjes, dus voorleessoftware
 * en zoekmachines lezen een doorlopende regel. Zonder javascript of met
 * beweging uit staat de kop er meteen; zie WordReveal.scss.
 */
const WordReveal: React.FC<WordRevealProps> = ({ text, className, delay = 0 }) => (
  <h1 className={className} style={{ '--word-base': `${delay}ms` } as React.CSSProperties}>
    {text.split(/\s+/).map((woord, index) => (
      <React.Fragment key={`${index}-${woord}`}>
        {index > 0 && ' '}
        <span className="word-mask">
          <span className="word" style={{ '--word-step': index } as React.CSSProperties}>
            {woord}
          </span>
        </span>
      </React.Fragment>
    ))}
  </h1>
);

export default WordReveal;
