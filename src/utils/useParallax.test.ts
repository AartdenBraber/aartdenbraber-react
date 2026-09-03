import { parallaxVerschuiving } from './useParallax';

// Een sectie van 800 hoog in een venster van 1000, met sterkte 0,2.
const hoogte = 800;
const venster = 1000;
const sterkte = 0.2;
const uiterste = sterkte * hoogte;

const verschuiving = (top: number) => parallaxVerschuiving(top, hoogte, venster, sterkte);

describe('parallaxVerschuiving', () => {
  it('staat op nul als de sectie in het midden van het venster staat', () => {
    const gecentreerd = venster / 2 - hoogte / 2;
    expect(verschuiving(gecentreerd)).toBeCloseTo(0);
  });

  it('duwt de laag omlaag zolang de sectie nog onder het venster hangt', () => {
    expect(verschuiving(venster)).toBeCloseTo(uiterste);
  });

  it('trekt de laag omhoog als de sectie boven het venster uit is', () => {
    expect(verschuiving(-hoogte)).toBeCloseTo(-uiterste);
  });

  it('loopt niet voorbij de uiterste standen, hoe ver je ook doorscrolt', () => {
    expect(verschuiving(50000)).toBeCloseTo(uiterste);
    expect(verschuiving(-50000)).toBeCloseTo(-uiterste);
  });

  it('beweegt de andere kant op naarmate je verder scrolt', () => {
    const boven = verschuiving(600);
    const midden = verschuiving(100);
    const onder = verschuiving(-400);

    expect(boven).toBeGreaterThan(midden);
    expect(midden).toBeGreaterThan(onder);
  });

  it('geeft nul terug als er geen venster is, in plaats van te delen door nul', () => {
    expect(parallaxVerschuiving(0, 0, 0, sterkte)).toBe(0);
  });
});
