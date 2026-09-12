import React from 'react';
import { volgMuisLicht } from './zoeklicht';

describe('volgMuisLicht', () => {
    it('zet de plek van de muis in de knop als --licht-x en --licht-y', () => {
        const knop = document.createElement('button');
        knop.getBoundingClientRect = () => ({ left: 100, top: 40 }) as DOMRect;

        volgMuisLicht({ currentTarget: knop, clientX: 170, clientY: 65 } as unknown as React.PointerEvent<HTMLElement>);

        expect(knop.style.getPropertyValue('--licht-x')).toBe('70px');
        expect(knop.style.getPropertyValue('--licht-y')).toBe('25px');
    });
});
