import React from 'react';

/**
 * Laat de gloed in een knop de muis volgen. De plek gaat als twee eigen
 * eigenschappen naar de opmaak; zie src/styles/_zoeklicht.scss. Zonder muis,
 * bij focus met het toetsenbord of op een telefoon, staat het licht in het
 * midden.
 */
export const volgMuisLicht = (event: React.PointerEvent<HTMLElement>) => {
    const knop = event.currentTarget;
    const vak = knop.getBoundingClientRect();
    knop.style.setProperty('--licht-x', `${event.clientX - vak.left}px`);
    knop.style.setProperty('--licht-y', `${event.clientY - vak.top}px`);
};
