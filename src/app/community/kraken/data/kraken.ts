
import type { Author, CommunityTopic } from "../types/content";
import type { KrakenEntry } from "../types/kraken";

export const featuredLogs: KrakenEntry[] = [
  {
    id: "iris-flower-measurements",
    type: "dataset",
    title: "Iris Flower Measurements",
    description:
      "Explore sepal and petal measurements across three iris species using a compact, beginner-friendly classification dataset.",
    content: `## About this dataset

The Iris dataset contains 150 observations of iris flowers from three species.

### Columns

- \`sepal_length\`: Sepal length
- \`sepal_width\`: Sepal width
- \`petal_length\`: Petal length
- \`petal_width\`: Petal width
- \`species\`: Observed iris species

### Suggested exploration

1. Compare petal measurements across species.
2. Visualize the relationship between sepal length and petal length.
3. Build a simple species classification model.

### Source and license

Original source: [UCI Machine Learning Repository](https://archive.ics.uci.edu/dataset/53/iris).

License: [Creative Commons Attribution 4.0 (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/).

Attribute the original dataset to the UCI Machine Learning Repository when redistributing it.`,
    author: "Kraken Data Library",
    authorInitial: "K",
    publishedLabel: "Curated dataset",
    domain: "machine-learning",
    format: "CSV",
    recordCount: 150,
    size: "Approx. 5 KB",
    difficulty: "beginner",
    taskType: "classification",
    source: "UCI Machine Learning Repository · CC BY 4.0",
    communities: ["Machine Learning", "Data Science", "Python"],
    tags: ["iris", "classification", "beginner", "csv", "uci"],
    signals: 0,
    replies: 0,
    views: "0",
  },
  {
    id: "customer-churn",
    type: "challenge",
    title: "Customer Churn Intelligence",
    description:
      "Identify customers likely to leave and discover the strongest churn indicators.",
    content:
      "Explore customer profiles, service usage, contract details, and billing history. Prepare the data, investigate churn patterns, and build a classification model. Suggested metric: F1-score.",
    author: "Arjun Mehta",
    authorInitial: "A",
    publishedLabel: "3 days ago",
    domain: "machine-learning",
    format: "CSV",
    recordCount: 7043,
    size: "1.2 MB",
    difficulty: "intermediate",
    taskType: "classification",
    evaluationMetric: "F1-score",
    source: "Kraken sample collection",
    communities: ["data-science", "machine-learning"],
    tags: ["Python", "Classification", "Customer Analytics"],
    signals: 324,
    replies: 48,
    views: "12.4K",
  },
  {
    id: "retail-demand",
    type: "challenge",
    title: "Retail Demand Forecasting",
    description:
      "Forecast product demand from historical sales and calendar patterns.",
    content:
      "Investigate historical sales, seasonality, promotions, and product-level trends. Build a forecasting baseline and compare prediction errors on a held-out time period.",
    author: "Priya Sharma",
    authorInitial: "P",
    publishedLabel: "5 days ago",
    domain: "data-analysis",
    format: "CSV",
    recordCount: 250000,
    size: "18 MB",
    difficulty: "advanced",
    taskType: "forecasting",
    evaluationMetric: "MAE",
    source: "Kraken sample collection",
    communities: ["data-science", "machine-learning"],
    tags: ["Forecasting", "Retail", "Time Series"],
    signals: 286,
    replies: 32,
    views: "8.6K",
  },
  {
    id: "city-air-quality",
    type: "dataset",
    title: "Urban Air Quality Observations",
    description:
      "Explore pollution measurements, weather conditions, and changes across locations.",
    content:
      "A sample dataset concept for investigating air quality across monitoring locations. Examine pollutant measurements, missing values, time-based trends, and relationships between environmental variables. Replace this sample metadata with a verified downloadable source before publication.",
    author: "Karan Verma",
    authorInitial: "K",
    publishedLabel: "1 week ago",
    domain: "data-analysis",
    format: "CSV",
    recordCount: 85000,
    size: "6.4 MB",
    difficulty: "beginner",
    taskType: "exploratory-analysis",
    source: "Kraken sample collection",
    communities: ["data-science"],
    tags: ["Environment", "EDA", "Data Visualization"],
    signals: 214,
    replies: 26,
    views: "6.1K",
  },
  {
    id: "image-classification",
    type: "challenge",
    title: "Image Classification Benchmark",
    description:
      "Build and compare image classifiers using a consistent evaluation workflow.",
    content:
      "Prepare image labels, establish a baseline, compare model architectures, and examine class-level performance. Record training time and document errors alongside the chosen evaluation metric.",
    author: "Neha Iyer",
    authorInitial: "N",
    publishedLabel: "1 week ago",
    domain: "computer-vision",
    format: "ZIP",
    recordCount: 12000,
    size: "420 MB",
    difficulty: "advanced",
    taskType: "computer-vision",
    evaluationMetric: "Accuracy",
    source: "Kraken sample collection",
    communities: ["data-science", "machine-learning"],
    tags: ["Computer Vision", "Deep Learning", "Images"],
    signals: 198,
    replies: 24,
    views: "5.3K",
  },
];

export const dataScienceLogs: KrakenEntry[] = [
  {
    id: "housing-prices",
    type: "challenge",
    title: "Residential Property Value Estimation",
    description:
      "Estimate property prices from location, size, and property characteristics.",
    content:
      "Study property attributes, investigate missing values, encode categorical fields, and create a regression baseline. Evaluate predictions on a separate validation set.",
    author: "Rohit Das",
    authorInitial: "R",
    publishedLabel: "4 days ago",
    domain: "machine-learning",
    format: "CSV",
    recordCount: 1460,
    size: "240 KB",
    difficulty: "beginner",
    taskType: "regression",
    evaluationMetric: "RMSE",
    source: "Kraken sample collection",
    communities: ["data-science", "machine-learning"],
    tags: ["Regression", "Feature Engineering", "Python"],
    signals: 320,
    replies: 41,
    views: "9.2K",
  },
  {
    id: "customer-transactions",
    type: "dataset",
    title: "Customer Transaction Patterns",
    description:
      "Analyze purchase frequency, basket sizes, and customer segments.",
    content:
      "Use transaction records to explore purchasing behavior, identify repeat customers, calculate basket metrics, and develop meaningful customer segments. Dataset metadata is illustrative until a verified source is attached.",
    author: "Sneha Kapoor",
    authorInitial: "S",
    publishedLabel: "6 days ago",
    domain: "data-analysis",
    format: "Parquet",
    recordCount: 180000,
    size: "14 MB",
    difficulty: "intermediate",
    taskType: "clustering",
    source: "Kraken sample collection",
    communities: ["data-science"],
    tags: ["Transactions", "Segmentation", "Analytics"],
    signals: 198,
    replies: 22,
    views: "4.9K",
  },
  {
    id: "energy-forecast",
    type: "challenge",
    title: "Energy Consumption Forecast",
    description:
      "Predict future electricity consumption from historical readings.",
    content:
      "Inspect timestamped energy readings, identify seasonal patterns, build a forecasting baseline, and evaluate performance on a chronological holdout rather than a random split.",
    author: "Arjun Mehta",
    authorInitial: "A",
    publishedLabel: "1 week ago",
    domain: "data-science",
    format: "CSV",
    recordCount: 525600,
    size: "32 MB",
    difficulty: "advanced",
    taskType: "forecasting",
    evaluationMetric: "MAE",
    source: "Kraken sample collection",
    communities: ["data-science", "machine-learning"],
    tags: ["Energy", "Forecasting", "Time Series"],
    signals: 176,
    replies: 18,
    views: "4.1K",
  },
  {
    id: "support-ticket-text",
    type: "dataset",
    title: "Customer Support Text Collection",
    description:
      "Explore support messages for themes, intent, and text classification.",
    content:
      "Analyze short support messages, inspect class distributions, clean text, and experiment with text representations. The sample describes a dataset concept; it does not provide actual message records.",
    author: "Priya Sharma",
    authorInitial: "P",
    publishedLabel: "1 week ago",
    domain: "natural-language-processing",
    format: "JSONL",
    recordCount: 42000,
    size: "9 MB",
    difficulty: "intermediate",
    taskType: "natural-language-processing",
    source: "Kraken sample collection",
    communities: ["data-science", "machine-learning"],
    tags: ["NLP", "Text Analytics", "Classification"],
    signals: 162,
    replies: 19,
    views: "3.8K",
  },
];

export const softwareEngineeringLogs: KrakenEntry[] = [
  {
    id: "api-traffic",
    type: "dataset",
    title: "API Traffic and Latency Records",
    description:
      "Investigate request volumes, latency distributions, and service errors.",
    content:
      "Use structured service telemetry to examine response-time percentiles, traffic peaks, error rates, and potential relationships between load and latency. Attach a verified telemetry dataset before making this listing publicly downloadable.",
    author: "Karan Verma",
    authorInitial: "K",
    publishedLabel: "3 days ago",
    domain: "software-engineering",
    format: "JSON",
    recordCount: 96000,
    size: "11 MB",
    difficulty: "intermediate",
    taskType: "exploratory-analysis",
    source: "Kraken sample collection",
    communities: ["software-engineering", "data-science"],
    tags: ["Observability", "APIs", "Performance"],
    signals: 248,
    replies: 34,
    views: "7.1K",
  },
  {
    id: "repository-metrics",
    type: "dataset",
    title: "Open-Source Repository Metrics",
    description:
      "Explore repository activity, contribution patterns, and project health.",
    content:
      "Investigate repository-level metrics such as contribution activity, issue counts, release cadence, and project age. Use the dataset to practice descriptive analytics and communicate findings responsibly.",
    author: "Neha Iyer",
    authorInitial: "N",
    publishedLabel: "5 days ago",
    domain: "data-engineering",
    format: "JSON",
    recordCount: 32000,
    size: "4.8 MB",
    difficulty: "beginner",
    taskType: "exploratory-analysis",
    source: "Kraken sample collection",
    communities: ["software-engineering", "data-science"],
    tags: ["Open Source", "Git", "Analytics"],
    signals: 220,
    replies: 28,
    views: "6.5K",
  },
  {
    id: "event-streams",
    type: "challenge",
    title: "Event Stream Anomaly Detection",
    description:
      "Identify unusual patterns in simulated application event streams.",
    content:
      "Analyze timestamped events and their attributes, define a baseline for normal behavior, and test anomaly detection strategies. Document false positives and the limitations of the chosen approach.",
    author: "Rohit Das",
    authorInitial: "R",
    publishedLabel: "1 week ago",
    domain: "data-engineering",
    format: "Parquet",
    recordCount: 400000,
    size: "27 MB",
    difficulty: "advanced",
    taskType: "classification",
    evaluationMetric: "F1-score",
    source: "Kraken sample collection",
    communities: ["software-engineering", "data-science"],
    tags: ["Streaming", "Anomaly Detection", "Data Engineering"],
    signals: 194,
    replies: 21,
    views: "5.2K",
  },
  {
    id: "database-query-analysis",
    type: "dataset",
    title: "Database Query Performance Samples",
    description:
      "Compare query durations and execution characteristics across workloads.",
    content:
      "Explore query durations, workload types, and execution metadata. Compare distributions and investigate slow-query patterns. This entry is a sample listing and needs a verified downloadable artifact before release.",
    author: "Sneha Kapoor",
    authorInitial: "S",
    publishedLabel: "1 week ago",
    domain: "data-engineering",
    format: "CSV",
    recordCount: 24000,
    size: "3.2 MB",
    difficulty: "intermediate",
    taskType: "exploratory-analysis",
    source: "Kraken sample collection",
    communities: ["software-engineering", "data-science"],
    tags: ["SQL", "Databases", "Performance"],
    signals: 180,
    replies: 20,
    views: "4.7K",
  },
];

export const recentLogs: KrakenEntry[] = [
  {
    id: "bike-sharing-demand",
    type: "challenge",
    title: "Bike Sharing Demand Prediction",
    description:
      "Predict bike rental demand from weather and calendar information.",
    content:
      "Explore rental counts, weather, and calendar variables. Establish a regression baseline and evaluate it on unseen observations. Use a chronological split if the evaluation setup represents future demand.",
    author: "Rohit Das",
    authorInitial: "R",
    publishedLabel: "Today",
    domain: "machine-learning",
    format: "CSV",
    recordCount: 17379,
    size: "1.1 MB",
    difficulty: "beginner",
    taskType: "regression",
    evaluationMetric: "RMSE",
    source: "Kraken sample collection",
    communities: ["data-science", "machine-learning"],
    tags: ["Regression", "Demand Prediction", "Python"],
    signals: 42,
    replies: 6,
    views: "1.2K",
  },
  {
    id: "cloud-costs",
    type: "dataset",
    title: "Cloud Resource Cost Records",
    description:
      "Explore cloud usage, resource categories, and cost patterns.",
    content:
      "Analyze resource usage and cost records to identify major cost drivers, compare service categories, and investigate unusual spending. Sample metadata only; attach a verified data source before publication.",
    author: "Karan Verma",
    authorInitial: "K",
    publishedLabel: "Today",
    domain: "data-engineering",
    format: "CSV",
    recordCount: 56000,
    size: "5.7 MB",
    difficulty: "intermediate",
    taskType: "exploratory-analysis",
    source: "Kraken sample collection",
    communities: ["data-science", "software-engineering"],
    tags: ["Cloud", "Cost Analysis", "FinOps"],
    signals: 38,
    replies: 4,
    views: "980",
  },
  {
    id: "data-versioning",
    type: "dataset",
    title: "Dataset Versioning Metadata",
    description:
      "Explore dataset lineage, version history, and schema changes.",
    content:
      "Use metadata describing data assets and versions to explore lineage, schema evolution, reproducibility, and change tracking. This sample listing does not include an actual dataset file.",
    author: "Neha Iyer",
    authorInitial: "N",
    publishedLabel: "Yesterday",
    domain: "data-engineering",
    format: "JSON",
    recordCount: 12000,
    size: "1.8 MB",
    difficulty: "intermediate",
    taskType: "data-engineering",
    source: "Kraken sample collection",
    communities: ["data-science", "software-engineering"],
    tags: ["Data Versioning", "Lineage", "MLOps"],
    signals: 36,
    replies: 12,
    views: "890",
  },
  {
    id: "web-performance",
    type: "challenge",
    title: "Web Performance Regression Analysis",
    description:
      "Analyze page performance metrics and investigate factors affecting response times.",
    content:
      "Compare performance measurements across releases, investigate outliers, and build an analysis that identifies possible regressions. Treat correlation as evidence for investigation rather than proof of causation.",
    author: "Sneha Kapoor",
    authorInitial: "S",
    publishedLabel: "Yesterday",
    domain: "software-engineering",
    format: "CSV",
    recordCount: 18000,
    size: "2.6 MB",
    difficulty: "intermediate",
    taskType: "regression",
    evaluationMetric: "MAE",
    source: "Kraken sample collection",
    communities: ["software-engineering", "data-science"],
    tags: ["Web Performance", "Regression", "Observability"],
    signals: 28,
    replies: 5,
    views: "760",
  },
];

export const trendingTopics: CommunityTopic[] = [
  { label: "Machine Learning", count: "1.2K" },
  { label: "Python", count: "986" },
  { label: "Data Analysis", count: "842" },
  { label: "Data Engineering", count: "754" },
  { label: "Deep Learning", count: "632" },
  { label: "Computer Vision", count: "518" },
  { label: "MLOps", count: "426" },
  { label: "Data Quality", count: "318" },
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
