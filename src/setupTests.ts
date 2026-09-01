import '@testing-library/jest-dom';

// jsdom heeft geen matchMedia. FocusSpotlight gebruikt het om aanraakschermen
// over te slaan, dus we geven de tests een stille variant die niets matcht.
if (!window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
