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
      { label: 'Certification', value: 'ServiceNow Certified Application Developer' },
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
        period: 'Feb 2024 - present',
        current: true,
        summary:
          'Working on STATOE, the system that handles status assignment for Dutch students. First for higher education (HOST), then for vocational education (MBOST). HOST had to keep behaving almost exactly as it did, MBOST left room to actually improve things.',
        highlights: [
          'Cut project start up from more than ten manual steps down to a single configuration',
          'Set up a greenfield MBOST project serving both staff and business users',
          'Worked out the API designs and connected them to the Angular frontend',
          'Clarified backend processes, including database population and the links between modules',
          'Mentored a junior full stack developer and a junior tester',
        ],
        stack: ['Java', 'Spring Boot', 'Angular', 'TypeScript', 'Liquibase', 'Hibernate', 'ActiveMQ', 'Docker', 'Jenkins', 'GitLab'],
      },
      {
        id: 'duo-frontend',
        company: 'DUO',
        role: 'Frontend developer',
        location: 'The Hague',
        period: 'Mar 2023 - Feb 2024',
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
          'Wrote tests at 80 to 100 percent coverage across Angular, React and Node',
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
        period: 'Apr 2021 - Nov 2021',
        summary:
          'Making several internally built applications maintainable again, together with their users and original authors. Alongside that, helping another team with their testing strategy.',
        highlights: [
          'Built shared packages so a single update reaches several apps at once',
          'Set up automatic ESLint fixes, testing standards and CI/CD',
          'Brought the team to user sessions using the fishbowl format, so everyone heard the requirements first hand',
          'Ran testing workshops. The other team moved from snapshot tests to tests that check behaviour',
        ],
        stack: ['TypeScript', 'StencilJS', 'JavaScript', 'Node', 'Python', 'Cypress', 'Jest', 'Jasmine', 'Docker', 'Cloud Foundry'],
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
          'Enterprise applications in Angular for ING, Heraeus, Lidl (Schwartz IT) and Finanz Informatik. I dealt with several of those clients directly.',
        highlights: [
          'Mapped significant technical debt at ING and resolved it in consultation',
          'Refactored for speed, making the application noticeably faster',
          'Designed and wrote REST APIs for Heraeus, ING and Lidl',
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
    items: [
      {
        quote:
          'Aart is a perfectionist and socially involved. As a valued team player and Frontend developer, he has made an important contribution to the development of the online banking environment. Together with his UX and Test knowledge, I would like to recommend Aart wholeheartedly.',
        name: 'Bart Illy',
        role: 'Product owner',
      },
      {
        quote:
          'He was the key developer in defining a new API for an existing application. He was able to properly translate the wishes from key users through ux testing and then specifying those requirements into a detailed API, and providing a frontend UI for that very same API as well, with its own set of automated tests.',
        name: 'Thijs Knippers',
        role: 'Colleague',
      },
      {
        quote:
          'He really emphasises the importance of writing comprehensible and well-tested code, and is able to use state of the art techniques to accomplish this. He happily took on the additional role of front-end mentor, and was always happy to explain things to me and help me gain more hands-on experience through pair-programming sessions.',
        name: 'Ravi Selker',
        role: 'Colleague',
      },
      {
        quote:
          'Exceptional hard and soft skills of Aart were crucial for the fast development of several frontend applications based on Angular and React, backend using NodeJS, establishing CI/CD and deploying on AWS.',
        name: 'Anton Zhirkov',
        role: 'Colleague',
      },
      {
        quote:
          'Aart is een echte verbinder, hij weet wat hij wil en gaat hier voor 110% voor om er een succes van te maken. Hij is een super teamspeler en weet zijn collega’s dan ook te inspireren om samen naar een groter doel te streven.',
        name: 'Kevin Donkers',
        role: 'Manager',
      },
      {
        quote:
          'Aart has demonstrated great ability in dealing with a highly complex technical project in a challenging setting. He was part of a multi-country development team and he played an essential role in having a successful project with a happy customer.',
        name: 'Raphael Rodriguez',
        role: 'Managing director',
      },
    ],
    moreLabel: 'All recommendations on LinkedIn',
    moreHref: 'https://www.linkedin.com/in/aartdenbraber',
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
