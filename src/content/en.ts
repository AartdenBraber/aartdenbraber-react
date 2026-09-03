import casesEn from './cases.en';
import { SiteContent } from './types';

const en: SiteContent = {
  meta: {
    title: 'Aart den Braber · Fullstack developer',
    description:
      'Fullstack developer with a passion for learning new things and an eye for detail, especially regarding TypeScript and testing. Also a certified UX-researcher, so my focus is always on the end-user.',
  },

  nav: {
    label: 'Sections on this page',
    skipToContent: 'Skip to content',
    items: [
      { href: '#over-mij', label: 'About' },
      { href: '#wat-ik-doe', label: 'What I do' },
      { href: '#cases', label: 'Cases' },
      { href: '#werkervaring', label: 'Experience' },
      { href: '#aanbevelingen', label: 'Recommendations' },
      { href: '#vragen', label: 'Questions' },
      { href: '#contact', label: 'Contact' },
    ],
  },

  hero: {
    greetings: {
      morning: 'Good morning',
      afternoon: 'Good afternoon',
      evening: 'Good evening',
    },
    name: 'Aart den Braber',
    role: 'Fullstack developer',
    title: "I'm a fullstack developer with a passion for learning new things and a focus on detail.",
    subtitle:
      'This almost always results in code that is short and very easy to maintain, yet written in less time.',
    primaryCta: { label: 'See my experience', href: '#werkervaring' },
    secondaryCta: { label: 'Download CV', href: '#cv' },
    scrollLabel: 'Go to the next section',
  },

  about: {
    heading: 'Nice to meet you!',
    paragraphs: [
      "Good (blackbox) testing comes with that. If you want to test whitebox, I'm happy to have that discussion with you.",
      "Next to being a developer, I'm a certified UX-researcher, so my focus is always on the end-user. This may mean that I'm able to figure out the best solution together with a UX designer, but might also mean that you can skip hiring a dedicated one. However, my focus is really on creating applications and writing the code to achieve that.",
      "While happily typing code I find it really important that my colleagues and juniors understand what is going on; so documenting, typesafety and tests are the basics for me. We spend about 10x more time reading code than writing it (according to Robert C. Martin); so that is pretty efficient.",
    ],
    facts: [
      { label: 'Working since', value: '2011' },
      { label: 'Education', value: 'BSc Communication & Multimedia Design, The Hague University' },
      { label: 'Sectors', value: 'Dutch government and finance' },
      { label: 'Languages', value: 'Dutch, English, German' },
    ],
  },

  services: {
    heading: 'What I do',
    intro: 'What clients usually ask me for.',
    items: [
      {
        title: 'Frontend in Angular',
        body: 'Angular since version 2, with TypeScript, NgRx and RxJS. Components and packages you reuse across several apps, so updating is suddenly very easy.',
        link: { label: 'On typesafe routes in Angular', href: 'https://www.linkedin.com/pulse/4-steps-typesafe-routes-angular-aart-den-braber-' },
      },
      {
        title: 'Backend in Java and Node',
        body: 'Java with Spring and Spring Boot, or Node with NestJS and Express. Next to that, I really like designing the REST API itself, in Swagger (OpenAPI 3).',
      },
      {
        title: 'Good (blackbox) testing',
        body: "Unit, integration and e2e. I give workshops about it too (Mosh's technique), so a team starts writing real tests instead of snapshot tests; those are clearer, more specific and easier to maintain.",
        link: { label: 'The technique those workshops lean on', href: 'https://www.linkedin.com/pulse/how-write-clean-testing-code-using-moshs-technique-aart-den-braber-' },
      },
      {
        title: 'UX research and flow design',
        body: "I'm a certified UX-researcher, so I can figure out the best solution together with a UX designer and run user tests. On smaller projects you can skip hiring a dedicated one.",
      },
      {
        title: 'Making a codebase maintainable again',
        body: 'Detecting big technical debt and solving it in consultation. Next to that, implementing loads of things that make the life of a simple developer better: auto-fix ESLint, good testing standards, good CI/CD.',
        link: { label: 'Stripping unused CSS out of a component library', href: 'https://www.linkedin.com/pulse/clean-up-unused-css-from-external-component-libraries-den-braber-' },
      },
      {
        title: 'Mentoring juniors',
        body: 'Mentoring junior developers and testers, focusing on writing maintainable, testable code and understanding the architectural decisions around it.',
      },
    ],
  },

  cases: casesEn,

  experience: {
    heading: 'Work experience',
    intro: 'Most recent first. Engagements that ran through an employer are shown indented.',
    highlightsLabel: 'What I did',
    stackLabel: 'Stack',
    currentLabel: 'Current',
    viaLabel: 'via',
    caseLinkLabel: 'Read the long version',
    entries: [
      {
        id: 'duo-fullstack',
        company: 'DUO',
        role: 'Full stack engineer',
        location: 'The Hague',
        period: 'Jan 2024 - present',
        current: true,
        summary:
          "My second assignment at DUO: a system that handles status assignment (STATOE). First for higher education (HOST), then for vocational education (MBOST). Sadly for me, HOST had to keep working almost exactly as it did. MBOST does leave room for improvement, so there I worked a lot with the UX designer and dove into the users' wishes.",
        highlights: [
          'Made starting the project a lot simpler: you first had to get 10+ things right before it worked, now you set it up once and it runs',
          'Set up a greenfield MBOST project serving both staff and business users',
          'Kept HOST as a lift & shift, because it had to keep working the same. Every now and then I made a point and improved something',
          'Worked out the API designs and connected them to the Angular frontend',
          'Clarified and improved loads of backend processes, a.o. populating the database and the connections between modules',
          'Mentored a junior full stack developer and a junior tester',
        ],
        stack: ['Java', 'Spring Boot', 'Spring Security', 'JUnit', 'Angular', 'TypeScript', 'Liquibase', 'Hibernate', 'ActiveMQ', 'Cucumber', 'Playwright', 'Docker', 'Jenkins', 'GitLab'],
      },
      {
        id: 'duo-frontend',
        company: 'DUO',
        role: 'Frontend developer',
        location: 'The Hague',
        period: 'Mar 2023 - Jan 2024',
        summary:
          'DUO wanted to move to case based document handling. An MVP existed, but it was not far enough along to roll out. With the team I built a full application for staff to process documents and attach them to a case.',
        highlights: [
          'Updated the existing frontend and rebuilt the tests with Cypress component tests',
          'Improved a lot of existing structures and pointed out the weak spots in the backend',
          'Worked closely with the UX/UI designer and with stakeholders',
        ],
        stack: ['Angular', 'NgRx', 'TypeScript', 'Java', 'Spring Boot', 'Cypress', 'Jest', 'Docker', 'Jenkins'],
      },
      {
        id: 'knab',
        caseId: 'knab',
        company: 'Knab',
        role: 'Software engineer',
        location: 'Amsterdam',
        period: 'Nov 2021 - Mar 2023',
        summary:
          "Knab took over the banking part of Aegon. My team built the portal those customers (mostly investment and retirement accounts) landed in. It's important that they feel safe in a portal they've never seen before, so that was a big focus point.",
        highlights: [
          'Built an environment that looks as much as possible like their old Aegon environment, but is a lot better UX-wise',
          'Backend for frontend on AWS Lambda, later ECS, for a secure connection to the Knab APIs',
          'Wrote tests at 80 to 96 percent coverage across Angular, React and Node',
          'Built the React sign in flow with OAuth, password change and an OTP code by SMS or email',
        ],
        stack: ['Angular', 'React', 'NgRx', 'TypeScript', 'Node', 'Express', 'AWS Lambda', 'AWS ECS', 'DynamoDB', 'OAuth', 'Jest', 'Cypress'],
      },
      {
        id: 'ordina',
        company: 'Ordina',
        role: 'Lead frontend and UX design',
        location: 'Nieuwegein',
        period: 'Apr 2020 - Nov 2021',
        summary: 'Through Ordina I worked in a High Performance Team, a progressive way of secondment. Two assignments at the Dutch national police, detailed below.',
        highlights: [],
        stack: [],
      },
      {
        id: 'politie-ebo',
        company: 'Dutch national police',
        via: 'Ordina',
        role: 'Lead frontend and UX design',
        location: 'Odijk',
        period: 'Apr 2020 - Nov 2021',
        summary:
          "EBO's are internal applications made by very small teams that outgrew their original size. My team had to make them maintainable, so I talked a lot to the users and the original creators of the apps.",
        highlights: [
          'Built shared packages so a single update reaches several apps at once',
          'Set up automatic ESLint fixes, testing standards and CI/CD',
          'Brought the team to user sessions using the fishbowl format, so everyone heard the requirements first hand',
          'Built Camera in Beeld among others, which shows officers where cameras are located',
        ],
        stack: ['TypeScript', 'StencilJS', 'JavaScript', 'Node', 'Python', 'Cypress', 'Jest', 'Jasmine', 'Docker', 'Cloud Foundry'],
      },
      {
        id: 'politie-webcomponents',
        caseId: 'webcomponents',
        company: 'Dutch national police',
        via: 'Ordina',
        role: 'Frontend developer',
        location: 'Odijk',
        period: 'Jun 2021 - Nov 2021',
        summary:
          'While working on the EBO assignment I noticed the Blueprint Webcomponents team, which was building a component library for all Dutch police apps, and found they could really use an extra set of hands. A big part was already there, but there were some fatal flaws.',
        highlights: [
          'Made the webcomponents work for native HTML (without a framework). That was a big change, as they were solely relying on the shadow DOM',
          "Gave workshops about how to test properly (Mosh's technique). The developers now write real tests instead of snapshot tests, which are clearer, more specific and easier to maintain",
          "Refactored a lot and wrote huge amounts of tests covering every use case, so the end user isn't bothered by mistakes we make. Especially in a project like this, where the components are used by numerous developers",
        ],
        stack: ['StencilJS', 'TypeScript', 'JavaScript', 'Node', 'Jasmine', 'Jest', 'ESLint', 'Sass'],
      },
      {
        id: 'politie-pandora',
        caseId: 'pandora',
        company: 'Dutch national police',
        via: 'Ordina',
        role: 'Lead frontend and UX design',
        location: 'Odijk',
        period: 'Apr 2020 - Apr 2021',
        summary:
          "Organising evidence and managing the access rights. At the end of the project we transferred everything to a Python team inside the police, so I built it while keeping in mind that I wouldn't be there to maintain it.",
        highlights: [
          'Designed a REST API in Swagger (OpenAPI 3) and optimised it for a snappy frontend, including a partial response (a kind of simplified GraphQL)',
          'Reduced the build time in the CI/CD pipeline from 18 minutes to just 6, by applying caching and other optimisations',
          'Set up rolling updates in the pipeline, so there is never any downtime',
          'Tested the API responses thoroughly, so the Python team (our successors) can see whether their refactoring broke anything',
        ],
        stack: ['Angular', 'TypeScript', 'RxJS', 'OpenAPI 3', 'Swagger', 'Node', 'Express', 'Python', 'Docker', 'Kubernetes', 'Cloud Foundry', 'Jasmine'],
      },
      {
        id: 'app4mation',
        caseId: 'ing',
        company: 'App4mation',
        role: 'Software engineer',
        location: 'Utrecht',
        period: 'Jan 2019 - Apr 2020',
        summary:
          "Lead developer on enterprise applications in Angular for ING, Heraeus, Lidl (Schwarz IT) and Finanz Informatik, with direct client contact at ING and Lidl. The ING work came in through Plat4mation, App4mation's sister company, which didn't have the expertise that app needed.",
        highlights: [
          'Found a big technical debt at ING, relayed it to Plat4mation and ING, and after an OK from both refactored a big part of the app',
          'Made that same app much faster by using REST APIs instead of pre-rendering, so only the required data is loaded after the page has loaded',
          'Designed and built a portal for Heraeus where staff and managers handle their proposals. Only a rough idea existed, so the design came with it',
          "Mentored a junior developer at Lidl inside a tight deadline, and realised I really like helping juniors and imparting knowledge (see Joel's recommendation on LinkedIn)",
          'Ran UX research and produced designs for Finanz Informatik, Heraeus and ING',
        ],
        stack: ['Angular', 'TypeScript', 'JavaScript', 'HTML', 'Sass', 'Git', 'GitLab'],
      },
      {
        id: 'pangaea',
        company: 'PANGAEA Digital Agency',
        role: 'Frontend developer',
        location: 'The Hague',
        period: 'Nov 2017 - Jan 2019',
        summary:
          'Enterprise websites for hospitality and retail, on a CMS PANGAEA had built in house. Clients included DEEN, Hotel van Oranje, Hotel Arena and GreenSand.',
        highlights: [
          'Brought structure to an existing codebase with Sass, BEM and React',
          'Set up CI/CD in GitHub and GitLab and trialled different collaboration models',
          'Did a lot of knowledge sharing via internal articles',
        ],
        stack: ['JavaScript', 'React', 'jQuery', 'Sass', 'Razor', 'XML', 'GitLab', 'GitHub'],
      },
      {
        id: 'abf',
        company: 'ABF Research',
        role: 'Frontend developer',
        location: 'Delft',
        period: 'Feb 2015 - Jul 2016',
        summary: 'Websites for Dutch municipalities, among them Rotterdam, Delft and Hardinxveld-Giessendam.',
        highlights: [
          'Turned designs into HTML, CSS and JavaScript',
          'Put quick sketches in front of colleagues as short user tests',
        ],
        stack: ['JavaScript', 'jQuery', 'HTML', 'Sass', 'Razor', 'JSON', 'XML'],
      },
      {
        id: 'den-braber-webdesign',
        company: 'Den Braber Webdesign',
        role: 'Owner and developer',
        location: 'Veenendaal',
        period: 'Oct 2011 - Nov 2021',
        summary:
          'My own company, alongside study and work. A wide variety of websites and applications, with a strong focus on good client contact. When I went freelance full time, it became too much work to keep it running alongside, so I stopped.',
        highlights: [
          'PageSpeed score of 98 on denbraberwebdesign.nl',
          'Loads of focus on accessibility and different demographic groups',
        ],
        stack: ['JavaScript', 'PHP', 'WordPress', 'Python', 'Django', 'Angular', 'jQuery', 'Sass'],
      },
    ],
  },

  testimonials: {
    heading: 'What others say',
    intro: 'I can say anything I like, but maybe my previous colleagues and managers can do a better job of saying what kind of person and developer I am. Some of their recommendations from LinkedIn, word for word.',
    moreLabel: 'All recommendations on LinkedIn',
    moreHref: 'https://www.linkedin.com/in/aartdenbraber',
  },

  faq: {
    heading: 'Frequently asked questions',
    intro: 'The things you probably want to know before you email.',
    items: [
      {
        id: 'beschikbaarheid',
        question: 'Are you available?',
        answer:
          "Not at the moment, I'm at DUO working on status assignment for higher and vocational education.\n\nA conversation is always welcome; then I know what's going on at your end and whether that's something for me later on.",
      },
      {
        id: 'werkvorm',
        question: 'Do you work remotely or on site?',
        answer:
          "Preferably remote. At DUO I go to the office about once every three weeks and that works really well: you know the people, but you don't lose your whole week to it.\n\nFully on site isn't my preference, unless there's a good reason for it.",
      },
      {
        id: 'achtergrond',
        question: 'What is your background?',
        answer:
          "From the age of 14 I was building websites and modding the game Battlefield 2 in Python. Sadly I never became a professional gamer, due to a chronic lack of talent, but that's where the love for programming started. Partly because of that I could start my own company in 2011. From 2015 I was employed and since the end of 2021 I'm a full-time freelancer.\n\nI've used Angular since version 2, and on the backend I work with Java and Spring Boot. Next to that, I'm a certified UX-researcher, so my focus is always on the end-user. Most of my work is in Dutch government and finance: DUO, the Dutch police, Knab and ING.",
      },
      {
        id: 'servicenow',
        question: 'Do you still work with ServiceNow?',
        answer:
          "Not anymore. In 2019 I got two certifications for it (Certified System Administrator and Certified Application Developer) and worked on a Service Portal, but not since.\n\nIt's not my first choice, but what I really enjoy is learning new techniques. So if there's a good reason to dive back in, I'd like to hear it.",
      },
      {
        id: 'testen',
        question: 'How do you think about testing?',
        answer:
          "Good (blackbox) testing comes naturally to me: a test checks what the user or the calling code notices, not how it works on the inside. If you want to test whitebox, I'm happy to have that discussion with you. Testing code is a first-class citizen to me, written with the same standards as regular code.\n\nSnapshot tests aren't real tests in my book. At the Dutch police I gave workshops about Mosh's technique; that team now writes tests that are clearer, more specific and easier to maintain.",
        link: { label: 'The technique written out', href: 'https://www.linkedin.com/pulse/how-write-clean-testing-code-using-moshs-technique-aart-den-braber-' },
      },
      {
        id: 'grenzen',
        question: 'What do you push back on?',
        answer:
          "Not on techniques, I love learning those. I do push back when there's no room for tests, or when code is 'temporary anyway' and therefore doesn't need to be maintainable.\n\nAt ING I ran into a big technical debt. I relayed it to Plat4mation and ING instead of working around it, and after an OK from both I refactored a big part of the app.",
      },
      {
        id: 'route',
        question: 'Do you work directly or through an agency?',
        answer:
          'Either. In Dutch government a lot runs through a broker and that works fine; straight to the client works just as well.',
      },
      {
        id: 'tarief',
        question: 'What does it cost?',
        answer:
          'On request. It depends on the length of the assignment, the travel time and whether it runs through an agency.',
      },
    ],
  },

  cv: {
    heading: 'The full CV',
    body:
      'The summary is above. The full CV also lists the courses I followed, my education and the remaining recommendations.',
    downloadLabel: 'Download CV as PDF',
    fileName: 'CV Aart den Braber',
  },

  contact: {
    heading: 'Contact',
    body:
      "Curious if I'm the right fit for your project or client? My email address is in the CV, so download it and drop me a line.",
    linkedIn: 'https://www.linkedin.com/in/aartdenbraber',
    linkedInLabel: 'LinkedIn',
  },
};

export default en;
