import { resolveSectionState, SectionBounds } from './useSectionProgress';

const secties: SectionBounds[] = [
  { id: 'over-mij', top: 1000, height: 800 },
  { id: 'cases', top: 1800, height: 2000 },
  { id: 'werkervaring', top: 3800, height: 4000 },
];

const scherm = 1000;
/** De hero is allang voorbij; de sectiekeuze staat daar los van. */
const HERO_VOORBIJ = -5000;

// De leeslijn ligt op 35 procent van het scherm, dus 350px onder de bovenrand.
const scrollNaar = (positie: number) =>
  resolveSectionState(secties, positie - 350, scherm, HERO_VOORBIJ);

describe('resolveSectionState, welke sectie', () => {
  it('houdt de eerste sectie aan zolang de lezer er nog boven zit', () => {
    expect(scrollNaar(0).activeId).toBe('over-mij');
    expect(scrollNaar(500).activeId).toBe('over-mij');
  });

  it('springt naar de volgende sectie zodra die de leeslijn passeert', () => {
    expect(scrollNaar(1799).activeId).toBe('over-mij');
    expect(scrollNaar(1800).activeId).toBe('cases');
    expect(scrollNaar(3800).activeId).toBe('werkervaring');
  });

  it('geeft de voortgang binnen de actieve sectie', () => {
    expect(scrollNaar(1800).progress).toBeCloseTo(0);
    expect(scrollNaar(2800).progress).toBeCloseTo(0.5);
    expect(scrollNaar(3799).progress).toBeCloseTo(1, 2);
  });

  it('houdt de voortgang tussen 0 en 1', () => {
    expect(scrollNaar(-5000).progress).toBe(0);
    expect(scrollNaar(50000).progress).toBe(1);
  });

  it('valt niet om zonder secties', () => {
    expect(resolveSectionState([], 2000, scherm, HERO_VOORBIJ)).toEqual({
      activeId: null,
      progress: 0,
      reveal: 1,
    });
  });

  it('deelt niet door nul bij een sectie zonder hoogte', () => {
    const state = resolveSectionState([{ id: 'leeg', top: 0, height: 0 }], 500, scherm, HERO_VOORBIJ);

    expect(state.activeId).toBe('leeg');
    expect(Number.isFinite(state.progress)).toBe(true);
  });
});

describe('resolveSectionState, tevoorschijn komen', () => {
  const bijHero = (heroOnderkant: number) =>
    resolveSectionState(secties, 0, scherm, heroOnderkant).reveal;

  it('blijft weg zolang de hero nog in beeld staat', () => {
    expect(bijHero(900)).toBe(0);
    expect(bijHero(1)).toBe(0);
    expect(bijHero(0)).toBe(0);
  });

  it('schuift geleidelijk tevoorschijn zodra de hero voorbij is', () => {
    expect(bijHero(-70)).toBeCloseTo(0.5);
    expect(bijHero(-140)).toBe(1);
  });

  it('gaat niet voorbij 1', () => {
    expect(bijHero(-10000)).toBe(1);
  });
});
