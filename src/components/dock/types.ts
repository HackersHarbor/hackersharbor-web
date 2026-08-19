export type CellType =
  | 'python'
  | 'sql'
  | 'markdown'

export type ExecutionMode =
  | 'browser'
  | 'cloud'

export type ExecutionResultType =
  | 'text'
  | 'table'
  | 'chart'
  | 'markdown'
  | 'json'
  | 'error'

export interface TableOutput {
  columns: string[]
  rows: unknown[][]
}

export interface ExecutionResult {
  success: boolean

  type: ExecutionResultType

  text?: string

  error?: string

  table?: TableOutput

  chart?: unknown

  executionTime?: number
}

export interface Cell {
  id: number

  type: CellType

  code: string

  output: ExecutionResult | null

  running: boolean
}

export interface PythonWorkerRequest {
  id: number

  type:
    | 'execute'
    | 'loadCSV'
    | 'reset'

  code?: string

  filename?: string

  content?: string
}

export interface PythonWorkerResponse {
  id: number

  type: 'result'

  result: ExecutionResult
}