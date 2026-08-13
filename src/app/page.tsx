"use client";

import React, { useState } from "react";

/*=========================================================
HACKERSHARBOR — COMPLETE HOMEPAGE
=========================================================*/

/*=========================================================
HERO IMAGE
=========================================================*/

const HERO_IMAGE = "/hero.png";

/*=========================================================
ICON HELPER
=========================================================*/

function TechIcon({
  slug,
  color,
  size = 34,
}: {
  slug: string;
  color?: string;
  size?: number;
}) {
  const src = color
    ? `https://cdn.simpleicons.org/${slug}/${color}`
    : `https://cdn.simpleicons.org/${slug}`;

  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className="tech-icon"
      loading="lazy"
    />
  );
}

/*=========================================================
SMALL ARROW
=========================================================*/

function Arrow() {
  return <span className="arrow">→</span>;
}

/*=========================================================
NAVBAR
=========================================================*/

function Navbar({
  darkMode,
  setDarkMode,
}: {
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <header className="navbar-wrap">
      <nav className="navbar">
        <div className="brand">
          <img
            src="/logo.png"
            alt="HackersHarbor"
            className="brand-logo"
          />

          <span className="brand-name">
            Hackers<span>Harbor</span>
          </span>
        </div>

        <div className="nav-links">
          <a href="#learn">Learn</a>
          <a href="#roadmaps">Roadmaps</a>
          <a href="#practice">Practice</a>
          <a href="#projects">Projects</a>
          <a href="#interview">Interview Prep</a>
          <a href="#community">Community</a>

          <a href="#pricing" className="pro-button">
            Pro
          </a>
        </div>

        <div className="nav-actions">
          <button className="search-button" aria-label="Search">
            <span className="search-icon"></span>
          </button>

          <button
            type="button"
            className={`theme-switch ${darkMode ? "active" : ""}`}
            onClick={() => setDarkMode((value) => !value)}
            aria-label="Toggle color theme"
            aria-pressed={darkMode}
          >
            <span className="theme-switch-knob"></span>
          </button>

          <button className="login-button">Login</button>
          <button className="signup-button">Signup</button>
        </div>
      </nav>
    </header>
  );
}

/*=========================================================
HERO
=========================================================*/

function Hero() {
  return (
    <section className="hero">
      <div
        className="hero-background"
        style={{
          backgroundImage: `url("${HERO_IMAGE}")`,
        }}
      />

      <div className="hero-left-fade" />
      <div className="hero-bottom-fade" />

      <div className="hero-content">
        <div className="hero-copy">
          <div className="hero-badge">
            <span className="anchor">⚓</span>
            <span>Your journey from code to career starts here</span>
          </div>

          <h1>
            Navigate Your
            <br />
            <span>Coding Journey.</span>
          </h1>

          <p className="hero-description">
            Learn. Practice. Build real projects. Get hired.
            <br />
            All in one place.
          </p>

          <div className="hero-buttons">
            <button className="primary-button">
              Start Learning for Free
              <Arrow />
            </button>

            <button className="secondary-button">
              Explore Roadmaps
              <Arrow />
            </button>
          </div>

          <div className="learners">
            <div className="avatar-group">
              <div className="avatar">👨🏻</div>
              <div className="avatar">👩🏻</div>
              <div className="avatar">👨🏽</div>
              <div className="avatar">👩🏾</div>
            </div>

            <span>
              Join <strong>20,000+</strong> developers learning and growing
              together 🚀
            </span>
          </div>
        </div>

        <div className="hero-progress-card">
          <h3>Your Progress</h3>
          <p>Keep going, Captain! ⚓</p>
          <div className="card-divider" />
          <div className="progress-empty" />
        </div>

        <div className="hero-streak-card">
          <h3>Current Streak 🔥</h3>
          <div className="streak-empty" />
        </div>
      </div>
    </section>
  );
}

/*=========================================================
TECHNOLOGY DATA
=========================================================*/

const technologies = [
  { name: "Python", slug: "python", color: "3776AB" },
  { name: "Java", slug: "openjdk", color: "ED8B00" },
  { name: "JavaScript", slug: "javascript", color: "F7DF1E" },
  { name: "C++", slug: "cplusplus", color: "00599C" },
  { name: "React", slug: "react", color: "61DAFB" },
  { name: "Next.js", slug: "nextdotjs", color: "111111" },
  { name: "SQL", slug: "mysql", color: "4479A1" },
  { name: "AWS", slug: "amazonaws", color: "232F3E" },
  { name: "Docker", slug: "docker", color: "2496ED" },
  { name: "GitHub", slug: "github", color: "181717" },
  { name: "Node.js", slug: "nodedotjs", color: "339933" },
  { name: "Kubernetes", slug: "kubernetes", color: "326CE5" },
  { name: "TypeScript", slug: "typescript", color: "3178C6" },
  { name: "Git", slug: "git", color: "F05032" },
  { name: "MySQL", slug: "mysql", color: "4479A1" },
  { name: "PostgreSQL", slug: "postgresql", color: "4169E1" },
  { name: "MongoDB", slug: "mongodb", color: "47A248" },
  { name: "Django", slug: "django", color: "092E20" },
  { name: "Flask", slug: "flask", color: "000000" },
  { name: "Tailwind CSS", slug: "tailwindcss", color: "06B6D4" },
  { name: "Linux", slug: "linux", color: "FCC624" },
  { name: "Terraform", slug: "terraform", color: "844FBA" },
  { name: "Azure", slug: "microsoftazure", color: "0078D4" },
  { name: "Google Cloud", slug: "googlecloud", color: "4285F4" },
];

/*=========================================================
TECHNOLOGY STRIP
=========================================================*/

function TechnologyStrip() {
  return (
    <section className="technology-section">
      <div className="technology-container">
        {technologies.map((tech) => (
          <div className="technology-tile" key={tech.name}>
            <div className="technology-icon-box">
              <TechIcon
                slug={tech.slug}
                color={tech.color}
                size={32}
              />
            </div>

            <span>{tech.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/*=========================================================
STATS
=========================================================*/

const stats = [
  {
    number: "500+",
    title: "Courses",
    subtitle: "For all skill levels",
    icon: "▣",
    className: "blue",
  },
  {
    number: "20,000+",
    title: "Coding Challenges",
    subtitle: "Practice & improve",
    icon: "</>",
    className: "green",
  },
  {
    number: "100+",
    title: "Real-world Projects",
    subtitle: "Build your portfolio",
    icon: "□",
    className: "purple",
  },
  {
    number: "AI Powered",
    title: "Smart Learning",
    subtitle: "Personalized for you",
    icon: "✦",
    className: "orange",
  },
];

function StatsSection() {
  return (
    <section className="stats-section">
      <div className="stats-container">
        {stats.map((stat) => (
          <div className="stat-item" key={stat.number}>
            <div className={`stat-icon ${stat.className}`}>
              {stat.icon}
            </div>

            <div className="stat-copy">
              <div className={`stat-number ${stat.className}`}>
                {stat.number}
              </div>

              <div className="stat-title">{stat.title}</div>
              <div className="stat-subtitle">{stat.subtitle}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/*=========================================================
ROADMAP DATA
=========================================================*/

const roadmaps = [
  {
    title: "Python Developer",
    description:
      "From basics to advanced Python and build real applications",
    lessons: "40 Lessons",
    projects: "12 Projects",
    slug: "python",
    color: "3776AB",
    iconBackground: "python-bg",
  },
  {
    title: "Backend Developer",
    description:
      "Master server-side development with Node.js, Express & more",
    lessons: "45 Lessons",
    projects: "15 Projects",
    slug: "nodedotjs",
    color: "339933",
    iconBackground: "backend-bg",
  },
  {
    title: "Frontend Developer",
    description:
      "Build modern, responsive web apps with React & Next.js",
    lessons: "35 Lessons",
    projects: "10 Projects",
    slug: "react",
    color: "61DAFB",
    iconBackground: "frontend-bg",
  },
  {
    title: "Cloud Engineer",
    description:
      "Learn AWS, Docker, Kubernetes and DevOps tools",
    lessons: "50 Lessons",
    projects: "14 Projects",
    slug: "amazonaws",
    color: "FF9900",
    iconBackground: "cloud-bg",
  },
  {
    title: "Java Developer",
    description:
      "Build scalable applications with Java and Spring Boot",
    lessons: "42 Lessons",
    projects: "11 Projects",
    slug: "openjdk",
    color: "ED8B00",
    iconBackground: "java-bg",
  },
  {
    title: "DevOps Engineer",
    description:
      "Master CI/CD, Docker, Kubernetes and infrastructure",
    lessons: "48 Lessons",
    projects: "13 Projects",
    slug: "kubernetes",
    color: "326CE5",
    iconBackground: "devops-bg",
  },
  {
    title: "Data Analyst",
    description:
      "Learn SQL, Python, visualization and business analytics",
    lessons: "38 Lessons",
    projects: "10 Projects",
    slug: "mysql",
    color: "4479A1",
    iconBackground: "data-bg",
  },
  {
    title: "TypeScript Developer",
    description:
      "Build reliable modern applications using TypeScript",
    lessons: "32 Lessons",
    projects: "9 Projects",
    slug: "typescript",
    color: "3178C6",
    iconBackground: "typescript-bg",
  },
  {
    title: "Data Scientist",
    description:
      "Master Python, statistics, machine learning and real-world data",
    lessons: "52 Lessons",
    projects: "14 Projects",
    slug: "python",
    color: "3776AB",
    iconBackground: "python-bg",
  },
  {
    title: "Full Stack Developer",
    description:
      "Build complete applications from frontend to backend",
    lessons: "55 Lessons",
    projects: "16 Projects",
    slug: "nextdotjs",
    color: "111111",
    iconBackground: "frontend-bg",
  },
  {
    title: "AI Engineer",
    description:
      "Learn machine learning, AI systems and intelligent applications",
    lessons: "50 Lessons",
    projects: "12 Projects",
    slug: "python",
    color: "3776AB",
    iconBackground: "python-bg",
  },
  {
    title: "Database Engineer",
    description:
      "Master SQL, PostgreSQL, MySQL, MongoDB and database systems",
    lessons: "40 Lessons",
    projects: "10 Projects",
    slug: "postgresql",
    color: "4169E1",
    iconBackground: "data-bg",
  },
];

/*=========================================================
ROADMAP CARD
=========================================================*/

function RoadmapCard({
  roadmap,
}: {
  roadmap: (typeof roadmaps)[number];
}) {
  return (
    <article className="roadmap-card">
      <div className="roadmap-card-top">
        <div className={`roadmap-icon ${roadmap.iconBackground}`}>
          <TechIcon
            slug={roadmap.slug}
            color={roadmap.color}
            size={44}
          />
        </div>

        <button
          className="roadmap-arrow"
          aria-label={`Open ${roadmap.title}`}
        >
          →
        </button>
      </div>

      <h3>{roadmap.title}</h3>
      <p>{roadmap.description}</p>

      <div className="roadmap-meta">
        <span>
          <b>▣</b>
          {roadmap.lessons}
        </span>

        <span>
          <b>◇</b>
          {roadmap.projects}
        </span>
      </div>
    </article>
  );
}

/*=========================================================
ROADMAP SECTION
=========================================================*/

function RoadmapsSection() {
  return (
    <section className="roadmaps-section" id="roadmaps">
      <div className="roadmaps-heading">
        <div className="learn-your-way">LEARN YOUR WAY</div>

        <h2>
          Popular Roadmaps<span>⚓</span>
        </h2>

        <p>Step-by-step paths to master in-demand skills</p>

        <a href="#roadmaps" className="all-roadmaps-link">
          View all roadmaps
          <span>→</span>
        </a>
      </div>

      <div className="roadmap-grid">
        {roadmaps.slice(0, 4).map((roadmap) => (
          <RoadmapCard
            key={roadmap.title}
            roadmap={roadmap}
          />
        ))}
      </div>

      <div className="more-roadmaps">
        {roadmaps.slice(4).map((roadmap) => (
          <RoadmapCard
            key={roadmap.title}
            roadmap={roadmap}
          />
        ))}
      </div>

      <button className="view-all-button">
        View All Roadmaps
        <Arrow />
      </button>
    </section>
  );
}

/*=========================================================
FEATURED PROJECTS
=========================================================*/

const projects = [
  {
    title: "AI Content Detector",
    description:
      "Build a machine learning system that predicts whether content was created by AI or a human.",
    difficulty: "Intermediate",
    category: "Machine Learning",
    technologies: ["python", "scikitlearn"],
    color: "blue",
  },
  {
    title: "E-Commerce Analytics Dashboard",
    description:
      "Analyze customer behavior, sales performance and business KPIs through an interactive dashboard.",
    difficulty: "Intermediate",
    category: "Data Analytics",
    technologies: ["python", "mysql"],
    color: "green",
  },
  {
    title: "Developer Portfolio",
    description:
      "Create a modern developer portfolio showcasing your skills, projects and professional journey.",
    difficulty: "Beginner",
    category: "Web Development",
    technologies: ["react", "nextdotjs"],
    color: "purple",
  },
  {
    title: "Real-Time Chat Application",
    description:
      "Build a full-stack chat application with authentication, messaging and real-time communication.",
    difficulty: "Advanced",
    category: "Full Stack",
    technologies: ["typescript", "nodedotjs"],
    color: "orange",
  },
];

function FeaturedProjectsSection() {
  return (
    <section className="projects-section" id="projects">
      <div className="projects-container">
        <div className="projects-heading">
          <div className="section-label">BUILD SOMETHING REAL</div>

          <h2>
            Featured Projects<span>⚓</span>
          </h2>

          <p>
            Stop watching tutorials. Start building projects that prove
            what you can do.
          </p>

          <a href="#projects" className="section-link">
            Explore all projects →
          </a>
        </div>

        <div className="projects-grid">
          {projects.map((project) => (
            <article
              className="project-card"
              key={project.title}
            >
              <div className="project-top">
                <div className={`project-icon ${project.color}`}>
                  {"</>"}
                </div>

                <span className="project-difficulty">
                  {project.difficulty}
                </span>
              </div>

              <div className="project-category">
                {project.category}
              </div>

              <h3>{project.title}</h3>

              <p>{project.description}</p>

              <div className="project-tech">
                {project.technologies.map((tech) => (
                  <TechIcon
                    key={tech}
                    slug={tech}
                    size={20}
                  />
                ))}
              </div>

              <button className="project-button">
                View Project
                <Arrow />
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/*=========================================================
WHY HACKERSHARBOR
=========================================================*/

const reasons = [
  {
    number: "01",
    title: "Learn by Doing",
    description:
      "Learn concepts through practical lessons, examples and hands-on exercises instead of passive tutorials.",
  },
  {
    number: "02",
    title: "Practice Every Day",
    description:
      "Strengthen your skills with coding challenges designed to help you think, solve and improve.",
  },
  {
    number: "03",
    title: "Build Your Portfolio",
    description:
      "Turn your knowledge into real-world projects that demonstrate your abilities to employers.",
  },
  {
    number: "04",
    title: "Prepare for Careers",
    description:
      "Practice interviews, strengthen your fundamentals and follow focused career roadmaps.",
  },
];

function WhyHackersHarborSection() {
  return (
    <section className="why-section">
      <div className="why-container">
        <div className="why-heading">
          <div className="section-label">WHY HACKERSHARBOR</div>

          <h2>
            Everything you need to
            <br />
            <span>navigate your career.</span>
          </h2>

          <p>
            One place to learn, practice, build and prepare for the next
            step in your developer journey.
          </p>
        </div>

        <div className="why-grid">
          {reasons.map((reason) => (
            <article
              className="why-card"
              key={reason.number}
            >
              <div className="why-card-top">
                <span className="why-number">
                  {reason.number}
                </span>
              </div>

              <h3>{reason.title}</h3>

              <p>{reason.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/*=========================================================
CAREER JOURNEY
=========================================================*/

const careerSteps = [
  {
    number: "01",
    title: "Learn",
    description:
      "Master the fundamentals through structured courses and guided roadmaps.",
  },
  {
    number: "02",
    title: "Practice",
    description:
      "Solve coding challenges and strengthen your problem-solving skills.",
  },
  {
    number: "03",
    title: "Build",
    description:
      "Create real-world projects and turn your knowledge into a portfolio.",
  },
  {
    number: "04",
    title: "Get Hired",
    description:
      "Prepare for interviews and confidently take your skills into the job market.",
  },
];

function CareerJourneySection() {
  return (
    <section className="career-section">
      <div className="career-container">
        <div className="career-heading">
          <div className="section-label">YOUR CAREER JOURNEY</div>

          <h2>
            From beginner to
            <span> job-ready.</span>
          </h2>

          <p>
            Follow a simple path and keep moving forward, one milestone
            at a time.
          </p>
        </div>

        <div className="career-journey">
          {careerSteps.map((step) => (
            <div className="career-step" key={step.number}>
              <div className="career-step-number">
                {step.number}
              </div>

              <h3>{step.title}</h3>

              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/*=========================================================
TESTIMONIALS
=========================================================*/

const testimonials = [
  {
    quote:
      "The Python roadmap gave me a clear path instead of jumping between random tutorials. I built projects I could actually discuss during interviews.",
    name: "Arjun",
    location: "Bengaluru",
    role: "Software Developer",
    company: "Wipro",
    initials: "AK",
  },
  {
    quote:
      "The projects helped me understand what companies actually expect from a fresher. I went from only knowing syntax to confidently explaining my work.",
    name: "Meera",
    location: "Hyderabad",
    role: "Data Analyst",
    company: "Analytics",
    initials: "MS",
  },
  {
    quote:
      "I used the roadmaps and interview preparation together. Having everything in one place made my preparation much more consistent.",
    name: "Rahul",
    location: "Pune",
    role: "Frontend Developer",
    company: "Tech",
    initials: "RP",
  },
];

function TestimonialsSection() {
  return (
    <section className="testimonials-section">
      <div className="testimonials-container">
        <div className="testimonials-heading">
          <div className="section-label">FROM THE CREW</div>

          <h2>
            Students who kept
            <span> moving forward.</span>
          </h2>

          <p>
            Real journeys from learners who used HackersHarbor to build
            skills, projects and confidence.
          </p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((testimonial) => (
            <article
              className="testimonial-card"
              key={testimonial.name}
            >
              <div className="testimonial-mark">“</div>

              <p className="testimonial-quote">
                {testimonial.quote}
              </p>

              <div className="testimonial-divider" />

              <div className="testimonial-person">
                <div className="testimonial-avatar">
                  {testimonial.initials}
                </div>

                <div>
                  <h3>{testimonial.name}</h3>

                  <p>
                    {testimonial.location} · {testimonial.role}
                  </p>
                </div>
              </div>

              <div className="testimonial-company">
                {testimonial.company}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/*=========================================================
THE NAVIGATOR AI
=========================================================*/

function NavigatorSection() {
  const [navigatorInput, setNavigatorInput] = useState("");

  const suggestions = [
    "Build me a Python roadmap",
    "What should I learn for data analytics?",
    "Give me a project for my portfolio",
  ];

  return (
    <section className="navigator-section">
      <div className="navigator-container">
        <div className="navigator-copy">
          <div className="section-label">
            MEET THE NAVIGATOR
          </div>

          <h2>
            Your personal AI guide
            <br />
            for the journey.
          </h2>

          <p>
            The Navigator helps you decide what to learn next, find the
            right roadmap, choose projects and stay focused on your career
            goal.
          </p>

          <div className="navigator-points">
            <div>
              <span className="navigator-point-number">01</span>
              <span>Tell it where you want to go.</span>
            </div>

            <div>
              <span className="navigator-point-number">02</span>
              <span>Get a learning path built around you.</span>
            </div>

            <div>
              <span className="navigator-point-number">03</span>
              <span>Keep adapting as your skills grow.</span>
            </div>
          </div>
        </div>

        <div className="navigator-demo">
          <div className="navigator-window">
            <div className="navigator-window-header">
              <div className="navigator-window-title">
                <div className="navigator-logo">N</div>

                <div>
                  <strong>The Navigator</strong>
                  <span>AI Career Guide</span>
                </div>
              </div>

              <span className="navigator-status">
                Online
              </span>
            </div>

            <div className="navigator-chat">
              <div className="navigator-message navigator-message-ai">
                <span className="navigator-message-label">
                  Navigator
                </span>

                <p>
                  Hey Captain. What are you trying to become?
                </p>
              </div>

              <div className="navigator-message navigator-message-user">
                <p>
                  I want to become a Python data analyst.
                </p>
              </div>

              <div className="navigator-message navigator-message-ai">
                <span className="navigator-message-label">
                  Navigator
                </span>

                <p>
                  Perfect. I&apos;d start with Python fundamentals,
                  SQL, data analysis and three portfolio projects.
                </p>

                <div className="navigator-roadmap-preview">
                  <div>
                    <span>01</span>
                    Python Foundations
                  </div>

                  <div>
                    <span>02</span>
                    SQL & Data
                  </div>

                  <div>
                    <span>03</span>
                    Analytics Projects
                  </div>
                </div>
              </div>
            </div>

            <div className="navigator-suggestions">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setNavigatorInput(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <div className="navigator-input">
              <input
                value={navigatorInput}
                onChange={(event) =>
                  setNavigatorInput(event.target.value)
                }
                placeholder="Ask The Navigator..."
              />

              <button type="button">→</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/*=========================================================
PRICING
=========================================================*/

const pricingPlans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    description:
      "Start learning, practice the basics and explore HackersHarbor.",
    features: [
      "Selected courses",
      "Coding challenges",
      "Learning roadmaps",
      "Community access",
    ],
    button: "Start for Free",
    featured: false,
  },
  {
    name: "Pro",
    price: "₹249",
    period: "per month",
    description:
      "Unlock the complete learning experience and accelerate your journey.",
    features: [
      "All courses",
      "All coding challenges",
      "Full project library",
      "The Navigator AI",
      "Interview preparation",
      "Certificates",
    ],
    button: "Get Pro",
    featured: true,
  },
  {
    name: "Teams",
    price: "Let's talk",
    period: "for your team",
    description:
      "Give your team a structured environment for learning and development.",
    features: [
      "Team learning paths",
      "Progress tracking",
      "Curated courses",
      "Projects & challenges",
      "Team support",
    ],
    button: "Contact Sales",
    featured: false,
  },
];

function PricingSection() {
  return (
    <section className="pricing-section" id="pricing">
      <div className="pricing-container">
        <div className="pricing-heading">
          <div className="section-label">SIMPLE PRICING</div>

          <h2>
            Choose your
            <span> next step.</span>
          </h2>

          <p>
            Start free. Upgrade when you&apos;re ready. No complicated
            plans standing between you and learning.
          </p>
        </div>

        <div className="pricing-grid">
          {pricingPlans.map((plan) => (
            <article
              className={`pricing-card ${
                plan.featured ? "pricing-card-featured" : ""
              }`}
              key={plan.name}
            >
              {plan.featured && (
                <div className="pricing-popular">
                  MOST POPULAR
                </div>
              )}

              <div className="pricing-card-inner">
                <h3>{plan.name}</h3>

                <div className="pricing-price">
                  <strong>{plan.price}</strong>

                  <span>{plan.period}</span>
                </div>

                <p className="pricing-description">
                  {plan.description}
                </p>

                <div className="pricing-divider" />

                <ul className="pricing-features">
                  {plan.features.map((feature) => (
                    <li key={feature}>
                      <span className="pricing-check">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  className={`pricing-button ${
                    plan.featured
                      ? "pricing-button-primary"
                      : ""
                  }`}
                >
                  {plan.button}
                  <Arrow />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/*=========================================================
FAQ
=========================================================*/

const faqs = [
  {
    question: "Is HackersHarbor free to start?",
    answer:
      "Yes. You can start learning for free and explore selected courses, challenges, roadmaps and community features. Pro is available when you want access to the complete learning experience.",
  },
  {
    question: "What programming languages and technologies are supported?",
    answer:
      "HackersHarbor is designed around popular technologies including Python, JavaScript, TypeScript, Java, C++, SQL, React, Next.js, Node.js, AWS, Docker, Kubernetes and more.",
  },
  {
    question: "Do I need prior programming experience?",
    answer:
      "No. The platform is designed for different skill levels. You can start with beginner-friendly roadmaps and gradually move toward advanced projects and career preparation.",
  },
  {
    question: "Do the certificates help with getting a job?",
    answer:
      "Certificates can help demonstrate that you completed structured learning, but they should support—not replace—real skills, projects and interview preparation. Your portfolio and ability to explain your work matter most.",
  },
  {
    question: "What is The Navigator AI?",
    answer:
      "The Navigator is HackersHarbor's AI learning and career guide. It helps you decide what to learn next, choose suitable projects and build a learning path around your goals.",
  },
  {
    question: "Can I cancel Pro whenever I want?",
    answer:
      "Yes. Pro is designed as a flexible monthly plan. You can cancel your subscription when you no longer want to continue with the paid plan.",
  },
];

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="faq-section">
      <div className="faq-container">
        <div className="faq-heading">
          <div className="section-label">FAQ</div>

          <h2>
            Questions before you
            <span> set sail?</span>
          </h2>

          <p>
            Everything you need to know before starting your journey.
          </p>
        </div>

        <div className="faq-list">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                className={`faq-item ${
                  isOpen ? "faq-item-open" : ""
                }`}
                key={faq.question}
              >
                <button
                  type="button"
                  className="faq-question"
                  onClick={() =>
                    setOpenIndex(isOpen ? null : index)
                  }
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>

                  <span
                    className={`faq-plus ${
                      isOpen ? "faq-plus-open" : ""
                    }`}
                  >
                    +
                  </span>
                </button>

                {isOpen && (
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/*=========================================================
COMMUNITY
=========================================================*/

const communitySections = [
  {
    title: "The Voyage",
    icon: "🔭",
    color: "green",
  },
  {
    title: "The Harbour",
    icon: "🧭",
    color: "blue",
  },
  {
    title: "Channels",
    icon: "📻",
    color: "cyan",
  },
  {
    title: "Crewrooms",
    icon: "🚢",
    color: "purple",
  },
  {
    title: "Shiplogs",
    icon: "🗺️",
    color: "amber",
  },
  {
    title: "Wrecks",
    icon: "🌩️",
    color: "red",
  },
];

function CommunitySection() {
  return (
    <section
      className="community-section"
      id="community"
    >
      <div className="community-container">
        <div className="community-heading">
          <div className="community-label">COMMUNITY</div>

          <h2>The HackersHarbor community</h2>

          <p>
            Ask questions, share knowledge, study with a crew, and
            report what&apos;s broken. Everything in one place.
          </p>
        </div>

        <div className="community-stats">
          <div>
            <span>members</span>
            <strong></strong>
          </div>

          <div>
            <span>open discussions</span>
            <strong></strong>
          </div>

          <div>
            <span>ship logs</span>
            <strong></strong>
          </div>

          <div>
            <span>crewrooms</span>
            <strong></strong>
          </div>

          <div>
            <span>online now</span>
            <strong></strong>
          </div>
        </div>

        <div className="community-grid">
          {communitySections.map((item) => (
            <div
              className={`community-card ${item.color}`}
              key={item.title}
            >
              <div className="community-icon">
                {item.icon}
              </div>

              <div>
                <h3>{item.title}</h3>
                <p>Explore the community</p>
              </div>

              <span className="community-arrow">→</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/*=========================================================
FINAL CTA
=========================================================*/

function FinalCTASection() {
  return (
    <section className="final-cta-section">
      <div className="final-cta-background">
        <div className="cta-glow-one" />
        <div className="cta-glow-two" />
      </div>

      <div className="final-cta-content">
        <div className="final-cta-anchor">⚓</div>

        <div className="section-label cta-label">
          YOUR JOURNEY STARTS HERE
        </div>

        <h2>
          Ready to navigate
          <br />
          <span>your future?</span>
        </h2>

        <p>
          Learn new skills, build real projects and become the developer
          you want to be.
        </p>

        <div className="final-cta-buttons">
          <button className="cta-primary-button">
            Start Learning Free
            <Arrow />
          </button>

          <button className="cta-secondary-button">
            Explore Roadmaps
            <Arrow />
          </button>
        </div>

        <div className="cta-note">
          No credit card required • Start for free
        </div>
      </div>
    </section>
  );
}

/*=========================================================
ENHANCED FOOTER
=========================================================*/

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-brand-column">
          <div className="footer-brand">
            <img
              src="/logo.png"
              alt="HackersHarbor"
            />

            <span>
              Hackers<span>Harbor</span>
            </span>
          </div>

          <p className="footer-tagline">
            Navigate your coding journey.
          </p>

          <p className="footer-description">
            Learn. Practice. Build real projects. Get hired.
          </p>
        </div>

        <div className="footer-column">
          <h3>Learn</h3>
          <a href="#learn">Courses</a>
          <a href="#roadmaps">Roadmaps</a>
          <a href="#practice">Coding Challenges</a>
          <a href="#projects">Projects</a>
        </div>

        <div className="footer-column">
          <h3>Career</h3>
          <a href="#interview">Interview Prep</a>
          <a href="#roadmaps">Career Paths</a>
          <a href="#projects">Portfolio Projects</a>
          <a href="#community">Community</a>
        </div>

        <div className="footer-column">
          <h3>HackersHarbor</h3>
          <a href="#">About</a>
          <a href="#pricing">Pro</a>
          <a href="#">Contact</a>
          <a href="#">Help Center</a>
        </div>
      </div>

      <div className="footer-bottom">
        <span>
          © 2026 HackersHarbor. All rights reserved.
        </span>

        <div className="footer-bottom-links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">GitHub</a>
        </div>
      </div>
    </footer>
  );
}

/*=========================================================
PAGE
=========================================================*/

export default function HomePage() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <>
      <div className={`page ${darkMode ? "dark-mode" : ""}`}>
        <Navbar
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        <main>
          <Hero />

          <TechnologyStrip />

          <StatsSection />

          <RoadmapsSection />

          <FeaturedProjectsSection />

          <WhyHackersHarborSection />

          <CareerJourneySection />

          {/* NEW */}
          <TestimonialsSection />

          {/* NEW */}
          <NavigatorSection />

          {/* NEW */}
          <PricingSection />

          <CommunitySection />

          {/* NEW */}
          <FAQSection />

          <FinalCTASection />
        </main>

        <Footer />
      </div>

      <style jsx global>{`

/*=====================================================
RESET
=====================================================*/

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  padding: 0;
  background: #f8fbff;
  color: #071735;
  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  transition:
    background 0.3s ease,
    color 0.3s ease;
}

button,
input,
textarea,
select {
  font: inherit;
}

button {
  cursor: pointer;
}

a {
  color: inherit;
  text-decoration: none;
}

img {
  display: block;
}

/*=====================================================
PAGE
=====================================================*/

.page {
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
  background:
    linear-gradient(
      180deg,
      #ffffff 0%,
      #f8fbff 100%
    );
  transition:
    background 0.35s ease,
    color 0.35s ease;
}

/*=====================================================
NAVBAR
=====================================================*/

.navbar-wrap {
  width: 100%;
  position: relative;
  z-index: 100;
  background: rgba(255,255,255,.97);
  border-bottom: 1px solid #e4ebf5;
  transition:
    background .3s ease,
    border-color .3s ease;
}

.navbar {
  width: 100%;
  min-height: 72px;
  padding: 0 42px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 22px;
  background: rgba(255,255,255,.96);
  transition: background .3s ease;
}

.brand {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 9px;
}

.brand-logo {
  width: 46px;
  height: 56px;
  object-fit: contain;
}

.brand-name {
  font-size: 23px;
  line-height: 1;
  font-weight: 750;
  letter-spacing: -.8px;
  color: #091a3b;
  white-space: nowrap;
}

.brand-name span {
  color: #145bea;
}

.nav-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
  margin-left: auto;
  margin-right: auto;
}

.nav-links a {
  font-size: 14px;
  font-weight: 500;
  color: #071735;
  transition: color .2s ease;
  white-space: nowrap;
}

.nav-links a:hover {
  color: #145bea;
}

.nav-links .pro-button {
  margin-left: 14px;
  padding: 7px 14px;
  border-radius: 7px;
  background: #145bea;
  color: #ffffff !important;
  font-size: 12px !important;
  font-weight: 700 !important;
  line-height: 1;
  white-space: nowrap;
  border: 1px solid #145bea;
  box-shadow: 0 4px 10px rgba(20,91,234,.14);
  transition:
    background .2s ease,
    border-color .2s ease,
    transform .2s ease;
}

.nav-links .pro-button:hover {
  background: #0d4fd4;
  border-color: #0d4fd4;
  color: #ffffff !important;
  transform: translateY(-1px);
}

/*=====================================================
NAV ACTIONS
=====================================================*/

.nav-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.search-button,
.login-button,
.signup-button {
  height: 38px;
  border-radius: 9px;
  background: white;
  border: 1px solid #cbd9ee;
  color: #071735;
  transition:
    background .25s ease,
    color .25s ease,
    border-color .25s ease,
    transform .2s ease;
}

.search-button:hover,
.login-button:hover,
.signup-button:hover {
  transform: translateY(-1px);
}

.search-button {
  width: 38px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-icon {
  width: 14px;
  height: 14px;
  border: 1.8px solid #071735;
  border-radius: 50%;
  position: relative;
}

.search-icon::after {
  content: "";
  position: absolute;
  width: 6px;
  height: 1.8px;
  background: #071735;
  transform: rotate(45deg);
  right: -5px;
  bottom: -2px;
  border-radius: 2px;
}

.login-button {
  min-width: 75px;
  padding: 0 13px;
  font-size: 12px;
  font-weight: 600;
}

.signup-button {
  min-width: 82px;
  padding: 0 15px;
  color: white;
  background: #115bea;
  border-color: #115bea;
  font-size: 12px;
  font-weight: 650;
  box-shadow: 0 5px 14px rgba(17,91,234,.16);
}

/*=====================================================
THEME SWITCH
=====================================================*/

.theme-switch {
  position: relative;
  width: 42px;
  height: 23px;
  padding: 0;
  border: 1px solid #b9cbe3;
  border-radius: 999px;
  background: #e5edf8;
  flex-shrink: 0;
  transition:
    background .25s ease,
    border-color .25s ease;
}

.theme-switch-knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 1px 4px rgba(7,23,53,.22);
  transition:
    transform .25s ease,
    background .25s ease;
}

.theme-switch.active {
  background: #145bea;
  border-color: #145bea;
}

.theme-switch.active .theme-switch-knob {
  transform: translateX(19px);
  background: #ffffff;
}

/*=====================================================
HERO
=====================================================*/

.hero {
  position: relative;
  width: 100vw;
  min-height: 460px;
  margin-left: calc(50% - 50vw);
  overflow: hidden;
  background: #eef4fb;
}

.hero-background {
  position: absolute;
  inset: 0;
  z-index: 0;
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  transform: scale(1.015);
}

.hero-left-fade {
  position: absolute;
  z-index: 1;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(
      90deg,
      rgba(255,255,255,.99) 0%,
      rgba(255,255,255,.96) 22%,
      rgba(255,255,255,.78) 38%,
      rgba(255,255,255,.20) 56%,
      rgba(255,255,255,0) 72%
    );
}

.hero-bottom-fade {
  position: absolute;
  z-index: 1;
  left: 0;
  right: 0;
  bottom: 0;
  height: 75px;
  background:
    linear-gradient(
      180deg,
      rgba(255,255,255,0),
      rgba(255,255,255,.78)
    );
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 5;
  width: 100%;
  min-height: 460px;
  padding: 58px 50px 42px;
}

.hero-copy {
  width: 52%;
  max-width: 730px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 9px 17px;
  border-radius: 999px;
  border: 1px solid #bdd5ff;
  background: rgba(255,255,255,.73);
  color: #075be9;
  font-size: 14px;
  font-weight: 650;
  margin-bottom: 23px;
  backdrop-filter: blur(8px);
}

.anchor {
  font-size: 17px;
}

.hero h1 {
  margin: 0;
  color: #061735;
  font-size: clamp(48px,4.2vw,66px);
  line-height: .98;
  font-weight: 800;
  letter-spacing: -3px;
}

.hero h1 span {
  color: #145bea;
}

.hero-description {
  margin: 24px 0 27px;
  color: #31527f;
  font-size: 18px;
  line-height: 1.55;
  font-weight: 450;
}

.hero-buttons {
  display: flex;
  align-items: center;
  gap: 15px;
}

.primary-button,
.secondary-button {
  height: 50px;
  padding: 0 24px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 22px;
  font-size: 14px;
  font-weight: 700;
  transition:
    transform .2s ease,
    box-shadow .2s ease;
}

.primary-button:hover,
.secondary-button:hover {
  transform: translateY(-1px);
}

.primary-button {
  color: white;
  border: 1px solid #145bea;
  background: #145bea;
  box-shadow: 0 8px 18px rgba(20,91,234,.18);
}

.secondary-button {
  color: #145bea;
  border: 1px solid #145bea;
  background: rgba(255,255,255,.72);
}

.arrow {
  font-size: 21px;
  line-height: 1;
}

.learners {
  margin-top: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #31527f;
  font-size: 13px;
}

.learners strong {
  color: #145bea;
}

.avatar-group {
  display: flex;
  align-items: center;
}

.avatar {
  width: 29px;
  height: 29px;
  border-radius: 50%;
  background: white;
  border: 2px solid white;
  box-shadow: 0 1px 5px rgba(0,0,0,.12);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: -4px;
  font-size: 15px;
}

.avatar:first-child {
  margin-left: 0;
}

.hero-progress-card,
.hero-streak-card {
  position: absolute;
  z-index: 8;
  right: 50px;
  width: 210px;
  border-radius: 15px;
  background: rgba(255,255,255,.89);
  border: 1px solid rgba(255,255,255,.88);
  box-shadow: 0 10px 25px rgba(31,67,113,.10);
  backdrop-filter: blur(10px);
}

.hero-progress-card {
  top: 34px;
  min-height: 145px;
  padding: 21px;
}

.hero-streak-card {
  bottom: 28px;
  min-height: 118px;
  padding: 21px;
}

.hero-progress-card h3,
.hero-streak-card h3 {
  margin: 0;
  color: #071735;
  font-size: 14px;
  font-weight: 750;
}

.hero-progress-card h3 {
  color: #145bea;
}

.hero-progress-card p {
  margin: 9px 0 14px;
  color: #506b92;
  font-size: 12px;
}

.card-divider {
  width: 100%;
  height: 1px;
  background: #d8e1ed;
}

.progress-empty,
.streak-empty {
  min-height: 35px;
}

/*=====================================================
TECHNOLOGY
=====================================================*/

.technology-section {
  position: relative;
  z-index: 20;
  width: 100%;
  padding: 10px 50px 9px;
  background: #f8fbff;
}

.technology-container {
  width: 100%;
  display: flex;
  align-items: stretch;
  gap: 10px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 1px 0 6px;
  scrollbar-width: thin;
  scrollbar-color: #b9c9de transparent;
}

.technology-container::-webkit-scrollbar {
  height: 5px;
}

.technology-container::-webkit-scrollbar-track {
  background: transparent;
}

.technology-container::-webkit-scrollbar-thumb {
  background: #c6d3e4;
  border-radius: 99px;
}

.technology-tile {
  flex: 1 0 130px;
  min-width: 130px;
  height: 60px;
  padding: 0 17px;
  border: 1px solid #d8e3f1;
  border-radius: 10px;
  background: rgba(255,255,255,.96);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 2px 8px rgba(31,67,113,.035);
}

.technology-icon-box {
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tech-icon {
  object-fit: contain;
  width: auto;
  height: auto;
  max-width: 34px;
  max-height: 34px;
}

.technology-tile span {
  font-size: 13px;
  font-weight: 600;
  color: #101d35;
  white-space: nowrap;
}

/*=====================================================
STATS
=====================================================*/

.stats-section {
  width: 100%;
  padding: 8px 50px 4px;
  background: #f8fbff;
}

.stats-container {
  width: 100%;
  min-height: 112px;
  border: 1px solid #dce6f2;
  border-radius: 15px;
  background: rgba(255,255,255,.98);
  display: grid;
  grid-template-columns: repeat(4,1fr);
  box-shadow: 0 4px 14px rgba(31,67,113,.035);
}

.stat-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 17px;
  padding: 18px 30px;
}

.stat-item:not(:last-child)::after {
  content: "";
  position: absolute;
  right: 0;
  top: 20%;
  bottom: 20%;
  width: 1px;
  background: #dbe5f1;
}

.stat-icon {
  width: 49px;
  height: 49px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  flex-shrink: 0;
}

.stat-icon.blue {
  background: #edf4ff;
  color: #145bea;
}

.stat-icon.green {
  background: #eefaf3;
  color: #17a357;
}

.stat-icon.purple {
  background: #f4edff;
  color: #7139d7;
}

.stat-icon.orange {
  background: #fff5e8;
  color: #f39a18;
}

.stat-number {
  font-size: 22px;
  line-height: 1.05;
  font-weight: 750;
  letter-spacing: -.4px;
}

.stat-number.blue {
  color: #145bea;
}

.stat-number.green {
  color: #13a052;
}

.stat-number.purple {
  color: #6d35d5;
}

.stat-number.orange {
  color: #f18d00;
}

.stat-title {
  margin-top: 4px;
  color: #08172f;
  font-size: 12px;
  font-weight: 700;
}

.stat-subtitle {
  margin-top: 4px;
  color: #52709a;
  font-size: 10px;
}

/*=====================================================
ROADMAPS
=====================================================*/

.roadmaps-section {
  width: 100%;
  padding: 10px 50px 35px;
  background: #f8fbff;
}

.roadmaps-heading {
  position: relative;
  text-align: center;
  padding: 0 0 13px;
}

.learn-your-way {
  margin-bottom: 4px;
  color: #145bea;
  font-size: 9px;
  line-height: 1;
  font-weight: 800;
  letter-spacing: 1.5px;
}

.roadmaps-heading h2 {
  margin: 0;
  color: #071735;
  font-size: 25px;
  line-height: 1.15;
  font-weight: 780;
  letter-spacing: -.7px;
}

.roadmaps-heading h2 span {
  color: #145bea;
}

.roadmaps-heading > p {
  margin: 5px 0 0;
  color: #5c7699;
  font-size: 12px;
}

.all-roadmaps-link {
  position: absolute;
  right: 0;
  bottom: 15px;
  color: #145bea;
  font-size: 11px;
  font-weight: 650;
  display: flex;
  align-items: center;
  gap: 7px;
}

.roadmap-grid,
.more-roadmaps {
  display: grid;
  grid-template-columns: repeat(4,minmax(0,1fr));
  gap: 12px;
}

.more-roadmaps {
  margin-top: 12px;
}

.roadmap-card {
  min-width: 0;
  min-height: 165px;
  padding: 14px;
  border-radius: 11px;
  border: 1px solid #d9e4f1;
  background: white;
  box-shadow: 0 3px 9px rgba(31,67,113,.025);
  transition:
    transform .2s ease,
    box-shadow .2s ease;
}

.roadmap-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(31,67,113,.08);
}

.roadmap-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.roadmap-icon {
  width: 45px;
  height: 45px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.python-bg {
  background: #eef5ff;
}

.backend-bg {
  background: #effaf1;
}

.frontend-bg {
  background: #edfaff;
}

.cloud-bg {
  background: #fff5e9;
}

.java-bg {
  background: #fff2eb;
}

.devops-bg {
  background: #edf3ff;
}

.data-bg {
  background: #edf6fb;
}

.typescript-bg {
  background: #edf4ff;
}

.roadmap-arrow {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid #d4e1f0;
  background: white;
  color: #145bea;
  font-size: 17px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.roadmap-card h3 {
  margin: 12px 0 5px;
  color: #091832;
  font-size: 14px;
  font-weight: 750;
  letter-spacing: -.2px;
}

.roadmap-card p {
  min-height: 30px;
  margin: 0;
  color: #55739b;
  font-size: 10px;
  line-height: 1.45;
}

.roadmap-meta {
  margin-top: 14px;
  display: flex;
  align-items: center;
  gap: 22px;
  color: #4f6e97;
  font-size: 9px;
}

.roadmap-meta span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
}

.roadmap-meta b {
  color: #145bea;
  font-size: 11px;
}

.view-all-button {
  margin: 14px auto 0;
  height: 39px;
  padding: 0 22px;
  border-radius: 9px;
  border: 1px solid #bfd2ee;
  background: white;
  color: #145bea;
  display: flex;
  align-items: center;
  gap: 13px;
  font-size: 11px;
  font-weight: 700;
}

/*=====================================================
SHARED NEW SECTION STYLES
=====================================================*/

.section-label {
  color: #145bea;
  font-size: 9px;
  line-height: 1;
  letter-spacing: 1.5px;
  font-weight: 800;
  margin-bottom: 6px;
}

/*=====================================================
FEATURED PROJECTS
=====================================================*/

.projects-section {
  width: 100%;
  padding: 58px 50px 62px;
  background: white;
  border-top: 1px solid #e5ecf5;
}

.projects-container {
  max-width: 1250px;
  margin: 0 auto;
}

.projects-heading {
  position: relative;
  text-align: center;
  max-width: 700px;
  margin: 0 auto 28px;
}

.projects-heading h2 {
  margin: 0;
  color: #071735;
  font-size: 28px;
  line-height: 1.15;
  font-weight: 780;
  letter-spacing: -.8px;
}

.projects-heading h2 span {
  color: #145bea;
}

.projects-heading p {
  margin: 7px 0 0;
  color: #5c7699;
  font-size: 12px;
  line-height: 1.55;
}

.section-link {
  display: inline-flex;
  margin-top: 10px;
  color: #145bea;
  font-size: 11px;
  font-weight: 700;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(4,minmax(0,1fr));
  gap: 14px;
}

.project-card {
  min-height: 280px;
  padding: 17px;
  border: 1px solid #d9e4f1;
  border-radius: 13px;
  background: #fbfdff;
  box-shadow: 0 3px 10px rgba(31,67,113,.035);
  transition:
    transform .2s ease,
    box-shadow .2s ease;
}

.project-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 24px rgba(31,67,113,.08);
}

.project-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.project-icon {
  width: 45px;
  height: 45px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 800;
}

.project-icon.blue {
  background: #edf4ff;
  color: #145bea;
}

.project-icon.green {
  background: #ecfaf2;
  color: #159a52;
}

.project-icon.purple {
  background: #f3edff;
  color: #7139d7;
}

.project-icon.orange {
  background: #fff4e7;
  color: #e98900;
}

.project-difficulty {
  padding: 5px 8px;
  border-radius: 999px;
  background: #f0f5fc;
  color: #55739b;
  font-size: 8px;
  font-weight: 700;
}

.project-category {
  margin-top: 16px;
  color: #145bea;
  font-size: 9px;
  font-weight: 750;
  letter-spacing: .3px;
}

.project-card h3 {
  margin: 7px 0 6px;
  color: #091832;
  font-size: 15px;
  font-weight: 750;
}

.project-card > p {
  min-height: 57px;
  margin: 0;
  color: #607a9d;
  font-size: 10px;
  line-height: 1.5;
}

.project-tech {
  margin-top: 14px;
  display: flex;
  align-items: center;
  gap: 9px;
  min-height: 24px;
}

.project-tech .tech-icon {
  max-width: 21px;
  max-height: 21px;
}

.project-button {
  width: 100%;
  height: 35px;
  margin-top: 14px;
  border-radius: 8px;
  border: 1px solid #c6d8ef;
  background: white;
  color: #145bea;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  font-size: 10px;
  font-weight: 700;
}

.project-button .arrow {
  font-size: 16px;
}

/*=====================================================
WHY HACKERSHARBOR
=====================================================*/

.why-section {
  width: 100%;
  padding: 65px 50px;
  background: #f8fbff;
}

.why-container {
  max-width: 1250px;
  margin: 0 auto;
}

.why-heading {
  text-align: center;
  max-width: 720px;
  margin: 0 auto 30px;
}

.why-heading h2 {
  margin: 0;
  color: #071735;
  font-size: 29px;
  line-height: 1.12;
  font-weight: 800;
  letter-spacing: -1px;
}

.why-heading h2 span {
  color: #145bea;
}

.why-heading p {
  margin: 9px auto 0;
  color: #5c7699;
  font-size: 12px;
  line-height: 1.6;
  max-width: 600px;
}

.why-grid {
  display: grid;
  grid-template-columns: repeat(4,1fr);
  gap: 11px;
}

.why-card {
  min-height: 190px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #d9e4f1;
  background: white;
  box-shadow: 0 3px 10px rgba(31,67,113,.03);
  transition:
    transform .2s ease,
    box-shadow .2s ease;
}

.why-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 22px rgba(31,67,113,.07);
}

.why-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.why-number {
  color: #b2c3d9;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1px;
}

.why-card h3 {
  margin: 24px 0 7px;
  color: #091832;
  font-size: 14px;
  font-weight: 750;
}

.why-card p {
  margin: 0;
  color: #607a9d;
  font-size: 10px;
  line-height: 1.6;
}

/*=====================================================
CAREER JOURNEY
=====================================================*/

.career-section {
  width: 100%;
  padding: 65px 50px;
  background: white;
}

.career-container {
  max-width: 1250px;
  margin: 0 auto;
}

.career-heading {
  text-align: center;
  max-width: 700px;
  margin: 0 auto 38px;
}

.career-heading h2 {
  margin: 0;
  color: #071735;
  font-size: 29px;
  line-height: 1.15;
  font-weight: 800;
  letter-spacing: -.9px;
}

.career-heading h2 span {
  color: #145bea;
}

.career-heading p {
  margin: 8px 0 0;
  color: #5c7699;
  font-size: 12px;
}

.career-journey {
  display: grid;
  grid-template-columns: repeat(4,1fr);
  gap: 12px;
}

.career-step {
  min-height: 160px;
  padding: 18px;
  border: 1px solid #d9e4f1;
  border-radius: 12px;
  background: #fbfdff;
}

.career-step-number {
  color: #145bea;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 1.3px;
}

.career-step h3 {
  margin: 12px 0 5px;
  color: #091832;
  font-size: 15px;
  font-weight: 750;
}

.career-step p {
  margin: 0;
  color: #607a9d;
  font-size: 10px;
  line-height: 1.55;
}

/*=====================================================
TESTIMONIALS — NEW
=====================================================*/

.testimonials-section {
  width: 100%;
  padding: 72px 50px;
  background: #f8fbff;
  border-top: 1px solid #e5ecf5;
}

.testimonials-container {
  max-width: 1250px;
  margin: 0 auto;
}

.testimonials-heading {
  text-align: center;
  max-width: 700px;
  margin: 0 auto 32px;
}

.testimonials-heading h2 {
  margin: 0;
  color: #071735;
  font-size: 30px;
  line-height: 1.12;
  font-weight: 800;
  letter-spacing: -1px;
}

.testimonials-heading h2 span {
  color: #145bea;
}

.testimonials-heading p {
  margin: 9px auto 0;
  color: #5c7699;
  font-size: 12px;
  line-height: 1.6;
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(3,1fr);
  gap: 15px;
}

.testimonial-card {
  position: relative;
  min-height: 270px;
  padding: 24px;
  border: 1px solid #d9e4f1;
  border-radius: 14px;
  background: white;
  box-shadow: 0 4px 12px rgba(31,67,113,.035);
  transition:
    transform .2s ease,
    box-shadow .2s ease;
}

.testimonial-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 26px rgba(31,67,113,.08);
}

.testimonial-mark {
  color: #145bea;
  font-family: Georgia, serif;
  font-size: 43px;
  line-height: .7;
  margin-bottom: 12px;
}

.testimonial-quote {
  min-height: 96px;
  margin: 0;
  color: #304d74;
  font-size: 12px;
  line-height: 1.7;
}

.testimonial-divider {
  height: 1px;
  background: #e2eaf4;
  margin: 20px 0 16px;
}

.testimonial-person {
  display: flex;
  align-items: center;
  gap: 11px;
}

.testimonial-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #edf4ff;
  color: #145bea;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 800;
}

.testimonial-person h3 {
  margin: 0 0 3px;
  color: #091832;
  font-size: 12px;
  font-weight: 750;
}

.testimonial-person p {
  margin: 0;
  color: #6a82a3;
  font-size: 9px;
}

.testimonial-company {
  position: absolute;
  right: 22px;
  bottom: 22px;
  color: #145bea;
  font-size: 9px;
  font-weight: 750;
}

/*=====================================================
NAVIGATOR AI — NEW
=====================================================*/

.navigator-section {
  width: 100%;
  padding: 78px 50px;
  background: white;
}

.navigator-container {
  max-width: 1250px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: .85fr 1.15fr;
  align-items: center;
  gap: 70px;
}

.navigator-copy {
  max-width: 510px;
}

.navigator-copy h2 {
  margin: 0;
  color: #071735;
  font-size: 34px;
  line-height: 1.1;
  font-weight: 800;
  letter-spacing: -1.2px;
}

.navigator-copy > p {
  margin: 16px 0 24px;
  color: #5c7699;
  font-size: 13px;
  line-height: 1.7;
}

.navigator-points {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.navigator-points > div {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #304d74;
  font-size: 11px;
  font-weight: 600;
}

.navigator-point-number {
  color: #145bea;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1px;
}

.navigator-demo {
  width: 100%;
}

.navigator-window {
  width: 100%;
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid #cfdeef;
  background: #f8fbff;
  box-shadow: 0 18px 45px rgba(31,67,113,.10);
}

.navigator-window-header {
  min-height: 66px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  border-bottom: 1px solid #dfe8f3;
}

.navigator-window-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.navigator-logo {
  width: 37px;
  height: 37px;
  border-radius: 10px;
  background: #145bea;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 800;
}

.navigator-window-title strong {
  display: block;
  color: #091832;
  font-size: 12px;
}

.navigator-window-title span {
  display: block;
  margin-top: 2px;
  color: #7890af;
  font-size: 8px;
}

.navigator-status {
  padding: 5px 9px;
  border-radius: 999px;
  background: #ecfaf2;
  color: #159a52;
  font-size: 8px;
  font-weight: 700;
}

.navigator-chat {
  min-height: 300px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.navigator-message {
  max-width: 80%;
  padding: 12px 14px;
  border-radius: 11px;
}

.navigator-message p {
  margin: 0;
  font-size: 10px;
  line-height: 1.55;
}

.navigator-message-ai {
  align-self: flex-start;
  background: white;
  border: 1px solid #dce6f2;
  color: #304d74;
}

.navigator-message-user {
  align-self: flex-end;
  background: #145bea;
  color: white;
}

.navigator-message-label {
  display: block;
  margin-bottom: 5px;
  color: #145bea;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: .5px;
}

.navigator-roadmap-preview {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.navigator-roadmap-preview div {
  padding: 7px 8px;
  border-radius: 7px;
  background: #f1f6fd;
  color: #304d74;
  font-size: 8px;
  font-weight: 600;
}

.navigator-roadmap-preview span {
  display: inline-block;
  margin-right: 7px;
  color: #145bea;
  font-weight: 800;
}

.navigator-suggestions {
  padding: 0 16px 12px;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.navigator-suggestions button {
  padding: 6px 8px;
  border-radius: 7px;
  border: 1px solid #d5e1ef;
  background: white;
  color: #5b7598;
  font-size: 8px;
}

.navigator-suggestions button:hover {
  color: #145bea;
  border-color: #b9d0f0;
}

.navigator-input {
  padding: 12px;
  display: flex;
  gap: 8px;
  background: white;
  border-top: 1px solid #dfe8f3;
}

.navigator-input input {
  flex: 1;
  height: 38px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid #d4e0ee;
  outline: none;
  color: #304d74;
  font-size: 10px;
}

.navigator-input input:focus {
  border-color: #145bea;
}

.navigator-input button {
  width: 38px;
  height: 38px;
  border: 0;
  border-radius: 8px;
  background: #145bea;
  color: white;
  font-size: 17px;
}

/*=====================================================
PRICING — NEW
=====================================================*/

.pricing-section {
  width: 100%;
  padding: 78px 50px;
  background: #f8fbff;
  border-top: 1px solid #e5ecf5;
}

.pricing-container {
  max-width: 1100px;
  margin: 0 auto;
}

.pricing-heading {
  max-width: 650px;
  text-align: center;
  margin: 0 auto 34px;
}

.pricing-heading h2 {
  margin: 0;
  color: #071735;
  font-size: 31px;
  line-height: 1.12;
  font-weight: 800;
  letter-spacing: -1px;
}

.pricing-heading h2 span {
  color: #145bea;
}

.pricing-heading p {
  margin: 9px auto 0;
  color: #5c7699;
  font-size: 12px;
  line-height: 1.6;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3,1fr);
  gap: 15px;
  align-items: stretch;
}

.pricing-card {
  position: relative;
  border: 1px solid #d8e3f0;
  border-radius: 14px;
  background: white;
  box-shadow: 0 4px 12px rgba(31,67,113,.035);
}

.pricing-card-featured {
  border-color: #145bea;
  box-shadow:
    0 10px 30px rgba(20,91,234,.13);
  transform: translateY(-5px);
}

.pricing-popular {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translate(-50%,-50%);
  padding: 5px 10px;
  border-radius: 999px;
  background: #145bea;
  color: white;
  font-size: 7px;
  font-weight: 800;
  letter-spacing: .8px;
  white-space: nowrap;
}

.pricing-card-inner {
  padding: 26px 22px 22px;
}

.pricing-card h3 {
  margin: 0;
  color: #091832;
  font-size: 16px;
  font-weight: 750;
}

.pricing-price {
  margin-top: 15px;
  display: flex;
  align-items: baseline;
  gap: 7px;
}

.pricing-price strong {
  color: #071735;
  font-size: 28px;
  line-height: 1;
  font-weight: 800;
  letter-spacing: -1px;
}

.pricing-price span {
  color: #7188a6;
  font-size: 9px;
}

.pricing-description {
  min-height: 48px;
  margin: 11px 0 0;
  color: #607a9d;
  font-size: 10px;
  line-height: 1.55;
}

.pricing-divider {
  height: 1px;
  margin: 18px 0;
  background: #e2eaf4;
}

.pricing-features {
  min-height: 142px;
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pricing-features li {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #415c7f;
  font-size: 10px;
}

.pricing-check {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #edf4ff;
  color: #145bea;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 800;
}

.pricing-button {
  width: 100%;
  height: 40px;
  margin-top: 20px;
  border-radius: 8px;
  border: 1px solid #c9d9eb;
  background: white;
  color: #145bea;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 10px;
  font-weight: 750;
}

.pricing-button-primary {
  background: #145bea;
  border-color: #145bea;
  color: white;
}

/*=====================================================
COMMUNITY
=====================================================*/

.community-section {
  width: 100%;
  padding: 50px 50px 60px;
  background: white;
  border-top: 1px solid #e5ecf5;
}

.community-container {
  max-width: 1250px;
  margin: 0 auto;
}

.community-heading {
  text-align: center;
  max-width: 700px;
  margin: 0 auto;
}

.community-label {
  color: #145bea;
  font-size: 9px;
  line-height: 1;
  letter-spacing: 1.5px;
  font-weight: 800;
  margin-bottom: 4px;
}

.community-heading h2 {
  margin: 0;
  font-size: 25px;
  line-height: 1.15;
  letter-spacing: -.7px;
  font-weight: 780;
  color: #071735;
}

.community-heading p {
  margin: 5px 0 0;
  color: #5c7699;
  font-size: 12px;
  line-height: 1.55;
  font-weight: 450;
}

.community-stats {
  margin-top: 25px;
  display: grid;
  grid-template-columns: repeat(5,1fr);
  border: 1px solid #dce6f2;
  border-radius: 12px;
  overflow: hidden;
  background: white;
}

.community-stats > div {
  padding: 15px;
  text-align: center;
  border-right: 1px solid #dce6f2;
}

.community-stats > div:last-child {
  border-right: 0;
}

.community-stats span {
  display: block;
  color: #5a7395;
  font-size: 9px;
  margin-bottom: 6px;
}

.community-stats strong {
  display: block;
  min-height: 16px;
}

.community-grid {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(3,1fr);
  gap: 12px;
}

.community-card {
  min-height: 92px;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 13px;
  border-radius: 11px;
  border: 1px solid #dce6f2;
  background: white;
}

.community-icon {
  width: 43px;
  height: 43px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 21px;
  flex-shrink: 0;
}

.community-card.green .community-icon {
  background: #ecfaf1;
}

.community-card.blue .community-icon {
  background: #edf4ff;
}

.community-card.cyan .community-icon {
  background: #eafaff;
}

.community-card.purple .community-icon {
  background: #f3edff;
}

.community-card.amber .community-icon {
  background: #fff5e6;
}

.community-card.red .community-icon {
  background: #fff0ef;
}

.community-card h3 {
  margin: 0;
  color: #091832;
  font-size: 13px;
  font-weight: 750;
  letter-spacing: -.15px;
}

.community-card p {
  margin: 4px 0 0;
  color: #607a9d;
  font-size: 10px;
}

.community-arrow {
  margin-left: auto;
  color: #145bea;
  font-size: 18px;
}

/*=====================================================
FAQ — NEW
=====================================================*/

.faq-section {
  width: 100%;
  padding: 78px 50px;
  background: #f8fbff;
  border-top: 1px solid #e5ecf5;
}

.faq-container {
  max-width: 850px;
  margin: 0 auto;
}

.faq-heading {
  text-align: center;
  margin-bottom: 32px;
}

.faq-heading h2 {
  margin: 0;
  color: #071735;
  font-size: 31px;
  line-height: 1.12;
  font-weight: 800;
  letter-spacing: -1px;
}

.faq-heading h2 span {
  color: #145bea;
}

.faq-heading p {
  margin: 8px 0 0;
  color: #5c7699;
  font-size: 12px;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.faq-item {
  border: 1px solid #d8e3f0;
  border-radius: 11px;
  background: white;
  overflow: hidden;
  transition:
    border-color .2s ease,
    box-shadow .2s ease;
}

.faq-item-open {
  border-color: #b9d0f0;
  box-shadow: 0 5px 15px rgba(31,67,113,.04);
}

.faq-question {
  width: 100%;
  min-height: 58px;
  padding: 0 17px;
  border: 0;
  background: transparent;
  color: #091832;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;
  font-size: 11px;
  font-weight: 700;
}

.faq-plus {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background: #edf4ff;
  color: #145bea;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 400;
  transition: transform .2s ease;
}

.faq-plus-open {
  transform: rotate(45deg);
}

.faq-answer {
  padding: 0 17px 17px;
}

.faq-answer p {
  max-width: 720px;
  margin: 0;
  color: #607a9d;
  font-size: 10px;
  line-height: 1.7;
}

/*=====================================================
FINAL CTA
=====================================================*/

.final-cta-section {
  position: relative;
  width: 100%;
  min-height: 370px;
  overflow: hidden;
  background:
    linear-gradient(
      135deg,
      #061735 0%,
      #0b2d68 52%,
      #145bea 100%
    );
}

.final-cta-background {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.cta-glow-one,
.cta-glow-two {
  position: absolute;
  border-radius: 50%;
  filter: blur(2px);
}

.cta-glow-one {
  width: 340px;
  height: 340px;
  top: -210px;
  left: 10%;
  background: rgba(80,145,255,.14);
}

.cta-glow-two {
  width: 400px;
  height: 400px;
  right: -170px;
  bottom: -250px;
  background: rgba(111,197,255,.13);
}

.final-cta-content {
  position: relative;
  z-index: 2;
  min-height: 370px;
  padding: 55px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.final-cta-anchor {
  width: 40px;
  height: 40px;
  margin-bottom: 12px;
  border-radius: 50%;
  background: rgba(255,255,255,.1);
  border: 1px solid rgba(255,255,255,.18);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.cta-label {
  color: #8dbaff;
}

.final-cta-content h2 {
  margin: 0;
  color: white;
  font-size: clamp(32px,4vw,47px);
  line-height: 1.05;
  font-weight: 800;
  letter-spacing: -1.8px;
}

.final-cta-content h2 span {
  color: #75adff;
}

.final-cta-content > p {
  max-width: 560px;
  margin: 13px 0 20px;
  color: #c5d8f3;
  font-size: 13px;
  line-height: 1.6;
}

.final-cta-buttons {
  display: flex;
  align-items: center;
  gap: 11px;
}

.cta-primary-button,
.cta-secondary-button {
  height: 44px;
  padding: 0 19px;
  border-radius: 9px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 13px;
  font-size: 11px;
  font-weight: 750;
}

.cta-primary-button {
  color: #145bea;
  background: white;
  border: 1px solid white;
}

.cta-secondary-button {
  color: white;
  background: rgba(255,255,255,.08);
  border: 1px solid rgba(255,255,255,.4);
}

.cta-note {
  margin-top: 13px;
  color: #9eb9df;
  font-size: 9px;
}

/*=====================================================
ENHANCED FOOTER
=====================================================*/

.footer {
  background: #071735;
  color: white;
  padding: 50px 50px 20px;
}

.footer-main {
  max-width: 1250px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 55px;
  padding-bottom: 38px;
}

.footer-brand-column {
  max-width: 300px;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 9px;
}

.footer-brand img {
  width: 42px;
  height: 52px;
  object-fit: contain;
}

.footer-brand > span {
  font-size: 20px;
  font-weight: 750;
}

.footer-brand > span span {
  color: #2c73f4;
}

.footer-tagline {
  margin: 17px 0 4px;
  color: #e4edfb;
  font-size: 12px;
  font-weight: 650;
}

.footer-description {
  margin: 0;
  color: #849bbd;
  font-size: 10px;
  line-height: 1.5;
}

.footer-column {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 9px;
}

.footer-column h3 {
  margin: 4px 0 7px;
  color: white;
  font-size: 12px;
  font-weight: 750;
}

.footer-column a {
  color: #9eb1cc;
  font-size: 10px;
  transition: color .2s ease;
}

.footer-column a:hover {
  color: #62a0ff;
}

.footer-bottom {
  max-width: 1250px;
  margin: 0 auto;
  padding-top: 18px;
  border-top: 1px solid #1d3353;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #738bad;
  font-size: 9px;
}

.footer-bottom-links {
  display: flex;
  align-items: center;
  gap: 20px;
}

.footer-bottom-links a:hover {
  color: #62a0ff;
}

/*=====================================================
DARK MODE
=====================================================*/

.page.dark-mode {
  background:
    linear-gradient(
      180deg,
      #07152d 0%,
      #0a1933 100%
    );
  color: #eef5ff;
}

.dark-mode .navbar-wrap {
  background: rgba(7,21,45,.97);
  border-bottom-color: #1a3154;
}

.dark-mode .navbar {
  background: rgba(7,21,45,.96);
}

.dark-mode .brand-name {
  color: #f1f6ff;
}

.dark-mode .nav-links a {
  color: #d9e7fb;
}

.dark-mode .nav-links a:hover {
  color: #5d96ff;
}

.dark-mode .search-button,
.dark-mode .login-button {
  background: #102442;
  border-color: #294467;
  color: #e5efff;
}

.dark-mode .search-icon {
  border-color: #e5efff;
}

.dark-mode .search-icon::after {
  background: #e5efff;
}

.dark-mode .theme-switch {
  background: #145bea;
  border-color: #145bea;
}

.dark-mode .hero {
  background: #0b1d36;
}

.dark-mode .hero-left-fade {
  background:
    linear-gradient(
      90deg,
      rgba(7,21,45,.99) 0%,
      rgba(7,21,45,.96) 22%,
      rgba(7,21,45,.78) 38%,
      rgba(7,21,45,.25) 56%,
      rgba(7,21,45,0) 72%
    );
}

.dark-mode .hero-bottom-fade {
  background:
    linear-gradient(
      180deg,
      rgba(7,21,45,0),
      rgba(7,21,45,.82)
    );
}

.dark-mode .hero-badge {
  background: rgba(8,27,53,.78);
  border-color: #285795;
  color: #65a0ff;
}

.dark-mode .hero h1 {
  color: #f2f7ff;
}

.dark-mode .hero-description {
  color: #b4c8e3;
}

.dark-mode .secondary-button {
  background: rgba(9,27,52,.78);
  color: #5d96ff;
  border-color: #3978d9;
}

.dark-mode .learners {
  color: #b4c8e3;
}

.dark-mode .hero-progress-card,
.dark-mode .hero-streak-card {
  background: rgba(10,29,55,.88);
  border-color: rgba(64,101,146,.65);
}

.dark-mode .hero-progress-card h3,
.dark-mode .hero-streak-card h3 {
  color: #f1f6ff;
}

.dark-mode .hero-progress-card h3 {
  color: #5d96ff;
}

.dark-mode .hero-progress-card p {
  color: #9eb5d5;
}

.dark-mode .card-divider {
  background: #29415f;
}

.dark-mode .technology-section,
.dark-mode .stats-section,
.dark-mode .roadmaps-section {
  background: #091a32;
}

.dark-mode .technology-tile,
.dark-mode .stats-container,
.dark-mode .roadmap-card,
.dark-mode .view-all-button {
  background: #0d203b;
  border-color: #233e61;
}

.dark-mode .technology-tile span {
  color: #dce9fa;
}

.dark-mode .stats-container {
  box-shadow: 0 4px 14px rgba(0,0,0,.15);
}

.dark-mode .stat-title {
  color: #e4edfa;
}

.dark-mode .stat-subtitle {
  color: #91aaca;
}

.dark-mode .stat-item:not(:last-child)::after {
  background: #29415f;
}

.dark-mode .roadmaps-heading h2 {
  color: #eef5ff;
}

.dark-mode .roadmaps-heading > p {
  color: #9bb1cf;
}

.dark-mode .roadmap-card h3 {
  color: #eaf2ff;
}

.dark-mode .roadmap-card p {
  color: #91aaca;
}

.dark-mode .roadmap-meta {
  color: #8ea8c9;
}

.dark-mode .roadmap-arrow {
  background: #102743;
  border-color: #2b4668;
}

/*=====================================================
DARK MODE — NEW SECTIONS
=====================================================*/

.dark-mode .projects-section,
.dark-mode .career-section,
.dark-mode .navigator-section {
  background: #0a1931;
  border-top-color: #203855;
}

.dark-mode .projects-heading h2,
.dark-mode .why-heading h2,
.dark-mode .career-heading h2,
.dark-mode .testimonials-heading h2,
.dark-mode .navigator-copy h2,
.dark-mode .pricing-heading h2,
.dark-mode .faq-heading h2 {
  color: #eef5ff;
}

.dark-mode .projects-heading p,
.dark-mode .why-heading p,
.dark-mode .career-heading p,
.dark-mode .testimonials-heading p,
.dark-mode .navigator-copy > p,
.dark-mode .pricing-heading p,
.dark-mode .faq-heading p {
  color: #9bb1cf;
}

.dark-mode .project-card,
.dark-mode .why-card,
.dark-mode .career-step,
.dark-mode .testimonial-card {
  background: #0d203b;
  border-color: #263f61;
}

.dark-mode .project-card h3,
.dark-mode .why-card h3,
.dark-mode .career-step h3,
.dark-mode .testimonial-person h3 {
  color: #eaf2ff;
}

.dark-mode .project-card > p,
.dark-mode .why-card p,
.dark-mode .career-step p,
.dark-mode .testimonial-quote {
  color: #91aaca;
}

.dark-mode .project-difficulty {
  background: #102743;
  color: #9bb1cf;
}

.dark-mode .project-button {
  background: #102743;
  border-color: #2b4668;
}

.dark-mode .why-section,
.dark-mode .testimonials-section,
.dark-mode .pricing-section,
.dark-mode .faq-section {
  background: #091a32;
}

.dark-mode .why-number {
  color: #4f6686;
}

.dark-mode .testimonial-divider,
.dark-mode .pricing-divider {
  background: #29415f;
}

.dark-mode .testimonial-person p,
.dark-mode .pricing-description,
.dark-mode .pricing-features li,
.dark-mode .faq-answer p {
  color: #91aaca;
}

.dark-mode .navigator-window {
  background: #0d203b;
  border-color: #294563;
}

.dark-mode .navigator-window-header,
.dark-mode .navigator-input {
  background: #102743;
  border-color: #29415f;
}

.dark-mode .navigator-window-title strong {
  color: #eaf2ff;
}

.dark-mode .navigator-window-title span {
  color: #8fa8c9;
}

.dark-mode .navigator-message-ai {
  background: #102743;
  border-color: #294563;
  color: #b9cbe2;
}

.dark-mode .navigator-message-user {
  background: #145bea;
}

.dark-mode .navigator-roadmap-preview div {
  background: #0d203b;
  color: #a9bed8;
}

.dark-mode .navigator-suggestions button {
  background: #102743;
  border-color: #294563;
  color: #91aaca;
}

.dark-mode .navigator-input input {
  background: #0d203b;
  border-color: #294563;
  color: #eaf2ff;
}

.dark-mode .pricing-card {
  background: #0d203b;
  border-color: #294563;
}

.dark-mode .pricing-card h3,
.dark-mode .pricing-price strong {
  color: #eef5ff;
}

.dark-mode .pricing-price span {
  color: #8fa8c9;
}

.dark-mode .pricing-check {
  background: #102743;
}

.dark-mode .pricing-button {
  background: #102743;
  border-color: #294563;
}

.dark-mode .pricing-button-primary {
  background: #145bea;
  border-color: #145bea;
  color: white;
}

.dark-mode .faq-item {
  background: #0d203b;
  border-color: #294563;
}

.dark-mode .faq-question {
  color: #eaf2ff;
}

.dark-mode .faq-plus {
  background: #102743;
}

.dark-mode .community-section {
  background: #0a1931;
  border-top-color: #203855;
}

.dark-mode .community-heading h2 {
  color: #eef5ff;
}

.dark-mode .community-heading p {
  color: #9bb1cf;
}

.dark-mode .community-stats,
.dark-mode .community-card {
  background: #0d203b;
  border-color: #263f61;
}

.dark-mode .community-stats > div {
  border-right-color: #263f61;
}

.dark-mode .community-stats span {
  color: #93a9c5;
}

.dark-mode .community-card h3 {
  color: #eaf2ff;
}

.dark-mode .community-card p {
  color: #91aaca;
}

/*=====================================================
RESPONSIVE
=====================================================*/

@media (max-width: 1200px) {

  .navbar {
    padding: 0 28px;
  }

  .nav-links {
    gap: 22px;
  }

  .nav-links .pro-button {
    margin-left: 12px;
  }

  .hero-content {
    padding-left: 35px;
    padding-right: 35px;
  }

  .hero-progress-card,
  .hero-streak-card {
    right: 30px;
  }

  .technology-section,
  .stats-section,
  .roadmaps-section {
    padding-left: 30px;
    padding-right: 30px;
  }

  .hero h1 {
    font-size: 52px;
  }

  .projects-section,
  .why-section,
  .career-section,
  .testimonials-section,
  .navigator-section,
  .pricing-section,
  .faq-section {
    padding-left: 30px;
    padding-right: 30px;
  }

  .footer {
    padding-left: 30px;
    padding-right: 30px;
  }
}

@media (max-width: 980px) {

  .nav-links {
    display: none;
  }

  .hero {
    min-height: 540px;
  }

  .hero-content {
    min-height: 540px;
  }

  .hero-copy {
    width: 65%;
  }

  .hero-progress-card {
    right: 25px;
    width: 190px;
  }

  .hero-streak-card {
    right: 25px;
    width: 190px;
  }

  .stats-container {
    grid-template-columns: repeat(2,1fr);
  }

  .stat-item:nth-child(2)::after {
    display: none;
  }

  .roadmap-grid,
  .more-roadmaps {
    grid-template-columns: repeat(2,1fr);
  }

  .projects-grid {
    grid-template-columns: repeat(2,1fr);
  }

  .why-grid {
    grid-template-columns: repeat(2,1fr);
  }

  .career-journey {
    grid-template-columns: repeat(2,1fr);
  }

  .testimonials-grid {
    grid-template-columns: repeat(2,1fr);
  }

  .testimonial-card:last-child {
    grid-column: 1 / -1;
  }

  .navigator-container {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .navigator-copy {
    max-width: 700px;
    margin: 0 auto;
    text-align: center;
  }

  .navigator-points {
    align-items: center;
  }

  .pricing-grid {
    grid-template-columns: repeat(2,1fr);
  }

  .pricing-card:last-child {
    grid-column: 1 / -1;
    max-width: 50%;
    width: 100%;
    margin: 0 auto;
  }

  .footer-main {
    grid-template-columns: 2fr 1fr 1fr;
  }

  .footer-brand-column {
    grid-row: span 2;
  }
}

@media (max-width: 700px) {

  .navbar {
    min-height: 66px;
    padding: 0 16px;
    gap: 8px;
  }

  .brand-logo {
    width: 38px;
    height: 48px;
  }

  .brand-name {
    font-size: 20px;
  }

  .nav-actions {
    gap: 6px;
  }

  .search-button {
    width: 34px;
    height: 34px;
  }

  .theme-switch {
    width: 38px;
    height: 21px;
  }

  .theme-switch-knob {
    width: 13px;
    height: 13px;
  }

  .theme-switch.active .theme-switch-knob {
    transform: translateX(17px);
  }

  .login-button {
    display: none;
  }

  .signup-button {
    min-width: 76px;
    height: 34px;
    padding: 0 12px;
    font-size: 11px;
  }

  .hero {
    min-height: 660px;
  }

  .hero-content {
    min-height: 660px;
    padding: 35px 20px;
  }

  .hero-background {
    background-position: 65% center;
  }

  .hero-left-fade {
    background:
      linear-gradient(
        180deg,
        rgba(255,255,255,.97) 0%,
        rgba(255,255,255,.92) 46%,
        rgba(255,255,255,.25) 80%,
        rgba(255,255,255,0) 100%
      );
  }

  .dark-mode .hero-left-fade {
    background:
      linear-gradient(
        180deg,
        rgba(7,21,45,.97) 0%,
        rgba(7,21,45,.92) 46%,
        rgba(7,21,45,.25) 80%,
        rgba(7,21,45,0) 100%
      );
  }

  .hero-copy {
    width: 100%;
    max-width: 100%;
  }

  .hero h1 {
    font-size: 46px;
    letter-spacing: -2.5px;
  }

  .hero-description {
    font-size: 16px;
  }

  .hero-progress-card,
  .hero-streak-card {
    display: none;
  }

  .learners {
    flex-wrap: wrap;
  }

  .technology-section,
  .stats-section,
  .roadmaps-section,
  .community-section,
  .projects-section,
  .why-section,
  .career-section,
  .testimonials-section,
  .navigator-section,
  .pricing-section,
  .faq-section {
    padding-left: 16px;
    padding-right: 16px;
  }

  .technology-tile {
    flex: 0 0 145px;
  }

  .stats-container {
    grid-template-columns: 1fr;
  }

  .stat-item {
    border-bottom: 1px solid #dbe5f1;
  }

  .dark-mode .stat-item {
    border-bottom-color: #29415f;
  }

  .stat-item::after {
    display: none;
  }

  .stat-item:last-child {
    border-bottom: 0;
  }

  .roadmap-grid,
  .more-roadmaps {
    grid-template-columns: 1fr;
  }

  .all-roadmaps-link {
    position: static;
    justify-content: center;
    margin-top: 12px;
  }

  .projects-grid,
  .why-grid {
    grid-template-columns: 1fr;
  }

  .project-card {
    min-height: auto;
  }

  .career-journey {
    grid-template-columns: 1fr;
  }

  .testimonials-grid {
    grid-template-columns: 1fr;
  }

  .testimonial-card:last-child {
    grid-column: auto;
  }

  .navigator-copy {
    text-align: left;
  }

  .navigator-points {
    align-items: flex-start;
  }

  .navigator-copy h2 {
    font-size: 29px;
  }

  .navigator-chat {
    min-height: 270px;
    padding: 15px;
  }

  .navigator-message {
    max-width: 90%;
  }

  .pricing-grid {
    grid-template-columns: 1fr;
  }

  .pricing-card-featured {
    transform: none;
  }

  .pricing-card:last-child {
    grid-column: auto;
    max-width: none;
  }

  .community-stats {
    grid-template-columns: 1fr 1fr;
  }

  .community-stats > div {
    border-bottom: 1px solid #dce6f2;
  }

  .dark-mode .community-stats > div {
    border-bottom-color: #263f61;
  }

  .community-grid {
    grid-template-columns: 1fr;
  }

  .final-cta-section,
  .final-cta-content {
    min-height: 400px;
  }

  .final-cta-content {
    padding-left: 20px;
    padding-right: 20px;
  }

  .final-cta-content h2 {
    font-size: 35px;
  }

  .final-cta-buttons {
    flex-direction: column;
    width: 100%;
    max-width: 280px;
  }

  .cta-primary-button,
  .cta-secondary-button {
    width: 100%;
  }

  .footer {
    padding: 40px 20px 18px;
  }

  .footer-main {
    grid-template-columns: 1fr 1fr;
    gap: 35px 25px;
  }

  .footer-brand-column {
    grid-column: 1 / -1;
    grid-row: auto;
  }

  .footer-bottom {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}

      `}</style>
    </>
  );
}