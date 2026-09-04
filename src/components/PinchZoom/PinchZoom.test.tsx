import React from 'react';
import { act, render, screen } from '@testing-library/react';
import PinchZoom from './PinchZoom';

/**
 * jsdom kent geen Touch en geen TouchEvent, en rekent ook geen maten uit. We
 * zetten hier dus zelf een knijpbeweging in elkaar en geven het venster een
 * breedte, zodat het ankerpunt niet op een deling door nul stukloopt.
 */
const maakAanraking = (clientX: number, clientY: number) =>
  ({ clientX, clientY } as Touch);

const stuurAanraking = (
  element: Element,
  type: 'touchstart' | 'touchmove' | 'touchend',
  punten: Array<[number, number]>,
) => {
  const aanrakingen = punten.map(([x, y]) => maakAanraking(x, y));
  const event = new Event(type, { bubbles: true, cancelable: true });

  Object.defineProperty(event, 'touches', {
    value: type === 'touchend' ? [] : aanrakingen,
  });

  // De component zet zijn stand vanuit een eigen luisteraar, dus buiten react
  // om. Zonder act is het opnieuw tekenen nog niet gebeurd als we kijken.
  act(() => {
    element.dispatchEvent(event);
  });
};

const geefVensterEenMaat = (venster: HTMLElement, breedte: number, hoogte: number) => {
  Object.defineProperty(venster, 'scrollWidth', { value: breedte, configurable: true });
  Object.defineProperty(venster, 'offsetHeight', { value: hoogte, configurable: true });
};

describe('PinchZoom', () => {
  // jsdom kan niet scrollen en klaagt daarover bij elke zoomstap. Dat zegt
  // niets over de component, dus we vangen het hier op.
  beforeAll(() => {
    window.scrollTo = jest.fn();
  });

  it('laat de inhoud gewoon staan zolang er niet geknepen wordt', () => {
    const { container } = render(
      <PinchZoom>
        <p>het cv</p>
      </PinchZoom>,
    );

    expect(screen.getByText('het cv')).toBeInTheDocument();
    expect(container.querySelector<HTMLElement>('.pinch-zoom__inhoud')!.style.width).toBe('100%');
  });

  it('maakt de inhoud breder als de vingers uit elkaar gaan', () => {
    const { container } = render(
      <PinchZoom>
        <p>het cv</p>
      </PinchZoom>,
    );

    const venster = container.querySelector<HTMLElement>('.pinch-zoom')!;
    geefVensterEenMaat(venster, 300, 400);

    // Van 100px naar 200px tussen de vingers is twee keer zo groot.
    stuurAanraking(venster, 'touchstart', [
      [100, 200],
      [200, 200],
    ]);
    stuurAanraking(venster, 'touchmove', [
      [50, 200],
      [250, 200],
    ]);

    expect(container.querySelector<HTMLElement>('.pinch-zoom__inhoud')!.style.width).toBe('200%');
  });

  it('gaat niet verder open dan de maat waarop het cv getekend is', () => {
    const { container } = render(
      <PinchZoom maxZoom={2}>
        <p>het cv</p>
      </PinchZoom>,
    );

    const venster = container.querySelector<HTMLElement>('.pinch-zoom')!;
    geefVensterEenMaat(venster, 300, 400);

    stuurAanraking(venster, 'touchstart', [
      [100, 200],
      [200, 200],
    ]);
    stuurAanraking(venster, 'touchmove', [
      [0, 200],
      [400, 200],
    ]);

    expect(container.querySelector<HTMLElement>('.pinch-zoom__inhoud')!.style.width).toBe('200%');
  });

  it('komt bij dichtknijpen niet kleiner terug dan hij begon', () => {
    const { container } = render(
      <PinchZoom>
        <p>het cv</p>
      </PinchZoom>,
    );

    const venster = container.querySelector<HTMLElement>('.pinch-zoom')!;
    geefVensterEenMaat(venster, 300, 400);

    stuurAanraking(venster, 'touchstart', [
      [100, 200],
      [200, 200],
    ]);
    stuurAanraking(venster, 'touchmove', [
      [140, 200],
      [150, 200],
    ]);

    expect(container.querySelector<HTMLElement>('.pinch-zoom__inhoud')!.style.width).toBe('100%');
  });

  it('doet niets bij een enkele vinger, zodat scrollen gewoon scrollen blijft', () => {
    const { container } = render(
      <PinchZoom>
        <p>het cv</p>
      </PinchZoom>,
    );

    const venster = container.querySelector<HTMLElement>('.pinch-zoom')!;
    geefVensterEenMaat(venster, 300, 400);

    stuurAanraking(venster, 'touchstart', [[100, 200]]);
    stuurAanraking(venster, 'touchmove', [[100, 300]]);

    expect(container.querySelector<HTMLElement>('.pinch-zoom__inhoud')!.style.width).toBe('100%');
  });
});
