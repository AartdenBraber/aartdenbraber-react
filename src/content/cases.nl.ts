import { CasesContent } from './types';

/**
 * Vrijwel letterlijk overgenomen uit Aarts eigen Nederlandse cv. De Engelse
 * versie komt uit zijn Engelstalige LinkedIn-projectteksten en is dus geen
 * vertaling hiervan; hij schrijft in beide talen zelf.
 */
const casesNl: CasesContent = {
  heading: 'Vier opdrachten uitgelicht',
  intro: 'Vier opdrachten wat uitgebreider dan in de tijdlijn eronder, met de opdracht, wat ik heb gedaan en het resultaat.',
  situationLabel: 'De opdracht',
  actionsLabel: 'Wat ik heb gedaan',
  resultLabel: 'Resultaat',
  items: [
    {
      id: 'pandora',
      client: 'Politie Nederland, via Ordina',
      period: 'apr. 2020 - apr. 2021',
      title: 'Het Pandora-project',
      situation:
        'Bij de Politie was mijn team (een High Performance Team van Ordina) verantwoordelijk voor het organiseren van bewijsstukken en het beheren van de rechten daarvan. We droegen aan het eind van het project deze kennis over aan een team van de politie.',
      actions: [
        'Samengewerkt met een team van zeer ervaren professionals',
        'De systeemeisen en gebruikerswensen onderzocht en deze geprioriteerd',
        'Een volledig nieuw Angular 9-project opgezet',
        'In Swagger (OpenAPI 3) een REST API ontworpen en geoptimaliseerd qua snelheid voor de front-end, inclusief een partial response (een soort gesimplificeerde GraphQL)',
        'De discussie met het team van de politie aangestuurd om het ontwerp van de api in de back-end te implementeren, en het politie-team begeleid met betrekking tot de actiepunten die daaruit naar voren kwamen',
        'De build-tijd in de CI/CD pipeline verkleind (18 min naar 6 min) door caching en andere optimalisaties door te voeren',
        'Rolling updates ingesteld in de CI/CD pipeline zodat er nooit downtime is',
      ],
      result:
        'Een API-design opgeleverd en gebouwd aan de hand van feedback uit het team en de consumenten, wat dient als een ijkpunt voor de backend. Deze API-responses worden namelijk uitgebreid getest, en aan de hand van die tests kan het Politie Python Team (onze opvolgers) zien of hun refactoring of extra functionaliteit geslaagd is en geen andere onderdelen van deze complexe applicatie kapot heeft gemaakt.\n\nDaarnaast heb ik een frontend in Angular opgeleverd die is gemaakt aan de hand van de wensen van de gebruikers van het systeem.',
    },
    {
      id: 'ing',
      client: 'ING, via App4mation',
      period: 'sep. 2019 - dec. 2019',
      title: 'Een snellere app, en een technical debt waar niemand naar had gevraagd',
      situation:
        'Plat4mation, de zusteronderneming van App4mation, had grote problemen met een app die voor ING was gemaakt. Managers van ING konden daarmee hun medewerkers beheren: bekijken, een promotie geven of hun budget aanpassen.\n\nING wilde meer functionaliteit en een snellere app, maar Plat4mation had de daarvoor benodigde expertise niet in huis.',
      actions: [
        'De app sneller laten werken in Angular',
        'Meer functionaliteit bouwen',
        'De klant op de hoogte houden (direct klantcontact)',
        'Op een duidelijke manier coderen',
        'Gaandeweg werd duidelijk dat er een grote technical debt zat die aangepakt moest worden. Dat heb ik doorgegeven aan Plat4mation en ING en van beide een akkoord gekregen. Daarna heb ik ook een groot deel van de app gerefactord (de code makkelijker leesbaar maken zonder iets aan de functionaliteit te veranderen)',
      ],
      result:
        'De app is volledig gerefactord en is nu veel sneller, deels doordat er REST API’s worden gebruikt in plaats van pre-rendering. Daardoor wordt alleen de benodigde data geladen nadat de pagina geladen is, wat veel sneller gaat.\n\nDe klant was erg tevreden met het resultaat, en daarmee heb ik ook twee erg blije aanbevelingen van Plat4mation gekregen.',
    },
    {
      id: 'knab',
      client: 'Knab',
      period: 'nov. 2021 - mrt. 2023',
      title: 'Een zachte landing voor overgezette klanten',
      situation:
        'Bij Knab was mijn team aan de slag om de overstap van het bancaire gedeelte van Aegon naar Knab op te zetten. De opdracht was om een portal te maken voor klanten die van Aegon naar Knab worden overgebracht. Hierbij is het belangrijk dat die klanten zich veilig voelen bij het nieuwe portal, dus dat was een groot focuspunt.',
      actions: [
        'Een applicatie gemaakt om klanten die van Aegon naar Knab overgaan (vooral beleggings- en pensioensrekeningen) te laten landen in een omgeving die zoveel mogelijk lijkt op hun vorige omgeving, maar qua UX een stuk beter is (o.a. Angular, PrimeNg, Inbenta)',
        'Via AWS Lambda (later geswitcht naar AWS ECS) een backend-for-frontend gemaakt om een veilige verbinding met de Knab API’s te kunnen maken (o.a. NodeTS, Express, DynamoDB, OAuth, jest)',
        'Veel tests geschreven (80-100% cov.) in React, Angular en Node om ervoor te zorgen dat de kwaliteit gewaarborgd is (o.a. jest, Jasmine, Spectator, Wallaby, Mosh’s technique). Daarnaast gewerkt met NewRelic om de applicatie in de gaten te kunnen houden',
        'In React een frontend geschreven om in te loggen via OAuth, maar ook om een wachtwoord te wijzigen of een OTP-code via SMS of email te ontvangen (o.a. React, jest, OAuth)',
        'We hebben een MVP opgeleverd, dus ook veel samenwerking gehad met verschillende teams om dat te bereiken',
      ],
      result:
        'Een goed onderhoudbare applicatie, die we hebben gemaakt in een multidisciplinair team met 3 frontenders en een backender.',
    },
    {
      id: 'webcomponents',
      client: 'Politie Nederland, via Ordina',
      period: 'jun. 2021 - nov. 2021',
      title: 'Een webcomponents-bibliotheek maken',
      situation:
        'Tijdens de opdracht hieronder (de EBO’s beheerbaar maken) zag ik dit project, en merkte ik dat ze een extra paar handen goed konden gebruiken.\n\nIn het team Blueprint Webcomponents richtten we ons op een betere gebruikerservaring voor alle politie-apps. Het idee is dat developers binnen de Politie de bibliotheek zo in hun eigen project kunnen trekken en dan kunnen werken met form controls (invoervelden, textarea, datepicker, buttons), header-ontwerpen en typografie. Toen ik erbij kwam was een groot deel van dat doel al bereikt, maar zaten er een paar fatale fouten in die ik heb helpen vinden en oplossen.',
      actions: [
        'Workshops gegeven hoe je goed test (Mosh’s technique) en de teamleden begeleid om dat consequent te doen',
        'De components bruikbaar gemaakt voor native HTML. Dat was een grote verandering, want ze leunden volledig op de shadow DOM',
        'Veel components gerefactord en tests gemaakt die alle use-cases dekken. Ik vind dat tests elke use-case horen te dekken, zodat de eindgebruiker geen last heeft van fouten die wij maken. Zeker in een project als dit, waar de components door talloze developers gebruikt worden',
      ],
      result:
        'Doordat de developers nu in plaats van snapshot tests échte tests schrijven, met een techniek die ik heb uitgelegd (Mosh’s technique), zijn de tests overzichtelijker, specifieker en beter te onderhouden. Doordat er nu goede tests zijn kan de volledige code met meer vertrouwen gerefactord en in de toekomst beter overgedragen worden.\n\nDaarnaast werken de form controls nu in native HTML, iets wat scheelt voor alle developers die niet met een JavaScript-framework werken.',
    },
  ],
};

export default casesNl;
