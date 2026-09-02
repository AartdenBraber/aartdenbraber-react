import {
  canonicalForLanguage,
  languageFromPath,
  pathForLanguage,
  urlForLanguage,
} from './routes';

describe('languageFromPath', () => {
  it('leest Engels van /en', () => {
    expect(languageFromPath('/en')).toBe('en');
    expect(languageFromPath('/en/')).toBe('en');
    expect(languageFromPath('/EN')).toBe('en');
  });

  it('houdt de rest Nederlands', () => {
    expect(languageFromPath('/')).toBe('nl');
    expect(languageFromPath('')).toBe('nl');
    expect(languageFromPath('/iets-anders')).toBe('nl');
  });

  it('trapt niet in een pad dat alleen met en begint', () => {
    expect(languageFromPath('/energie')).toBe('nl');
    expect(languageFromPath('/enquete')).toBe('nl');
  });
});

describe('pathForLanguage en canonicalForLanguage', () => {
  it('geeft elke taal een eigen adres', () => {
    expect(pathForLanguage('nl')).toBe('/');
    expect(pathForLanguage('en')).toBe('/en');
  });

  it('maakt daar een volledige canonical van', () => {
    expect(canonicalForLanguage('nl')).toBe('https://aartdenbraber.nl/');
    expect(canonicalForLanguage('en')).toBe('https://aartdenbraber.nl/en');
  });

  it('komt op zichzelf uit, heen en weer', () => {
    expect(languageFromPath(pathForLanguage('en'))).toBe('en');
    expect(languageFromPath(pathForLanguage('nl'))).toBe('nl');
  });
});

describe('urlForLanguage', () => {
  it('houdt de sectie vast waar de lezer was', () => {
    expect(urlForLanguage('en', '', '#werkervaring')).toBe('/en#werkervaring');
    expect(urlForLanguage('nl', '', '#werkervaring')).toBe('/#werkervaring');
  });

  it('houdt ook zoekparameters vast', () => {
    expect(urlForLanguage('en', '?bron=linkedin', '')).toBe('/en?bron=linkedin');
  });

  it('geeft een kaal adres wanneer er niets vast te houden is', () => {
    expect(urlForLanguage('nl', '', '')).toBe('/');
  });
});
