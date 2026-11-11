
export interface TrainingEpoch {
    epoch: number;
    trainingLoss?: number;
    validationLoss?: number;
    trainingAccuracy?: number;
    validationAccuracy?: number;
    learningRate?: number;
    durationMs?: number;
  }
  
  export interface TrainingHistory {
    experimentId: string;
    modelName: string;
    epochs: TrainingEpoch[];
    startedAt?: string;
    completedAt?: string;
    status:
      | "pending"
      | "running"
      | "completed"
      | "failed"
      | "cancelled";
  }
  
  export interface ResourceMetrics {
    cpuUsagePercent?: number;
    memoryBytes?: number;
    gpuMemoryBytes?: number;
    elapsedMs?: number;
    source: "measured" | "unavailable";
  }
  