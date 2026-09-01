import React from 'react';

interface WordRevealProps {
  text: string;
  className?: string;
  /** Milliseconden die het eerste woord wacht op wat ervoor binnenkomt. */
  delay?: number;
}

/**
 * Kop die woord voor woord uit een eigen venstertje omhoog draait (stijlen in
 * styles/motion.scss).
 *
 * De spaties staan als gewone tekst tussen de venstertjes, dus voorleessoftware
 * en zoekmachines lezen één doorlopende regel. Staat beweging uit, dan staat de
 * kop er meteen.
 */
const WordReveal: React.FC<WordRevealProps> = ({ text, className, delay = 0 }) => (
  <h1 className={className} style={{ '--word-base': `${delay}ms` } as React.CSSProperties}>
    {text.split(/\s+/).map((word, index) => (
      <React.Fragment key={`${index}-${word}`}>
        {index > 0 && ' '}
        <span className="word-mask">
          <span className="word" style={{ '--word-step': index } as React.CSSProperties}>
            {word}
          </span>
        </span>
      </React.Fragment>
    ))}
  </h1>
);

export default WordReveal;
