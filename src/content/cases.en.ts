import { CasesContent } from './types';

/**
 * Vrijwel letterlijk overgenomen uit Aarts eigen Engelstalige
 * LinkedIn-projectteksten. Niet vertaald uit het Nederlands: hij schrijft in
 * beide talen zelf, en dan hoort de site dat ook te doen.
 */
const casesEn: CasesContent = {
  heading: 'Four assignments up close',
  intro: 'Four assignments in a bit more detail than the timeline below, with the assignment, what I did and the result.',
  situationLabel: 'The assignment',
  actionsLabel: 'What I did',
  resultLabel: 'The result',
  items: [
    {
      id: 'pandora',
      client: 'Dutch Police, via Ordina',
      period: 'Apr 2020 - Apr 2021',
      title: 'The Pandora project',
      situation:
        'At the Dutch Police, my team was responsible for creating an app to organize evidence and managing the access-rights. At the end of this project, we transferred that knowledge to an internal Dutch Police-team.',
      actions: [
        'Worked together with a team of highly skilled professionals',
        'Retrieved and prioritized the system requirements and user requirements',
        'Set up a completely new Angular 9-project (later converted to 11)',
        'In Swagger (OpenAPI 3), I designed a REST API and optimized it for a snappy frontend experience. This also included a partial response (a kind of simplified GraphQL)',
        'Directed the conversation with the internal Dutch Police-team to implement the API-design in the backend, and helped them create actions from that conversation',
        'Reduced the build-time in the CI/CD pipeline from 18 minutes to just 6, by applying caching and other optimizations',
        'Set up rolling updates in the pipeline so there would not be any downtime',
      ],
      result:
        "An API-design that's been built from the system and user requirements, which serves as a single source of truth for the back- and frontend. These API-responses are tested thoroughly, which greatly improves the maintainability for this very complex and big application.\n\nNext to that, I delivered an Angular app that was made according to the system requirements and usertests. It was created with the greatest care and while keeping in mind that I wouldn't be there to maintain it, which meant very typesafe and loads of quality tests to ensure that the functionality wouldn't regress (break).",
    },
    {
      id: 'ing',
      client: 'ING, via App4mation',
      period: 'Sep 2019 - Dec 2019',
      title: 'A faster app, and a technical debt nobody had asked about',
      situation:
        "Plat4mation, App4mation's sister-company, had great trouble with an app that had been created for ING. With this app, ING's managers could manage their employees. For example, they could view them and give a promotion or change their budgets.\n\nHowever, ING required more functionality and a faster app, but Plat4mation didn't have the expertise required.",
      actions: [
        'Making the app work faster in Angular',
        'Build more functionality',
        'Keep the client posted (direct customer contact)',
        'Code in a clear way',
        'Sadly, during the project, it became clear that there was a great technical debt which had to be addressed. I relayed this to Plat4mation and ING and got an OK from both. After this, I also refactored a big part of the app (making the code easier to read without changing any of the functionality)',
      ],
      result:
        "The app has been fully refactored and is now much faster, partly due to using REST API's instead of pre-rendering. Because of this, only the required data is loaded after the page has been loaded, much quicker.\n\nThe customer was very satisfied with the result and with that fact, I also received two very happy recommendations from Plat4mation.",
    },
    {
      id: 'knab',
      client: 'Knab',
      period: 'Nov 2021 - Mar 2023',
      title: 'Making a soft landing place for transferred customers',
      situation:
        'At Knab my team and I have been working to make the transfer of Aegon customers to Knab as smooth as possible. These customers were being transferred because Aegon wanted Knab (where Aegon was a main shareholder) to take over investments and retirement accounts.',
      actions: [
        'Create an Angular application to make for a smooth landing of the customers that have either investments or retirement accounts (using a.o. Angular, PrimeNg, Inbenta)',
        "Using AWS Lambda (later we switched to AWS ECS) we created a backend-for-frontend to work safely with the very sensitive data we retrieved from the Knab API's (using a.o. NodeTS, Express, DynamoDB, OAuth, jest)",
        "Wrote loads of tests (80-100% cov.) in React, Angular and Node to make sure the quality is assured (using a.o. jest, Jasmine, Spectator, Wallaby, Mosh's technique). Next to that we implemented NewRelic to keep an automated eye on the apps",
        'Used React to create a frontend which is used to login using OAuth, but also allows for changing a password, creating an account, sending/receiving an OTP-code using SMS or email and such',
        'Worked towards an MVP, so we had loads of collaboration with different teams to achieve all kinds of integrations',
      ],
      result:
        'A very maintainable application which we created in a multi-disciplinary team with 3 frontenders and a backender.',
    },
    {
      id: 'webcomponents',
      client: 'Dutch Police, via Ordina',
      period: 'Jun 2021 - Nov 2021',
      title: 'Creating a webcomponents library',
      situation:
        "When working on the assignment below (making EBO's maintainable), I noticed the following project and found that they could really use the extra set of hands.\n\nIn the 'Blueprint Webcomponents' team, we were focussing on a better user experience for all Dutch Police-apps. The idea is that developers inside the Dutch Police can simply pull the library into their own project and then work with form controls (input fields, textarea, datapicker, buttons), header designs, typography. When I entered the project, a big part of this goal had already been reached, but there were some fatal flaws which I helped uncover and solve.",
      actions: [
        "Give workshops about how to test properly (using Mosh's technique) and helped the team members do this consistently",
        'Made the webcomponents work for native HTML (without a framework). This was a big change as they were solely relying on the shadow DOM',
        "Refactored a lot, and written huge amounts of tests for StencilJS. I'm of the opinion that tests should cover every use-case, so the end-user isn't bothered by mistakes we make. Especially in a project like this, where components are used by numerous developers",
      ],
      result:
        "Because the developers are writing real tests now (instead of snapshot tests), with a technique I introduced to them (Mosh's technique), the tests are clearer, more specific and easier/better maintainable.\n\nNext to that, the form controls now work in native HTML; something that helps loads of developers who don't work with a JavaScript-framework.",
    },
  ],
};

export default casesEn;
