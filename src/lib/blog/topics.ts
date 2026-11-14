
import type {
  BlogTopic,
  BlogTopicCategory,
} from "@/features/blog/domain/types";

/**
 * Broad subject areas in the HackersHarbor Journal.
 * These are publication categories, not individual technologies.
 */
export const BLOG_TOPIC_CATEGORIES: BlogTopicCategory[] = [
  {
    id: "category-ai",
    name: "Artificial Intelligence",
    slug: "artificial-intelligence",
    description:
      "Explore intelligent systems, generative models, language models and the evolving field of artificial intelligence.",
  },
  {
    id: "category-data-science",
    name: "Data Science",
    slug: "data-science",
    description:
      "Discover data exploration, scientific methods, experimentation and insights from complex datasets.",
  },
  {
    id: "category-data-analytics",
    name: "Data Analytics",
    slug: "data-analytics",
    description:
      "Learn how to transform information into useful insights through analysis, visualization and reporting.",
  },
  {
    id: "category-machine-learning",
    name: "Machine Learning",
    slug: "machine-learning",
    description:
      "Understand algorithms, predictive modeling, model evaluation and practical machine learning systems.",
  },
  {
    id: "category-deep-learning",
    name: "Deep Learning",
    slug: "deep-learning",
    description:
      "Explore neural networks, representation learning, computer vision and advanced deep learning architectures.",
  },
  {
    id: "category-data-engineering",
    name: "Data Engineering",
    slug: "data-engineering",
    description:
      "Build reliable data pipelines, distributed systems, warehouses and modern data infrastructure.",
  },
  {
    id: "category-programming",
    name: "Programming",
    slug: "programming",
    description:
      "Explore programming languages, software development, algorithms and engineering practices.",
  },
  {
    id: "category-databases",
    name: "Databases and SQL",
    slug: "databases-sql",
    description:
      "Work with relational databases, query languages, data modeling and database performance.",
  },
  {
    id: "category-mathematics",
    name: "Mathematics and Statistics",
    slug: "mathematics-statistics",
    description:
      "Build the mathematical and statistical foundations behind computing, analytics and intelligent systems.",
  },
  {
    id: "category-cybersecurity",
    name: "Cybersecurity",
    slug: "cybersecurity",
    description:
      "Explore application security, network defense, privacy and modern security engineering.",
  },
  {
    id: "category-cloud",
    name: "Cloud Computing and DevOps",
    slug: "cloud-computing-devops",
    description:
      "Learn cloud platforms, infrastructure, deployment, automation and scalable operations.",
  },
  {
    id: "category-web",
    name: "Web Development",
    slug: "web-development",
    description:
      "Build modern websites and applications using frontend, backend and full-stack technologies.",
  },
];

/**
 * Individual technologies, tools and specialized subject areas.
 * A topic can belong to multiple broad categories.
 */
export const BLOG_TOPICS: BlogTopic[] = [
  // Artificial intelligence
  {
    id: "topic-generative-ai",
    name: "Generative AI",
    slug: "generative-ai",
    description:
      "Generative models, applications and techniques for producing text, images, code and other content.",
    categorySlugs: [
      "artificial-intelligence",
      "machine-learning",
      "deep-learning",
    ],
    keywords: ["genai", "generative models", "content generation"],
  },
  {
    id: "topic-llms",
    name: "Large Language Models",
    slug: "large-language-models",
    description:
      "Language model architectures, training, inference, evaluation and practical applications.",
    categorySlugs: ["artificial-intelligence", "deep-learning"],
    keywords: ["llm", "language models", "transformers"],
  },
  {
    id: "topic-ai-agents",
    name: "AI Agents",
    slug: "ai-agents",
    description:
      "Autonomous and tool-using AI systems, agent workflows, planning and orchestration.",
    categorySlugs: ["artificial-intelligence"],
    keywords: ["agents", "agentic ai", "tool calling", "orchestration"],
  },
  {
    id: "topic-rag",
    name: "Retrieval-Augmented Generation",
    slug: "retrieval-augmented-generation",
    description:
      "Knowledge retrieval, vector search and grounding language model responses in external information.",
    categorySlugs: ["artificial-intelligence", "data-engineering"],
    keywords: ["rag", "vector search", "embeddings", "retrieval"],
  },

  // Data science and analytics
  {
    id: "topic-python",
    name: "Python",
    slug: "python",
    description:
      "Python programming, application development, automation and its extensive data ecosystem.",
    categorySlugs: [
      "programming",
      "data-science",
      "data-engineering",
    ],
    keywords: ["python programming", "python language"],
  },
  {
    id: "topic-pandas",
    name: "Pandas",
    slug: "pandas",
    description:
      "Data manipulation, cleaning, transformation and analysis using Python's Pandas library.",
    categorySlugs: [
      "data-science",
      "data-analytics",
      "programming",
    ],
    keywords: ["dataframes", "data cleaning", "python data analysis"],
  },
  {
    id: "topic-numpy",
    name: "NumPy",
    slug: "numpy",
    description:
      "Numerical computing, multidimensional arrays, vectorization and scientific computation in Python.",
    categorySlugs: [
      "data-science",
      "mathematics-statistics",
      "programming",
    ],
    keywords: ["arrays", "numerical computing", "scientific python"],
  },
  {
    id: "topic-polars",
    name: "Polars",
    slug: "polars",
    description:
      "Fast DataFrame processing, lazy execution and analytical workflows with Polars.",
    categorySlugs: [
      "data-science",
      "data-analytics",
      "data-engineering",
    ],
    keywords: ["dataframes", "lazy evaluation", "data processing"],
  },
  {
    id: "topic-scipy",
    name: "SciPy",
    slug: "scipy",
    description:
      "Scientific computing, optimization, signal processing and numerical methods in Python.",
    categorySlugs: ["data-science", "mathematics-statistics"],
    keywords: ["scientific computing", "optimization"],
  },
  {
    id: "topic-matplotlib",
    name: "Matplotlib",
    slug: "matplotlib",
    description:
      "Data visualization and scientific plotting using Python.",
    categorySlugs: [
      "data-science",
      "data-analytics",
      "programming",
    ],
    keywords: ["visualization", "plotting", "charts"],
  },
  {
    id: "topic-seaborn",
    name: "Seaborn",
    slug: "seaborn",
    description:
      "Statistical data visualization and exploratory plotting in Python.",
    categorySlugs: [
      "data-science",
      "data-analytics",
      "mathematics-statistics",
    ],
    keywords: ["statistical visualization", "plots"],
  },
  {
    id: "topic-power-bi",
    name: "Power BI",
    slug: "power-bi",
    description:
      "Business intelligence, interactive dashboards, data modeling and reporting.",
    categorySlugs: ["data-analytics"],
    keywords: ["business intelligence", "dashboards", "microsoft"],
  },
  {
    id: "topic-tableau",
    name: "Tableau",
    slug: "tableau",
    description:
      "Visual analytics, interactive dashboards and data storytelling.",
    categorySlugs: ["data-analytics"],
    keywords: ["visual analytics", "dashboards", "data visualization"],
  },

  // Machine learning and deep learning
  {
    id: "topic-scikit-learn",
    name: "Scikit-learn",
    slug: "scikit-learn",
    description:
      "Classical machine learning, preprocessing, model selection and evaluation in Python.",
    categorySlugs: [
      "machine-learning",
      "data-science",
      "programming",
    ],
    keywords: ["sklearn", "classical machine learning", "model evaluation"],
  },
  {
    id: "topic-pytorch",
    name: "PyTorch",
    slug: "pytorch",
    description:
      "Deep learning development, tensor computation and neural network training.",
    categorySlugs: [
      "deep-learning",
      "machine-learning",
      "programming",
    ],
    keywords: ["tensors", "neural networks", "deep learning framework"],
  },
  {
    id: "topic-tensorflow",
    name: "TensorFlow",
    slug: "tensorflow",
    description:
      "Machine learning and deep learning model development and deployment.",
    categorySlugs: [
      "deep-learning",
      "machine-learning",
      "programming",
    ],
    keywords: ["keras", "neural networks", "machine learning framework"],
  },
  {
    id: "topic-keras",
    name: "Keras",
    slug: "keras",
    description:
      "High-level neural network development and deep learning workflows.",
    categorySlugs: ["deep-learning", "machine-learning"],
    keywords: ["neural networks", "deep learning"],
  },
  {
    id: "topic-computer-vision",
    name: "Computer Vision",
    slug: "computer-vision",
    description:
      "Image understanding, object detection, image segmentation and visual recognition.",
    categorySlugs: [
      "artificial-intelligence",
      "deep-learning",
      "machine-learning",
    ],
    keywords: ["image processing", "object detection", "vision"],
  },
  {
    id: "topic-nlp",
    name: "Natural Language Processing",
    slug: "natural-language-processing",
    description:
      "Text processing, language understanding, information extraction and language technologies.",
    categorySlugs: ["artificial-intelligence", "machine-learning"],
    keywords: ["nlp", "text processing", "language understanding"],
  },

  // Data engineering and databases
  {
    id: "topic-apache-spark",
    name: "Apache Spark",
    slug: "apache-spark",
    description:
      "Distributed data processing, large-scale analytics and Spark-based data pipelines.",
    categorySlugs: ["data-engineering", "data-science"],
    keywords: ["pyspark", "distributed computing", "big data"],
  },
  {
    id: "topic-apache-airflow",
    name: "Apache Airflow",
    slug: "apache-airflow",
    description:
      "Workflow orchestration, scheduling and monitoring for data pipelines.",
    categorySlugs: ["data-engineering"],
    keywords: ["workflow orchestration", "dag", "pipelines"],
  },
  {
    id: "topic-sql",
    name: "SQL",
    slug: "sql",
    description:
      "Querying, transforming and managing structured data in relational databases.",
    categorySlugs: [
      "databases-sql",
      "data-analytics",
      "data-engineering",
    ],
    keywords: ["queries", "relational databases", "database language"],
  },
  {
    id: "topic-postgresql",
    name: "PostgreSQL",
    slug: "postgresql",
    description:
      "Relational database development, advanced SQL, indexing and database administration.",
    categorySlugs: ["databases-sql", "data-engineering"],
    keywords: ["postgres", "relational database"],
  },
  {
    id: "topic-mysql",
    name: "MySQL",
    slug: "mysql",
    description:
      "Relational database management, SQL queries and application data storage.",
    categorySlugs: ["databases-sql", "web-development"],
    keywords: ["relational database", "database queries"],
  },
  {
    id: "topic-duckdb",
    name: "DuckDB",
    slug: "duckdb",
    description:
      "Analytical SQL, embedded databases and efficient local data processing.",
    categorySlugs: [
      "databases-sql",
      "data-science",
      "data-engineering",
    ],
    keywords: ["olap", "embedded analytics", "analytical database"],
  },

  // Programming and web development
  {
    id: "topic-javascript",
    name: "JavaScript",
    slug: "javascript",
    description:
      "Modern JavaScript, browser programming, asynchronous code and application development.",
    categorySlugs: ["programming", "web-development"],
    keywords: ["js", "ecmascript", "frontend"],
  },
  {
    id: "topic-typescript",
    name: "TypeScript",
    slug: "typescript",
    description:
      "Typed JavaScript, application architecture and reliable development at scale.",
    categorySlugs: ["programming", "web-development"],
    keywords: ["ts", "static typing", "javascript"],
  },
  {
    id: "topic-react",
    name: "React",
    slug: "react",
    description:
      "Component-based user interfaces, hooks, state management and frontend architecture.",
    categorySlugs: ["programming", "web-development"],
    keywords: ["reactjs", "frontend", "components"],
  },
  {
    id: "topic-nextjs",
    name: "Next.js",
    slug: "nextjs",
    description:
      "Full-stack React applications, routing, rendering and modern web development.",
    categorySlugs: ["programming", "web-development"],
    keywords: ["next", "react framework", "full stack"],
  },
  {
    id: "topic-java",
    name: "Java",
    slug: "java",
    description:
      "Object-oriented programming, application development and the Java ecosystem.",
    categorySlugs: ["programming"],
    keywords: ["jvm", "object oriented programming"],
  },
  {
    id: "topic-cpp",
    name: "C++",
    slug: "cpp",
    description:
      "Systems programming, performance, memory management and modern C++ development.",
    categorySlugs: ["programming"],
    keywords: ["cpp", "systems programming", "performance"],
  },
  {
    id: "topic-rust",
    name: "Rust",
    slug: "rust",
    description:
      "Memory-safe systems programming, ownership and high-performance software.",
    categorySlugs: ["programming"],
    keywords: ["systems programming", "ownership"],
  },
  {
    id: "topic-go",
    name: "Go",
    slug: "go",
    description:
      "Concurrent programming, backend services and cloud-native software with Go.",
    categorySlugs: [
      "programming",
      "cloud-computing-devops",
    ],
    keywords: ["golang", "backend", "concurrency"],
  },

  // Mathematics and statistics
  {
    id: "topic-statistics",
    name: "Statistics",
    slug: "statistics",
    description:
      "Descriptive statistics, probability, inference and statistical reasoning.",
    categorySlugs: [
      "mathematics-statistics",
      "data-science",
      "data-analytics",
    ],
    keywords: ["probability", "statistical inference", "hypothesis testing"],
  },
  {
    id: "topic-linear-algebra",
    name: "Linear Algebra",
    slug: "linear-algebra",
    description:
      "Vectors, matrices, transformations and mathematical foundations for machine learning.",
    categorySlugs: [
      "mathematics-statistics",
      "data-science",
      "machine-learning",
    ],
    keywords: ["vectors", "matrices", "eigenvalues"],
  },

  // Cybersecurity and cloud
  {
    id: "topic-network-security",
    name: "Network Security",
    slug: "network-security",
    description:
      "Network defense, secure communication, threat detection and infrastructure protection.",
    categorySlugs: ["cybersecurity"],
    keywords: ["network defense", "firewalls", "threat detection"],
  },
  {
    id: "topic-docker",
    name: "Docker",
    slug: "docker",
    description:
      "Containerization, reproducible environments and application deployment.",
    categorySlugs: ["cloud-computing-devops", "programming"],
    keywords: ["containers", "images", "deployment"],
  },
  {
    id: "topic-kubernetes",
    name: "Kubernetes",
    slug: "kubernetes",
    description:
      "Container orchestration, scalable deployments and cloud-native infrastructure.",
    categorySlugs: ["cloud-computing-devops"],
    keywords: ["k8s", "orchestration", "cloud native"],
  },
];

/**
 * Find a broad category by its URL slug.
 */
export function getTopicCategoryBySlug(
  slug: string
): BlogTopicCategory | undefined {
  return BLOG_TOPIC_CATEGORIES.find(
    (category) => category.slug === slug
  );
}

/**
 * Find an individual topic by its URL slug.
 */
export function getBlogTopicBySlug(
  slug: string
): BlogTopic | undefined {
  return BLOG_TOPICS.find(
    (topic) => topic.slug === slug
  );
}

/**
 * Get every topic associated with a broad category.
 */
export function getTopicsByCategory(
  categorySlug: string
): BlogTopic[] {
  return BLOG_TOPICS.filter((topic) =>
    topic.categorySlugs.includes(categorySlug)
  );
}

/**
 * Get all broad categories associated with an individual topic.
 */
export function getCategoriesForTopic(
  topic: BlogTopic
): BlogTopicCategory[] {
  return BLOG_TOPIC_CATEGORIES.filter((category) =>
    topic.categorySlugs.includes(category.slug)
  );
}

/**
 * Search topic names, descriptions and keywords.
 */
export function searchBlogTopics(
  searchTerm: string
): BlogTopic[] {
  const normalizedTerm = searchTerm.trim().toLowerCase();

  if (!normalizedTerm) {
    return BLOG_TOPICS;
  }

  return BLOG_TOPICS.filter((topic) => {
    const searchableContent = [
      topic.name,
      topic.slug,
      topic.description,
      ...topic.keywords,
    ]
      .join(" ")
      .toLowerCase();

    return searchableContent.includes(normalizedTerm);
  });
}
