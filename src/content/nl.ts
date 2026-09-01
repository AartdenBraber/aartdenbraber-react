import { SiteContent } from './types';

const nl: SiteContent = {
  meta: {
    title: 'Aart den Braber · Full stack engineer, Angular en Java',
    description:
      'Freelance full stack engineer. Angular en TypeScript aan de voorkant, Java en Spring aan de achterkant. Werkt aan complexe systemen bij de overheid en in de financiële sector.',
  },

  nav: {
    skipToContent: 'Naar de inhoud',
    items: [
      { href: '#over-mij', label: 'Over mij' },
      { href: '#wat-ik-doe', label: 'Wat ik doe' },
      { href: '#werkervaring', label: 'Werkervaring' },
      { href: '#aanbevelingen', label: 'Aanbevelingen' },
      { href: '#vragen', label: 'Vragen' },
      { href: '#contact', label: 'Contact' },
    ],
  },

  hero: {
    greetings: {
      morning: 'Goedemorgen',
      afternoon: 'Goedemiddag',
      evening: 'Goedenavond',
    },
    name: 'Aart den Braber',
    role: 'Full stack engineer',
    title: 'Ik schrijf code die de volgende ontwikkelaar zonder uitleg begrijpt.',
    subtitle:
      'Full stack engineer sinds 2011. Angular en TypeScript aan de voorkant, Java en Spring aan de achterkant. Meestal bij de overheid en in de financiële sector.',
    primaryCta: { label: 'Bekijk mijn werkervaring', href: '#werkervaring' },
    secondaryCta: { label: 'Download cv', href: '#cv' },
    scrollLabel: 'Naar het volgende onderdeel',
  },

  about: {
    heading: 'Wat je aan mij hebt',
    paragraphs: [
      'Ik ben Aart den Braber, freelance full stack engineer uit Nederland. Mijn werk zit meestal in bestaande systemen: applicaties die al jaren draaien, waar veel van afhangt, en waar degene die er als laatste iets ingrijpends aan veranderde inmiddels vertrokken is.',
      'Ik ben begonnen als frontender en afgestudeerd als UX-researcher. Daardoor kan ik een gebruikersvraag zelf omzetten in een API-ontwerp, zonder dat daar drie mensen tussen hoeven te zitten. In de praktijk scheelt dat een hoop heen en weer.',
      'Waar ik streng in ben: tests die daadwerkelijk gedrag controleren, code die je zonder toelichting kunt lezen, en documentatie die klopt. Niet omdat het netjes staat, maar omdat een systeem anders niet over te dragen is zonder dat de kwaliteit meezakt.',
    ],
    facts: [
      { label: 'Actief sinds', value: '2011' },
      { label: 'Opleiding', value: 'HBO Communication & Multimedia Design, Haagse Hogeschool' },
      { label: 'Werkterrein', value: 'Overheid en financiële sector' },
      { label: 'Talen', value: 'Nederlands, Engels, Duits' },
    ],
  },

  services: {
    heading: 'Wat ik doe',
    intro: 'De dingen waar opdrachtgevers me meestal voor vragen.',
    items: [
      {
        title: 'Frontend in Angular',
        body: 'Angular en TypeScript, van state management met NgRx tot componenten die je over meerdere applicaties hergebruikt. Ik werk met Angular sinds versie 2.',
      },
      {
        title: 'Backend in Java en Node',
        body: 'Java met Spring Boot, of Node met NestJS en Express. Inclusief het API-ontwerp zelf, in OpenAPI, voordat er een regel implementatie staat.',
      },
      {
        title: 'Testen dat ergens over gaat',
        body: 'Unit, integratie en end-to-end. Ik geef er ook workshops over, want veel teams schrijven tests die alleen bevestigen wat de code toevallig al doet.',
      },
      {
        title: 'UX-onderzoek en flow design',
        body: 'Afgestudeerd UX-researcher. Ik doe gebruikerstests en ontwerp flows. Bij kleinere trajecten scheelt dat een aparte designer.',
      },
      {
        title: 'Onderhoudbaarheid terugbrengen',
        body: 'Technical debt in kaart brengen, opstart- en buildprocessen versimpelen, en het team meenemen zodat het daarna niet terugzakt.',
      },
      {
        title: 'Begeleiding van juniors',
        body: 'Junior developers en testers begeleiden, met de nadruk op code en tests die over een jaar nog leesbaar zijn.',
      },
    ],
  },

  experience: {
    heading: 'Werkervaring',
    intro: 'Van recent naar eerder. Opdrachten die via een werkgever liepen, staan ingesprongen.',
    highlightsLabel: 'Wat het opleverde',
    stackLabel: 'Stack',
    currentLabel: 'Nu',
    viaLabel: 'via',
    entries: [
      {
        id: 'duo-fullstack',
        company: 'DUO',
        role: 'Full stack engineer',
        location: 'Den Haag',
        period: 'feb. 2024 - heden',
        current: true,
        summary:
          'Aan STATOE, het systeem dat statustoekenningen regelt. Eerst voor het hoger onderwijs (HOST), daarna voor het middelbaar beroepsonderwijs (MBOST). Bij HOST moest de werking vrijwel identiek blijven, bij MBOST was er wel ruimte om het beter te maken.',
        highlights: [
          'Het opstarten van het project teruggebracht van meer dan tien handmatige stappen naar één keer instellen',
          'Greenfield MBOST-project opgezet, voor zowel medewerkers als zakelijke gebruikers',
          'HOST als lift-and-shift aangepakt, omdat de bedrijfsvoering niet stil mocht vallen. Verbeteringen alleen waar ze niets in de werking omgooiden',
          'API-ontwerpen uitgewerkt en gekoppeld aan de Angular-frontend',
          'Backendprocessen verduidelijkt, waaronder het vullen van de database en de koppelingen tussen modules',
          'Een junior fullstack developer en een junior tester begeleid',
        ],
        stack: ['Java', 'Spring Boot', 'Spring Security', 'JUnit', 'Angular', 'TypeScript', 'Liquibase', 'Hibernate', 'ActiveMQ', 'Cucumber', 'Playwright', 'Docker', 'Jenkins', 'GitLab'],
      },
      {
        id: 'duo-frontend',
        company: 'DUO',
        role: 'Frontend developer',
        location: 'Den Haag',
        period: 'mrt. 2023 - feb. 2024',
        summary:
          'DUO wilde zaakgericht gaan werken bij het verwerken van documenten. Er stond een MVP, maar die was niet ver genoeg om uit te rollen. Met het team een volledige applicatie gebouwd waarmee medewerkers documenten verwerken en aan een zaak koppelen.',
        highlights: [
          'Bestaande frontend bijgewerkt en de tests vernieuwd met Cypress component tests',
          'Zwakke plekken in de backend benoemd en de structuur eromheen verbeterd',
          'Nauw samengewerkt met de UX/UI-designer en met stakeholders',
        ],
        stack: ['Angular', 'NgRx', 'TypeScript', 'Java', 'Spring Boot', 'Cypress', 'Jest', 'Docker', 'Jenkins'],
      },
      {
        id: 'knab',
        company: 'Knab',
        role: 'Software engineer',
        location: 'Amsterdam',
        period: 'nov. 2021 - mrt. 2023',
        summary:
          'Knab nam het bancaire deel van Aegon over. Mijn team bouwde het portaal waar die klanten in terechtkwamen. Vertrouwen was daarbij het grootste ontwerpprobleem: mensen moesten hun beleggings- en pensioenrekening herkennen in een omgeving die ze nog nooit hadden gezien.',
        highlights: [
          'Portaal gebouwd dat de oude Aegon-omgeving herkenbaar houdt en tegelijk prettiger werkt',
          'Backend-for-frontend op AWS Lambda, later ECS, voor een veilige koppeling met de Knab-API’s',
          'Tests geschreven met 80 tot 96 procent dekking in Angular, React en Node',
          'Inlogflow in React met OAuth, wachtwoord wijzigen en een OTP-code via sms of e-mail',
        ],
        stack: ['Angular', 'React', 'NgRx', 'TypeScript', 'Node', 'Express', 'AWS Lambda', 'AWS ECS', 'DynamoDB', 'OAuth', 'Jest', 'Cypress'],
      },
      {
        id: 'ordina',
        company: 'Ordina',
        role: 'Lead front-end en UX design',
        location: 'Nieuwegein',
        period: 'apr. 2020 - nov. 2021',
        summary:
          'Via Ordina werkte ik in een High Performance Team. Twee opdrachten bij de Nederlandse Politie, hieronder uitgewerkt.',
        highlights: [],
        stack: [],
      },
      {
        id: 'politie-ebo',
        company: 'Politie Nederland',
        via: 'Ordina',
        role: 'Lead front-end en UX design',
        location: 'Odijk',
        period: 'apr. 2020 - nov. 2021',
        summary:
          'EBO’s zijn applicaties die door hele kleine teams zijn gebouwd en daarna uit hun jasje groeiden. Mijn opdracht was ze professioneel op te zetten, samen met de gebruikers en de oorspronkelijke makers.',
        highlights: [
          'Gedeelde packages gemaakt, zodat een update in meerdere apps tegelijk doorkomt',
          'Automatische ESLint-fixes, teststandaarden en CI/CD ingericht',
          'Het team meegenomen naar gebruikerssessies via de fishbowl-werkvorm, zodat iedereen de wensen zelf hoorde',
          'Onder meer Camera in Beeld gebouwd, waarmee agenten snel zien waar camera’s hangen',
        ],
        stack: ['TypeScript', 'StencilJS', 'JavaScript', 'Node', 'Python', 'Cypress', 'Jest', 'Jasmine', 'Docker', 'Cloud Foundry'],
      },
      {
        id: 'politie-webcomponents',
        company: 'Politie Nederland',
        via: 'Ordina',
        role: 'Front-end developer',
        location: 'Odijk',
        period: 'jun. 2021 - nov. 2021',
        summary:
          'Tijdens de EBO-opdracht liep ik tegen het Blueprint Webcomponents-team aan, dat een componentbibliotheek bouwde voor alle politie-apps. Een groot deel stond er al, maar er zaten fouten in die het onbruikbaar maakten buiten een framework.',
        highlights: [
          'De componenten laten werken in kaal HTML. Ze leunden volledig op de shadow DOM, waardoor developers zonder JavaScript-framework er niets mee konden',
          'Workshops gegeven over testen. Het team stapte daarna van snapshot tests over op tests die gedrag controleren, wat de tests specifieker en beter onderhoudbaar maakte',
          'Veel gerefactord en tests geschreven voor StencilJS, met dekking op elke use-case. Bij een bibliotheek die tientallen developers gebruiken, komt elke fout ergens anders weer terug',
        ],
        stack: ['StencilJS', 'TypeScript', 'JavaScript', 'Node', 'Jasmine', 'Jest', 'ESLint', 'Sass'],
      },
      {
        id: 'politie-pandora',
        company: 'Politie Nederland',
        via: 'Ordina',
        role: 'Lead front-end en UX design',
        location: 'Odijk',
        period: 'apr. 2020 - apr. 2021',
        summary:
          'Bewijsstukken organiseren en de rechten daarop beheren. Aan het eind droegen we het over aan een Python-team van de politie zelf, dus overdraagbaarheid was geen bijzaak maar de opdracht.',
        highlights: [
          'REST API ontworpen in OpenAPI 3, inclusief partial response, een versimpelde vorm van wat GraphQL doet',
          'De build in de CI/CD-pipeline teruggebracht van 18 naar 6 minuten met caching en andere optimalisaties',
          'Rolling updates ingericht, waardoor een release geen downtime meer oplevert',
          'De API-responses uitgebreid getest, zodat het opvolgende team kon zien of hun refactoring iets brak',
        ],
        stack: ['Angular', 'TypeScript', 'RxJS', 'OpenAPI 3', 'Swagger', 'Node', 'Express', 'Python', 'Docker', 'Kubernetes', 'Cloud Foundry', 'Jasmine'],
      },
      {
        id: 'app4mation',
        company: 'App4mation',
        role: 'Software engineer',
        location: 'Utrecht',
        period: 'jan. 2019 - apr. 2020',
        summary:
          'Enterprise-applicaties in Angular voor ING, Heraeus, Lidl (Schwartz IT) en Finanz Informatik. Bij een deel van die klanten had ik direct contact.',
        highlights: [
          'Grote technical debt bij ING in kaart gebracht en in overleg opgelost',
          'Op snelheid gerefactord, waardoor de applicatie merkbaar sneller werd',
          'REST API’s ontworpen en geschreven voor Heraeus, ING en Lidl',
          'UX-onderzoek gedaan en ontwerpen gemaakt voor Finanz Informatik, Heraeus en ING',
        ],
        stack: ['Angular', 'TypeScript', 'JavaScript', 'HTML', 'Sass', 'Git', 'GitLab'],
      },
      {
        id: 'pangaea',
        company: 'PANGAEA Digital Agency',
        role: 'Frontend developer',
        location: 'Den Haag',
        period: 'nov. 2017 - jan. 2019',
        summary:
          'Enterprise-websites voor horeca en retail, op een CMS dat PANGAEA zelf had gebouwd. Onder meer voor DEEN, Hotel van Oranje, Hotel Arena en GreenSand.',
        highlights: [
          'Structuur aangebracht in bestaande code met Sass, BEM en React',
          'CI/CD opgezet in GitHub en GitLab en verschillende samenwerkvormen onderzocht',
          'Interne artikelen geschreven om kennis te delen',
        ],
        stack: ['JavaScript', 'React', 'jQuery', 'Sass', 'Razor', 'XML', 'GitLab', 'GitHub'],
      },
      {
        id: 'abf',
        company: 'ABF Research',
        role: 'Frontend developer',
        location: 'Delft',
        period: 'feb. 2015 - jul. 2016',
        summary: 'Websites voor gemeenten, waaronder Rotterdam, Delft en Hardinxveld-Giessendam.',
        highlights: [
          'Ontwerpen uitgewerkt in HTML, CSS en JavaScript',
          'Snelle schetsen voorgelegd aan collega’s, als korte gebruikerstest',
        ],
        stack: ['JavaScript', 'jQuery', 'HTML', 'Sass', 'Razor', 'JSON', 'XML'],
      },
      {
        id: 'den-braber-webdesign',
        company: 'Den Braber Webdesign',
        role: 'Eigenaar en developer',
        location: 'Veenendaal',
        period: 'okt. 2011 - nov. 2021',
        summary:
          'Mijn eigen bureau, naast studie en werk. Websites en applicaties voor kleinere opdrachtgevers, met veel aandacht voor toegankelijkheid en snelheid. Toen ik fulltime freelance ging, ben ik ermee gestopt.',
        highlights: [
          'PageSpeed van 98 op denbraberwebdesign.nl',
          'Toegankelijkheid als uitgangspunt, ook voor bezoekers buiten de standaarddoelgroep',
        ],
        stack: ['JavaScript', 'PHP', 'WordPress', 'Python', 'Django', 'Angular', 'jQuery', 'Sass'],
      },
    ],
  },

  testimonials: {
    heading: 'Wat anderen zeggen',
    intro: 'Aanbevelingen van opdrachtgevers en collega’s, overgenomen van LinkedIn.',
    moreLabel: 'Alle aanbevelingen op LinkedIn',
    moreHref: 'https://www.linkedin.com/in/aartdenbraber',
  },

  faq: {
    heading: 'Veelgestelde vragen',
    intro: 'De dingen die je waarschijnlijk wilt weten voordat je mailt.',
    items: [
      {
        id: 'beschikbaarheid',
        question: 'Ben je beschikbaar?',
        answer:
          'Op dit moment niet. Ik werk bij DUO aan de statustoekenning voor het hoger en middelbaar beroepsonderwijs.\n\nEen gesprek is wel altijd goed. Dan weet ik wat er bij jou speelt en of ik daar over een tijd bij pas.',
      },
      {
        id: 'werkvorm',
        question: 'Werk je remote of op locatie?',
        answer:
          'Voorkeur voor remote. Bij DUO ga ik ongeveer eens per drie weken naar kantoor en dat bevalt goed: genoeg om de mensen te kennen, weinig genoeg om er niet je week aan kwijt te zijn.\n\nVolledig op locatie doe ik liever niet, tenzij er een reden voor is die ik kan volgen.',
      },
      {
        id: 'achtergrond',
        question: 'Wat is je achtergrond?',
        answer:
          'Ik bouw sinds 2011 websites en applicaties, vanaf 2015 in loondienst en daarna freelance. Angular gebruik ik sinds versie 2, aan de achterkant werk ik met Java en Spring Boot.\n\nDaarnaast ben ik afgestudeerd UX-researcher. Daardoor kan ik een gebruikersvraag zelf doortrekken tot een API-ontwerp in plaats van hem door te geven. Het meeste van mijn werk zit bij de overheid en in de financiële sector: DUO, de Politie, Knab en ING.',
      },
      {
        id: 'servicenow',
        question: 'Werk je nog met ServiceNow?',
        answer:
          'Nee. Ik heb er in 2019 twee certificeringen voor gehaald en aan Service Portals gewerkt, maar sindsdien niet meer. Uit mezelf zou ik het niet voorstellen.\n\nTegelijk wil ik het geen nee noemen. Ik vind het werk in IT breed leuk, dus als er een goede reden is om er weer in te duiken, hoor ik die graag. Zie het als niet mijn eerste keus.',
      },
      {
        id: 'testen',
        question: 'Hoe kijk je naar testen?',
        answer:
          'Blackbox als uitgangspunt. Een test controleert wat een gebruiker of een aanroepende partij merkt, niet hoe het van binnen in elkaar zit. Wil je whitebox testen, dan ga ik daar graag met je over in discussie.\n\nSnapshot tests reken ik niet mee. Die bevestigen alleen wat de code toevallig al doet. Bij de Politie heb ik daar workshops over gegeven; dat team is daarna overgestapt op tests die gedrag controleren.',
      },
      {
        id: 'grenzen',
        question: 'Waar begin je over als het je niet bevalt?',
        answer:
          'Ik heb geen lijst met technieken waar ik niet aan wil. Waar ik wel over begin: als er geen ruimte is om tests te schrijven, of als de code niet overdraagbaar hoeft te zijn omdat het toch tijdelijk is.\n\nBij ING trof ik een flinke technical debt aan. Die heb ik gemeld bij zowel het bureau als de klant in plaats van eromheen te werken. Na hun akkoord is een groot deel van de app gerefactord. Zo doe ik het liever.',
      },
      {
        id: 'route',
        question: 'Werk je direct of via een bureau?',
        answer:
          'Allebei, geen voorkeur. Bij de overheid loopt veel via een broker en daar werk ik prima mee. Rechtstreeks met de opdrachtgever kan net zo goed.',
      },
      {
        id: 'tarief',
        question: 'Wat kost het?',
        answer:
          'Op aanvraag. Het hangt af van de duur van de opdracht, de reistijd en of het via een bureau loopt.',
      },
    ],
  },

  cv: {
    heading: 'Het volledige cv',
    body:
      'Hierboven staat de samenvatting. Het volledige cv bevat daarnaast de gevolgde cursussen, de opleidingen en de overige aanbevelingen.',
    downloadLabel: 'Download cv als pdf',
    fileName: 'CV Aart den Braber',
  },

  contact: {
    heading: 'Contact',
    body:
      'Zoek je iemand voor een langere opdracht, of wil je eerst sparren over een systeem dat vastloopt? Stuur gerust een mail.',
    emailLabel: 'Stuur een mail',
    emailUser: 'cv',
    emailDomain: 'prosumfrontend.nl',
    linkedIn: 'https://www.linkedin.com/in/aartdenbraber',
    linkedInLabel: 'LinkedIn',
  },
};

export default nl;
