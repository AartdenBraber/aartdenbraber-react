import { CasesContent } from './types';

const casesNl: CasesContent = {
  heading: 'Vier opdrachten van dichtbij',
  intro: 'De rest van mijn werk staat verderop in de tijdlijn. Dit zijn er vier waar de afweging interessanter was dan het resultaat.',
  situationLabel: 'De situatie',
  actionsLabel: 'Wat ik deed',
  resultLabel: 'Wat het opleverde',
  items: [
    {
      id: 'pandora',
      client: 'Politie Nederland, via Ordina',
      period: 'apr. 2020 - apr. 2021',
      title: 'Een API bouwen die een ander team moest overnemen',
      situation:
        'Mijn team was verantwoordelijk voor een applicatie om bewijsstukken te ordenen en de rechten daarop te beheren. Aan het eind van het project droegen we alles over aan een intern Python-team van de Politie.\n\nDat wisten we vanaf het begin. Overdraagbaarheid was daardoor geen nette bijkomstigheid maar de opdracht zelf.',
      actions: [
        'De systeemeisen en de gebruikerswensen opgehaald en geprioriteerd',
        'Een nieuw Angular 9-project opgezet, later omgezet naar 11',
        'In Swagger (OpenAPI 3) een REST API ontworpen en geoptimaliseerd voor een snelle frontend, inclusief partial response: een versimpelde vorm van wat GraphQL doet',
        'Het gesprek met het interne politieteam geleid om dat ontwerp in de backend te implementeren, en ze geholpen daar actiepunten uit te halen',
        'De buildtijd in de CI/CD-pipeline van 18 naar 6 minuten gebracht met caching en andere optimalisaties',
        'Rolling updates ingericht, zodat een release geen downtime meer oplevert',
      ],
      result:
        'Een API-ontwerp dat is opgebouwd uit de systeem- en gebruikerseisen en dat dient als één bron van waarheid voor zowel de front- als de backend. De responses zijn uitgebreid getest, dus het opvolgende team kan zien of hun refactoring iets breekt in een applicatie die groot en ingewikkeld is.\n\nDe Angular-app is geschreven met de gedachte dat ik er niet zou zijn om hem te onderhouden: typesafe, en met genoeg tests om te merken wanneer functionaliteit stukgaat.',
    },
    {
      id: 'ing',
      client: 'ING, via App4mation',
      period: 'sep. 2019 - dec. 2019',
      title: 'Technical debt melden in plaats van eromheen werken',
      situation:
        'Plat4mation, de zusteronderneming van App4mation, zat vast met een app die zij voor ING hadden gebouwd. Managers beheerden daarin hun medewerkers: inzien, promoveren, budgetten aanpassen. ING wilde meer functionaliteit en een snellere app, maar de expertise daarvoor was er niet.',
      actions: [
        'De app versneld in Angular en de gevraagde functionaliteit gebouwd',
        'Rechtstreeks contact met de klant onderhouden over de voortgang',
        'Gaandeweg bleek er een flinke technical debt te zitten. Dat heb ik gemeld bij Plat4mation én bij ING, in plaats van eromheen te bouwen',
        'Na akkoord van beide partijen een groot deel van de app gerefactord: dezelfde functionaliteit, leesbaardere code',
      ],
      result:
        'De app is volledig gerefactord en werkt merkbaar sneller, onder meer doordat pre-rendering is vervangen door REST-API’s. Daardoor wordt alleen de data opgehaald die nodig is, nadat de pagina al staat.\n\nDe klant was tevreden over het resultaat. Twee aanbevelingen van Plat4mation komen uit deze opdracht.',
    },
    {
      id: 'knab',
      client: 'Knab',
      period: 'nov. 2021 - mrt. 2023',
      title: 'Een zachte landing voor klanten die er zelf niet om gevraagd hadden',
      situation:
        'Aegon wilde dat Knab, waar Aegon grootaandeelhouder was, de beleggings- en pensioenrekeningen zou overnemen. Die klanten werden dus overgezet naar een bank die ze niet zelf hadden uitgezocht.\n\nHet grootste ontwerpprobleem was daarmee niet technisch maar menselijk: mensen moesten hun eigen rekening herkennen in een omgeving die ze nog nooit hadden gezien.',
      actions: [
        'Een Angular-applicatie gebouwd waarin die klanten landen, met onder meer PrimeNG en Inbenta',
        'Een backend-for-frontend op AWS Lambda, later ECS, om veilig te werken met de gevoelige data uit de Knab-API’s',
        'In React de inlogflow gebouwd: OAuth, wachtwoord wijzigen, account aanmaken, en een OTP-code via sms of e-mail',
        'Tests geschreven met 80 tot 96 procent dekking in React, Angular en Node, en NewRelic ingericht om de apps in de gaten te houden',
      ],
      result:
        'Een goed onderhoudbare applicatie, gebouwd in een multidisciplinair team met drie frontenders en een backender. Om alle koppelingen voor elkaar te krijgen was er veel samenwerking met andere teams nodig.',
    },
    {
      id: 'webcomponents',
      client: 'Politie Nederland, via Ordina',
      period: 'jun. 2021 - nov. 2021',
      title: 'Een componentbibliotheek die alleen binnen een framework werkte',
      situation:
        'Tijdens een andere opdracht liep ik tegen het Blueprint Webcomponents-team aan. Zij bouwden een bibliotheek waarmee elke ontwikkelaar binnen de Politie formuliervelden, kopstijlen en typografie uit één bron kan halen.\n\nEen groot deel stond er al, maar er zaten fouten in die pas opvallen als je de componenten buiten een JavaScript-framework probeert te gebruiken. Ik zag dat ze een extra paar handen konden gebruiken en ben aangeschoven.',
      actions: [
        'De componenten laten werken in kaal HTML. Ze leunden volledig op de shadow DOM, waardoor ontwikkelaars zonder framework er niets mee konden',
        'Workshops gegeven over testen volgens de techniek van Mosh, en de teamleden begeleid om die consequent toe te passen',
        'Veel gerefactord en grote hoeveelheden tests voor StencilJS geschreven, met dekking op elke use-case',
      ],
      result:
        'De formuliervelden werken nu ook in kaal HTML. Dat scheelt voor alle ontwikkelaars binnen de Politie die niet met een JavaScript-framework werken.\n\nDoordat het team nu echte tests schrijft in plaats van snapshot tests, zijn die tests specifieker en beter te onderhouden. Bij een bibliotheek die tientallen ontwikkelaars gebruiken, komt elke fout ergens anders weer terug.',
    },
  ],
};

export default casesNl;
