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
      { covered: 0, depth: 0, clip: NO_CLIP, shift: 0 },
      { covered: 0, depth: 0, clip: NO_CLIP, shift: 0 },
      { covered: 0, depth: 0, clip: NO_CLIP, shift: 0 },
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
      shift: 0,
    });
  });

  it('schuift een uitgeduwde kaart terug naar zijn plek in de stapel', () => {
    // Kaart 24px boven zijn plakpositie geduwd terwijl de laatste kaart nog
    // op zijn plek ligt: precies dat stuk schuift hij visueel terug.
    expect(resolveStackDepths([kaart(40, 40), kaart(52, 52)])[0].shift).toBe(0);
    expect(resolveStackDepths([kaart(16, 40), kaart(52, 52)])[0].shift).toBeCloseTo(24);
  });

  it('laat de stapel als geheel meescrollen met de vertrekkende laatste kaart', () => {
    // De laatste kaart is 32px voorbij zijn plakpositie gescrold; de rest
    // schuift evenveel mee omhoog in plaats van te blijven plakken.
    expect(resolveStackDepths([kaart(40, 40), kaart(20, 52)])[0].shift).toBeCloseTo(-32);

    // Ook wie zelf al door de lijstonderkant is uitgeduwd (hier 540px), komt
    // in de vertrekkende formatie terecht: 12px boven de laatste kaart.
    const [eerste, laatste] = resolveStackDepths([kaart(-500, 40), kaart(-400, 52)]);

    expect(laatste.shift).toBe(0);
    expect(-500 + eerste.shift).toBeCloseTo(-400 - 12);
  });

  it('knipt een bedolven kaart terug tot het randje plus de hoekmarge', () => {
    // Van een volledig bedolven kaart blijft het randje (lip, 12) over plus
    // wat er achter de ronde hoeken van de opvolger schuilgaat (26). Van een
    // kaart van 400 hoog gaat er dus 362 af, hoe hoog de opvolger ook is.
    expect(resolveStackDepths([kaart(40, 40), kaart(52, 52, 200)])[0].clip).toBeCloseTo(362);
    expect(resolveStackDepths([kaart(40, 40), kaart(52, 52, 700)])[0].clip).toBeCloseTo(362);
  });

  it('knipt evenredig mee terwijl de opvolger eroverheen schuift', () => {
    const halverwege = 40 + 400 - (400 - 12) / 2;
    const [lang] = resolveStackDepths([kaart(40, 40), kaart(halverwege, 52, 200)]);

    expect(lang.clip).toBeCloseTo(181);
  });


  it('deelt niet door nul bij een kaart korter dan de plak-offset', () => {
    const depths = resolveStackDepths([kaart(40, 40, 8), kaart(52, 52, 8)]);

    expect(depths[0].covered).toBe(1);
    expect(Number.isFinite(depths[0].depth)).toBe(true);
  });
});
