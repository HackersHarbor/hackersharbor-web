
export type ChartType =
  | "line"
  | "bar"
  | "scatter"
  | "histogram"
  | "box"
  | "violin"
  | "heatmap"
  | "roc"
  | "precision-recall"
  | "confusion-matrix";

export interface ChartSeries {
  name: string;
  x: (string | number)[];
  y: (string | number | null)[];
}

export interface ChartConfiguration {
  id: string;
  title: string;
  type: ChartType;
  series: ChartSeries[];
  xLabel?: string;
  yLabel?: string;
  datasetIds: string[];
  createdAt: string;
}

export interface SavedVisualization {
  id: string;
  configuration: ChartConfiguration;
  pinned: boolean;
  createdAt: string;
}
