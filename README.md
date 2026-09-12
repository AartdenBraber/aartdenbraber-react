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

De site is één pagina: een hero met zoeklichteffect, een korte introductie en
daaronder het cv, pagina voor pagina getekend met pdf.js. Onder het cv staat een
contactformulier.

## Structuur

```
src/
  content/      Alle teksten, per taal (nl.tsx en en.tsx) met gedeelde types
  i18n/         Taal uit het adres halen, <html lang>, titel en canonical bijwerken
  components/   Eén map per component, met de bijbehorende .scss ernaast
  hooks/        useRevealOnView, met de opmaak van het onthullen ernaast
  utils/        PdfWithTextLayer tekent het cv op canvassen, useParallax schuift de achtergrond
  styles/       Wat voor de hele site geldt: bootstrap.scss en global.scss
```

Teksten aanpassen doe je in `src/content/nl.tsx` en `src/content/en.tsx`. Beide
bestanden voldoen aan hetzelfde type, dus TypeScript geeft een fout zodra er in
één taal iets ontbreekt. De alinea's staan als JSX in die bestanden, omdat er
vetgedrukte stukken middenin de zinnen zitten.

## Opmaak

Alles is SCSS. Elke component importeert zijn eigen bestand, dus wie de hero
wil aanpassen zit in `src/components/Hero/Hero.scss` en nergens anders. In
`src/styles/global.scss` staat alleen wat voor de hele pagina geldt: de
variabelen, de reset en de regels op kale elementen zoals `body`, `img` en `a`.
`src/styles/bootstrap.scss` laadt Bootstrap met een paar overrides. Het oude
WordPress-thema waar de opmaak uit kwam is verder opgeruimd; wat daar nog van
over is, is de reset en een handvol elementregels.

## Taal aan het adres

`/` is Nederlands en `/en` is Engels. De taal wordt uit het pad gelezen, niet
uit een voorkeur in de browser, zodat elke taal een eigen adres heeft dat een
zoekmachine kan indexeren en een gedeelde link laat zien wat de deler zag.

## Het cv

`CV-Aart-den-Braber-NL.pdf` en `CV-Aart-den-Braber-EN.pdf` staan in `public/`
en gaan met de build mee. Ze zijn sowieso al openbaar te downloaden vanaf de
site, dus ze staan ook in deze publieke repo. Welke van de twee getoond wordt
hangt af van de taal; zie `cv` in `src/content/nl.tsx` en `en.tsx`.

pdf.js heeft een losse worker nodig. Die stond eerst op een cdn, wat betekende
dat een storing daar een lege pagina opleverde op de plek waar het cv hoort.
`scripts/copy-pdf-worker.js` zet hem nu voor elke start en build vanuit
`node_modules` in `public/`, zodat hij van ons eigen domein komt en altijd bij
de gebruikte versie past. Het gekopieerde bestand staat in `.gitignore`.

Tekenen gebeurt met `requestAnimationFrame`. Een browser laat dat niet lopen in
een tabblad op de achtergrond, dus in een verborgen tab blijft het cv leeg tot
je het tabblad naar voren haalt. Dat is geen fout in de site.

## Contactformulier

Onder het cv staat een contactformulier, met een link ernaartoe onder de
introductie en in de balk bovenin. De site stuurt een bericht naar
`public/contact.php`, en dat script stuurt het per mail door. Het gaat gewoon
mee met de build.

Het formulier staat er pas als dat script antwoordt. Bij het laden van de
pagina haalt de site een token op bij `/contact.php`. Lukt dat niet, dan
blijven het formulier en beide links weg. Een bezoeker ziet dus nooit een
formulier dat het niet doet, ook niet zolang de instellingen op de server nog
ontbreken.

### Instellen op de server

De instellingen staan niet in deze repo, want die is openbaar. Ze staan in een
bestand boven de webroot:

```
/home/aartdenbraber/domains/aartdenbraber.nl/contactformulier/config.php
```

Het FTP-account van de uitrol begint in de webroot en kan daar niet bij.
`deploy/contactformulier-config.voorbeeld.php` laat zien wat erin hoort; zet
de kopie neer met Bestandsbeheer in DirectAdmin. Verplicht zijn `ontvanger` en
`geheim`. Een geheim maak je met
`php -r "echo bin2hex(random_bytes(32)), PHP_EOL;"`.

Naast het configbestand maakt het script zelf een map `opslag` aan voor de
tellers en de gebruikte tokens. Daarin staat geen IP-adres, alleen een HMAC
ervan.

Klopt er iets niet aan de instellingen, dan antwoordt het script met 503 en
staat de reden in het foutenlog van het domein, met `contactformulier:`
ervoor. Berichten die de botwering tegenhoudt, staan daar ook.

### Turnstile

Maak in het Cloudflare-dashboard een Turnstile-widget aan voor de hostname
`aartdenbraber.nl` en zet de sitekey en de secret in de config. Laat je ze
allebei leeg, dan werkt het formulier zonder Turnstile en blijven de andere
lagen aan. Het script van Cloudflare laadt pas als iemand het formulier
aanraakt. Wie alleen het cv leest, maakt dus geen verbinding met Cloudflare.

### De botwering

Het recept is hetzelfde als bij de formulieren van EV Company in
`wecatalyze-apis`.

1. Een token met tijdval. Bij het laden haalt de site een token op dat de
   server met HMAC tekent. Een bericht moet dat token dragen, het moet minstens
   drie seconden oud zijn en het werkt maar één keer. Een bot die ophaalt en
   meteen post, valt hierop af. Na zes uur verloopt het token; de site haalt
   dan zelf een nieuw en probeert het nog een keer.
2. Een honeypot. Het formulier heeft buiten beeld een veld `fax` dat mensen
   niet kunnen bereiken. Staat daar iets in, dan antwoordt het script alsof
   het bericht verstuurd is en gooit het weg.
3. Controle van de invoer, en een limiet van tien berichten per uur per
   IP-adres en vijftig per dag in totaal.
4. Cloudflare Turnstile, stil: de widget laat zich alleen zien als Cloudflare
   twijfelt. Geeft Cloudflare geen antwoord, dan gaat het bericht toch door,
   met een regel in het log.

Een filter op de inhoud zit er bewust niet in. Dat houdt vooral echte
berichten tegen.

### De mail

Het script verstuurt met `mail()` vanaf `noreply@aartdenbraber.nl` en zet het
adres van de bezoeker in `Reply-To`. De SPF-record van aartdenbraber.nl staat
de server toe, en met `-f` staat de envelope-afzender op hetzelfde domein. Een
DKIM-record heeft aartdenbraber.nl niet. Belandt de mail toch in de spam, zet
dan DKIM aan in DirectAdmin en zet het record bij Junda, waar de DNS staat.

### Lokaal testen

In `npm start` draait geen PHP, dus daar blijft het formulier weg. Test met de
build en de ingebouwde server van PHP:

```bash
npm run build
CONTACTFORMULIER_CONFIG=/pad/naar/config.php php -S 127.0.0.1:8080 -t build
```

Zet in die lokale config `testmap` op een map, dan worden berichten
`.eml`-bestanden in plaats van echte mail. De testsleutels van Cloudflare
(sitekey `1x00000000000000000000AA`, secret
`1x0000000000000000000000000000000AA`) laten elk bericht door. Voor de
controle bij Cloudflare heeft PHP de extensie `curl` of `openssl` nodig.

De PHP-tests hebben geen server nodig:

```bash
php scripts/test-contactformulier.php
```

De workflow draait ze voor elke uitrol.

## Hosting

De server meldt zich als Apache. Onbekende paden krijgen daar `index.html`
terug, waardoor de app op elk pad opstart. `/en` heeft daarnaast een eigen
regel: dat adres krijgt `en.html`, hetzelfde document met een Engelse titel,
omschrijving, canonical en `lang`. Dat bestand komt na elke build uit
`scripts/taalpaginas.js`. Wie geen javascript draait, zoals het deelvenster van
LinkedIn, kreeg daar anders de Nederlandse tekst. De rewrites staan in
`public/.htaccess` en dat bestand gaat met de build mee.

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

### De uitrol in drie fasen

De site mag nooit naar bestanden wijzen die er nog niet staan, en de uitrol mag
niets weggooien dat niet uit deze repo komt. Vandaar drie fasen.

1. Alles behalve de toegangsdocumenten (`index.html`, `en.html`) en
   `.htaccess` gaat omhoog, zonder iets te verwijderen. De nieuwe bundels komen
   naast de oude te staan en de site draait ondertussen door op de oude
   documenten.
2. De toegangsdocumenten en `.htaccess` gaan omhoog onder een tijdelijke naam
   en worden daarna hernoemd. Hernoemen binnen een map is een enkele handeling
   op het bestandssysteem, dus niemand krijgt een half geschreven bestand te
   zien. Hier klapt de site om.
3. Opruimen gebeurt **alleen in `static/`**.

Struikelt fase 1 of 2, dan staat de oude site er nog compleet bij en is er
niets verwijderd. `cmd:fail-exit` stopt het script voor fase 3.

Echt blauw-groen is het niet. Wie de pagina vlak voor de omschakeling laadde
en daarna pas een lui geladen chunk opvraagt, kan die net opgeruimd zien zijn.
En terugrollen gaat niet met een schakelaar, maar door de vorige commit
opnieuw uit te rollen. Wat je wel hebt: op geen enkel moment wijst de live
`index.html` of `en.html` naar bundels die er niet zijn.

### Waarom er alleen in static/ wordt opgeruimd

In `static/` staat uitsluitend wat de build genereert, en elke bestandsnaam
bevat een hash van de inhoud. Wat daar staat en niet meer in `build/`
voorkomt, is dus met zekerheid een bundel van een vorige uitrol. Daar mag
`--delete` zijn werk doen, anders stapelen die zich eindeloos op.

Buiten `static/` gebeurt dat niet. In de root en in `images/` worden alleen
bestanden overschreven die de build zelf maakt. Wat daar verder staat, blijft
staan.

Dat is met opzet zo, en het heeft een aanleiding. Op 3 september 2026 draaide
`mirror --delete` op de hele webroot en verdween alles wat niet in `build/`
zat. Dat bleek een stuk meer dan de oude bundels alleen.

Bij het onderzoeken daarvan ging het nog een keer mis, op een manier die het
onthouden waard is. De rewrite in `.htaccess` geeft voor elk onbekend pad
`index.html` terug met status 200. Een statuscode zegt hier dus niets over of
een bestand nog bestaat. Wie met `curl -o /dev/null -w '%{http_code}'`
controleert of iets er nog staat, krijgt altijd 200 en concludeert ten
onrechte dat er niets verwijderd is. Kijk naar het inhoudstype of naar de
eerste bytes. De controlestap aan het eind van de workflow doet dat nu ook,
anders zou die groen blijven terwijl het cv van de server verdwenen was.

### Wat de uitrol wel en niet aanraakt

`public/.htaccess` gaat mee. Daarin staat de rewrite die `/en` laat werken, de
doorverwijzing van www naar het kale domein, en hoe lang de browser bestanden
mag bewaren. Zit daar een fout in, dan geeft de site een 500; de controlestap
aan het eind van de workflow vangt dat op.

`DEPLOY_PATH` moet precies de webroot van deze site zijn. De workflow kijkt
eerst of er een `index.html` in die map ligt en stopt als dat niet zo is,
zodat een typefout in die variabele niet in een andere map gaat schrijven.

Wil je vooraf zien wat er gaat gebeuren, start de workflow dan met de hand en
zet **Proefrit** aan.
