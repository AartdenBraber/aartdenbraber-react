import React, { useEffect, useRef } from 'react';
import './FocusSpotlight.scss';

interface FocusSpotlightProps {
  /** Terugval voor browsers zonder WebP. */
  image: string;
  imageWebp: string;
}

const OFF_SCREEN = -9999;

/**
 * Dezelfde foto staat er twee keer, scherp en geblurd. Een eigen component
 * scheelt het dubbel uitschrijven van de bronnen.
 */
const Background: React.FC<{ image: string; imageWebp: string; className: string }> = ({
  image,
  imageWebp,
  className,
}) => (
  <picture>
    <source srcSet={imageWebp} type="image/webp" />
    <img
      src={image}
      alt=""
      className={className}
      width={1200}
      height={800}
      decoding="async"
      // Dit is het grootste element in beeld, dus het mag niet achteraan
      // in de rij komen te staan.
      fetchPriority="high"
    />
  </picture>
);

/**
 * Legt een scherpe kopie van de achtergrond over een geblurde versie heen en
 * onthult die alleen rond de cursor. De positie gaat via CSS-variabelen, zodat
 * React niet bij elke muisbeweging opnieuw hoeft te renderen.
 */
const FocusSpotlight: React.FC<FocusSpotlightProps> = ({ image, imageWebp }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const spotlight = spotlightRef.current;

    if (!wrapper || !spotlight) return;

    // Op een aanraakscherm is er geen cursor om te volgen.
    if (window.matchMedia('(hover: none)').matches) return;

    let frame: number | null = null;
    let hasAnimated = false;

    const place = (x: number, y: number) => {
      if (frame !== null) cancelAnimationFrame(frame);

      frame = requestAnimationFrame(() => {
        spotlight.style.setProperty('--x', `${x}px`);
        spotlight.style.setProperty('--y', `${y}px`);
      });
    };

    const handleMove = (event: MouseEvent) => {
      const rect = wrapper.getBoundingClientRect();
      place(event.clientX - rect.left, event.clientY - rect.top);

      if (!hasAnimated) {
        hasAnimated = true;
        spotlight.classList.add('animate-ring');
      }
    };

    const handleLeave = () => place(OFF_SCREEN, OFF_SCREEN);

    window.addEventListener('mousemove', handleMove, { passive: true });
    document.addEventListener('mouseleave', handleLeave);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseleave', handleLeave);

      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="spotlight-background" aria-hidden="true">
      <div className="background-wrapper" ref={wrapperRef}>
        <Background image={image} imageWebp={imageWebp} className="background blurred" />
        <div ref={spotlightRef} className="spotlight">
          <Background image={image} imageWebp={imageWebp} className="background focused" />
        </div>
      </div>
    </div>
  );
};

export default FocusSpotlight;
