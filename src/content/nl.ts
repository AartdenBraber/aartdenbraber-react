import casesNl from './cases.nl';
import { SiteContent } from './types';

const nl: SiteContent = {
  meta: {
    title: 'Aart den Braber · Fullstack developer',
    description:
      'Developer met een passie voor leren en een oog voor detail en optimalisatie. Daarnaast afgestudeerd UX-researcher, dus de focus ligt altijd op de eindgebruiker.',
  },

  nav: {
    label: 'Onderdelen van deze pagina',
    skipToContent: 'Naar de inhoud',
    items: [
      { href: '#over-mij', label: 'Over mij' },
      { href: '#wat-ik-doe', label: 'Wat ik doe' },
      { href: '#cases', label: 'Cases' },
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
    role: 'Fullstack developer',
    title: 'Ik ben een developer met een passie voor leren en focus op detail en optimalisatie.',
    subtitle:
      'Dit zorgt vrijwel altijd voor code die kort en zeer goed onderhoudbaar is, maar in minder tijd is geschreven.',
    primaryCta: { label: 'Bekijk mijn werkervaring', href: '#werkervaring' },
    secondaryCta: { label: 'Download cv', href: '#cv' },
    scrollLabel: 'Naar het volgende onderdeel',
  },

  about: {
    heading: 'Leuk om kennis te maken!',
    paragraphs: [
      'Het goed (blackbox) testen is daarbij vanzelfsprekend. Als je whitebox wilt testen ga ik graag in discussie.',
      'Naast developer ben ik afgestudeerd UX-researcher, dus focus ik me altijd op de eindgebruiker. Dit kan ervoor zorgen dat ik met de UX-designer kan sparren en gebruikerstests kan uitvoeren, maar zelfs betekenen dat die uitgespaard kan worden. Maar mijn focus ligt wel op het schrijven van applicaties.',
      'Tijdens het tevreden typen van code vind ik het ontzettend belangrijk dat mijn collega’s en junioren begrijpen wat er gebeurt; dus documenteren, typesafety en tests vind ik de basis. We besteden ongeveer 10x zoveel tijd aan het lezen van code dan aan het schrijven ervan (volgens Robert C. Martin); dus dat is erg efficiënt.',
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
    intro: 'Waar opdrachtgevers me meestal voor vragen.',
    items: [
      {
        title: 'Frontend in Angular',
        body: 'Angular sinds versie 2, met TypeScript, NgRx en RxJS. Componenten en packages die je over meerdere apps hergebruikt, dus updaten is ineens erg eenvoudig.',
        link: { label: 'Over typesafe routes in Angular', href: 'https://www.linkedin.com/pulse/4-steps-typesafe-routes-angular-aart-den-braber-' },
      },
      {
        title: 'Backend in Java en Node',
        body: 'Java met Spring en Spring Boot, of Node met NestJS en Express. Daarbij ontwerp ik ook graag de REST API zelf, in Swagger (OpenAPI 3).',
      },
      {
        title: 'Goed (blackbox) testen',
        body: 'Unit, integratie en e2e. Ik geef er ook workshops over (Mosh’s technique), zodat een team in plaats van snapshot tests échte tests gaat schrijven; die zijn overzichtelijker, specifieker en beter te onderhouden.',
        link: { label: 'De techniek waar die workshops op leunen', href: 'https://www.linkedin.com/pulse/how-write-clean-testing-code-using-moshs-technique-aart-den-braber-' },
      },
      {
        title: 'UX-onderzoek en flow design',
        body: 'Afgestudeerd UX-researcher, dus ik kan met de UX-designer sparren en gebruikerstests uitvoeren. Bij kleinere trajecten kan die zelfs uitgespaard worden.',
      },
      {
        title: 'Code weer onderhoudbaar maken',
        body: 'Grote technical debt detecteren en in overleg oplossen. Daarnaast dingen instellen die het leven van een gewone developer verbeteren: automatische fixes van ESLint, goede teststandaarden, goede CI/CD.',
        link: { label: 'Ongebruikte CSS uit een componentbibliotheek slopen', href: 'https://www.linkedin.com/pulse/clean-up-unused-css-from-external-component-libraries-den-braber-' },
      },
      {
        title: 'Begeleiding van juniors',
        body: 'Junior developers en testers begeleiden in onder andere het ontwikkelen van goede en onderhoudbare code, en het begrijpen van de architectuurkeuzes eromheen.',
      },
    ],
  },

  cases: casesNl,

  experience: {
    heading: 'Werkervaring',
    intro: 'Van recent naar eerder. Opdrachten die via een werkgever liepen, staan ingesprongen.',
    highlightsLabel: 'Wat ik heb gedaan',
    stackLabel: 'Stack',
    currentLabel: 'Nu',
    viaLabel: 'via',
    caseLinkLabel: 'Lees de uitgebreide versie',
    entries: [
      {
        id: 'duo-fullstack',
        company: 'DUO',
        role: 'Full stack engineer',
        location: 'Den Haag',
        period: 'jan. 2024 - heden',
        current: true,
        summary:
          'Mijn tweede opdracht bij DUO: een systeem dat statustoekenningen regelt (STATOE). Eerst voor het hoger onderwijs (HOST), daarna voor het middelbaar beroepsonderwijs (MBOST). Helaas voor mij moest HOST vrijwel hetzelfde blijven werken. Bij MBOST mag er wel verbeterd worden, dus daar heb ik veel samengewerkt met de UX-designer en me verdiept in de gebruikerswensen.',
        highlights: [
          'Het opstarten van het project versimpeld: eerst moest je 10+ dingen goed hebben voordat het werkte, nu stel je het één keer in en draait het',
          'Greenfield MBOST-project opgezet, voor zowel medewerkers als zakelijke gebruikers',
          'HOST als lift & shift aangehouden, want de werking moest hetzelfde blijven. Af en toe een punt gemaakt en verbeterd',
          'API-ontwerpen uitgewerkt en gekoppeld aan de Angular-frontend',
          'Veel processen in de backend verduidelijkt en verbeterd, o.a. het vullen van de database en de connecties tussen modules',
          'Een junior fullstack developer en een junior tester begeleid',
        ],
        stack: ['Java', 'Spring Boot', 'Spring Security', 'JUnit', 'Angular', 'TypeScript', 'Liquibase', 'Hibernate', 'ActiveMQ', 'Cucumber', 'Playwright', 'Docker', 'Jenkins', 'GitLab'],
      },
      {
        id: 'duo-frontend',
        company: 'DUO',
        role: 'Frontend developer',
        location: 'Den Haag',
        period: 'mrt. 2023 - jan. 2024',
        summary:
          'DUO wilde zaakgericht gaan werken bij het verwerken van documenten. Er stond een MVP, maar die was niet ver genoeg om uit te rollen. Met het team een volledige applicatie gebouwd waarmee medewerkers documenten verwerken en aan een zaak koppelen.',
        highlights: [
          'Bestaande frontend bijgewerkt en de tests vernieuwd met Cypress component tests',
          'Veel bestaande structuren verbeterd en aangegeven waar de zwakke plekken in de backend zaten',
          'Nauw samengewerkt met de UX/UI-designer en met stakeholders',
        ],
        stack: ['Angular', 'NgRx', 'TypeScript', 'Java', 'Spring Boot', 'Cypress', 'Jest', 'Docker', 'Jenkins'],
      },
      {
        id: 'knab',
        caseId: 'knab',
        company: 'Knab',
        role: 'Software engineer',
        location: 'Amsterdam',
        period: 'nov. 2021 - mrt. 2023',
        summary:
          'Knab nam het bancaire deel van Aegon over. Mijn team maakte het portal waar die klanten (vooral beleggings- en pensioenrekeningen) in terechtkwamen. Het is belangrijk dat zij zich veilig voelen bij zo’n nieuw portal, dus dat was een groot focuspunt.',
        highlights: [
          'Een omgeving gebouwd die zoveel mogelijk lijkt op de oude Aegon-omgeving, maar qua UX een stuk beter is',
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
          'Via Ordina werkte ik in een High Performance Team, een vooruitstrevende manier van detachering. Twee opdrachten bij de Nederlandse Politie, hieronder uitgewerkt.',
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
          'EBO’s zijn kleinere applicaties die intern door hele kleine teams zijn gemaakt en daarna uit hun jasje groeiden. Mijn team moest ze beheerbaar maken, dus ik heb veel geschakeld met de gebruikers en de oorspronkelijke makers van de apps.',
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
        caseId: 'webcomponents',
        company: 'Politie Nederland',
        via: 'Ordina',
        role: 'Front-end developer',
        location: 'Odijk',
        period: 'jun. 2021 - nov. 2021',
        summary:
          'Tijdens de EBO-opdracht zag ik het Blueprint Webcomponents-team, dat een componentbibliotheek bouwde voor alle politie-apps, en merkte ik dat ze een extra paar handen goed konden gebruiken. Een groot deel stond er al, maar er zaten een paar fatale fouten in.',
        highlights: [
          'De components bruikbaar gemaakt voor native HTML. Dat was een grote verandering, want ze leunden volledig op de shadow DOM',
          'Workshops gegeven over hoe je goed test (Mosh’s technique). De developers schrijven nu in plaats van snapshot tests échte tests, en die zijn overzichtelijker, specifieker en beter te onderhouden',
          'Veel components gerefactord en tests gemaakt die alle use-cases dekken, zodat de eindgebruiker geen last heeft van fouten die wij maken. Zeker in een project als dit, waar de components door talloze developers gebruikt worden',
        ],
        stack: ['StencilJS', 'TypeScript', 'JavaScript', 'Node', 'Jasmine', 'Jest', 'ESLint', 'Sass'],
      },
      {
        id: 'politie-pandora',
        caseId: 'pandora',
        company: 'Politie Nederland',
        via: 'Ordina',
        role: 'Lead front-end en UX design',
        location: 'Odijk',
        period: 'apr. 2020 - apr. 2021',
        summary:
          'Bewijsstukken organiseren en de rechten daarvan beheren. Aan het eind van het project droegen we de kennis over aan een Python-team van de politie zelf, dus ik heb alles gebouwd met in mijn achterhoofd dat ik er niet zou zijn om het te onderhouden.',
        highlights: [
          'In Swagger (OpenAPI 3) een REST API ontworpen en geoptimaliseerd qua snelheid voor de frontend, inclusief een partial response (een soort gesimplificeerde GraphQL)',
          'De buildtijd in de CI/CD-pipeline verkleind (18 min naar 6 min) door caching en andere optimalisaties',
          'Rolling updates ingesteld in de CI/CD-pipeline, zodat er nooit downtime is',
          'De API-responses uitgebreid getest, zodat het Python-team (onze opvolgers) kan zien of hun refactoring iets kapot heeft gemaakt',
        ],
        stack: ['Angular', 'TypeScript', 'RxJS', 'OpenAPI 3', 'Swagger', 'Node', 'Express', 'Python', 'Docker', 'Kubernetes', 'Cloud Foundry', 'Jasmine'],
      },
      {
        id: 'app4mation',
        caseId: 'ing',
        company: 'App4mation',
        role: 'Software engineer',
        location: 'Utrecht',
        period: 'jan. 2019 - apr. 2020',
        summary:
          'Als lead developer enterprise-applicaties in Angular gebouwd voor ING, Heraeus, Lidl (Schwarz IT) en Finanz Informatik, met direct klantcontact bij ING en Lidl. Het ING-werk kwam binnen via zusteronderneming Plat4mation, die de expertise voor die app niet in huis had.',
        highlights: [
          'Bij ING een grote technical debt ontdekt, dat doorgegeven aan Plat4mation en ING, en na akkoord van beide een groot deel van de app gerefactord',
          'Diezelfde app veel sneller gemaakt door REST API’s te gebruiken in plaats van pre-rendering, zodat alleen de benodigde data wordt geladen nadat de pagina geladen is',
          'Voor Heraeus een portaal ontworpen en gebouwd waar medewerkers en managers hun voorstellen beheren. Er lag alleen een globaal idee, dus het ontwerp kwam er ook bij',
          'Bij Lidl een junior developer begeleid binnen een korte deadline, en ontdekt dat ik kennisoverdracht leuk vind om te doen (zie Joels aanbeveling op LinkedIn)',
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
          'Veel aan kennisdeling gedaan via interne artikelen',
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
          'Mijn eigen bedrijf, naast studie en werk. Veel verschillende websites en applicaties, met een sterke focus op goed klantcontact. Toen ik fulltime freelance ging, werd het te veel werk om het ernaast aan te houden en ben ik ermee gestopt.',
        highlights: [
          'PageSpeed van 98 op denbraberwebdesign.nl',
          'Veel focus op accessibility en verschillende demografische groepen',
        ],
        stack: ['JavaScript', 'PHP', 'WordPress', 'Python', 'Django', 'Angular', 'jQuery', 'Sass'],
      },
    ],
  },

  testimonials: {
    heading: 'Wat anderen zeggen',
    intro: 'Ik kan alles van mezelf zeggen, maar wat anderen zeggen geeft mijns inziens een realistischer beeld. Hieronder een deel van de aanbevelingen op LinkedIn, letterlijk overgenomen.',
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
          'Op dit moment niet, ik zit bij DUO aan de statustoekenning voor het hoger en middelbaar beroepsonderwijs.\n\nEen gesprek is altijd welkom; dan weet ik wat er bij jou speelt en of dat later iets voor mij is.',
      },
      {
        id: 'werkvorm',
        question: 'Werk je remote of op locatie?',
        answer:
          'Het liefst remote. Bij DUO ga ik ongeveer eens per drie weken naar kantoor en dat bevalt erg goed: je kent de mensen, maar je bent er niet je hele week aan kwijt.\n\nVolledig op locatie doe ik liever niet, tenzij daar een goede reden voor is.',
      },
      {
        id: 'achtergrond',
        question: 'Wat is je achtergrond?',
        answer:
          'Vanaf mijn 14e was ik bezig met het maken van websites en paste ik in Python het spel Battlefield 2 aan. Helaas ben ik nooit een professioneel gamer geworden door een chronisch gebrek aan talent, maar de liefde voor programmeren is toen wel ontstaan. Mede hierdoor kon ik in 2011 mijn eigen bedrijf oprichten. Vanaf 2015 werkte ik in loondienst en sinds eind 2021 ben ik fulltime freelance.\n\nAngular gebruik ik sinds versie 2, aan de achterkant werk ik met Java en Spring Boot. Daarnaast ben ik afgestudeerd UX-researcher, dus focus ik me altijd op de eindgebruiker. Het meeste van mijn werk zit bij de overheid en in de financiële sector: DUO, de Politie, Knab en ING.',
      },
      {
        id: 'servicenow',
        question: 'Werk je nog met ServiceNow?',
        answer:
          'Niet meer. In 2019 heb ik er twee certificeringen voor gehaald (Certified System Administrator en Certified Application Developer) en aan een Service Portal gewerkt, maar sindsdien niet meer.\n\nHet is niet mijn eerste keus, maar waar ik echt van geniet is het leren van nieuwe technieken. Dus als er een goede reden is om er weer in te duiken, hoor ik die graag.',
      },
      {
        id: 'testen',
        question: 'Hoe kijk je naar testen?',
        answer:
          'Het goed (blackbox) testen vind ik vanzelfsprekend: een test kijkt naar wat de gebruiker of de aanroepende code merkt, niet naar hoe het van binnen werkt. Als je whitebox wilt testen ga ik graag in discussie. Testcode is voor mij een first-class citizen, die schrijf je met dezelfde standaarden als gewone code.\n\nSnapshot tests vind ik geen échte tests. Bij de Politie heb ik workshops gegeven over Mosh’s technique; dat team schrijft nu tests die overzichtelijker, specifieker en beter te onderhouden zijn.',
        link: { label: 'De techniek uitgeschreven', href: 'https://www.linkedin.com/pulse/how-write-clean-testing-code-using-moshs-technique-aart-den-braber-' },
      },
      {
        id: 'grenzen',
        question: 'Waar ga je over in discussie?',
        answer:
          'Niet over technieken, die leer ik juist graag. Wel als er geen ruimte is voor tests, of als code "toch tijdelijk" is en daarom niet onderhoudbaar hoeft te zijn.\n\nBij ING kwam ik een grote technical debt tegen. Die heb ik doorgegeven aan Plat4mation en ING in plaats van eromheen te werken, en na akkoord van beide heb ik een groot deel van de app gerefactord.',
      },
      {
        id: 'route',
        question: 'Werk je direct of via een bureau?',
        answer:
          'Allebei. Bij de overheid loopt veel via een broker en dat werkt prima; rechtstreeks met de opdrachtgever kan net zo goed.',
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
      'Benieuwd of ik bij jouw project of klant pas? Mijn e-mailadres staat in het cv, dus download die en stuur gerust een mail.',
    linkedIn: 'https://www.linkedin.com/in/aartdenbraber',
    linkedInLabel: 'LinkedIn',
  },
};

export default nl;
