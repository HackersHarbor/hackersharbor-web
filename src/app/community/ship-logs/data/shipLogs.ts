import type { Author, CommunityTopic } from "../types/content";
import type { ShipLog } from "../types/shipLog";

export const featuredLogs: ShipLog[] = [
  {
    id: "churn-eda-deployment",
    type: "notebook",
    title:
      "Customer Churn Prediction — From EDA to Deployment",
    description:
      "Complete workflow from data exploration to model deployment using scikit-learn and FastAPI.",
    content:
      "Explore a customer churn dataset, clean the data, engineer useful features, train a classification model with scikit-learn, evaluate its performance, and expose the trained model through a FastAPI service.",
    author: "Arjun Mehta",
    authorInitial: "A",
    publishedLabel: "3 days ago",
    communities: [
      "data-science",
      "software-engineering",
    ],
    tags: [
      "Python",
      "Machine Learning",
      "EDA",
      "FastAPI",
    ],
    signals: 324,
    replies: 48,
    views: "12.4K",
  },
  {
    id: "production-rag",
    type: "project",
    title: "Building a Production RAG Pipeline",
    description:
      "End-to-end RAG system with LangChain, vector databases and production deployment.",
    content:
      "Build a retrieval-augmented generation pipeline using LangChain and a vector database. The workflow covers document ingestion, chunking, embeddings, retrieval, prompt construction, evaluation, and production deployment.",
    author: "Priya Sharma",
    authorInitial: "P",
    publishedLabel: "5 days ago",
    communities: [
      "data-science",
      "software-engineering",
    ],
    tags: [
      "Python",
      "LLM",
      "LangChain",
      "Docker",
    ],
    signals: 286,
    replies: 32,
    views: "8.6K",
  },
  {
    id: "sql-analytical-workloads",
    type: "tutorial",
    title: "SQL Patterns for Analytical Workloads",
    description:
      "Practical SQL patterns with real datasets and hands-on examples for data analysis.",
    content:
      "Learn practical SQL techniques for analytical workloads, including filtering, aggregation, joins, window functions, common table expressions, and query patterns that make real-world data analysis easier to maintain.",
    author: "Karan Verma",
    authorInitial: "K",
    publishedLabel: "1 week ago",
    communities: ["data-science"],
    tags: [
      "SQL",
      "Data Analysis",
      "PostgreSQL",
    ],
    signals: 214,
    replies: 26,
    views: "6.1K",
  },
  {
    id: "event-driven-system",
    type: "project",
    title:
      "Designing a Scalable Event-Driven System",
    description:
      "Architecture, implementation and lessons learned from building an event-driven service.",
    content:
      "Design an event-driven service around asynchronous communication and independent components. Explore event producers, consumers, message brokers, failure handling, scaling strategies, and the operational lessons learned during implementation.",
    author: "Neha Iyer",
    authorInitial: "N",
    publishedLabel: "1 week ago",
    communities: [
      "software-engineering",
    ],
    tags: [
      "Kafka",
      "Docker",
      "Kubernetes",
      "Systems",
    ],
    signals: 198,
    replies: 24,
    views: "5.3K",
  },
];

export const dataScienceLogs: ShipLog[] = [
  {
    id: "vision-benchmark",
    type: "notebook",
    title: "Computer Vision Model Benchmark",
    description:
      "Compare CNN, ViT and EfficientNet on real-world datasets.",
    content:
      "Benchmark several computer vision architectures on the same datasets and evaluation metrics. Compare CNN, Vision Transformer, and EfficientNet approaches while examining accuracy, training cost, inference performance, and model behavior.",
    author: "Rohit Das",
    authorInitial: "R",
    publishedLabel: "4 days ago",
    communities: ["data-science"],
    tags: [
      "Python",
      "Computer Vision",
      "Deep Learning",
    ],
    signals: 320,
    replies: 41,
    views: "9.2K",
  },
  {
    id: "data-cleaning",
    type: "tutorial",
    title:
      "Data Cleaning Techniques for Real-World Data",
    description:
      "Practical approaches to handling missing data, outliers and noisy datasets.",
    content:
      "Work through common data-quality problems using practical examples. Cover missing values, duplicate records, inconsistent formats, outliers, noisy observations, and validation techniques for creating analysis-ready datasets.",
    author: "Sneha Kapoor",
    authorInitial: "S",
    publishedLabel: "6 days ago",
    communities: ["data-science"],
    tags: [
      "Python",
      "Data Analysis",
      "Pandas",
    ],
    signals: 198,
    replies: 22,
    views: "4.9K",
  },
  {
    id: "forecasting-pytorch",
    type: "project",
    title:
      "Time Series Forecasting with PyTorch",
    description:
      "Build and train a forecasting model for demand prediction.",
    content:
      "Build a time-series forecasting workflow with PyTorch. Prepare historical demand data, create training sequences, train a forecasting model, evaluate predictions, and examine how the model behaves on unseen periods.",
    author: "Arjun Mehta",
    authorInitial: "A",
    publishedLabel: "1 week ago",
    communities: ["data-science"],
    tags: [
      "Python",
      "PyTorch",
      "Time Series",
    ],
    signals: 176,
    replies: 18,
    views: "4.1K",
  },
  {
    id: "nlp-transformers",
    type: "notebook",
    title:
      "NLP Text Classification with Transformers",
    description:
      "Fine-tune BERT for multi-class text classification.",
    content:
      "Fine-tune a transformer-based language model for multi-class text classification. Prepare the dataset, tokenize the text, configure training, evaluate the model, and examine practical considerations when applying transformers to real datasets.",
    author: "Priya Sharma",
    authorInitial: "P",
    publishedLabel: "1 week ago",
    communities: ["data-science"],
    tags: [
      "Python",
      "NLP",
      "Transformers",
    ],
    signals: 162,
    replies: 19,
    views: "3.8K",
  },
];

export const softwareEngineeringLogs: ShipLog[] = [
  {
    id: "reliable-rest",
    type: "project",
    title: "Designing Reliable REST APIs",
    description:
      "Best practices for building secure, scalable and maintainable APIs.",
    content:
      "Explore practical REST API design patterns covering resource modeling, validation, authentication, authorization, error handling, versioning, observability, and strategies for keeping APIs maintainable as systems grow.",
    author: "Karan Verma",
    authorInitial: "K",
    publishedLabel: "3 days ago",
    communities: [
      "software-engineering",
    ],
    tags: [
      "Node.js",
      "TypeScript",
      "API Design",
    ],
    signals: 248,
    replies: 34,
    views: "7.1K",
  },
  {
    id: "system-design",
    type: "tutorial",
    title: "System Design for Beginners",
    description:
      "Learn system design fundamentals through practical engineering examples.",
    content:
      "Learn the fundamentals of system design through practical examples. Explore requirements, scalability, load balancing, caching, databases, queues, service boundaries, reliability, and the trade-offs engineers make when designing systems.",
    author: "Neha Iyer",
    authorInitial: "N",
    publishedLabel: "5 days ago",
    communities: [
      "software-engineering",
    ],
    tags: [
      "System Design",
      "Scalability",
      "Architecture",
    ],
    signals: 220,
    replies: 28,
    views: "6.5K",
  },
  {
    id: "full-stack-next",
    type: "project",
    title:
      "Full Stack Application with Next.js 14",
    description:
      "Build a modern full-stack application with authentication and deployment.",
    content:
      "Build a full-stack application using Next.js, TypeScript, authentication, PostgreSQL, and deployment tooling. The project covers application structure, server and client boundaries, data access, authentication flows, and deployment considerations.",
    author: "Rohit Das",
    authorInitial: "R",
    publishedLabel: "1 week ago",
    communities: [
      "software-engineering",
    ],
    tags: [
      "Next.js",
      "TypeScript",
      "PostgreSQL",
    ],
    signals: 194,
    replies: 21,
    views: "5.2K",
  },
  {
    id: "docker-kubernetes",
    type: "tutorial",
    title:
      "Docker and Kubernetes for Developers",
    description:
      "A practical guide to containerization and orchestration.",
    content:
      "Learn the practical foundations of containerization and orchestration. Build Docker images, manage containers, configure services, and understand how Kubernetes deployments, services, scaling, and configuration fit together.",
    author: "Sneha Kapoor",
    authorInitial: "S",
    publishedLabel: "1 week ago",
    communities: [
      "software-engineering",
    ],
    tags: [
      "Docker",
      "Kubernetes",
      "DevOps",
    ],
    signals: 180,
    replies: 20,
    views: "4.7K",
  },
];

export const recentLogs: ShipLog[] = [
  {
    id: "visualization-python",
    type: "notebook",
    title: "Data Visualization with Python",
    description:
      "Build clear, useful visualizations from real datasets.",
    content:
      "Explore practical data visualization techniques with Python. Transform raw datasets into clear charts, compare visualization approaches, and focus on communicating useful findings rather than simply producing attractive graphics.",
    author: "Rohit Das",
    authorInitial: "R",
    publishedLabel: "Today",
    communities: ["data-science"],
    tags: [
      "Python",
      "Data Analysis",
    ],
    signals: 42,
    replies: 6,
    views: "1.2K",
  },
  {
    id: "ml-aws",
    type: "project",
    title: "ML Model Deployment with AWS",
    description:
      "Deploy a trained model behind a production-ready inference service.",
    content:
      "Deploy a trained machine learning model as an inference service on AWS. Cover model packaging, service configuration, deployment, monitoring, and the operational considerations involved in keeping an ML inference endpoint reliable.",
    author: "Karan Verma",
    authorInitial: "K",
    publishedLabel: "Today",
    communities: [
      "data-science",
      "software-engineering",
    ],
    tags: [
      "AWS",
      "MLOps",
    ],
    signals: 38,
    replies: 4,
    views: "980",
  },
  {
    id: "versioning-tools",
    type: "discussion",
    title:
      "Best Tools for Data Versioning?",
    description:
      "A community discussion around datasets, experiments and model versions.",
    content:
      "Compare approaches for versioning datasets, experiments, and machine learning models. Discuss the trade-offs between different tools and workflows and how teams can keep data and model history reproducible.",
    author: "Neha Iyer",
    authorInitial: "N",
    publishedLabel: "Yesterday",
    communities: ["data-science"],
    tags: [
      "Data Engineering",
      "MLOps",
    ],
    signals: 36,
    replies: 12,
    views: "890",
  },
  {
    id: "testing-python",
    type: "tutorial",
    title: "Testing Strategies in Python",
    description:
      "Practical patterns for reliable Python test suites.",
    content:
      "Explore practical Python testing strategies covering unit tests, integration tests, fixtures, mocking, test organization, and techniques for keeping a growing test suite reliable and maintainable.",
    author: "Sneha Kapoor",
    authorInitial: "S",
    publishedLabel: "Yesterday",
    communities: [
      "software-engineering",
    ],
    tags: [
      "Testing",
      "Python",
    ],
    signals: 28,
    replies: 5,
    views: "760",
  },
];

export const trendingTopics: CommunityTopic[] = [
  {
    label: "Machine Learning",
    count: "1.2K",
  },
  {
    label: "Python",
    count: "986",
  },
  {
    label: "Data Analysis",
    count: "842",
  },
  {
    label: "JavaScript",
    count: "754",
  },
  {
    label: "Deep Learning",
    count: "632",
  },
  {
    label: "Web Development",
    count: "518",
  },
  {
    label: "MLOps",
    count: "426",
  },
  {
    label: "DevOps",
    count: "318",
  },
];

export const peopleToLearnFrom: Author[] = [
  {
    name: "Arjun Mehta",
    initial: "A",
    specialty: "Machine Learning",
    logs: 48,
  },
  {
    name: "Priya Sharma",
    initial: "P",
    specialty: "Backend & LLMs",
    logs: 36,
  },
  {
    name: "Karan Verma",
    initial: "K",
    specialty: "Data Engineering",
    logs: 28,
  },
  {
    name: "Neha Iyer",
    initial: "N",
    specialty: "System Design",
    logs: 24,
  },
];