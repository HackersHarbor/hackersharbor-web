'use client'

import {
  ChangeEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import Image from 'next/image'
import Link from 'next/link'

import {
  Cell,
  CellType,
  ExecutionMode,
  ExecutionResult,
} from '@/components/dock/types'

import { usePythonWorker } from '@/components/dock/usePythonWorker'

import { useDuckDB } from '@/components/dock/useDuckDB'

import { SmartTable } from '@/components/dock/SmartTable'

import {
  SQLChart,
  ChartState,
} from '@/components/dock/SQLChart'

import { SmartInsight } from '@/components/dock/SmartInsight'

import { ExportActions } from '@/components/dock/ExportActions'

import { PDFReportButton } from '@/components/dock/PDFReportButton'

import { AnalysisHistory } from '@/components/dock/AnalysisHistory'
import { FusionWorkspace } from '@/components/dock/FusionWorkspace'

import { ColumnIntelligence } from '@/components/dock/ColumnIntelligence'
import { AdvancedAIInsights } from '@/components/dock/AdvancedAIInsights'
import { Dashboard } from '@/components/dock/Dashboard'
import type { DashboardPin } from '@/components/dock/Dashboard'

/* -------------------------------------------------------------------------- */
/*                                  STORAGE                                   */
/* -------------------------------------------------------------------------- */

const STORAGE_KEY =
  'hackersharbor-dock-notebook'

const THEME_KEY =
  'hackersharbor-theme'

/* -------------------------------------------------------------------------- */
/*                               INITIAL CELLS                                */
/* -------------------------------------------------------------------------- */

const initialCells: Cell[] = [
  {
    id: 1,

    type: 'markdown',

    code:
      '# My Data Analysis Notebook\n\nWelcome to The Dock.\n\nUpload a CSV and start analyzing it with Python or SQL.',

    output: null,

    running: false,
  },

  {
    id: 2,

    type: 'python',

    code:
      'import pandas as pd\nimport numpy as np\n\n# Your Python code here\n\nprint("Python is ready!")',

    output: null,

    running: false,
  },

  {
    id: 3,

    type: 'sql',

    code:
      '-- Upload a CSV first.\n-- Example:\n-- SELECT * FROM data LIMIT 10;\n\nSELECT *\nFROM data\nLIMIT 10;',

    output: null,

    running: false,
  },
]

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

const cellColor: Record<
  CellType,
  string
> = {
  python: '#16A34A',

  sql: '#2563EB',

  markdown: '#B7791F',
}

function formatSQL(
  sql: string,
) {
  const normalized =
    sql
      .replace(
        /\r\n/g,
        '\n',
      )
      .replace(
        /[ \t]+/g,
        ' ',
      )
      .replace(
        /\n{3,}/g,
        '\n\n',
      )
      .trim()

  if (!normalized) {
    return ''
  }

  return normalized
    .replace(
      /\s+(FROM|WHERE|GROUP BY|HAVING|ORDER BY|LIMIT|OFFSET|UNION|EXCEPT|INTERSECT)\s+/gi,
      '\n$1 ',
    )
    .replace(
      /\s+(LEFT JOIN|RIGHT JOIN|FULL JOIN|INNER JOIN|OUTER JOIN|CROSS JOIN|JOIN)\s+/gi,
      '\n$1 ',
    )
    .replace(
      /\s+(AND|OR)\s+/gi,
      '\n  $1 ',
    )
    .replace(
      /\bSELECT\s+/i,
      'SELECT\n  ',
    )
    .replace(
      /,\s*(?=[A-Za-z_"`])/g,
      ',\n  ',
    )
    .replace(
      /\n  FROM /g,
      '\nFROM ',
    )
    .replace(
      /\n  WHERE /g,
      '\nWHERE ',
    )
    .replace(
      /\n  GROUP BY /g,
      '\nGROUP BY ',
    )
    .replace(
      /\n  HAVING /g,
      '\nHAVING ',
    )
    .replace(
      /\n  ORDER BY /g,
      '\nORDER BY ',
    )
    .replace(
      /\n  LIMIT /g,
      '\nLIMIT ',
    )
    .replace(
      /\n  OFFSET /g,
      '\nOFFSET ',
    )
    .trim()
}

function formatExecutionTime(
  value?: number,
) {
  if (
    typeof value !== 'number'
  ) {
    return ''
  }

  if (value < 1000) {
    return `${Math.round(value)} ms`
  }

  return `${(
    value / 1000
  ).toFixed(2)} s`
}

/* -------------------------------------------------------------------------- */
/*                              SHARE HELPERS                                */
/* -------------------------------------------------------------------------- */

function encodeShareState(value: unknown) {
  const json = JSON.stringify(value)
  const bytes = new TextEncoder().encode(json)
  let binary = ''

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function decodeShareState(value: string) {
  const padded = value
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(
      Math.ceil(value.length / 4) * 4,
      '=',
    )

  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return JSON.parse(
    new TextDecoder().decode(bytes),
  )
}

function isShareSnapshot(value: unknown): value is {
  name?: string
  cells: Cell[]
  chartStates?: Record<number, ChartState | null>
  dashboardPins?: DashboardPin[]
  darkMode?: boolean
} {
  if (!value || typeof value !== 'object') {
    return false
  }

  const snapshot = value as {
    cells?: unknown
  }

  return Array.isArray(snapshot.cells)
}

/* -------------------------------------------------------------------------- */
/*                                    PAGE                                    */
/* -------------------------------------------------------------------------- */

export default function Dock() {
  /* ------------------------------------------------------------------------ */
  /*                              NOTEBOOK STATE                              */
  /* ------------------------------------------------------------------------ */

  const [cells, setCells] =
    useState<Cell[]>(
      initialCells,
    )

  const [
    notebookName,
    setNotebookName,
  ] = useState(
    'Untitled notebook',
  )

  const [
    darkMode,
    setDarkMode,
  ] = useState(false)

  const [status, setStatus] =
    useState('')

  const [
    chartFilter,
    setChartFilter,
  ] = useState<{
    cellId: number
    column: string
    value: unknown
  } | null>(null)

  const [
    chartStates,
    setChartStates,
  ] = useState<
    Record<
      number,
      ChartState | null
    >
  >({})

  const [
    dashboardPins,
    setDashboardPins,
  ] = useState<
    DashboardPin[]
  >([])

  const [
    dashboardMode,
    setDashboardMode,
  ] = useState(false)

  const [fusionMode, setFusionMode] = useState(false)

  const [
    dashboardHydrated,
    setDashboardHydrated,
  ] = useState(false)

  useEffect(() => {
    try {
      const stored =
        window.localStorage.getItem(
          'hackersharbor-dock-dashboard',
        )

      if (stored) {
        const parsed =
          JSON.parse(
            stored,
          )

        if (
          Array.isArray(
            parsed,
          )
        ) {
          setDashboardPins(
            parsed,
          )
        }
      }
    } catch {
      // Ignore invalid local dashboard state.
    } finally {
      setDashboardHydrated(
        true,
      )
    }
  }, [])

  useEffect(() => {
    if (!dashboardHydrated) {
      return
    }

    try {
      window.localStorage.setItem(
        'hackersharbor-dock-dashboard',
        JSON.stringify(
          dashboardPins,
        ),
      )
    } catch {
      // Ignore storage failures.
    }
  }, [
    dashboardPins,
    dashboardHydrated,
  ])

  const [saving, setSaving] =
    useState(false)

  const [
    sharing,
    setSharing,
  ] = useState(false)

  const [
    executionMode,
    setExecutionMode,
  ] =
    useState<ExecutionMode>(
      'browser',
    )

  const [
    uploadedFiles,
    setUploadedFiles,
  ] = useState<string[]>([])

  const [
    draggedCellId,
    setDraggedCellId,
  ] = useState<number | null>(
    null,
  )

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null,
    )

  /* ------------------------------------------------------------------------ */
  /*                              PYTHON ENGINE                               */
  /* ------------------------------------------------------------------------ */

  const {
    ready: pythonReady,

    error: pythonError,

    execute: executePython,

    loadCSV,

    reset: resetPython,
  } = usePythonWorker()

  /* ------------------------------------------------------------------------ */
  /*                              DUCKDB ENGINE                               */
  /* ------------------------------------------------------------------------ */

  const {
    ready: duckDBReady,

    loading: duckDBLoading,

    error: duckDBError,

    execute: executeSQL,

    loadCSV:
      loadCSVIntoDuckDB,

    getTables,
  } = useDuckDB()

  /* ------------------------------------------------------------------------ */
  /*                            RESTORE NOTEBOOK                              */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    try {
      const savedTheme =
        localStorage.getItem(
          THEME_KEY,
        )

      if (
        savedTheme ===
        'dark'
      ) {
        setDarkMode(true)
      }

      if (
        savedTheme ===
        'light'
      ) {
        setDarkMode(false)
      }

      const savedNotebook =
        localStorage.getItem(
          STORAGE_KEY,
        )

      if (!savedNotebook) {
        return
      }

      const parsed =
        JSON.parse(
          savedNotebook,
        )

      if (
        parsed &&
        typeof parsed.name ===
          'string' &&
        Array.isArray(
          parsed.cells,
        )
      ) {
        setNotebookName(
          parsed.name,
        )

        setCells(
          parsed.cells.map(
            (
              cell: Cell,
            ) => ({
              ...cell,

              running: false,
            }),
          ),
        )
      }
    } catch {
      /*
       * Ignore invalid
       * localStorage data.
       */
    }
  }, [])

  /* ------------------------------------------------------------------------ */
  /*                            RESTORE SHARED STATE                          */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const hash = window.location.hash

    if (!hash.startsWith('#share=')) {
      return
    }

    try {
      const encoded = hash.slice('#share='.length)
      const parsed = decodeShareState(encoded)

      if (!isShareSnapshot(parsed)) {
        return
      }

      setNotebookName(
        typeof parsed.name === 'string'
          ? parsed.name
          : 'Shared analysis',
      )

      setCells(
        parsed.cells.map(
          (cell) => ({
            ...cell,
            running: false,
          }),
        ),
      )

      if (parsed.chartStates) {
        setChartStates(
          parsed.chartStates,
        )
      }

      if (Array.isArray(parsed.dashboardPins)) {
        setDashboardPins(
          parsed.dashboardPins,
        )
        setDashboardMode(
          parsed.dashboardPins.length > 0,
        )
      }

      if (typeof parsed.darkMode === 'boolean') {
        setDarkMode(parsed.darkMode)
      }

      setStatus(
        'Shared analysis loaded.',
      )

      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${window.location.search}`,
      )
    } catch {
      setStatus(
        'This share link is invalid or incomplete.',
      )
    }
  }, [])

  /* ------------------------------------------------------------------------ */
  /*                              THEME STORAGE                               */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    try {
      localStorage.setItem(
        THEME_KEY,
        darkMode
          ? 'dark'
          : 'light',
      )
    } catch {
      /*
       * Ignore storage
       * errors.
       */
    }
  }, [darkMode])

  /* ------------------------------------------------------------------------ */
  /*                              AUTOSAVE                                    */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    try {
      const notebook = {
        name: notebookName,

        cells: cells.map(
          (cell) => ({
            ...cell,

            running: false,
          }),
        ),

        savedAt:
          new Date().toISOString(),
      }

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          notebook,
        ),
      )
    } catch {
      /*
       * Ignore storage errors.
       */
    }
  }, [
    notebookName,
    cells,
  ])

  /* ------------------------------------------------------------------------ */
  /*                              ERROR STATUS                                */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (pythonError) {
      setStatus(
        `Python kernel error: ${pythonError}`,
      )
    }
  }, [pythonError])

  useEffect(() => {
    if (duckDBError) {
      setStatus(
        `SQL engine error: ${duckDBError}`,
      )
    }
  }, [duckDBError])

  /* ------------------------------------------------------------------------ */
  /*                              COLORS                                      */
  /* ------------------------------------------------------------------------ */

  const colors = useMemo(
    () => ({
      bg: darkMode
        ? '#080C10'
        : '#F8FAFF',

      card: darkMode
        ? '#0D1520'
        : '#FFFFFF',

      editor: darkMode
        ? '#060A0F'
        : '#F4F7FA',

      output: darkMode
        ? '#090E14'
        : '#F8FAFC',

      border: darkMode
        ? '#1A2636'
        : '#E5EAF0',

      subtleBorder:
        darkMode
          ? '#121C29'
          : '#EEF2F6',

      primaryText:
        darkMode
          ? '#E8EEF6'
          : '#111827',

      secondaryText:
        darkMode
          ? '#8292A8'
          : '#65758B',

      mutedText:
        darkMode
          ? '#5A6B80'
          : '#8A98A9',

      activeNav:
        darkMode
          ? '#111B29'
          : '#EFF4FF',

      input: darkMode
        ? '#0A111A'
        : '#F7F9FC',

      blue: '#1549C2',

      brightBlue: '#4A8CFF',

      success: '#16A34A',

      danger: '#DC2626',

      warning: '#D97706',

      purple: '#8B5CF6',
    }),
    [darkMode],
  )

  /* ------------------------------------------------------------------------ */
  /*                              ADD CELL                                   */
  /* ------------------------------------------------------------------------ */

  const addCell =
    useCallback(
      (type: CellType) => {
        const newCell: Cell = {
          id:
            Date.now() +
            Math.floor(
              Math.random() *
                1000,
            ),

          type,

          code:
            type === 'python'
              ? '# New Python cell\n'
              : type === 'sql'
                ? 'SELECT * FROM data LIMIT 10;'
                : '## New markdown cell',

          output: null,

          running: false,
        }

        setCells(
          (previous) => [
            ...previous,
            newCell,
          ],
        )

        setStatus(
          `${type
            .charAt(0)
            .toUpperCase()}${type.slice(
            1,
          )} cell added.`,
        )
      },
      [],
    )

  /* ------------------------------------------------------------------------ */
  /*                              DELETE CELL                                */
  /* ------------------------------------------------------------------------ */

  const deleteCell =
    useCallback(
      (id: number) => {
        setCells(
          (previous) =>
            previous.filter(
              (cell) =>
                cell.id !== id,
            ),
        )

        setStatus(
          'Cell deleted.',
        )
      },
      [],
    )

  /* ------------------------------------------------------------------------ */
  /*                              UPDATE CODE                                */
  /* ------------------------------------------------------------------------ */

  const updateCode =
    useCallback(
      (
        id: number,
        code: string,
      ) => {
        setCells(
          (previous) =>
            previous.map(
              (cell) =>
                cell.id === id
                  ? {
                      ...cell,

                      code,
                    }
                  : cell,
            ),
        )
      },
      [],
    )

  /* ------------------------------------------------------------------------ */
  /*                              MOVE CELL                                  */
  /* ------------------------------------------------------------------------ */

  const moveCell =
    useCallback(
      (
        sourceId: number,
        targetId: number,
      ) => {
        if (
          sourceId === targetId
        ) {
          return
        }

        setCells(
          (previous) => {
            const sourceIndex =
              previous.findIndex(
                (cell) =>
                  cell.id ===
                  sourceId,
              )

            const targetIndex =
              previous.findIndex(
                (cell) =>
                  cell.id ===
                  targetId,
              )

            if (
              sourceIndex ===
                -1 ||
              targetIndex === -1
            ) {
              return previous
            }

            const next =
              [...previous]

            const [
              moved,
            ] =
              next.splice(
                sourceIndex,
                1,
              )

            next.splice(
              targetIndex,
              0,
              moved,
            )

            return next
          },
        )
      },
      [],
    )

  /* ------------------------------------------------------------------------ */
  /*                              RUN PYTHON                                 */
  /* ------------------------------------------------------------------------ */

  const runPythonCell =
    useCallback(
      async (
        cell: Cell,
      ) => {
        if (cell.running) {
          return
        }

        setStatus(
          executionMode ===
            'cloud'
            ? 'Sending Python cell to cloud execution...'
            : 'Running Python cell in browser...',
        )

        setCells(
          (previous) =>
            previous.map(
              (current) =>
                current.id ===
                cell.id
                  ? {
                      ...current,

                      running: true,

                      output: null,
                    }
                  : current,
            ),
        )

        try {
          let result: ExecutionResult

          if (
            executionMode ===
            'browser'
          ) {
            result =
              await executePython(
                cell.code,
              )
          } else {
            const started =
              performance.now()

            try {
              const response =
                await fetch(
                  '/api/execute',
                  {
                    method:
                      'POST',

                    headers: {
                      'Content-Type':
                        'application/json',
                    },

                    body:
                      JSON.stringify(
                        {
                          language:
                            'python',

                          code:
                            cell.code,

                          cellId:
                            cell.id,
                        },
                      ),
                  },
                )

              const data =
                await response.json()

              if (
                !response.ok
              ) {
                result = {
                  success:
                    false,

                  type:
                    'error',

                  error:
                    data.error ||
                    data.detail ||
                    'Cloud execution failed.',

                  executionTime:
                    performance.now() -
                    started,
                }
              } else {
                result =
                  data
              }
            } catch (error) {
              result = {
                success:
                  false,

                type:
                  'error',

                error:
                  error instanceof
                  Error
                    ? error.message
                    : 'Cloud execution failed.',

                executionTime:
                  performance.now() -
                  started,
              }
            }
          }

          setCells(
            (previous) =>
              previous.map(
                (current) =>
                  current.id ===
                  cell.id
                    ? {
                        ...current,

                        running:
                          false,

                        output:
                          result,
                      }
                    : current,
              ),
          )

          if (
            result.success
          ) {
            setStatus(
              `Python cell finished${
                result.executionTime
                  ? ` · ${formatExecutionTime(
                      result.executionTime,
                    )}`
                  : ''
              }.`,
            )
          } else {
            setStatus(
              'Python execution failed.',
            )
          }
        } catch (error) {
          const result: ExecutionResult =
            {
              success:
                false,

              type:
                'error',

              error:
                error instanceof
                Error
                  ? error.message
                  : 'Python execution failed.',
            }

          setCells(
            (previous) =>
              previous.map(
                (current) =>
                  current.id ===
                  cell.id
                    ? {
                        ...current,

                        running:
                          false,

                        output:
                          result,
                      }
                    : current,
              ),
          )

          setStatus(
            'Python execution failed.',
          )
        }
      },
      [
        executionMode,
        executePython,
      ],
    )

  /* ------------------------------------------------------------------------ */
  /*                              RUN SQL                                    */
  /* ------------------------------------------------------------------------ */

  const runSQLCell =
    useCallback(
      async (
        cell: Cell,
      ) => {
        if (cell.running) {
          return
        }

        if (!duckDBReady) {
          setStatus(
            'SQL engine is still loading. Please wait.',
          )

          return
        }

        setCells(
          (previous) =>
            previous.map(
              (current) =>
                current.id ===
                cell.id
                  ? {
                      ...current,

                      running: true,

                      output: null,
                    }
                  : current,
            ),
        )

        setStatus(
          'Running SQL query...',
        )

        try {
          const result =
            await executeSQL(
              cell.code,
            )

          setCells(
            (previous) =>
              previous.map(
                (current) =>
                  current.id ===
                  cell.id
                    ? {
                        ...current,

                        running:
                          false,

                        output:
                          result,
                      }
                    : current,
              ),
          )

          setChartFilter((current) =>
            current?.cellId === cell.id
              ? null
              : current,
          )

          setChartStates(
            (current) => {
              if (
                !Object.prototype.hasOwnProperty.call(
                  current,
                  cell.id,
                )
              ) {
                return current
              }

              const next = {
                ...current,
              }

              delete next[cell.id]

              return next
            },
          )

          if (
            result.success
          ) {
            setStatus(
              `SQL query finished${
                result.executionTime
                  ? ` · ${formatExecutionTime(
                      result.executionTime,
                    )}`
                  : ''
              }.`,
            )
          } else {
            setStatus(
              'SQL query failed.',
            )
          }
        } catch (error) {
          const result: ExecutionResult =
            {
              success:
                false,

              type:
                'error',

              error:
                error instanceof
                Error
                  ? error.message
                  : 'SQL execution failed.',
            }

          setCells(
            (previous) =>
              previous.map(
                (current) =>
                  current.id ===
                  cell.id
                    ? {
                        ...current,

                        running:
                          false,

                        output:
                          result,
                      }
                    : current,
              ),
          )

          setStatus(
            'SQL execution failed.',
          )
        }
      },
      [
        duckDBReady,
        executeSQL,
      ],
    )

  const handleCellKeyDown =
    useCallback(
      (
        event: KeyboardEvent<HTMLTextAreaElement>,
        cell: Cell,
      ) => {
        if (
          cell.type !== 'sql'
        ) {
          return
        }

        if (
          event.shiftKey &&
          event.key === 'Enter'
        ) {
          event.preventDefault()
          event.stopPropagation()

          void runSQLCell(
            cell,
          )
        }
      },
      [runSQLCell],
    )

  /* ------------------------------------------------------------------------ */
  /*                              RUN MARKDOWN                               */
  /* ------------------------------------------------------------------------ */

  const runMarkdownCell =
    useCallback(
      async (
        cell: Cell,
      ) => {
        if (cell.running) {
          return
        }

        const result: ExecutionResult =
          {
            success:
              true,

            type:
              'markdown',

            text:
              cell.code,
          }

        setCells(
          (previous) =>
            previous.map(
              (current) =>
                current.id ===
                cell.id
                  ? {
                      ...current,

                      running:
                        false,

                      output:
                        result,
                    }
                  : current,
            ),
        )

        setStatus(
          'Markdown rendered.',
        )
      },
      [],
    )

  /* ------------------------------------------------------------------------ */
  /*                              RUN CELL                                   */
  /* ------------------------------------------------------------------------ */

  const runCell =
    useCallback(
      async (
        id: number,
      ) => {
        const target =
          cells.find(
            (cell) =>
              cell.id === id,
          )

        if (
          !target ||
          target.running
        ) {
          return
        }

        if (
          target.type ===
          'python'
        ) {
          await runPythonCell(
            target,
          )

          return
        }

        if (
          target.type ===
          'sql'
        ) {
          await runSQLCell(
            target,
          )

          return
        }

        await runMarkdownCell(
          target,
        )
      },
      [
        cells,
        runPythonCell,
        runSQLCell,
        runMarkdownCell,
      ],
    )

  /* ------------------------------------------------------------------------ */
  /*                              RUN ALL                                    */
  /* ------------------------------------------------------------------------ */

  const runAll =
    useCallback(
      async () => {
        if (
          cells.some(
            (cell) =>
              cell.running,
          )
        ) {
          return
        }

        setStatus(
          'Running all notebook cells...',
        )

        /*
         * Use the current ordered
         * cell IDs so execution
         * happens sequentially.
         */

        const cellIds =
          cells.map(
            (cell) =>
              cell.id,
          )

        for (
          const id of cellIds
        ) {
          await runCell(id)
        }

        setStatus(
          'All notebook cells finished.',
        )
      },
      [
        cells,
        runCell,
      ],
    )

  /* ------------------------------------------------------------------------ */
  /*                              SAVE                                        */
  /* ------------------------------------------------------------------------ */

  const saveNotebook =
    useCallback(() => {
      if (saving) {
        return
      }

      setSaving(true)

      setStatus(
        'Saving notebook...',
      )

      window.setTimeout(
        () => {
          try {
            const notebook =
              {
                name:
                  notebookName,

                cells:
                  cells.map(
                    (cell) => ({
                      ...cell,

                      running:
                        false,
                    }),
                  ),

                savedAt:
                  new Date().toISOString(),
              }

            localStorage.setItem(
              STORAGE_KEY,
              JSON.stringify(
                notebook,
              ),
            )

            setStatus(
              'Notebook saved locally.',
            )
          } catch {
            setStatus(
              'Unable to save notebook.',
            )
          }

          setSaving(false)
        },
        300,
      )
    }, [
      cells,
      notebookName,
      saving,
    ])

  /* ------------------------------------------------------------------------ */
  /*                              EXPORT                                      */
  /* ------------------------------------------------------------------------ */

  const exportNotebook =
    useCallback(() => {
      try {
        const notebook =
          {
            name:
              notebookName,

            cells:
              cells.map(
                (cell) => ({
                  id:
                    cell.id,

                  type:
                    cell.type,

                  code:
                    cell.code,
                }),
              ),

            savedAt:
              new Date().toISOString(),
          }

        const blob =
          new Blob(
            [
              JSON.stringify(
                notebook,
                null,
                2,
              ),
            ],
            {
              type:
                'application/json',
            },
          )

        const url =
          URL.createObjectURL(
            blob,
          )

        const anchor =
          document.createElement(
            'a',
          )

        anchor.href =
          url

        anchor.download =
          `${
            notebookName
              .trim()
              .replace(
                /[^a-z0-9-_]+/gi,
                '-',
              )
              .replace(
                /^-+|-+$/g,
                '',
              ) ||
            'notebook'
          }.json`

        document.body.appendChild(
          anchor,
        )

        anchor.click()

        anchor.remove()

        URL.revokeObjectURL(
          url,
        )

        setStatus(
          'Notebook exported.',
        )
      } catch {
        setStatus(
          'Unable to export notebook.',
        )
      }
    }, [
      cells,
      notebookName,
    ])

  /* ------------------------------------------------------------------------ */
  /*                              IMPORT                                      */
  /* ------------------------------------------------------------------------ */

  const importNotebook =
    useCallback(
      (
        event: ChangeEvent<HTMLInputElement>,
      ) => {
        const file =
          event.target.files?.[0]

        if (!file) {
          return
        }

        const reader =
          new FileReader()

        reader.onload =
          () => {
            try {
              const parsed =
                JSON.parse(
                  String(
                    reader.result,
                  ),
                )

              if (
                !parsed ||
                typeof parsed.name !==
                  'string' ||
                !Array.isArray(
                  parsed.cells,
                )
              ) {
                throw new Error(
                  'Invalid notebook.',
                )
              }

              const importedCells =
                parsed.cells.map(
                  (
                    cell: Cell,
                  ) => ({
                    ...cell,

                    running:
                      false,

                    output:
                      null,
                  }),
                )

              setNotebookName(
                parsed.name,
              )

              setCells(
                importedCells,
              )

              setStatus(
                'Notebook imported successfully.',
              )
            } catch {
              setStatus(
                'Unable to import notebook. Invalid JSON notebook.',
              )
            }
          }

        reader.readAsText(
          file,
        )

        event.target.value =
          ''
      },
      [],
    )

  /* ------------------------------------------------------------------------ */
  /*                              RESET NOTEBOOK                              */
  /* ------------------------------------------------------------------------ */

  const resetNotebook =
    useCallback(() => {
      const confirmed =
        window.confirm(
          'Reset this notebook to the default cells?',
        )

      if (!confirmed) {
        return
      }

      setNotebookName(
        'Untitled notebook',
      )

      setCells(
        initialCells,
      )

      setStatus(
        'Notebook reset.',
      )
    }, [])

  /* ------------------------------------------------------------------------ */
  /*                              SHARE                                       */
  /* ------------------------------------------------------------------------ */

  const shareNotebook =
    useCallback(
      async () => {
        if (sharing) {
          return
        }

        setSharing(true)

        try {
          const snapshot = {
            version: 1,
            name: notebookName,
            darkMode,
            cells: cells.map(
              (cell) => ({
                ...cell,
                running: false,
              }),
            ),
            chartStates,
            dashboardPins,
          }

          const encoded =
            encodeShareState(snapshot)

          const shareURL =
            `${window.location.origin}${window.location.pathname}#share=${encoded}`

          if (shareURL.length > 50000) {
            setStatus(
              'This analysis is too large to fit safely in a share link.',
            )
            return
          }

          let copied = false

          if (
            typeof navigator !==
              'undefined' &&
            navigator.clipboard &&
            window.isSecureContext
          ) {
            try {
              await navigator.clipboard.writeText(
                shareURL,
              )
              copied = true
            } catch {
              copied = false
            }
          }

          if (!copied) {
            const textarea =
              document.createElement(
                'textarea',
              )

            textarea.value =
              shareURL
            textarea.setAttribute(
              'readonly',
              '',
            )
            textarea.style.position =
              'fixed'
            textarea.style.left =
              '-9999px'
            textarea.style.top =
              '0'
            textarea.style.opacity =
              '0'

            document.body.appendChild(
              textarea,
            )

            textarea.focus()
            textarea.select()

            try {
              copied =
                document.execCommand(
                  'copy',
                )
            } finally {
              textarea.remove()
            }
          }

          if (copied) {
            setStatus(
              'Share link copied to clipboard.',
            )
          } else {
            window.prompt(
              'Copy this share link:',
              shareURL,
            )

            setStatus(
              'Share link generated.',
            )
          }
        } catch (error) {
          console.error(
            'Share analysis failed:',
            error,
          )
  
          const message =
            error instanceof Error
              ? error.message
              : String(error)
  
          setStatus(
            `Share failed: ${message}`,
          )
        } finally {
          setSharing(false)
        }
      },
      [
        cells,
        chartStates,
        dashboardPins,
        darkMode,
        notebookName,
        sharing,
      ],
    )

  /* ------------------------------------------------------------------------ */
  /*                              CSV UPLOAD                                  */
  /* ------------------------------------------------------------------------ */

  const handleCSVUpload =
    useCallback(
      async (
        event: ChangeEvent<HTMLInputElement>,
      ) => {
        const files =
          Array.from(
            event.target
              .files || [],
          )

        if (!files.length) {
          return
        }

        for (
          const file of files
        ) {
          if (
            !file.name
              .toLowerCase()
              .endsWith('.csv')
          ) {
            setStatus(
              `${file.name} is not a CSV file.`,
            )

            continue
          }

          try {
            const content =
              await file.text()

            /*
             * Load into Pyodide.
             */

            await loadCSV(
              file.name,
              content,
            )

            /*
             * Load into DuckDB.
             */

            const duckResult =
              await loadCSVIntoDuckDB(
                file.name,
                content,
              )

            setUploadedFiles(
              (previous) =>
                previous.includes(
                  file.name,
                )
                  ? previous
                  : [
                      ...previous,
                      file.name,
                    ],
            )

            setStatus(
              `CSV "${file.name}" loaded · ${duckResult.tableName} · ${duckResult.rowCount.toLocaleString()} rows`,
            )
          } catch (error) {
            setStatus(
              error instanceof
                Error
                ? error.message
                : `Unable to load ${file.name}.`,
            )
          }
        }

        event.target.value =
          ''
      },
      [
        loadCSV,
        loadCSVIntoDuckDB,
      ],
    )

  /* ------------------------------------------------------------------------ */
  /*                              RESET PYTHON                                */
  /* ------------------------------------------------------------------------ */

  const resetPythonKernel =
    useCallback(
      async () => {
        try {
          await resetPython()

          setStatus(
            'Python kernel reset.',
          )
        } catch {
          setStatus(
            'Unable to reset Python kernel.',
          )
        }
      },
      [resetPython],
    )

  /* ------------------------------------------------------------------------ */
  /*                              SQL TABLES                                  */
  /* ------------------------------------------------------------------------ */

  const inspectTables =
    useCallback(
      async () => {
        try {
          const tables =
            await getTables()

          if (!tables.length) {
            setStatus(
              'No SQL tables loaded.',
            )

            return
          }

          setStatus(
            `SQL tables: ${tables.join(
              ', ',
            )}`,
          )
        } catch {
          setStatus(
            'Unable to inspect SQL tables.',
          )
        }
      },
      [getTables],
    )

  /* ------------------------------------------------------------------------ */
  /*                         OPEN SAVED ANALYSIS                              */
  /* ------------------------------------------------------------------------ */

  const clearSQLCell =
    useCallback(
      (id: number) => {
        setCells(
          (previous) =>
            previous.map(
              (cell) =>
                cell.id === id
                  ? {
                      ...cell,
                      code: '',
                      output: null,
                      running: false,
                    }
                  : cell,
            ),
        )

        setChartFilter(
          (current) =>
            current?.cellId === id
              ? null
              : current,
        )

        setChartStates(
          (current) => {
            if (
              !Object.prototype.hasOwnProperty.call(
                current,
                id,
              )
            ) {
              return current
            }

            const next = {
              ...current,
            }

            delete next[id]

            return next
          },
        )

        setStatus(
          'SQL cell cleared.',
        )
      },
      [],
    )

  const duplicateSQLCell =
    useCallback(
      (id: number) => {
        const sourceCell =
          cells.find(
            (cell) =>
              cell.id === id,
          )

        if (
          !sourceCell ||
          sourceCell.type !==
            'sql'
        ) {
          return
        }

        const newId =
          Date.now() +
          Math.floor(
            Math.random() *
              1000,
          )

        const duplicatedCell: Cell =
          {
            id: newId,
            type: 'sql',
            code:
              sourceCell.code,
            output: null,
            running: false,
          }

        setCells(
          (previous) => {
            const index =
              previous.findIndex(
                (cell) =>
                  cell.id === id,
              )

            if (
              index < 0
            ) {
              return [
                ...previous,
                duplicatedCell,
              ]
            }

            const next =
              [...previous]

            next.splice(
              index + 1,
              0,
              duplicatedCell,
            )

            return next
          },
        )

        setStatus(
          'SQL cell duplicated.',
        )
      },
      [cells],
    )

  /* ------------------------------------------------------------------------ */
  /*                           DASHBOARD ACTIONS                              */
  /* ------------------------------------------------------------------------ */

  const toggleDashboardPin =
    useCallback(
      (
        cell: Cell,
      ) => {
        if (
          cell.type !== 'sql' ||
          !cell.output?.success ||
          cell.output.type !==
            'table' ||
          !cell.output.table
        ) {
          return
        }

        setDashboardPins(
          (current) => {
            const existing =
              current.find(
                (pin) =>
                  pin.cellId ===
                  cell.id,
              )

            if (existing) {
              setStatus(
                'Removed from dashboard.',
              )

              return current.filter(
                (pin) =>
                  pin.cellId !==
                  cell.id,
              )
            }

            const pin: DashboardPin =
              {
                id:
                  `${cell.id}-${Date.now()}`,
                cellId:
                  cell.id,
                title:
                  `Analysis ${cell.id}`,
                  columns:
                  cell.output?.table?.columns ?? [],
                rows:
                  cell.output?.table?.rows ?? [],
                chartState:
                  chartStates[
                    cell.id
                  ] ?? null,
              }

            setDashboardMode(
              true,
            )

            setStatus(
              'Added to dashboard.',
            )

            return [
              ...current,
              pin,
            ]
          },
        )
      },
      [chartStates],
    )

  const updateDashboardChartState =
    useCallback(
      (
        cellId: number,
        state: ChartState,
      ) => {
        setDashboardPins(
          (current) => {
            let changed = false

            const next =
              current.map(
                (pin) => {
                  if (
                    pin.cellId !==
                    cellId
                  ) {
                    return pin
                  }

                  const previous =
                    pin.chartState

                  const unchanged =
                    previous?.chartType ===
                      state.chartType &&
                    previous?.xColumn ===
                      state.xColumn &&
                    previous?.yColumn ===
                      state.yColumn

                  if (
                    unchanged
                  ) {
                    return pin
                  }

                  changed = true

                  return {
                    ...pin,
                    chartState:
                      state,
                  }
                },
              )

            return changed
              ? next
              : current
          },
        )
      },
      [],
    )

  const removeDashboardPin =
    useCallback(
      (pinId: string) => {
        setDashboardPins(
          (current) =>
            current.filter(
              (pin) =>
                pin.id !== pinId,
            ),
        )

        setStatus(
          'Removed from dashboard.',
        )
      },
      [],
    )

  const clearDashboard =
    useCallback(() => {
      setDashboardPins([])

      setStatus(
        'Dashboard cleared.',
      )
    }, [])

  /* ------------------------------------------------------------------------ */
  /*                         DUPLICATE ANALYSIS                              */
  /* ------------------------------------------------------------------------ */

  const duplicateSavedAnalysis =
    useCallback(
      (
        analysis: {
          id: number
          title: string
          query: string
          columns: string[]
          rows: unknown[][]
          chartState?: ChartState | null
        },
        newId: number,
      ) => {
        const restoredOutput =
          {
            success: true,
            type: 'table',
            table: {
              columns:
                analysis.columns,
              rows:
                analysis.rows,
            },
          } as ExecutionResult

        setChartFilter(null)

        setChartStates(
          (current) => ({
            ...current,
            [newId]:
              analysis.chartState ??
              null,
          }),
        )

        setCells(
          (previous) => [
            ...previous,
            {
              id: newId,
              type: 'sql',
              code:
                analysis.query,
              output:
                restoredOutput,
              running:
                false,
            },
          ],
        )

        setStatus(
          'Analysis duplicated.',
        )

        window.setTimeout(
          () => {
            const element =
              document.getElementById(
                `dock-cell-${newId}`,
              )

            element?.scrollIntoView(
              {
                behavior:
                  'smooth',
                block:
                  'center',
              },
            )
          },
          50,
        )
      },
      [],
    )

  const openSavedAnalysis =
    useCallback(
      (analysis: {
        id: number
        query: string
        columns: string[]
        rows: unknown[][]
        chartState?: ChartState | null
      }) => {
        const restoredOutput =
          {
            success: true,
            type: 'table',
            table: {
              columns:
                analysis.columns,
              rows:
                analysis.rows,
            },
          } as ExecutionResult

        setChartFilter(null)

        setChartStates(
          (current) => ({
            ...current,
            [analysis.id]:
              analysis.chartState ?? null,
          }),
        )

        setCells(
          (previous) => {
            const exists =
              previous.some(
                (cell) =>
                  cell.id ===
                  analysis.id,
              )

            if (exists) {
              return previous.map(
                (cell) =>
                  cell.id ===
                  analysis.id
                    ? {
                        ...cell,
                        type: 'sql',
                        code:
                          analysis.query,
                        output:
                          restoredOutput,
                        running:
                          false,
                      }
                    : cell,
              )
            }

            return [
              ...previous,
              {
                id:
                  analysis.id,
                type: 'sql',
                code:
                  analysis.query,
                output:
                  restoredOutput,
                running:
                  false,
              },
            ]
          },
        )

        setStatus(
          'Saved analysis reopened.',
        )

        window.setTimeout(
          () => {
            const element =
              document.getElementById(
                `dock-cell-${analysis.id}`,
              )

            element?.scrollIntoView(
              {
                behavior:
                  'smooth',
                block:
                  'center',
              },
            )
          },
          50,
        )
      },
      [],
    )

  /* ------------------------------------------------------------------------ */
  /*                              STATUS                                      */
  /* ------------------------------------------------------------------------ */

  const pythonStatus =
    executionMode ===
    'browser'
      ? pythonReady
        ? 'Ready'
        : 'Loading'
      : 'Cloud'

  const sqlStatus =
    duckDBReady
      ? 'Ready'
      : duckDBLoading
        ? 'Loading'
        : 'Unavailable'

  /* ------------------------------------------------------------------------ */
  /*                              RENDER                                      */
  /* ------------------------------------------------------------------------ */

  return (
    <div
      style={{
        minHeight:
          '100vh',

        background:
          colors.bg,

        color:
          colors.primaryText,

        fontFamily:
          "'Google Sans', 'Inter', 'Segoe UI', system-ui, sans-serif",

        transition:
          'background 180ms ease, color 180ms ease',
      }}
    >
      {/* ================================================================== */}
      {/* TOP NAVIGATION                                                     */}
      {/* ================================================================== */}

      <nav
        style={{
          display:
            'flex',

          alignItems:
            'center',

          justifyContent:
            'space-between',

          padding:
            '0 20px',

          height:
            '56px',

          background:
            colors.card,

          borderBottom:
            `1px solid ${colors.border}`,

          boxShadow:
            darkMode
              ? '0 1px 0 rgba(255,255,255,0.015)'
              : '0 1px 3px rgba(15,23,42,0.025)',

          gap:
            '16px',
        }}
      >
        {/* BRAND */}

        <Link
          href="/"
          style={{
            display:
              'flex',

            alignItems:
              'center',

            gap:
              '8px',

            textDecoration:
              'none',

            minWidth:
              '190px',
          }}
        >
          <Image
            src="/logo.png"
            alt="HackersHarbor"
            width={34}
            height={34}
            priority
          />

          <span
            style={{
              fontSize:
                '15px',

              fontWeight:
                650,

              letterSpacing:
                '-0.25px',

              color:
                colors.primaryText,
            }}
          >
            Hackers
            <span
              style={{
                color:
                  colors.blue,
              }}
            >
              Harbor
            </span>
          </span>
        </Link>

        {/* MAIN NAVIGATION */}

        <div
          style={{
            display:
              'flex',

            alignItems:
              'center',

            gap:
              '3px',
          }}
        >
          {[
            {
              label:
                'Dashboard',

              href:
                '/dashboard',
            },

            {
              label:
                'Practice',

              href:
                '/practice',
            },

            {
              label:
                'The Voyage',

              href:
                '/voyage',
            },

            {
              label:
                'The Dock',

              href:
                '/dock',
            },

            {
              label:
                'Community',

              href:
                '/community',
            },
          ].map(
            (item) => (
              <Link
                key={
                  item.label
                }
                href={
                  item.href
                }
                style={{
                  fontSize:
                    '12px',

                  fontWeight:
                    item.label ===
                    'The Dock'
                      ? 600
                      : 500,

                  color:
                    item.label ===
                    'The Dock'
                      ? colors.primaryText
                      : colors.secondaryText,

                  padding:
                    '7px 11px',

                  textDecoration:
                    'none',

                  background:
                    item.label ===
                    'The Dock'
                      ? colors.activeNav
                      : 'transparent',

                  borderRadius:
                    '6px',
                }}
              >
                {
                  item.label
                }
              </Link>
            ),
          )}
        </div>

        {/* RIGHT SIDE */}

        <div
          style={{
            display:
              'flex',

            alignItems:
              'center',

            justifyContent:
              'flex-end',

            gap:
              '10px',

            minWidth:
              '190px',
          }}
        >
          {/* THEME */}

          <button
            type="button"
            onClick={() =>
              setDarkMode(
                (value) =>
                  !value,
              )
            }
            aria-label="Toggle color theme"
            aria-pressed={
              darkMode
            }
            style={{
              width:
                '34px',

              height:
                '18px',

              padding:
                0,

              border:
                `1px solid ${
                  darkMode
                    ? '#2B4F89'
                    : '#C9D2DE'
                }`,

              borderRadius:
                '999px',

              background:
                darkMode
                  ? '#123C83'
                  : '#D9E0E8',

              position:
                'relative',

              cursor:
                'pointer',

              flexShrink:
                0,
            }}
          >
            <span
              style={{
                position:
                  'absolute',

                top:
                  '2px',

                left:
                  darkMode
                    ? '17px'
                    : '2px',

                width:
                  '12px',

                height:
                  '12px',

                borderRadius:
                  '50%',

                background:
                  '#FFFFFF',

                boxShadow:
                  '0 1px 3px rgba(0,0,0,0.22)',
              }}
            />
          </button>

          <Link
            href="/dashboard"
            style={{
              display:
                'inline-flex',

              alignItems:
                'center',

              justifyContent:
                'center',

              height:
                '32px',

              padding:
                '0 12px',

              fontSize:
                '12px',

              fontWeight:
                600,

              color:
                colors.brightBlue,

              textDecoration:
                'none',

              border:
                `1px solid ${
                  darkMode
                    ? '#1F3D70'
                    : '#D5E0F5'
                }`,

              borderRadius:
                '6px',

              background:
                darkMode
                  ? '#0D1726'
                  : '#F7F9FD',
            }}
          >
            Dashboard
          </Link>
        </div>
      </nav>

      {/* ================================================================== */}
      {/* MAIN LAYOUT                                                        */}
      {/* ================================================================== */}

      <div
        style={{
          display:
            'grid',

          gridTemplateColumns:
            '220px minmax(0, 1fr)',

          minHeight:
            'calc(100vh - 56px)',
        }}
      >
        {/* ================================================================ */}
        {/* SIDEBAR                                                          */}
        {/* ================================================================ */}

        <aside
          style={{
            background:
              colors.card,

            borderRight:
              `1px solid ${colors.border}`,

            minHeight:
              'calc(100vh - 56px)',

            padding:
              '12px 0',
          }}
        >
          <div
            style={{
              padding:
                '0 13px 12px',

              borderBottom:
                `1px solid ${colors.border}`,

              marginBottom:
                '8px',
            }}
          >
            <div
              style={{
                fontSize:
                  '11px',

                color:
                  colors.purple,

                marginBottom:
                  '4px',
              }}
            >
              📓 The Dock
            </div>

            <div
              style={{
                fontSize:
                  '13px',

                fontWeight:
                  600,

                color:
                  colors.primaryText,
              }}
            >
              My notebooks
            </div>
          </div>

          {[
            'Untitled notebook',
            'Data analysis',
            'SQL practice',
            'ML experiments',
          ].map(
            (
              notebook,
              index,
            ) => (
              <button
                key={
                  notebook
                }
                type="button"
                onClick={() =>
                  setStatus(
                    index === 0
                      ? 'Current notebook selected.'
                      : `${notebook} is ready for future notebook loading.`,
                  )
                }
                style={{
                  width:
                    '100%',

                  display:
                    'block',

                  textAlign:
                    'left',

                  padding:
                    '7px 13px',

                  fontSize:
                    '12px',

                  color:
                    index ===
                    0
                      ? colors.primaryText
                      : colors.secondaryText,

                  cursor:
                    'pointer',

                  background:
                    index ===
                    0
                      ? colors.activeNav
                      : 'transparent',

                  border:
                    'none',

                  borderLeft:
                    index ===
                    0
                      ? `2px solid ${colors.purple}`
                      : '2px solid transparent',

                  fontFamily:
                    'inherit',
                }}
              >
                {
                  notebook
                }
              </button>
            ),
          )}

          {/* ADD CELL */}

          <div
            style={{
              padding:
                '12px 13px',

              marginTop:
                '8px',

              borderTop:
                `1px solid ${colors.border}`,
            }}
          >
            <div
              style={{
                fontSize:
                  '10px',

                color:
                  colors.mutedText,

                marginBottom:
                  '7px',

                textTransform:
                  'uppercase',

                letterSpacing:
                  '0.06em',
              }}
            >
              Add cell
            </div>

            {(
              [
                'python',
                'sql',
                'markdown',
              ] as CellType[]
            ).map(
              (type) => (
                <button
                  key={
                    type
                  }
                  type="button"
                  onClick={() =>
                    addCell(
                      type,
                    )
                  }
                  style={{
                    display:
                      'block',

                    width:
                      '100%',

                    textAlign:
                      'left',

                    fontSize:
                      '11px',

                    color:
                      cellColor[
                        type
                      ],

                    background:
                      'transparent',

                    border:
                      'none',

                    cursor:
                      'pointer',

                    padding:
                      '5px 0',

                    fontFamily:
                      'inherit',
                  }}
                >
                  +{' '}
                  {type
                    .charAt(
                      0,
                    )
                    .toUpperCase() +
                    type.slice(
                      1,
                    )}
                </button>
              ),
            )}
          </div>

          {/* DATA */}

          <div
            style={{
              padding:
                '12px 13px',

              marginTop:
                '4px',

              borderTop:
                `1px solid ${colors.border}`,
            }}
          >
            <div
              style={{
                fontSize:
                  '10px',

                color:
                  colors.mutedText,

                marginBottom:
                  '7px',

                textTransform:
                  'uppercase',

                letterSpacing:
                  '0.06em',
              }}
            >
              Data
            </div>

            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              style={{
                width:
                  '100%',

                textAlign:
                  'left',

                fontSize:
                  '11px',

                color:
                  colors.brightBlue,

                background:
                  'transparent',

                border:
                  'none',

                cursor:
                  'pointer',

                padding:
                  '5px 0',

                fontFamily:
                  'inherit',
              }}
            >
              📁 Upload CSV
            </button>

            <input
              ref={
                fileInputRef
              }
              type="file"
              accept=".csv,text/csv"
              multiple
              onChange={
                handleCSVUpload
              }
              style={{
                display:
                  'none',
              }}
            />

            {uploadedFiles.length >
              0 && (
              <div
                style={{
                  marginTop:
                    '7px',
                }}
              >
                {uploadedFiles.map(
                  (file) => (
                    <div
                      key={
                        file
                      }
                      style={{
                        fontSize:
                          '10px',

                        color:
                          colors.secondaryText,

                        padding:
                          '3px 0',

                        overflow:
                          'hidden',

                        textOverflow:
                          'ellipsis',

                        whiteSpace:
                          'nowrap',
                      }}
                      title={
                        file
                      }
                    >
                      📄{' '}
                      {
                        file
                      }
                    </div>
                  ),
                )}
              </div>
            )}
            {duckDBReady && (
  <button
    type="button"
    onClick={async () => {
      try {
        const tables =
          await getTables()

        setStatus(
          tables.length
            ? `SQL tables: ${tables.join(', ')}`
            : 'No SQL tables loaded.',
        )
      } catch {
        setStatus(
          'Unable to inspect SQL tables.',
        )
      }
    }}
    style={{
      width: '100%',
      textAlign: 'left',
      fontSize: '10px',
      color: colors.secondaryText,
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      padding: '5px 0',
      fontFamily: 'inherit',
    }}
  >
    ◉ Inspect SQL tables
  </button>
)}

            <button
              type="button"
              onClick={
                inspectTables
              }
              disabled={
                !duckDBReady
              }
              style={{
                width:
                  '100%',

                textAlign:
                  'left',

                fontSize:
                  '10px',

                color:
                  duckDBReady
                    ? colors.secondaryText
                    : colors.mutedText,

                background:
                  'transparent',

                border:
                  'none',

                cursor:
                  duckDBReady
                    ? 'pointer'
                    : 'not-allowed',

                padding:
                  '6px 0',

                fontFamily:
                  'inherit',
              }}
            >
              ◉ Inspect SQL tables
            </button>
          </div>
        </aside>

        {/* ================================================================ */}
        {/* CONTENT                                                          */}
        {/* ================================================================ */}

        <main
          style={{
            minWidth:
              0,

            padding:
              '20px 24px 48px',

            overflowX:
              'hidden',
          }}
        >
          {/* NOTEBOOK HEADER */}

          <div
            style={{
              display:
                'flex',

              alignItems:
                'center',

              justifyContent:
                'space-between',

              gap:
                '16px',

              marginBottom:
                '16px',

              flexWrap:
                'wrap',
            }}
          >
            <div
              style={{
                minWidth:
                  0,

                flex:
                  1,
              }}
            >
              <input
                value={
                  notebookName
                }
                onChange={(
                  event,
                ) =>
                  setNotebookName(
                    event.target
                      .value,
                  )
                }
                aria-label="Notebook name"
                style={{
                  width:
                    '100%',

                  maxWidth:
                    '500px',

                  background:
                    'transparent',

                  border:
                    'none',

                  outline:
                    'none',

                  color:
                    colors.primaryText,

                  fontSize:
                    '18px',

                  fontWeight:
                    650,

                  letterSpacing:
                    '-0.25px',

                  padding:
                    0,

                  fontFamily:
                    'inherit',
                }}
              />

              <div
                style={{
                  fontSize:
                    '11px',

                  color:
                    colors.mutedText,

                  marginTop:
                    '5px',
                }}
              >
                Interactive coding
                notebook
                {' · '}
                {
                  cells.length
                }{' '}
                cells
              </div>
            </div>

            <div
              style={{
                display:
                  'flex',

                alignItems:
                  'center',

                gap:
                  '6px',

                flexWrap:
                  'wrap',
              }}
            >
              <button
                type="button"
                onClick={
                  saveNotebook
                }
                disabled={
                  saving
                }
                style={{
                  fontSize:
                    '11px',

                  fontWeight:
                    600,

                  color:
                    colors.secondaryText,

                  background:
                    darkMode
                      ? '#111A27'
                      : '#F7F9FC',

                  border:
                    `1px solid ${colors.border}`,

                  borderRadius:
                    '5px',

                  padding:
                    '6px 12px',

                  cursor:
                    saving
                      ? 'wait'
                      : 'pointer',

                  fontFamily:
                    'inherit',
                }}
              >
                {saving
                  ? 'Saving...'
                  : 'Save'}
              </button>

              <button
                type="button"
                onClick={
                  exportNotebook
                }
                style={{
                  fontSize:
                    '11px',

                  fontWeight:
                    600,

                  color:
                    colors.secondaryText,

                  background:
                    darkMode
                      ? '#111A27'
                      : '#F7F9FC',

                  border:
                    `1px solid ${colors.border}`,

                  borderRadius:
                    '5px',

                  padding:
                    '6px 12px',

                  cursor:
                    'pointer',

                  fontFamily:
                    'inherit',
                }}
              >
                Export
              </button>

              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById(
                      'dock-import-input',
                    )
                    ?.click()
                }
                style={{
                  fontSize:
                    '11px',

                  fontWeight:
                    600,

                  color:
                    colors.secondaryText,

                  background:
                    darkMode
                      ? '#111A27'
                      : '#F7F9FC',

                  border:
                    `1px solid ${colors.border}`,

                  borderRadius:
                    '5px',

                  padding:
                    '6px 12px',

                  cursor:
                    'pointer',

                  fontFamily:
                    'inherit',
                }}
              >
                Import
              </button>

              <input
                id="dock-import-input"
                type="file"
                accept=".json,application/json"
                onChange={
                  importNotebook
                }
                style={{
                  display:
                    'none',
                }}
              />

              <button
                type="button"
                title="Share analysis"
                onClick={
                  shareNotebook
                }
                disabled={
                  sharing
                }
                style={{
                  fontSize:
                    '11px',

                  fontWeight:
                    600,

                  color:
                    colors.secondaryText,

                  background:
                    darkMode
                      ? '#111A27'
                      : '#F7F9FC',

                  border:
                    `1px solid ${colors.border}`,

                  borderRadius:
                    '5px',

                  padding:
                    '6px 12px',

                  cursor:
                    sharing
                      ? 'wait'
                      : 'pointer',

                  fontFamily:
                    'inherit',
                }}
              >
                {sharing
                  ? 'Sharing...'
                  : 'Share analysis'}
              </button>

              <button
                type="button"
                title="Open Harbor Fusion"
                onClick={() =>
                  setFusionMode(true)
                }
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: fusionMode
                    ? '#FFFFFF'
                    : colors.blue,
                  background: fusionMode
                    ? colors.blue
                    : darkMode
                      ? '#10233D'
                      : '#EFF6FF',
                  border: `1px solid ${colors.blue}`,
                  borderRadius: '5px',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Fusion
              </button>

              <button
                type="button"
                onClick={
                  resetNotebook
                }
                style={{
                  fontSize:
                    '11px',

                  fontWeight:
                    600,

                  color:
                    colors.danger,

                  background:
                    darkMode
                      ? '#1A0A0A'
                      : '#FFF1F2',

                  border:
                    `1px solid ${
                      darkMode
                        ? '#3A1717'
                        : '#FECACA'
                    }`,

                  borderRadius:
                    '5px',

                  padding:
                    '6px 12px',

                  cursor:
                    'pointer',

                  fontFamily:
                    'inherit',
                }}
              >
                Reset
              </button>
            </div>
          </div>

          {/* EXECUTION BAR */}

          <div
            style={{
              display:
                'flex',

              alignItems:
                'center',

              justifyContent:
                'space-between',

              gap:
                '12px',

              padding:
                '9px 11px',

              marginBottom:
                '12px',

              background:
                colors.card,

              border:
                `1px solid ${colors.border}`,

              borderRadius:
                '7px',

              flexWrap:
                'wrap',
            }}
          >
            <div
              style={{
                display:
                  'flex',

                alignItems:
                  'center',

                gap:
                  '10px',

                flexWrap:
                  'wrap',
              }}
            >
              <span
                style={{
                  fontSize:
                    '11px',

                  fontWeight:
                    600,

                  color:
                    colors.primaryText,
                }}
              >
                Execution
              </span>

              <select
                value={
                  executionMode
                }
                onChange={(
                  event,
                ) =>
                  setExecutionMode(
                    event.target
                      .value as ExecutionMode,
                  )
                }
                style={{
                  fontSize:
                    '11px',

                  color:
                    colors.primaryText,

                  background:
                    colors.input,

                  border:
                    `1px solid ${colors.border}`,

                  borderRadius:
                    '5px',

                  padding:
                    '5px 8px',

                  outline:
                    'none',

                  fontFamily:
                    'inherit',
                }}
              >
                <option value="browser">
                  Browser
                </option>

                <option value="cloud">
                  Cloud
                </option>
              </select>

              <span
                style={{
                  display:
                    'inline-flex',

                  alignItems:
                    'center',

                  gap:
                    '5px',

                  fontSize:
                    '10px',

                  color:
                    colors.secondaryText,
                }}
              >
                <span
                  style={{
                    width:
                      '7px',

                    height:
                      '7px',

                    borderRadius:
                      '50%',

                    background:
                      pythonReady &&
                      duckDBReady
                        ? colors.success
                        : colors.warning,
                  }}
                />

                Python:{' '}
                {
                  pythonStatus
                }

                {' · '}

                SQL:{' '}
                {
                  sqlStatus
                }
              </span>
            </div>

            <div
              style={{
                display:
                  'flex',

                gap:
                  '8px',
              }}
            >
              {executionMode ===
                'browser' && (
                <button
                  type="button"
                  onClick={
                    resetPythonKernel
                  }
                  style={{
                    fontSize:
                      '10px',

                    color:
                      colors.secondaryText,

                    background:
                      'transparent',

                    border:
                      'none',

                    cursor:
                      'pointer',

                    padding:
                      '4px 6px',

                    fontFamily:
                      'inherit',
                  }}
                >
                  Reset Python
                </button>
              )}
            </div>
          </div>

          {/* STATUS */}

          {status && (
            <div
              style={{
                marginBottom:
                  '12px',

                padding:
                  '8px 10px',

                background:
                  darkMode
                    ? '#0D1726'
                    : '#F3F7FF',

                border:
                  `1px solid ${
                    darkMode
                      ? '#1F3D70'
                      : '#DCE7FA'
                  }`,

                borderRadius:
                  '6px',

                color:
                  colors.secondaryText,

                fontSize:
                  '11px',
              }}
            >
              {
                status
              }
            </div>
          )}

          {/* TOOLBAR */}

          <div
            style={{
              display:
                'flex',

              gap:
                '6px',

              marginBottom:
                '16px',

              alignItems:
                'center',

              flexWrap:
                'wrap',
            }}
          >
            {(
              [
                'python',
                'sql',
                'markdown',
              ] as CellType[]
            ).map(
              (type) => (
                <button
                  key={
                    type
                  }
                  type="button"
                  onClick={() =>
                    addCell(
                      type,
                    )
                  }
                  style={{
                    fontSize:
                      '11px',

                    fontWeight:
                      550,

                    padding:
                      '6px 13px',

                    borderRadius:
                      '5px',

                    border:
                      `1px solid ${cellColor[type]}40`,

                    cursor:
                      'pointer',

                    background:
                      darkMode
                        ? '#0D1520'
                        : '#FFFFFF',

                    color:
                      cellColor[
                        type
                      ],

                    fontFamily:
                      'inherit',
                  }}
                >
                  +{' '}
                  {type
                    .charAt(
                      0,
                    )
                    .toUpperCase() +
                    type.slice(
                      1,
                    )}{' '}
                  cell
                </button>
              ),
            )}

            <button
              type="button"
              onClick={() =>
                setDashboardMode(
                  (current) =>
                    !current,
                )
              }
              style={{
                fontSize:
                  '11px',
                fontWeight:
                  600,
                padding:
                  '6px 12px',
                borderRadius:
                  '5px',
                border:
                  `1px solid ${
                    dashboardMode
                      ? colors.blue
                      : colors.border
                  }`,
                cursor:
                  'pointer',
                background:
                  dashboardMode
                    ? colors.blue
                    : colors.card,
                color:
                  dashboardMode
                    ? '#FFFFFF'
                    : colors.primaryText,
                fontFamily:
                  'inherit',
              }}
            >
              {dashboardMode
                ? 'Hide dashboard'
                : 'Dashboard'}
              {dashboardPins.length >
                0
                ? ` · ${dashboardPins.length}`
                : ''}
            </button>

            <button
              type="button"
              onClick={
                runAll
              }
              style={{
                fontSize:
                  '11px',

                fontWeight:
                  600,

                padding:
                  '6px 14px',

                borderRadius:
                  '5px',

                border:
                  'none',

                cursor:
                  'pointer',

                background:
                  colors.blue,

                color:
                  '#FFFFFF',

                marginLeft:
                  'auto',

                fontFamily:
                  'inherit',
              }}
            >
              ▶ Run all
            </button>
          </div>

          {/* ============================================================ */}
          {/* ANALYSIS HISTORY                                             */}
          {/* ============================================================ */}

          <AnalysisHistory
            cells={cells}
            darkMode={darkMode}
            chartStates={chartStates}
            onOpenAnalysis={
              openSavedAnalysis
            }
            onDuplicateAnalysis={
              duplicateSavedAnalysis
            }
          />

          {fusionMode && (
            <FusionWorkspace
              cells={cells}
              darkMode={darkMode}
              colors={colors}
              chartStates={chartStates}
              dashboardPins={dashboardPins}
              onUpdateCode={updateCode}
              onRunCell={runCell}
              onChartStateChange={(cellId, state) => {
                setChartStates((current) => {
                  const previous = current[cellId]
                  if (
                    previous?.chartType === state.chartType &&
                    previous?.xColumn === state.xColumn &&
                    previous?.yColumn === state.yColumn
                  ) {
                    return current
                  }
                  return { ...current, [cellId]: state }
                })
                updateDashboardChartState(cellId, state)
              }}
              onPointClick={(cellId, column, value) =>
                setChartFilter({ cellId, column, value })
              }
              onRemoveDashboardPin={removeDashboardPin}
              onClearDashboard={clearDashboard}
              onDashboardChartStateChange={updateDashboardChartState}
              onOpenAnalysis={openSavedAnalysis}
              onDuplicateAnalysis={duplicateSavedAnalysis}
            />
          )}

          <div
            style={{
              display: fusionMode ? 'none' : 'block',
            }}
          >

          {dashboardMode && (
            <Dashboard
              pins={
                dashboardPins
              }
              darkMode={
                darkMode
              }
              onRemovePin={
                removeDashboardPin
              }
              onClear={
                clearDashboard
              }
              onChartStateChange={
                updateDashboardChartState
              }
            />
          )}

          {/* ============================================================ */}
          {/* CELLS                                                        */}
          {/* ============================================================ */}

          {cells.map(
            (
              cell,
              index,
            ) => (
              <div
                id={`dock-cell-${cell.id}`}
                key={
                  cell.id
                }
                draggable
                onDragStart={() =>
                  setDraggedCellId(
                    cell.id,
                  )
                }
                onDragEnd={() =>
                  setDraggedCellId(
                    null,
                  )
                }
                onDragOver={(
                  event,
                ) => {
                  event.preventDefault()
                }}
                onDrop={() => {
                  if (
                    draggedCellId !==
                    null
                  ) {
                    moveCell(
                      draggedCellId,
                      cell.id,
                    )
                  }

                  setDraggedCellId(
                    null,
                  )
                }}
                style={{
                  background:
                    colors.card,

                  border:
                    `1px solid ${colors.border}`,

                  borderRadius:
                    '7px',

                  marginBottom:
                    '12px',

                  overflow:
                    'hidden',

                  opacity:
                    draggedCellId ===
                    cell.id
                      ? 0.65
                      : 1,
                }}
              >
                {/* CELL HEADER */}

                <div
                  style={{
                    display:
                      'flex',

                    alignItems:
                      'center',

                    justifyContent:
                      'space-between',

                    gap:
                      '10px',

                    padding:
                      '7px 9px',

                    borderBottom:
                      `1px solid ${colors.border}`,

                    background:
                      darkMode
                        ? '#0C141E'
                        : '#FAFBFD',
                  }}
                >
                  <div
                    style={{
                      display:
                        'flex',

                      alignItems:
                        'center',

                      gap:
                        '8px',
                    }}
                  >
                    <span
                      style={{
                        fontSize:
                          '10px',

                        color:
                          colors.mutedText,

                        cursor:
                          'grab',

                        userSelect:
                          'none',
                      }}
                    >
                      ⋮⋮
                    </span>

                    <span
                      style={{
                        fontSize:
                          '10px',

                        fontWeight:
                          650,

                        color:
                          cellColor[
                            cell.type
                          ],

                        textTransform:
                          'uppercase',

                        letterSpacing:
                          '0.05em',
                      }}
                    >
                      {
                        cell.type
                      }
                    </span>

                    <span
                      style={{
                        fontSize:
                          '10px',

                        color:
                          colors.mutedText,
                      }}
                    >
                      [
                      {index +
                        1}
                      ]
                    </span>

                    {cell.running && (
                      <span
                        style={{
                          fontSize:
                            '10px',

                          color:
                            colors.warning,
                        }}
                      >
                        Running...
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      display:
                        'flex',

                      alignItems:
                        'center',

                      gap:
                        '5px',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        runCell(
                          cell.id,
                        )
                      }
                      disabled={
                        cell.running ||
                        (
                          cell.type === 'python' &&
                          executionMode === 'browser' &&
                          !pythonReady
                        ) ||
                        (
                          cell.type === 'sql' &&
                          !duckDBReady
                        )
                      }
                      
                      style={{
                        fontSize:
                          '10px',

                        fontWeight:
                          600,

                        color:
                          '#FFFFFF',

                        background:
                          cell.running
                            ? '#64748B'
                            : cellColor[
                                cell.type
                              ],

                        border:
                          'none',

                        borderRadius:
                          '4px',

                        padding:
                          '4px 9px',

                        cursor:
                          cell.running
                            ? 'wait'
                            : 'pointer',

                        fontFamily:
                          'inherit',
                      }}
                    >
                      {cell.running
                        ? 'Running...'
                        : '▶ Run'}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deleteCell(
                          cell.id,
                        )
                      }
                      style={{
                        fontSize:
                          '10px',

                        color:
                          colors.danger,

                        background:
                          'transparent',

                        border:
                          'none',

                        cursor:
                          'pointer',

                        padding:
                          '4px 6px',

                        fontFamily:
                          'inherit',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {cell.type ===
                  'sql' && (
                  <div
                    style={{
                      display:
                        'flex',
                      alignItems:
                        'center',
                      justifyContent:
                        'space-between',
                      gap:
                        '8px',
                      padding:
                        '7px 10px',
                      borderTop:
                        `1px solid ${colors.border}`,
                      borderBottom:
                        `1px solid ${colors.border}`,
                      background:
                        colors.card,
                      flexWrap:
                        'wrap',
                    }}
                  >
                    <div
                      style={{
                        display:
                          'flex',
                        alignItems:
                          'center',
                        gap:
                        '6px',
                        flexWrap:
                          'wrap',
                      }}
                    >
                      <span
                        style={{
                          color:
                            colors.mutedText,
                          fontSize:
                            '9px',
                          fontWeight:
                            700,
                          letterSpacing:
                            '0.06em',
                          textTransform:
                            'uppercase',
                          marginRight:
                            '2px',
                        }}
                      >
                        SQL
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          const formatted =
                            formatSQL(
                              cell.code,
                            )

                          updateCode(
                            cell.id,
                            formatted,
                          )

                          setStatus(
                            'SQL formatted.',
                          )
                        }}
                        disabled={
                          cell.running
                        }
                        style={{
                          fontSize:
                            '10px',
                          color:
                            colors.primaryText,
                          background:
                            colors.input,
                          border:
                            `1px solid ${colors.border}`,
                          borderRadius:
                            '4px',
                          padding:
                            '5px 8px',
                          cursor:
                            cell.running
                              ? 'not-allowed'
                              : 'pointer',
                          fontFamily:
                            'inherit',
                          opacity:
                            cell.running
                              ? 0.55
                              : 1,
                        }}
                      >
                        Format SQL
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          duplicateSQLCell(
                            cell.id,
                          )
                        }
                        disabled={
                          cell.running
                        }
                        style={{
                          fontSize:
                            '10px',
                          color:
                            colors.primaryText,
                          background:
                            colors.input,
                          border:
                            `1px solid ${colors.border}`,
                          borderRadius:
                            '4px',
                          padding:
                            '5px 8px',
                          cursor:
                            cell.running
                              ? 'not-allowed'
                              : 'pointer',
                          fontFamily:
                            'inherit',
                          opacity:
                            cell.running
                              ? 0.55
                              : 1,
                        }}
                      >
                        Duplicate
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          clearSQLCell(
                            cell.id,
                          )
                        }
                        disabled={
                          cell.running
                        }
                        style={{
                          fontSize:
                            '10px',
                          color:
                            colors.danger,
                          background:
                            'transparent',
                          border:
                            `1px solid ${
                              darkMode
                                ? '#3A2024'
                                : '#F1C9CE'
                            }`,
                          borderRadius:
                            '4px',
                          padding:
                            '5px 8px',
                          cursor:
                            cell.running
                              ? 'not-allowed'
                              : 'pointer',
                          fontFamily:
                            'inherit',
                          opacity:
                            cell.running
                              ? 0.55
                              : 1,
                        }}
                      >
                        Clear
                      </button>
                    </div>

                    <span
                      style={{
                        color:
                          colors.mutedText,
                        fontSize:
                          '9px',
                        whiteSpace:
                          'nowrap',
                      }}
                    >
                      Shift + Enter to run
                    </span>
                  </div>
                )}

                {/* CODE EDITOR */}

                <textarea
                  value={
                    cell.code
                  }
                  onChange={(
                    event,
                  ) =>
                    updateCode(
                      cell.id,
                      event.target
                        .value,
                    )
                  }
                  onKeyDown={(
                    event,
                  ) =>
                    handleCellKeyDown(
                      event,
                      cell,
                    )
                  }
                  spellCheck={
                    false
                  }
                  aria-label={`${cell.type} cell ${
                    index + 1
                  }`}
                  style={{
                    display:
                      'block',

                    width:
                      '100%',

                    minHeight:
                      cell.type ===
                      'markdown'
                        ? '100px'
                        : '145px',

                    boxSizing:
                      'border-box',

                    resize:
                      'vertical',

                    border:
                      'none',

                    outline:
                      'none',

                    padding:
                      '14px 15px',

                    background:
                      colors.editor,

                    color:
                      colors.primaryText,

                    fontFamily:
                      "'JetBrains Mono', 'SFMono-Regular', Consolas, monospace",

                    fontSize:
                      '12px',

                    lineHeight:
                      '1.65',
                  }}
                />

                {/* OUTPUT */}

                {cell.output && (
                  <div
                    style={{
                      borderTop:
                        `1px solid ${colors.border}`,

                      background:
                        colors.output,
                    }}
                  >
                    <div
                      style={{
                        padding:
                          '7px 10px',

                        borderBottom:
                          `1px solid ${colors.subtleBorder}`,

                        fontSize:
                          '9px',

                        fontWeight:
                          650,

                        color:
                          colors.mutedText,

                        textTransform:
                          'uppercase',

                        letterSpacing:
                          '0.06em',
                      }}
                    >
                      Output

                      {cell
                        .output
                        .executionTime && (
                        <span
                          style={{
                            marginLeft:
                              '8px',

                            fontWeight:
                              500,

                            textTransform:
                              'none',

                            letterSpacing:
                              'normal',
                          }}
                        >
                          ·{' '}
                          {
                            formatExecutionTime(
                              cell
                                .output
                                .executionTime,
                            )
                          }
                        </span>
                      )}
                    </div>

                    {/* ERROR */}

                    {!cell
                      .output
                      .success && (
                      <pre
                        style={{
                          margin:
                            0,

                          padding:
                            '12px 14px',

                          whiteSpace:
                            'pre-wrap',

                          overflowX:
                            'auto',

                          color:
                            '#EF4444',

                          fontFamily:
                            "'JetBrains Mono', monospace",

                          fontSize:
                            '11px',

                          lineHeight:
                            '1.6',
                        }}
                      >
                        {cell
                          .output
                          .error ||
                          'Execution failed.'}
                      </pre>
                    )}

                    {/* TEXT */}

                    {cell
                      .output
                      .success &&
                      cell.output
                        .type ===
                        'text' && (
                        <pre
                          style={{
                            margin:
                              0,

                            padding:
                              '12px 14px',

                            whiteSpace:
                              'pre-wrap',

                            overflowX:
                              'auto',

                            color:
                              colors.primaryText,

                            fontFamily:
                              "'JetBrains Mono', monospace",

                            fontSize:
                              '11px',

                            lineHeight:
                              '1.6',
                          }}
                        >
                          {
                            cell
                              .output
                              .text
                          }
                        </pre>
                      )}

                    {/* MARKDOWN */}

                    {cell
                      .output
                      .success &&
                      cell.output
                        .type ===
                        'markdown' && (
                        <div
                          style={{
                            padding:
                              '14px',

                            whiteSpace:
                              'pre-wrap',

                            color:
                              colors.primaryText,

                            fontSize:
                              '12px',

                            lineHeight:
                              '1.7',
                          }}
                        >
                          {
                            cell
                              .output
                              .text
                          }
                        </div>
                      )}

                    {/* TABLE */}

{cell
  .output
  .success &&
  cell.output
    .type ===
    'table' &&
  cell.output
    .table && (
    <>
      {/* EXPORTS */}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          flexWrap: 'wrap',
        }}
      >
        <ExportActions
          columns={
            cell.output.table
              .columns
          }
          rows={
            cell.output.table
              .rows
          }
          darkMode={
            darkMode
          }
          filename={
            `hackersharbor-results-${cell.id}.csv`
          }
        />

        <PDFReportButton
          columns={
            cell.output.table
              .columns
          }
          rows={
            cell.output.table
              .rows
          }
          darkMode={
            darkMode
          }
        />
      </div>

      {/* DASHBOARD PIN */}

      <div
        style={{
          display:
            'flex',
          justifyContent:
            'flex-end',
          margin:
            '6px 0 4px',
        }}
      >
        <button
          type="button"
          onClick={() =>
            toggleDashboardPin(
              cell,
            )
          }
          style={{
            fontSize:
              '10px',
            fontWeight:
              600,
            padding:
              '5px 9px',
            borderRadius:
              '4px',
            border:
              `1px solid ${colors.border}`,
            background:
              dashboardPins.some(
                (pin) =>
                  pin.cellId ===
                  cell.id,
              )
                ? colors.blue
                : colors.card,
            color:
              dashboardPins.some(
                (pin) =>
                  pin.cellId ===
                  cell.id,
              )
                ? '#FFFFFF'
                : colors.primaryText,
            cursor:
              'pointer',
            fontFamily:
              'inherit',
          }}
        >
          {dashboardPins.some(
            (pin) =>
              pin.cellId ===
              cell.id,
          )
            ? 'Pinned to dashboard'
            : 'Pin to dashboard'}
        </button>
      </div>

      {/* TABLE */}

      <SmartTable
        columns={
          cell.output.table
            .columns
        }
        rows={
          cell.output.table
            .rows
        }
        darkMode={
          darkMode
        }
        pageSize={25}
        chartFilter={
          chartFilter?.cellId ===
          cell.id
            ? {
                column:
                  chartFilter.column,
                value:
                  chartFilter.value,
              }
            : null
        }
        onClearChartFilter={() =>
          setChartFilter(
            (current) =>
              current?.cellId ===
              cell.id
                ? null
                : current,
          )
        }
      />

      {/* COLUMN INTELLIGENCE */}

      <ColumnIntelligence
        columns={
          cell.output.table
            .columns
        }
        rows={
          cell.output.table
            .rows
        }
        darkMode={
          darkMode
        }
      />

      {/* INSIGHT */}

      <SmartInsight
        columns={
          cell.output.table
            .columns
        }
        rows={
          cell.output.table
            .rows
        }
        darkMode={
          darkMode
        }
      />

      <AdvancedAIInsights
        columns={
          cell.output.table
            .columns
        }
        rows={
          cell.output.table
            .rows
        }
        darkMode={
          darkMode
        }
      />

      {/* CHART */}

      <SQLChart
        columns={
          cell.output.table
            .columns
        }
        rows={
          cell.output.table
            .rows
        }
        darkMode={
          darkMode
        }
        chartState={
          chartStates[cell.id] ??
          null
        }
        onChartStateChange={(
          state,
        ) => {
          setChartStates(
            (current) => {
              const previous =
                current[cell.id]

              if (
                previous &&
                previous.chartType ===
                  state.chartType &&
                previous.xColumn ===
                  state.xColumn &&
                previous.yColumn ===
                  state.yColumn
              ) {
                return current
              }

              const next = {
                ...current,
                [cell.id]:
                  state,
              }

              updateDashboardChartState(
                cell.id,
                state,
              )

              return next
            },
          )
        }}
        exportFilename={
          `hackersharbor-chart-${cell.id}`
        }
        onPointClick={(
          column,
          value,
        ) =>
          setChartFilter({
            cellId:
              cell.id,
            column,
            value,
          })
        }
      />
    </>
  )}

                    {/* JSON */}

                    {cell
                      .output
                      .success &&
                      cell.output
                        .type ===
                        'json' && (
                        <pre
                          style={{
                            margin:
                              0,

                            padding:
                              '12px 14px',

                            whiteSpace:
                              'pre-wrap',

                            overflowX:
                              'auto',

                            color:
                              colors.primaryText,

                            fontFamily:
                              "'JetBrains Mono', monospace",

                            fontSize:
                              '11px',

                            lineHeight:
                              '1.6',
                          }}
                        >
                          {
                            cell
                              .output
                              .text
                          }
                        </pre>
                      )}
                  </div>
                )}

                {/* EMPTY OUTPUT */}

                {!cell.output &&
                  !cell.running && (
                    <div
                      style={{
                        padding:
                          '7px 10px',

                        borderTop:
                          `1px solid ${colors.subtleBorder}`,

                        color:
                          colors.mutedText,

                        fontSize:
                          '10px',

                        background:
                          darkMode
                            ? '#080E15'
                            : '#FBFCFE',
                      }}
                    >
                      No output yet.
                      Run this cell
                      to execute
                      it.
                    </div>
                  )}
              </div>
            ),
          )}

          </div>

          {/* FUSION NORMAL CONTENT END */}

          {/* EMPTY NOTEBOOK */}

          {cells.length ===
            0 && (
            <div
              style={{
                padding:
                  '50px 20px',

                textAlign:
                  'center',

                border:
                  `1px dashed ${colors.border}`,

                borderRadius:
                  '8px',

                color:
                  colors.secondaryText,
              }}
            >
              <div
                style={{
                  fontSize:
                    '14px',

                  fontWeight:
                    600,

                  marginBottom:
                    '6px',
                }}
              >
                Your notebook
                is empty
              </div>

              <div
                style={{
                  fontSize:
                    '11px',

                  marginBottom:
                    '14px',
                }}
              >
                Add a Python,
                SQL, or
                Markdown cell
                to begin.
              </div>

              <button
                type="button"
                onClick={() =>
                  addCell(
                    'python',
                  )
                }
                style={{
                  fontSize:
                    '11px',

                  fontWeight:
                    600,

                  color:
                    '#FFFFFF',

                  background:
                    colors.blue,

                  border:
                    'none',

                  borderRadius:
                    '5px',

                  padding:
                    '7px 13px',

                  cursor:
                    'pointer',

                  fontFamily:
                    'inherit',
                }}
              >
                + Python cell
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}