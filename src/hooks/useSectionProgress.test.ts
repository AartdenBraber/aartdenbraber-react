import { resolveSectionState, SectionBounds } from './useSectionProgress';

const secties: SectionBounds[] = [
  { id: 'over-mij', top: 1000, height: 800 },
  { id: 'cases', top: 1800, height: 2000 },
  { id: 'werkervaring', top: 3800, height: 4000 },
];

const scherm = 1000;
// De leeslijn ligt op 35 procent van het scherm, dus 350px onder de bovenrand.
const scrollNaar = (positie: number) => resolveSectionState(secties, positie - 350, scherm);

describe('resolveSectionState', () => {
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

  it('blijft weg zolang de hero in beeld is', () => {
    expect(resolveSectionState(secties, 0, scherm).visible).toBe(false);
    expect(resolveSectionState(secties, 600, scherm).visible).toBe(false);
    expect(resolveSectionState(secties, 601, scherm).visible).toBe(true);
  });

  it('valt niet om zonder secties', () => {
    expect(resolveSectionState([], 2000, scherm)).toEqual({
      activeId: null,
      progress: 0,
      visible: true,
    });
  });

  it('deelt niet door nul bij een sectie zonder hoogte', () => {
    const state = resolveSectionState([{ id: 'leeg', top: 0, height: 0 }], 500, scherm);

    expect(state.activeId).toBe('leeg');
    expect(Number.isFinite(state.progress)).toBe(true);
  });
});
