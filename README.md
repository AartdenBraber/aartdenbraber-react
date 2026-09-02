# aartdenbraber.nl

Portfoliosite van Aart den Braber. React met TypeScript, gebouwd met Create React App.

## Aan de slag

```bash
npm install
npm start
```

De site draait dan op http://localhost:3000.

| Commando        | Wat het doet                                  |
| --------------- | --------------------------------------------- |
| `npm start`     | Development server met hot reload              |
| `npm test`      | Tests in watch mode                            |
| `npm run build` | Productiebundel in `build/`                    |

## Structuur

```
src/
  content/      Alle teksten, per taal (nl.ts en en.ts) met gedeelde types
  i18n/         Taalcontext: keuze onthouden, <html lang> bijwerken
  components/   Eén map per component, met de bijbehorende .scss ernaast
  styles/       Tokens en globale stijlen
```

Teksten aanpassen doe je in `src/content/nl.ts` en `src/content/en.ts`. Beide
bestanden voldoen aan hetzelfde type, dus TypeScript geeft een fout zodra er in
één taal iets ontbreekt.

Kleuren, spacing en typografie staan als CSS-variabelen in
`src/styles/_tokens.scss`.

## Het cv

De site linkt naar een pdf in `public/`:

- Development gebruikt `CV-DEV.pdf`, een dummybestand zonder persoonsgegevens.
- Productie gebruikt `CV-Aart-den-Braber-NL.pdf` en `CV-Aart-den-Braber-EN.pdf`.

Die twee productiebestanden staan bewust niet in de repo, omdat de repo publiek
is. Ze worden los op de server geplaatst. Zie `src/content/index.ts` voor de
logica die de juiste bestandsnaam kiest.

## Hosting

De server meldt zich als Apache. Onbekende paden krijgen daar `index.html`
terug, waardoor `/en` werkt zonder dat er in deze repo iets voor geregeld is.
Die configuratie staat op de server, niet hier.

Hoe de build op de server terechtkomt staat nergens vastgelegd. Vul dat hier
aan zodra je het opnieuw doet.

Twee bestanden staan alleen op de server en niet in de repo: de twee cv-pdf's,
zie hierboven. Vervang ze niet met een deploy die de hele map overschrijft.
