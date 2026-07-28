import type { IconType } from "react-icons";
import { FiFileText, FiGithub, FiLinkedin, FiMail } from "react-icons/fi";

export const profile = {
  name: "Steven Wilcox",
  role: "Physicist | Mathematician | ML Research Scientist",
  location: "United States",
  email: "hello@example.com",
  summary:
    "Physicist and mathematician turned machine learning research scientist with over 8 years of work experience in data science, enterprise machine learning engineering, and product development.",
  links: [
    { label: "Email", href: "/contact", Icon: FiMail },
    { label: "GitHub", href: "https://github.com/workbench-a", Icon: FiGithub },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/steven-wilcox-0002",
      Icon: FiLinkedin,
    },
    { label: "CV PDF", href: "/cv", Icon: FiFileText },
  ],
} satisfies {
  name: string;
  role: string;
  location: string;
  email: string;
  summary: string;
  links: { label: string; href: string; Icon: IconType }[];
};

export const work = [
  {
    title: "SIRL",
    slug: "sirl",
    isPublished: true,
    period: "November 2024 - Present",
    description:
      "A mixed-reality role-playing game for personal development, helping players realize their aspirational self in real life through in-game actions and aligned real-world challenges.",
    tags: ["Founder", "Data Science", "LLMs"],
    timeline: [
      {
        title: "Origin",
        body: "Placeholder timeline content for SIRL.",
      },
      {
        title: "B-CODE",
        body: "Placeholder timeline content for cognitive behavioral programming language work.",
      },
      {
        title: "Next",
        body: "Placeholder timeline content for the next milestone.",
      },
    ],
  },
  {
    title: "Machine Learning PhD Quest",
    slug: "mlphd",
    isPublished: true,
    period: "Ongoing",
    description:
      "A self-directed research and professional development track across machine learning, deep learning, NLP, vision, deployment, testing, and monitoring.",
    tags: ["CS229", "CS231N", "CS224N"],
    timeline: [
      {
        title: "Foundations",
        body: "Placeholder timeline content for mathematical and statistical foundations.",
      },
      {
        title: "Systems",
        body: "Placeholder timeline content for deployment, testing, and monitoring.",
      },
      {
        title: "Research",
        body: "Placeholder timeline content for ongoing research direction.",
      },
    ],
  },
  {
    title: "Large Hadron Collider",
    slug: "lhc",
    isPublished: false,
    period: "Graduate Research Fellowship",
    description:
      "Collaborated with the CMS group at CERN to analyze detector aging in the Endcap Muon System and present diagnostic findings to the CMS group.",
    tags: ["CERN", "CMS", "Physics"],
    timeline: [
      {
        title: "CMS Collaboration",
        body: "Placeholder timeline content for CMS group collaboration.",
      },
      {
        title: "Detector Aging",
        body: "Placeholder timeline content for cathode strip chamber analysis.",
      },
      {
        title: "Presentation",
        body: "Placeholder timeline content for findings presented to the CMS group.",
      },
    ],
  },
];

export const experience = [
  {
    organization: "Data Scientist, Consulting",
    role: "Consulting",
    period: "January 2024 - November 2024",
  },
  {
    organization: "OxyML",
    role: "Product Lead",
    period: "January 2023 - December 2023",
  },
  {
    organization: "Cardinal Health",
    role: "Sr. Data Scientist and ML Engineer",
    period: "March 2021 - July 2022",
  },
  {
    organization: "The Covid Tutoring Initiative",
    role: "Full-Stack Web Developer",
    period: "January 2020 - August 2020",
  },
  {
    organization: "University of Florida Landmine Detection Lab",
    role: "Data Scientist",
    period: "May 2015 - August 2016",
  },
  {
    organization: "Teaching",
    role: "Private Tutor, Physics Instructor, and TA",
    period: "August 2013 - November 2019",
  },
];

export const capabilities = [
  {
    category: "Programming",
    skills: [
      "Object-Oriented Programming",
      "Algorithms",
      "Software Testing",
      "Documentation",
      "Practical AI Development Workflows",
    ],
    examples: ["Python", "MATLAB", "TypeScript", "C++"],
  },
  {
    category: "Data Science and Visualization",
    skills: [
      "Data Preprocessing Pipelines",
      "Exploratory Analysis",
      "Scientific Computing",
      "Visualization",
      "Reporting",
    ],
    technologies: ["Scientific Computing", "Visualization Workflows"],
    examples: ["NumPy", "Pandas", "SciPy"],
  },
  {
    category: "Machine Learning",
    skills: [
      "Model Development",
      "Testing",
      "Deployment",
      "Monitoring",
      "Reporting",
    ],
    technologies: ["Classical ML and Deep Learning Frameworks and Libraries"],
    examples: ["Scikit-Learn", "Keras", "PyTorch", "TensorFlow"],
  },
  {
    category: "AI API and LLM Development",
    skills: ["RAG", "Prompting", "Fine-Tuning"],
    technologies: ["Foundation Model APIs", "LLM Application Workflows"],
    examples: ["OpenAI", "Claude", "Gemini"],
  },
  {
    category: "Data",
    skills: ["Relational Databases", "Document Databases", "Vector Databases"],
    technologies: ["Databases", "ORMs and ODMs", "Vector Storage"],
    examples: [
      "PostgreSQL",
      "MongoDB",
      "SQLAlchemy",
      "Mongoose",
      "Vector Databases",
    ],
  },
  {
    category: "Full Stack and UI/UX",
    skills: [
      "Frontend Development",
      "Backend Integration",
      "Component-Driven UI Design",
    ],
    technologies: ["Web Frameworks", "Styling Systems"],
    examples: ["React", "Next.js", "Tailwind CSS"],
  },
  {
    category: "Ops",
    skills: [
      "CLI Workflows",
      "Version Control",
      "Cloud Deployment",
      "Containerization",
      "CI/CD Pipelines",
    ],
    technologies: ["Shell Tooling", "Git Hosting", "Cloud Platforms", "Containers"],
    examples: [
      "Bash",
      "Git",
      "GitHub",
      "GitLab",
      "CircleCI",
      "Docker",
      "Google Cloud Platform",
    ],
  },
] satisfies {
  category: string;
  skills: string[];
  technologies?: string[];
  examples: string[];
}[];

export const achievements = [
  "Ranked in the top 14th percentile in the nation on the Putnam Exam",
  "Publication - Investigation of the switching wave propagation in linear chains of magnetic elements",
  "Undergraduate Research - 3 NSF Sponsored Research Programs: Condensed Matter, Optics, and Inverse Problems for Medical Imaging",
];

export const courses = [
  "CS229 Machine Learning",
  "CS231N Convolutional Neural Networks for Visual Recognition",
  "CS224N Natural Language Processing with Deep Learning",
  "Testing and Monitoring of Machine Learning Model Deployments",
  "Deployment of Machine Learning Models",
  "Feature Selection for Machine Learning",
  "Machine Learning",
  "Statistics",
  "Partial Differential Equations",
  "Advanced Linear Algebra",
  "Abstract Algebra",
  "Real Analysis",
  "Complex Analysis",
  "General Topology",
  "Quantum, Statistical, and Classical Mechanics",
  "Electromagnetism",
  "Optics",
  "Probability and Statistics",
];
