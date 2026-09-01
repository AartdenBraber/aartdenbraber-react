import { CasesContent } from './types';

const casesEn: CasesContent = {
  heading: 'Four engagements up close',
  intro: 'The rest of my work is in the timeline further down. These are four where the trade-off was more interesting than the outcome.',
  situationLabel: 'The situation',
  actionsLabel: 'What I did',
  resultLabel: 'What it produced',
  items: [
    {
      id: 'pandora',
      client: 'Dutch national police, via Ordina',
      period: 'Apr 2020 - Apr 2021',
      title: 'Building an API another team had to take over',
      situation:
        'My team was responsible for an application that organises evidence and manages the access rights to it. At the end of the project we handed everything over to an internal Python team inside the police.\n\nWe knew that from the start. Being handover ready was therefore not a nice extra but the assignment itself.',
      actions: [
        'Gathered and prioritised the system requirements and the user requirements',
        'Set up a new Angular 9 project, later moved to 11',
        'Designed a REST API in Swagger (OpenAPI 3) and optimised it for a responsive frontend, including partial response: a simplified take on what GraphQL does',
        'Led the conversation with the internal police team so they could implement that design in the backend, and helped them turn it into concrete actions',
        'Brought the CI/CD build down from 18 minutes to 6 with caching and other optimisations',
        'Set up rolling updates, so a release no longer causes downtime',
      ],
      result:
        'An API design built from the system and user requirements, serving as a single source of truth for both the frontend and the backend. The responses are tested thoroughly, so the successor team can tell whether their refactoring breaks something in an application that is large and complicated.\n\nThe Angular app was written on the assumption that I would not be there to maintain it: type safe, and with enough tests to notice when functionality breaks.',
    },
    {
      id: 'ing',
      client: 'ING, via App4mation',
      period: 'Sep 2019 - Dec 2019',
      title: 'Reporting technical debt instead of working around it',
      situation:
        'Plat4mation, App4mation’s sister company, was stuck with an app they had built for ING. Managers used it to handle their staff: viewing them, granting promotions, adjusting budgets. ING wanted more functionality and a faster app, but the expertise for that was not there.',
      actions: [
        'Made the app faster in Angular and built the functionality that was asked for',
        'Kept the client informed directly about progress',
        'Along the way substantial technical debt surfaced. I raised it with Plat4mation and with ING, rather than building around it',
        'Once both sides agreed, refactored a large part of the app: same functionality, more readable code',
      ],
      result:
        'The app was fully refactored and runs noticeably faster, in part because pre-rendering was replaced by REST APIs. Only the data that is actually needed loads, once the page is already up.\n\nThe client was satisfied with the result. Two of my recommendations from Plat4mation come out of this engagement.',
    },
    {
      id: 'knab',
      client: 'Knab',
      period: 'Nov 2021 - Mar 2023',
      title: 'A soft landing for customers who never asked for it',
      situation:
        'Aegon wanted Knab, where Aegon was a major shareholder, to take over its investment and pension accounts. Those customers were moved to a bank they had not chosen themselves.\n\nThat made the main design problem human rather than technical: people had to recognise their own account in an environment they had never seen.',
      actions: [
        'Built an Angular application for those customers to land in, using PrimeNG and Inbenta among others',
        'Built a backend for frontend on AWS Lambda, later ECS, to work safely with the sensitive data coming out of the Knab APIs',
        'Built the sign in flow in React: OAuth, password change, account creation, and an OTP code by SMS or email',
        'Wrote tests at 80 to 96 percent coverage across React, Angular and Node, and set up NewRelic to keep an eye on the apps',
      ],
      result:
        'A maintainable application, built in a multidisciplinary team of three frontend developers and one backend developer. Getting all the integrations in place took a lot of collaboration with other teams.',
    },
    {
      id: 'webcomponents',
      client: 'Dutch national police, via Ordina',
      period: 'Jun 2021 - Nov 2021',
      title: 'A component library that only worked inside a framework',
      situation:
        'While on another engagement I ran into the Blueprint Webcomponents team. They were building a library that lets any developer inside the police pull form controls, header styles and typography from a single source.\n\nMuch of it existed already, but it carried flaws that only surface once you try to use the components outside a JavaScript framework. I saw they could use an extra pair of hands and joined in.',
      actions: [
        'Made the components work in plain HTML. They relied entirely on the shadow DOM, which left developers without a framework unable to use them',
        'Ran workshops on testing using Mosh’s technique, and coached team members to apply it consistently',
        'Refactored heavily and wrote large amounts of StencilJS tests, covering every use case',
      ],
      result:
        'The form controls now work in plain HTML too. That matters for every developer inside the police who does not work with a JavaScript framework.\n\nBecause the team now writes real tests instead of snapshot tests, those tests are more specific and easier to maintain. In a library dozens of developers depend on, any mistake resurfaces somewhere else.',
    },
  ],
};

export default casesEn;
