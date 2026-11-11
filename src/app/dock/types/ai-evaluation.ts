
export interface AIEvaluationRecord {
    id: string;
    datasetId?: string;
    modelName: string;
    promptId?: string;
    response: string;
    score?: number;
    latencyMs?: number;
    inputTokens?: number;
    outputTokens?: number;
    evaluatedAt: string;
    status: "completed" | "failed" | "pending";
    error?: string;
  }
  
  export interface BenchmarkResult {
    benchmarkName: string;
    modelName: string;
    score: number;
    sampleCount: number;
    evaluatedAt: string;
    source: "measured" | "imported";
  }
  
  export interface PromptComparison {
    promptId: string;
    prompt: string;
    modelResults: {
      modelName: string;
      response: string;
      latencyMs?: number;
      tokenCount?: number;
      score?: number;
    }[];
  }
  