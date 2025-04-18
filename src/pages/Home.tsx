import '../styles/cv.css';
import { useTranslation } from 'react-i18next';

const Home = () => {
  const { t } = useTranslation();

  return (
    <div className="cv-page max-w-4xl mx-auto bg-white p-6 md:p-12 rounded-xl shadow-xl fade-in my-8">
      <header className="text-center mb-16 border-b border-slate-200 pb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-indigo-700 mb-3">{t('cv.title')}</h1>
        <p className="text-xl md:text-2xl text-slate-600">{t('cv.subtitle')}</p>
      </header>

      <section id="contact" className="mb-10">
        <h2><i className="fas fa-address-book"></i>{t('cv.sections.contact')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-slate-700">

          <div className="flex items-center contact-item">
            <i className="fab fa-linkedin fa-fw"></i>
            <a href="https://www.linkedin.com/in/asimplek" target="_blank" rel="noopener noreferrer">linkedin.com/in/asimplek</a>
          </div>
          <div className="flex items-center contact-item">
            <i className="fab fa-medium fa-fw"></i>
            <a href="https://medium.com/@AlgimantasKras1" target="_blank" rel="noopener noreferrer">medium.com/@AlgimantasKras1</a>
          </div>
          <div className="flex items-center contact-item">
            <i className="fab fa-facebook fa-fw"></i>
            <a href="https://www.facebook.com/algimantask" target="_blank" rel="noopener noreferrer">{t('contact.facebook')}</a>
          </div>
          <div className="flex items-center contact-item">
            <i className="fas fa-map-marker-alt fa-fw"></i>
            <span>{t('cv.contact.location')}</span>
          </div>
        </div>
      </section>

      <section id="summary" className="mb-10">
        <h2><i className="fas fa-user-alt"></i>{t('cv.sections.summary')}</h2>
        <p className="text-slate-700 leading-relaxed text-base">
          {t('cv.summary.text')}
        </p>
      </section>

      <section id="experience" className="mb-10">
        <h2><i className="fas fa-briefcase"></i>{t('cv.sections.experience')}</h2>

        <div className="entry">
          <div className="entry-title">
            <h3 className="text-xl font-semibold">Wix.com</h3>
            <span className="text-sm">July 2020 - Present</span>
          </div>
          <p className="entry-details">Back End Developer | Vilnius, Lithuania</p>
          <p className="entry-description">
            Developing and maintaining a robust HR management system utilizing a combination of Spring and Sangria GraphQL. Responsible for designing and implementing scalable backend solutions, optimizing database queries, and ensuring high performance across the platform. Collaborating with cross-functional teams to deliver new features and improvements to the HR system.
          </p>
        </div>
        
        <div className="entry">
          <div className="entry-title">
            <h3 className="text-xl font-semibold">Wix.com</h3>
            <span className="text-sm">February 2020 - July 2020</span>
          </div>
          <p className="entry-details">Frontend Developer | Vilnius, Lithuania</p>
          <p className="entry-description">
            Provided technical support to a FrontEnd team utilizing cutting-edge technologies such as Typescript, GraphQL, and React. Collaborated on developing responsive user interfaces, implementing state management solutions, and ensuring cross-browser compatibility. Participated in code reviews and contributed to improving frontend architecture and performance.
          </p>
        </div>

        <div className="entry">
          <div className="entry-title">
            <h3 className="text-xl font-semibold">Wix.com</h3>
            <span className="text-sm">June 2018 - February 2020</span>
          </div>
          <p className="entry-details">Backend Developer | Vilnius, Lithuania</p>
          <p className="entry-description">
            Expertise in developing and maintaining an internal Applicant Tracking System (ATS) using Spring and Sangria GraphQL. Implemented key features for candidate management, interview scheduling, and reporting. Worked closely with HR teams to understand requirements and deliver solutions that streamlined the recruitment process and improved user experience.
          </p>
        </div>

        <div className="entry">
          <div className="entry-title">
            <h3 className="text-xl font-semibold">Wix.com</h3>
            <span className="text-sm">January 2018 - June 2018</span>
          </div>
          <p className="entry-details">Senior Frontend Developer | Berlin Area, Germany</p>
          <p className="entry-description">
            Led front-end R&D efforts in multilingual projects, resulting in the development of user-friendly interfaces that supported multiple languages and localization requirements. Mentored junior developers, established coding standards, and implemented best practices for frontend development. Collaborated with UX designers to create intuitive and accessible user experiences.
          </p>
        </div>
        
        <div className="entry">
          <div className="entry-title">
            <h3 className="text-xl font-semibold">Polecat - Incisive Intelligence</h3>
            <span className="text-sm">May 2016 - Dec 2017</span>
          </div>
          <p className="entry-details">Solution Engineer | Bristol, United Kingdom</p>
          <p className="entry-description">
            Expertise in modernizing monolith architecture by implementing microservices utilizing Clojure. Led the transition from legacy systems to a more scalable and maintainable architecture. Designed and implemented RESTful APIs, improved system performance, and reduced deployment complexity. Collaborated with cross-functional teams to ensure smooth integration and minimal disruption during the transition.
          </p>
        </div>

        <div className="entry">
          <div className="entry-title">
            <h3 className="text-xl font-semibold">YachtWorld LLC</h3>
            <span className="text-sm">Apr 2015 - Apr 2016</span>
          </div>
          <p className="entry-details">Software Engineer | Fareham, Hampshire, United Kingdom</p>
          <p className="entry-description">
            Expertise in working with a diverse range of systems, including Spring (Java), Play (Scala), and various frontend technologies. Developed and maintained features for a high-traffic yacht listing platform. Implemented performance optimizations that improved page load times by 30%. Collaborated with UX designers to enhance user experience and implement responsive design principles across the platform.
          </p>
        </div>

        <div className="entry">
          <div className="entry-title">
            <h3 className="text-xl font-semibold">Sportlobster</h3>
            <span className="text-sm">Mar 2014 - Aug 2014</span>
          </div>
          <p className="entry-details">Lead Front End Developer | London, United Kingdom</p>
          <p className="entry-description">
            Lead a team of 3 developers in re-factoring complex Symphony code for use in the front-end. Established coding standards and best practices that improved code quality and team productivity. Implemented a component-based architecture that enhanced reusability and maintainability. Worked closely with product managers to prioritize features and deliver a sports-focused social platform that met user needs and business objectives.
          </p>
        </div>

        <div className="entry">
          <div className="entry-title">
            <h3 className="text-xl font-semibold">Dods Group PLC</h3>
            <span className="text-sm">Sep 2013 - May 2014</span>
          </div>
          <p className="entry-details">Solution Engineer | London, United Kingdom</p>
          <p className="entry-description">
            Expertly leveraged AngularJs as a primary front-end developer, utilizing RESTful web services to create dynamic and responsive user interfaces. Developed and maintained features for a political information platform. Implemented data visualization components that improved the presentation of complex legislative information. Collaborated with backend developers to optimize API integration and ensure consistent data flow throughout the application.
          </p>
        </div>
        
        <div className="entry">
          <div className="entry-title">
            <h3 className="text-xl font-semibold">Quatrodev</h3>
            <span className="text-sm">Jun 2013 - Aug 2013</span>
          </div>
          <p className="entry-details">Frontend Developer | Kaunas, Lithuania</p>
          <p className="entry-description">
            Expertly led a team of 10 front-end developers as the primary AngularJs lead developer. Established development workflows and coding standards that improved team efficiency. Implemented advanced frontend architecture patterns that enhanced application performance and maintainability. Mentored junior developers and conducted regular code reviews to ensure high-quality deliverables.
          </p>
        </div>
        
        <div className="entry">
          <div className="entry-title">
            <h3 className="text-xl font-semibold">Sheep Print</h3>
            <span className="text-sm">Feb 2013 - Jun 2013</span>
          </div>
          <p className="entry-details">System Analyst | Kaunas, Lithuania</p>
          <p className="entry-description">
            Performed in-depth systems analysis utilizing UML standard notation, resulting in the successful creation of comprehensive system documentation. Created detailed diagrams and specifications that guided development efforts. Collaborated with stakeholders to gather requirements and translate business needs into technical specifications. Implemented process improvements that enhanced system reliability and performance.
          </p>
        </div>
        
        <div className="entry">
          <div className="entry-title">
            <h3 className="text-xl font-semibold">Angry Ideas</h3>
            <span className="text-sm">Feb 2012 - Jun 2012</span>
          </div>
          <p className="entry-details">PHP Developer | Kaunas, Lithuania</p>
          <p className="entry-description">
            Designed and developed highly scalable Facebook apps utilizing a blend of AJAX, JQuery JS, and PHP. Created interactive social applications that engaged users and drove platform adoption. Implemented responsive designs that worked across multiple devices and screen sizes. Integrated with Facebook's API to leverage social features and enhance user experience.
          </p>
        </div>
        
        <div className="entry">
          <div className="entry-title">
            <h3 className="text-xl font-semibold">smsbiuras.lt</h3>
            <span className="text-sm">Jul 2011 - Feb 2012</span>
          </div>
          <p className="entry-details">Back-End Developer | Kaunas, Lithuania</p>
          <p className="entry-description">
            Expertly blended front-end and back-end development utilizing Vanilla PHP and JQuery JS. Developed and maintained SMS messaging platform features that supported high-volume message processing. Implemented database optimizations that improved query performance and system responsiveness. Created user-friendly interfaces that simplified complex messaging operations and improved overall user experience.
          </p>
        </div>
      </section>

      <section id="education" className="mb-10">
        <h2><i className="fas fa-graduation-cap"></i>{t('cv.sections.education')}</h2>
        <div className="entry">
          <div className="entry-title mb-1">
            <h3 className="text-xl font-semibold text-slate-800">Kauno Technologijos Universitetas</h3>
            <span className="text-sm text-slate-500">2009 - 2013</span>
          </div>
          <p className="entry-details">Bachelor's Degree, Informatics | Kaunas, Lithuania</p>
        </div>
        <div className="entry">
          <div className="entry-title mb-1">
            <h3 className="text-xl font-semibold text-slate-800">Kauno S. Dariaus ir S. Girėno gimnazija</h3>
            <span className="text-sm text-slate-500">1997 - 2009</span>
          </div>
          <p className="entry-details">Secondary Degree | Kaunas, Lithuania</p>
        </div>
      </section>

      <section id="skills" className="mb-10">
        <h2><i className="fas fa-cogs"></i>{t('cv.sections.skills')}</h2>
        <h4 className="font-semibold text-slate-700 mb-3">{t('cv.skills.topSkills')}</h4>
        <div className="flex flex-wrap gap-2 mb-5">
          <span className="skill-badge badge-indigo">Scala</span>
          <span className="skill-badge badge-indigo">Event Sourcing</span>
          <span className="skill-badge badge-indigo">Kafka</span>
        </div>
        <h4 className="font-semibold text-slate-700 mb-3">{t('cv.skills.otherSkills')}</h4>
        <div className="flex flex-wrap gap-2">

          <span className="skill-badge badge-amber">Java</span>
          <span className="skill-badge badge-emerald">Clojure</span>
          <span className="skill-badge badge-slate">PHP</span>
          <span className="skill-badge badge-rose">Functional Programming</span>
          <span className="skill-badge badge-amber">Spring</span>
          <span className="skill-badge badge-sky">Sangria</span>
          <span className="skill-badge badge-rose">Cats</span>
          <span className="skill-badge badge-rose">Slick</span>
          <span className="skill-badge badge-sky">Play Framework</span>
          <span className="skill-badge badge-slate">Zend Framework</span>
          <span className="skill-badge badge-slate">CodeIgniter</span>
          <span className="skill-badge badge-blue">JavaScript</span>
          <span className="skill-badge badge-blue">TypeScript</span>
          <span className="skill-badge badge-blue">React</span>
          <span className="skill-badge badge-blue">Redux</span>
          <span className="skill-badge badge-blue">AngularJS</span>
          <span className="skill-badge badge-indigo">GraphQL</span>
          <span className="skill-badge badge-blue">Wix Style React</span>
          <span className="skill-badge badge-amber">HTML</span>
          <span className="skill-badge badge-sky">CSS</span>
          <span className="skill-badge badge-rose">SASS/LESS</span>
          <span className="skill-badge badge-blue">JQuery</span>
          <span className="skill-badge badge-blue">AJAX</span>
          <span className="skill-badge badge-blue">Coffeescript</span>
          <span className="skill-badge badge-emerald">MySQL</span>
          <span className="skill-badge badge-amber">Apache Solr</span>
          <span className="skill-badge badge-indigo">Microservices</span>
          <span className="skill-badge badge-indigo">RESTful Web Services</span>
          <span className="skill-badge badge-emerald">TDD</span>
          <span className="skill-badge badge-slate">UML</span>
          <span className="skill-badge badge-slate">Grunt</span>
          <span className="skill-badge badge-slate">ODATA</span>
          <span className="skill-badge badge-slate">SMPP</span>
          <span className="skill-badge badge-slate">Dynamics CRM</span>
          <span className="skill-badge badge-slate">Git</span>
        </div>
      </section>

      <section id="languages" className="mb-10">
        <h2><i className="fas fa-language"></i>{t('cv.sections.languages')}</h2>
        <ul className="info-list">
          <li><i className="fas fa-check-circle"></i><strong className="font-medium w-32">{t('cv.languages.lithuanian')}:</strong> {t('cv.languages.nativeLevel')}</li>
          <li><i className="fas fa-check-circle"></i><strong className="font-medium w-32">{t('cv.languages.english')}:</strong> {t('cv.languages.nativeLevel')}</li>
          <li><i className="fas fa-dot-circle"></i><strong className="font-medium w-32">{t('cv.languages.german')}:</strong> {t('cv.languages.elementaryLevel')}</li>
        </ul>
      </section>

      <section id="certifications" className="mb-10">
        <h2><i className="fas fa-certificate"></i>{t('cv.sections.certifications')}</h2>
        <ul className="info-list space-y-2">
          <li><i className="fas fa-award"></i>Introduction to OAuth2, OpenID Connect and JSON Web Tokens (JWT)</li>
          <li><i className="fas fa-award"></i>Stocks and Bonds</li>
          <li><i className="fas fa-award"></i>Functional Programming in Haskell</li>
          <li><i className="fas fa-award"></i>Managing Your Money: MBA Insights for Undergraduates</li>
          <li><i className="fas fa-award"></i>Advanced Understanding of Stocks and Bonds</li>
        </ul>
      </section>

    </div>
  );
};

export default Home;
