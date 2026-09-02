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

`CV-Aart-den-Braber-NL.pdf` en `CV-Aart-den-Braber-EN.pdf` staan in `public/`
en gaan met de build mee. Ze zijn sowieso al openbaar te downloaden vanaf de
site, dus ze staan ook in deze publieke repo.

Welke van de twee de downloadknop gebruikt hangt af van de taal; zie `cvUrl`
in `src/content/index.ts`.

## Hosting

De server meldt zich als Apache. Onbekende paden krijgen daar `index.html`
terug, waardoor `/en` werkt zonder dat er in deze repo iets voor geregeld is.
Die configuratie staat op de server, niet hier.

Uitrollen gaat via `.github/workflows/deploy.yml`: bij elke push naar `main`
bouwt GitHub de site en zet die met rsync over SSH op de server. Handmatig kan
ook, via de Actions-tab.

Daarvoor moeten deze secrets in de repository staan
(Settings, Secrets and variables, Actions):

| Secret | Wat erin hoort |
| --- | --- |
| `SSH_HOST` | hostnaam of IP van de server |
| `SSH_USER` | de SSH-gebruikersnaam |
| `SSH_KEY` | de private helft van een sleutel die alleen voor deze uitrol bestaat |
| `SSH_KNOWN_HOSTS` | de uitvoer van `ssh-keyscan <host>`, zodat de sleutel van de server vaststaat |
| `DEPLOY_PATH` | absoluut pad naar de map waar `index.html` hoort |
| `SSH_PORT` | alleen nodig als het niet 22 is |

Zolang `SSH_HOST` of `SSH_KEY` ontbreekt bouwt en test de workflow wel, maar
rolt hij niets uit.

De rsync draait **met** `--delete`, zodat oude gehashte bestanden zich niet
opstapelen. Alleen `.well-known/` blijft met rust: daar zet Let's Encrypt zijn
controlebestanden neer, en die komen niet uit deze repo.

`public/.htaccess` gaat wel mee. Daarin staat de rewrite die `/en` laat
werken, de doorverwijzing van www naar het kale domein, en hoe lang de
browser bestanden mag bewaren. Zit daar een fout in, dan geeft de site een
500; de controlestap aan het eind van de workflow vangt dat op.

`DEPLOY_PATH` moet daarom precies de webroot van deze site zijn en niets
ruimers: alles daarbinnen wat niet in `build/` zit, verdwijnt.

Twee bestanden staan alleen op de server en niet in de repo: de twee cv-pdf's,
zie hierboven. Vervang ze niet met een deploy die de hele map overschrijft.
