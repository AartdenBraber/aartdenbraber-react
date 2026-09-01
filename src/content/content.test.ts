import { content, LANGUAGES } from './index';

/**
 * nl.ts en en.ts worden los bijgewerkt. Als een aanvulling maar in één taal
 * landt, valt dat niet op in de browser: je ziet altijd maar één taal tegelijk.
 * Deze tests vergelijken de twee daarom op structuur.
 */
describe('nl en en blijven gelijk opgebouwd', () => {
  const nl = content.nl;
  const en = content.en;

  it('heeft dezelfde werkervaring in dezelfde volgorde', () => {
    expect(en.experience.entries.map((entry) => entry.id)).toEqual(
      nl.experience.entries.map((entry) => entry.id),
    );
  });

  it('heeft per opdracht evenveel punten en dezelfde stack', () => {
    nl.experience.entries.forEach((entry, index) => {
      const tegenhanger = en.experience.entries[index];

      expect({
        id: entry.id,
        highlights: entry.highlights.length,
        stack: entry.stack,
        via: entry.via ?? null,
        current: entry.current ?? false,
      }).toEqual({
        id: tegenhanger.id,
        highlights: tegenhanger.highlights.length,
        stack: tegenhanger.stack,
        via: tegenhanger.via ?? null,
        current: tegenhanger.current ?? false,
      });
    });
  });

  it('heeft dezelfde vragen in de faq', () => {
    expect(en.faq.items.map((item) => item.id)).toEqual(nl.faq.items.map((item) => item.id));
  });

  it('heeft evenveel diensten, profielgegevens en navigatie-items', () => {
    expect(en.services.items).toHaveLength(nl.services.items.length);
    expect(en.about.facts).toHaveLength(nl.about.facts.length);
    expect(en.about.paragraphs).toHaveLength(nl.about.paragraphs.length);
    expect(en.nav.items.map((item) => item.href)).toEqual(nl.nav.items.map((item) => item.href));
  });

  it('laat nergens een tekst leeg', () => {
    LANGUAGES.forEach((taal) => {
      const teksten = JSON.stringify(content[taal]).match(/"[^"]*"/g) ?? [];

      expect(teksten.filter((tekst) => tekst === '""')).toHaveLength(0);
    });
  });
});
