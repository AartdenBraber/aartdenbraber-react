import { sortTestimonials, testimonials } from './testimonials';

describe('sortTestimonials', () => {
  it('laat alle aanbevelingen staan, ongeacht de taal', () => {
    expect(sortTestimonials('nl')).toHaveLength(testimonials.length);
    expect(sortTestimonials('en')).toHaveLength(testimonials.length);
  });

  it('zet de taal van de site bovenaan', () => {
    expect(sortTestimonials('nl')[0].language).toBe('nl');
    expect(sortTestimonials('en')[0].language).toBe('en');
  });

  it('groepeert per taal in plaats van ze door elkaar te zetten', () => {
    const talen = sortTestimonials('nl').map((item) => item.language);
    const wisselingen = talen.filter((taal, index) => index > 0 && taal !== talen[index - 1]);

    expect(wisselingen).toHaveLength(1);
  });

  it('zet binnen een taal het meest recente citaat eerst', () => {
    const nederlands = sortTestimonials('nl').filter((item) => item.language === 'nl');
    const datums = nederlands.map((item) => item.date);

    expect(datums).toEqual([...datums].sort().reverse());
  });

  it('laat de bron ongemoeid', () => {
    const voor = testimonials.map((item) => item.id);

    sortTestimonials('en');

    expect(testimonials.map((item) => item.id)).toEqual(voor);
  });
});
