import { SiteContent } from './types';

const en: SiteContent = {
  meta: {
    title: 'Aart den Braber · Full stack engineer, Angular and Java',
    description:
      'Freelance full stack engineer. Angular and TypeScript on the front, Java and Spring on the back. Works on complex systems in Dutch government and finance.',
  },

  nav: {
    skipToContent: 'Skip to content',
    items: [
      { href: '#over-mij', label: 'About' },
      { href: '#wat-ik-doe', label: 'What I do' },
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
    role: 'Full stack engineer',
    title: 'I write code the next developer understands without being talked through it.',
    subtitle:
      'Full stack engineer since 2011. Angular and TypeScript on the front, Java and Spring on the back. Mostly in Dutch government and finance.',
    primaryCta: { label: 'See my experience', href: '#werkervaring' },
    secondaryCta: { label: 'Download CV', href: '#cv' },
    scrollLabel: 'Go to the next section',
  },

  about: {
    heading: 'What you get',
    paragraphs: [
      'I am Aart den Braber, a freelance full stack engineer based in the Netherlands. Most of my work happens inside existing systems: applications that have been running for years, that a lot depends on, and whose last serious contributor has usually left.',
      'I started out in frontend and graduated as a UX researcher. That means I can turn a user question into an API design myself, without three people in between. In practice it saves a lot of back and forth.',
      'What I am strict about: tests that check actual behaviour, code you can read without a walkthrough, and documentation that is accurate. Not because it looks tidy, but because a system cannot change hands without it.',
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
    intro: 'The work clients usually come to me for.',
    items: [
      {
        title: 'Frontend in Angular',
        body: 'Angular and TypeScript, from state management with NgRx to components shared across several applications. I have used Angular since version 2.',
      },
      {
        title: 'Backend in Java and Node',
        body: 'Java with Spring Boot, or Node with NestJS and Express. Including the API design itself, in OpenAPI, before a line of implementation exists.',
      },
      {
        title: 'Testing that means something',
        body: 'Unit, integration and end to end. I run workshops on it too, because a lot of teams write tests that only confirm whatever the code happens to do.',
      },
      {
        title: 'UX research and flow design',
        body: 'I graduated as a UX researcher. I run user tests and design flows. On smaller projects that can replace a separate designer.',
      },
      {
        title: 'Making a codebase maintainable again',
        body: 'Mapping technical debt, simplifying start up and build processes, and taking the team along so it does not slide back.',
      },
      {
        title: 'Mentoring juniors',
        body: 'Coaching junior developers and testers, with the emphasis on code and tests that still read well a year later.',
      },
    ],
  },

  experience: {
    heading: 'Work experience',
    intro: 'Most recent first. Engagements that ran through an employer are shown indented.',
    highlightsLabel: 'What it produced',
    stackLabel: 'Stack',
    currentLabel: 'Current',
    viaLabel: 'via',
    entries: [
      {
        id: 'duo-fullstack',
        company: 'DUO',
        role: 'Full stack engineer',
        location: 'The Hague',
        period: 'Jan 2024 - present',
        current: true,
        summary:
          'Working on STATOE, the system that handles status assignment for Dutch students. First for higher education (HOST), then for vocational education (MBOST). HOST had to keep behaving almost exactly as it did, MBOST left room to actually improve things.',
        highlights: [
          'Cut project start up from more than ten manual steps down to a single configuration',
          'Set up a greenfield MBOST project serving both staff and business users',
          'Treated HOST as a lift and shift, because the business could not afford disruption. Improvements only where they left behaviour intact',
          'Worked out the API designs and connected them to the Angular frontend',
          'Clarified backend processes, including database population and the links between modules',
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
          'Named the weak spots in the backend and improved the structure around them',
          'Worked closely with the UX/UI designer and with stakeholders',
        ],
        stack: ['Angular', 'NgRx', 'TypeScript', 'Java', 'Spring Boot', 'Cypress', 'Jest', 'Docker', 'Jenkins'],
      },
      {
        id: 'knab',
        company: 'Knab',
        role: 'Software engineer',
        location: 'Amsterdam',
        period: 'Nov 2021 - Mar 2023',
        summary:
          'Knab took over the banking arm of Aegon. My team built the portal those customers landed in. Trust was the real design problem: people had to recognise their investment and pension accounts in an environment they had never seen before.',
        highlights: [
          'Built a portal that keeps the old Aegon environment recognisable while working better',
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
        summary: 'Through Ordina I worked in a High Performance Team. Two engagements at the Dutch national police, detailed below.',
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
          'EBOs are applications built by very small teams that outgrew their original size. My job was to put them on a professional footing, working with their users and original authors.',
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
        company: 'Dutch national police',
        via: 'Ordina',
        role: 'Frontend developer',
        location: 'Odijk',
        period: 'Jun 2021 - Nov 2021',
        summary:
          'While working on the EBO engagement I ran into the Blueprint Webcomponents team, building a component library for every Dutch police app. Much of it existed already, but flaws in it made the library unusable outside a framework.',
        highlights: [
          'Made the components work in plain HTML. They relied entirely on the shadow DOM, which left developers without a JavaScript framework unable to use them',
          'Ran testing workshops. The team moved from snapshot tests to tests that check behaviour, making them more specific and easier to maintain',
          'Refactored heavily and wrote StencilJS tests covering every use case. In a library dozens of developers depend on, any mistake resurfaces somewhere else',
        ],
        stack: ['StencilJS', 'TypeScript', 'JavaScript', 'Node', 'Jasmine', 'Jest', 'ESLint', 'Sass'],
      },
      {
        id: 'politie-pandora',
        company: 'Dutch national police',
        via: 'Ordina',
        role: 'Lead frontend and UX design',
        location: 'Odijk',
        period: 'Apr 2020 - Apr 2021',
        summary:
          'Organising evidence and managing access rights to it. At the end we handed the work over to a Python team inside the police, so being handover ready was the assignment rather than an afterthought.',
        highlights: [
          'Designed a REST API in OpenAPI 3, including partial response, a simplified take on what GraphQL does',
          'Brought the CI/CD build down from 18 minutes to 6 with caching and other optimisations',
          'Set up rolling updates, so a release no longer causes downtime',
          'Tested the API responses thoroughly, so the successor team could tell whether their refactoring broke anything',
        ],
        stack: ['Angular', 'TypeScript', 'RxJS', 'OpenAPI 3', 'Swagger', 'Node', 'Express', 'Python', 'Docker', 'Kubernetes', 'Cloud Foundry', 'Jasmine'],
      },
      {
        id: 'app4mation',
        company: 'App4mation',
        role: 'Software engineer',
        location: 'Utrecht',
        period: 'Jan 2019 - Apr 2020',
        summary:
          'Lead developer on enterprise applications in Angular for ING, Heraeus, Lidl (Schwarz IT) and Finanz Informatik. For several of those clients I ran the intake and the client contact myself. The ING work came in through Plat4mation, App4mation’s sister company, which did not have the expertise that app needed in house.',
        highlights: [
          'Found substantial technical debt at ING, raised it with both the agency and the client, and refactored a large part of the app once they agreed',
          'Made that same app faster by replacing pre-rendering with REST APIs, so only the data actually needed loads once the page is up',
          'Designed and built a portal for Heraeus where staff and managers handle their proposals. Only a rough idea existed, so the design came with it',
          'Mentored a junior developer at Lidl inside a tight deadline',
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
          'Wrote internal articles to share knowledge',
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
          'My own studio, alongside study and work. Websites and applications for smaller clients, with a lot of attention to accessibility and speed. I wound it down when I went freelance full time.',
        highlights: [
          'PageSpeed score of 98 on denbraberwebdesign.nl',
          'Accessibility as a starting point, including for visitors outside the default audience',
        ],
        stack: ['JavaScript', 'PHP', 'WordPress', 'Python', 'Django', 'Angular', 'jQuery', 'Sass'],
      },
    ],
  },

  testimonials: {
    heading: 'What others say',
    intro: 'Recommendations from clients and colleagues, taken from LinkedIn.',
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
          'Not at the moment. I am at DUO, working on status assignment for higher and vocational education.\n\nA conversation is always worth having. Then I know what is going on at your end and whether I fit it a while from now.',
      },
      {
        id: 'werkvorm',
        question: 'Do you work remotely or on site?',
        answer:
          'Remote by preference. At DUO I go into the office roughly every three weeks, which works well: enough to know the people, little enough that it does not eat the week.\n\nFull time on site is not my preference, unless there is a reason for it I can follow.',
      },
      {
        id: 'achtergrond',
        question: 'What is your background?',
        answer:
          'I have been building websites and applications since 2011, employed from 2015 and freelance after that. I have used Angular since version 2, and Java with Spring Boot on the back.\n\nI also graduated as a UX researcher. That lets me carry a user question through to an API design myself rather than handing it off. Most of my work sits in Dutch government and finance: DUO, the national police, Knab and ING.',
      },
      {
        id: 'servicenow',
        question: 'Do you still work with ServiceNow?',
        answer:
          'No. I earned two certifications for it in 2019 and worked on Service Portals, but not since. I would not propose it myself.\n\nI would not call it a no either. I enjoy work across IT, so if there is a good reason to go back in, I want to hear it. Read it as not my first choice.',
      },
      {
        id: 'testen',
        question: 'How do you think about testing?',
        answer:
          'Blackbox as the starting point. A test checks what a user or a calling party notices, not how it works inside. If you want whitebox tests, I am happy to have that argument with you.\n\nSnapshot tests do not count for me. They only confirm whatever the code already happens to do. I ran workshops on this at the national police, and that team moved to tests that check behaviour.',
      },
      {
        id: 'grenzen',
        question: 'What will you push back on?',
        answer:
          'I have no list of technologies I refuse. What I will raise: when there is no room to write tests, or when the code supposedly does not need to be handover ready because it is temporary anyway.\n\nAt ING I found substantial technical debt. I raised it with both the agency and the client instead of working around it, and once they agreed, a large part of the app was refactored. That is how I prefer to do it.',
      },
      {
        id: 'route',
        question: 'Do you work directly or through an agency?',
        answer:
          'Either, no preference. In Dutch government work a lot runs through a broker and that is fine by me. Straight to the client works just as well.',
      },
      {
        id: 'tarief',
        question: 'What does it cost?',
        answer:
          'On request. It depends on the length of the engagement, the travel involved and whether it runs through an agency.',
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
      'Looking for someone for a longer engagement, or want to talk through a system that has stalled? An email is fine.',
    emailLabel: 'Send an email',
    emailUser: 'cv',
    emailDomain: 'prosumfrontend.nl',
    linkedIn: 'https://www.linkedin.com/in/aartdenbraber',
    linkedInLabel: 'LinkedIn',
  },
};

export default en;
