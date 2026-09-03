import { canonicalForLanguage, languageFromPath, pathForLanguage, urlForLanguage } from './routes';

describe('taal uit het adres', () => {
  it('leest Nederlands op de hoofdpagina', () => {
    expect(languageFromPath('/')).toBe('nl');
  });

  it('leest Engels op /en, met en zonder afsluitende schuine streep', () => {
    expect(languageFromPath('/en')).toBe('en');
    expect(languageFromPath('/en/')).toBe('en');
  });

  it('laat zich niet foppen door een pad dat toevallig met en begint', () => {
    expect(languageFromPath('/energie')).toBe('nl');
  });

  it('trekt zich niets aan van hoofdletters', () => {
    expect(languageFromPath('/EN')).toBe('en');
  });
});

describe('adres bij een taal', () => {
  it('geeft de hoofdpagina voor Nederlands en /en voor Engels', () => {
    expect(pathForLanguage('nl')).toBe('/');
    expect(pathForLanguage('en')).toBe('/en');
  });

  it('houdt de rest van het adres vast bij het wisselen', () => {
    expect(urlForLanguage('en', '', '#portfolio')).toBe('/en#portfolio');
    expect(urlForLanguage('nl', '?a=1', '#portfolio')).toBe('/?a=1#portfolio');
  });

  it('maakt een volledige canonical', () => {
    expect(canonicalForLanguage('en')).toBe('https://aartdenbraber.nl/en');
    expect(canonicalForLanguage('nl')).toBe('https://aartdenbraber.nl/');
  });
});
