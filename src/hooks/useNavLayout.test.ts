import { fitsBeside, NAV_GUTTER } from './useNavLayout';

describe('fitsBeside', () => {
  it('past wanneer de rail plus lucht aan beide kanten in de marge valt', () => {
    expect(fitsBeside(140, 140 + NAV_GUTTER * 2)).toBe(true);
    expect(fitsBeside(140, 400)).toBe(true);
  });

  it('past niet wanneer er ook maar één pixel tekort is', () => {
    expect(fitsBeside(140, 140 + NAV_GUTTER * 2 - 1)).toBe(false);
  });

  it('past niet in een marge die er niet is', () => {
    expect(fitsBeside(140, 0)).toBe(false);
    expect(fitsBeside(140, 90)).toBe(false);
  });

  it('gaat mee met bredere labels, zoals in een andere taal', () => {
    const marge = 200;

    expect(fitsBeside(140, marge)).toBe(true);
    expect(fitsBeside(180, marge)).toBe(false);
  });

  it('kiest de balk zolang er nog niets te meten valt', () => {
    expect(fitsBeside(0, 400)).toBe(false);
  });
});
