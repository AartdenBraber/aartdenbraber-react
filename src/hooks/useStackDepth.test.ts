import { NO_CLIP, resolveStackDepths, StackCardBounds } from './useStackDepth';

// Kaarten van 400px hoog die 12px onder elkaar vastplakken, zoals in de
// werkervaring-sectie.
const kaart = (top: number, stickyTop: number, height = 400): StackCardBounds => ({
  top,
  height,
  stickyTop,
});

describe('resolveStackDepths', () => {
  it('laat alles met rust zolang de kaarten nog onder elkaar staan', () => {
    const depths = resolveStackDepths([kaart(40, 40), kaart(452, 52), kaart(864, 64)]);

    expect(depths).toEqual([
      { covered: 0, depth: 0, clip: NO_CLIP, pushed: 0 },
      { covered: 0, depth: 0, clip: NO_CLIP, pushed: 0 },
      { covered: 0, depth: 0, clip: NO_CLIP, pushed: 0 },
    ]);
  });

  it('bedekt een kaart naarmate de volgende eroverheen schuift', () => {
    // De volgende kaart start op de onderrand (40 + 400) en eindigt op zijn
    // eigen plakpositie (52). Halverwege die weg is de bedekking 0,5.
    const halverwege = 40 + 400 - (400 - 12) / 2;

    expect(resolveStackDepths([kaart(40, 40), kaart(440, 52)])[0].covered).toBe(0);
    expect(resolveStackDepths([kaart(40, 40), kaart(halverwege, 52)])[0].covered).toBeCloseTo(0.5);
    expect(resolveStackDepths([kaart(40, 40), kaart(52, 52)])[0].covered).toBe(1);
  });

  it('houdt de bedekking op 1 wanneer kaarten aan het einde worden uitgeduwd', () => {
    // Onderaan de lijst schuiven vastgeplakte kaarten omhoog voorbij hun
    // plakpositie. Wat eronder lag, blijft dan gewoon bedekt.
    expect(resolveStackDepths([kaart(-200, 40), kaart(-100, 52)])[0].covered).toBe(1);
  });

  it('telt de diepte op over alle kaarten erboven', () => {
    const depths = resolveStackDepths([
      kaart(40, 40),
      kaart(52, 52),
      kaart(64, 64),
      kaart(700, 76),
    ]);

    expect(depths.map(({ depth }) => depth)).toEqual([2, 1, 0, 0]);
  });

  it('kapt de diepte af zodra extra kaarten geen verschil meer maken', () => {
    const stapel = [0, 1, 2, 3, 4, 5].map((index) => kaart(40 + index * 12, 40 + index * 12));

    expect(resolveStackDepths(stapel)[0].depth).toBe(3);
  });

  it('laat de laatste kaart altijd vooraan liggen', () => {
    const depths = resolveStackDepths([kaart(40, 40), kaart(52, 52)]);

    expect(depths[depths.length - 1]).toEqual({
      covered: 0,
      depth: 0,
      clip: NO_CLIP,
      pushed: 0,
    });
  });

  it('meet hoe ver een kaart boven zijn plakpositie uit is geduwd', () => {
    // Kaart 24px boven zijn plakpositie: precies dat stuk schuift hij visueel
    // terug, zodat zijn ronde bovenrand op zijn plek in de stapel blijft.
    expect(resolveStackDepths([kaart(40, 40), kaart(52, 52)])[0].pushed).toBe(0);
    expect(resolveStackDepths([kaart(16, 40), kaart(52, 52)])[0].pushed).toBeCloseTo(24);
  });

  it('schuift de laatste kaart nooit terug', () => {
    // De laatste kaart plakt nooit; boven zijn plakpositie uitkomen is daar
    // gewoon scrollen.
    expect(resolveStackDepths([kaart(-500, 40), kaart(-400, 52)])[1].pushed).toBe(0);
  });

  it('knipt een lange bedolven kaart af tot boven de onderkant van zijn opvolger', () => {
    // Kaart van 400 hoog, bedolven onder een kaart van 200: er blijft
    // 200 + lip (12) - marge (36) = 176 over, dus 224 gaat eraf. De zichtbare
    // onderkant (40 + 176) eindigt daarmee 36px boven die van de opvolger
    // (52 + 200).
    const [lang] = resolveStackDepths([kaart(40, 40), kaart(52, 52, 200)]);

    expect(lang.clip).toBeCloseTo(224);
  });

  it('knipt evenredig mee terwijl de opvolger eroverheen schuift', () => {
    const halverwege = 40 + 400 - (400 - 12) / 2;
    const [lang] = resolveStackDepths([kaart(40, 40), kaart(halverwege, 52, 200)]);

    expect(lang.clip).toBeCloseTo(112);
  });

  it('knipt niets van een kaart die korter is dan zijn opvolger', () => {
    const [kort] = resolveStackDepths([kaart(40, 40, 150), kaart(52, 52, 400)]);

    expect(kort.clip).toBe(NO_CLIP);
  });

  it('duikt weg achter wat er van de opvolger over is, niet achter zijn volle hoogte', () => {
    // De middelste kaart (600) is zelf al geknepen tot 276 achter de korte
    // kaart (300). De lange kaart (700) moet daarachter passen, niet achter
    // de volle 600.
    const depths = resolveStackDepths([
      kaart(40, 40, 700),
      kaart(52, 52, 600),
      kaart(64, 64, 300),
    ]);

    expect(depths[1].clip).toBeCloseTo(324);
    expect(depths[0].clip).toBeCloseTo(448);
  });

  it('deelt niet door nul bij een kaart korter dan de plak-offset', () => {
    const depths = resolveStackDepths([kaart(40, 40, 8), kaart(52, 52, 8)]);

    expect(depths[0].covered).toBe(1);
    expect(Number.isFinite(depths[0].depth)).toBe(true);
  });
});
