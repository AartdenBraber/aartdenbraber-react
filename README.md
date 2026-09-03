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
bouwt en test GitHub de site en spiegelt die met `lftp` over FTPS naar de
webroot. Handmatig kan ook, via de Actions-tab.

De servergegevens staan in de environment `public`
(Settings, Environments). Alleen het wachtwoord is een secret; de rest zijn
variables, want daar zit niets geheims in en zo kun je ze in de interface
teruglezen.

| Naam | Soort | Wat erin hoort |
| --- | --- | --- |
| `FTP_PASSWORD` | secret | het wachtwoord van het FTP-account |
| `FTP_HOST` | variable | hostnaam van de server, `vserver99.axc.eu` |
| `FTP_USER` | variable | de FTP-gebruikersnaam, inclusief het domein erachter |
| `DEPLOY_PATH` | variable | pad naar de webroot zoals dit FTP-account het ziet |

De job declareert die environment met `environment: public`. Laat je die regel
weg, dan ziet de workflow geen van deze waarden en slaat hij de uitrol stil
over. Zolang `FTP_HOST` of `FTP_PASSWORD` ontbreekt bouwt en test de workflow
wel, maar rolt hij niets uit.

DirectAdmin noemt een FTP-account voor een domein `iets@aartdenbraber.nl`. Die
hele naam hoort in `FTP_USER`, met het domein erachter, anders komt de login
niet door.

Maak in DirectAdmin een eigen FTP-account voor deze uitrol en gebruik niet het
hoofdaccount. Zet de beginmap op de webroot, dan is `DEPLOY_PATH` gewoon `/`
en kan een uitgelekt wachtwoord verder niets bereiken. Log je toch in met het
hoofdaccount, dan is het pad
`/domains/aartdenbraber.nl/public_html`.

Staat `DEPLOY_PATH` op `/` terwijl het account hoger in de boom begint, dan
zou de spiegeling de verkeerde map leegruimen. De controlestap vangt dat op:
die eist een `index.html` op die plek en stopt anders.

### Waarom FTPS en niet rsync over SSH

SSH staat uit op dit hostingpakket, in het account zelf en op resellerniveau,
en er is geen vinkje in het paneel om het aan te zetten. Alleen Versio kan dat
doen. FTPS werkt wel: poort 21 draait ProFTPD en accepteert `AUTH SSL`.

Wat dat kost: spiegelen over FTP is trager dan rsync, want elk bestand is een
eigen transfer. Bij een build van een paar honderd kilobyte valt dat niet op.
Omdat de build elke keer verse tijdstempels krijgt, gaat de hele map elke keer
opnieuw omhoog. Dat is niet zuinig, maar wel voorspelbaar.

Het servercertificaat is een echt DigiCert-certificaat voor `*.axc.eu`, maar
ProFTPD stuurt de tussenliggende CA niet mee. Daarom staat die CA in
`deploy/PerfectSSL.pem` en plakt de workflow hem achter de rootcertificaten
van de runner. Zo kan `ssl:verify-certificate` aan. Zonder die controle zou de
verbinding wel versleuteld zijn, maar zou je niet weten met wie je praat. Die
CA loopt tot april 2034; het certificaat van de server zelf mag ondertussen
vernieuwd worden zonder dat hier iets hoeft te veranderen.

### Wat de spiegeling wel en niet aanraakt

`mirror` draait **met** `--delete`, zodat oude gehashte bestanden zich niet
opstapelen. Alleen `.well-known/` blijft met rust: daar zet Let's Encrypt zijn
controlebestanden neer, en die komen niet uit deze repo.

`public/.htaccess` gaat wel mee. Daarin staat de rewrite die `/en` laat
werken, de doorverwijzing van www naar het kale domein, en hoe lang de
browser bestanden mag bewaren. Zit daar een fout in, dan geeft de site een
500; de controlestap aan het eind van de workflow vangt dat op.

`DEPLOY_PATH` moet daarom precies de webroot van deze site zijn en niets
ruimers: alles daarbinnen wat niet in `build/` zit, verdwijnt. De workflow
kijkt eerst of er een `index.html` in die map ligt en stopt als dat niet zo
is, zodat een typefout in die variabele geen andere map leegruimt.

Staat er in de webroot nog iets dat niet uit deze repo komt, dan verdwijnt
het bij de eerste uitrol. Start de workflow daarom de eerste keer met de hand
en zet **Proefrit** aan. Dan laat `lftp` in het log zien wat hij zou uploaden
en verwijderen zonder het te doen. Kijk in dat log twee dingen na: staat
`.well-known` niet in de lijst met te verwijderen bestanden, en staat er niets
anders bij dat je wilt houden. Klopt het, dan start je hem daarna zonder
proefrit.
