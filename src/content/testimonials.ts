import { Language } from './types';

export interface Testimonial {
  id: string;
  /** Letterlijk overgenomen van LinkedIn. Paragrafen gescheiden door een lege regel. */
  quote: string;
  name: string;
  role: string;
  /** De taal waarin de aanbeveling geschreven is, gebruikt voor de sortering. */
  language: Language;
  /** Datum van de aanbeveling op LinkedIn. */
  date: string;
}

/**
 * De aanbevelingen staan hier één keer, los van nl.ts en en.ts, omdat een
 * citaat niet vertaald wordt. Wie iets in het Engels schreef, blijft dat in het
 * Engels zeggen. Spelling en interpunctie zijn ongewijzigd overgenomen,
 * inclusief de enkele tikfout, want het zijn andermans woorden.
 */
export const testimonials: Testimonial[] = [
  {
    id: 'antoni-skubida',
    quote:
      'I had the pleasure of working with Aart while testing the back-end (Java) and front-end (Playwright) of the websites for DUO. Our collaboration was very pleasant, as Aart frequently shared his ideas and was always eager to help when needed. His knowledge of both the front-end and back-end proved highly valuable, and he excels at explaining the reasoning behind his work. He is also someone who is constructively critical of the code and enjoys contributing ideas that directly improve its consistency and overall quality. I believe our collaboration directly contributed to a higher standard of code. Overall, it was a productive and educational experience for me.',
    name: 'Antoni Skubida',
    role: 'Tester',
    language: 'en',
    date: '2025-12-01',
  },
  {
    id: 'edo-boorsma',
    quote:
      'Ik heb met veel plezier en waardering samengewerkt met Aart tijdens zijn opdracht binnen het domein statustoekenning. Hij viel voor mij direct op door zijn sterke front-end kennis, zijn vaardigheid in de backend, en zijn betrokken, doordachte manier van werken.\n\nWat ik erg waardeer in Aart is zijn positieve kritische houding. Hij stelde scherpe vragen, dacht actief mee en schroomde niet om een andere invalshoek voor te stellen. De discussies die ik met hem had, waren echt waardevol. Inhoudelijk sterk, met wederzijds respect en altijd gericht op het verbeteren van het eindresultaat. Soms had hij gewoon gelijk, soms kon hij na uitleg en overleg een punt loslaten. In beide gevallen droegen zijn inbreng en houding zichtbaar bij aan betere oplossingen.\n\nAart is een fijne collega met wie je goed kunt sparren, die zijn werk serieus neemt en die echt bijdraagt aan de kwaliteit van een project, zowel inhoudelijk als in de samenwerking. Een vakman én teamspeler.',
    name: 'Edo Boorsma',
    role: 'Business analyst en Scrum Master',
    language: 'nl',
    date: '2025-07-03',
  },
  {
    id: 'danny-renting',
    quote:
      'Aart is a very nice person te work with. He has a very high knowledge of Angular. If in the future I have an Angular problem which no one can solve, I will call Aart.',
    name: 'Danny Renting',
    role: 'Java software developer, Cavero',
    language: 'en',
    date: '2025-12-01',
  },
  {
    id: 'edmee-niggebrugge',
    quote:
      'Het gebeurt niet vaak dat je een frontender tegen komt die continu met zijn hoofd bij de klant is en het ux design precies namaakt of nog beter!\n\nAart is een frontender met wie ik als ux’er kan lezen en schrijven. Eindelijk iemand die niet alleen maar programmeert maar ook mee denkt met wat hij daarmee creëert, hoe dat er uit ziet en of de werking wel het beste is voor de klant. En daar ook nog goed over kan communiceren.',
    name: 'Edmee Niggebrugge',
    role: 'Lead account UX, Valsplat',
    language: 'nl',
    date: '2023-02-08',
  },
  {
    id: 'konstantin-novikov',
    quote:
      'When I joined the Knab decouple project team Aart was interviewing me for a frontend dev position alongside our Knab product owner. In a few months, together with one of my colleagues from EPAM, Aart managed to build a solid MVP application that just needed some extra features. Aart was always fun to work with and his pull request reviews were super beneficial for the project quality and also for me as I could get a few best practices out of it - like UI-Blackbox testing, BEM and a lot of CSS goodies.',
    name: 'Konstantin Novikov',
    role: 'Senior software engineer, EPAM Systems',
    language: 'en',
    date: '2023-01-30',
  },
  {
    id: 'sebastiaan-zeeff',
    quote:
      'I’m very happy to have worked with Aart in a team over the past year. His passion for optimizing the User Experience (UX) and the User Interface (UI) of applications taught me a lot about how to build applications for humans instead of applications that just meet the technical requirements. I also enjoyed our conversations and discussions about proper software development, in which we explored topics such as testing theory and writing good code.\n\nAs a person, I appreciate his focus on getting the job done. As Andy Hunt writes his book The Pragmatic Programmer, "great software today is often preferable to perfect software tomorrow." In our team, Aart plays an important role in helping us maintain a pragmatic mindset that actually focuses on delivering a solution.',
    name: 'Sebastiaan Zeeff',
    role: 'Principal expert, Sopra Steria Pythoneers',
    language: 'en',
    date: '2021-11-04',
  },
  {
    id: 'thijs-knippers',
    quote:
      'I’ve come to know Aart as the frontend developer for the Pandora project at the Police where he was the key developer in defining a new API for an existing application. He was able to properly translate the wishes from key users through ux testing and then specifying those requirements into a detailed API (fully documented in Swagger) and providing a frontend UI for that very same API as well, with it’s own set of automated tests. If that doesn’t tell you how multi-talented he is, I don’t know what will :).\n\nMoreover, Aart is always willing to learn new skills and at the same time teach team members from his experiences with a patience and smile you’ll only find in the best of teachers. He’s willing to discuss new ideas, give and receive feedback and readjust to new information, keeping the team at their best.',
    name: 'Thijs Knippers',
    role: 'Tester',
    language: 'en',
    date: '2021-01-25',
  },
  {
    id: 'ravi-selker',
    quote:
      'Aart is a great software developer. He really emphasises the importance of writing comprehensible and well-tested code, and is able to use state of the art techniques to accomplish this.\n\nI have had the pleasure to work with Aart in a project where he was the lead front-end developer, and I was a back-end developer that wanted to learn more about front-end development. He happily took on the additional role of front-end mentor, and was always happy to explain things to me and help me gain more hands-on experience through pair-programming sessions.',
    name: 'Ravi Selker',
    role: 'Software developer',
    language: 'en',
    date: '2021-01-23',
  },
  {
    id: 'michael-awad',
    quote:
      'When I’m working on a project, doesn’t matter if it is work-related or personal, I ask Aart to do a review. That’s because he is not only always willing to do so, but also because he sets very high standards.\n\nOne thing I noticed when asking Aart for a review is that he has great skill in making code readable. I always gain new insights and inspiration when he does a review.',
    name: 'Michael Awad',
    role: 'Senior manager software development',
    language: 'en',
    date: '2020-12-10',
  },
];

/**
 * Citaten in de taal van de site komen eerst, daarbinnen het meest recent
 * bovenaan. Er wordt niets weggefilterd: alles blijft zichtbaar.
 */
export const sortTestimonials = (language: Language): Testimonial[] =>
  [...testimonials].sort((a, b) => {
    if (a.language !== b.language) {
      return a.language === language ? -1 : 1;
    }

    return b.date.localeCompare(a.date);
  });
