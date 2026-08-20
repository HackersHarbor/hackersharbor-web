'use client'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Cell,
} from '@/components/dock/types'

type SavedAnalysis = {
  id: number
  title: string
  query: string
  columns: string[]
  rows: unknown[][]
  rowCount: number
  savedAt: number
  customTitle?: boolean
  chartState?: {
    chartType: 'bar' | 'line' | 'scatter' | 'pie'
    xColumn: string
    yColumn: string
  } | null
}

type AnalysisHistoryProps = {
  cells: Cell[]
  darkMode?: boolean
  chartStates?: Record<
    number,
    {
      chartType: 'bar' | 'line' | 'scatter' | 'pie'
      xColumn: string
      yColumn: string
    } | null
  >
  onOpenAnalysis?: (
    analysis: {
      id: number
      title: string
      query: string
      columns: string[]
      rows: unknown[][]
      chartState?: {
        chartType: 'bar' | 'line' | 'scatter' | 'pie'
        xColumn: string
        yColumn: string
      } | null
    },
  ) => void
  onDuplicateAnalysis?: (
    analysis: {
      id: number
      title: string
      query: string
      columns: string[]
      rows: unknown[][]
      chartState?: {
        chartType: 'bar' | 'line' | 'scatter' | 'pie'
        xColumn: string
        yColumn: string
      } | null
    },
    newId: number,
  ) => void
}

const HISTORY_STORAGE_KEY =
  'hackersharbor-dock-analysis-history'

function getAutoTitle(
  code: string,
) {
  const query = code
    .replace(
      /--.*$/gm,
      '',
    )
    .replace(
      /\s+/g,
      ' ',
    )
    .trim()

  if (!query) {
    return 'SQL analysis'
  }

  return query.length > 64
    ? `${query.slice(
        0,
        64,
      )}…`
    : query
}

function formatSavedAt(
  timestamp: number,
) {
  const diff =
    Date.now() -
    timestamp

  if (diff < 60_000) {
    return 'Just now'
  }

  if (diff < 3_600_000) {
    return `${Math.max(
      1,
      Math.floor(
        diff / 60_000,
      ),
    )}m ago`
  }

  if (diff < 86_400_000) {
    return `${Math.floor(
      diff /
        3_600_000,
    )}h ago`
  }

  return new Date(
    timestamp,
  ).toLocaleDateString(
    undefined,
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    },
  )
}

function readHistory(): SavedAnalysis[] {
  if (
    typeof window ===
    'undefined'
  ) {
    return []
  }

  try {
    const raw =
      localStorage.getItem(
        HISTORY_STORAGE_KEY,
      )

    if (!raw) {
      return []
    }

    const parsed =
      JSON.parse(raw)

    if (
      !Array.isArray(
        parsed,
      )
    ) {
      return []
    }

    return parsed.filter(
      (
        item,
      ): item is SavedAnalysis =>
        item &&
        typeof item.id ===
          'number' &&
        typeof item.title ===
          'string' &&
        typeof item.query ===
          'string' &&
        Array.isArray(
          item.columns,
        ) &&
        Array.isArray(
          item.rows,
        ) &&
        typeof item.rowCount ===
          'number' &&
        typeof item.savedAt ===
          'number',
    )
  } catch {
    return []
  }
}

function writeHistory(
  items: SavedAnalysis[],
) {
  try {
    localStorage.setItem(
      HISTORY_STORAGE_KEY,
      JSON.stringify(
        items.slice(0, 50),
      ),
    )
  } catch {
    /*
     * Ignore localStorage
     * quota/private-mode errors.
     */
  }
}

export function AnalysisHistory({
  cells,
  darkMode = false,
  chartStates = {},
  onOpenAnalysis,
  onDuplicateAnalysis,
}: AnalysisHistoryProps) {
  const [
    open,
    setOpen,
  ] = useState(true)

  const [
    history,
    setHistory,
  ] = useState<
    SavedAnalysis[]
  >([])

  const [
    loaded,
    setLoaded,
  ] = useState(false)

  useEffect(() => {
    setHistory(
      readHistory(),
    )
    setLoaded(true)
  }, [])

  /*
   * Save successful table results
   * as self-contained snapshots.
   *
   * This is what makes an analysis
   * reopenable after a page refresh:
   * the result itself is saved, not
   * only the SQL text.
   */
  useEffect(() => {
    if (!loaded) {
      return
    }

    const successfulCells =
      cells.filter(
        (cell) =>
          cell.type ===
            'sql' &&
          cell.output?.success &&
          cell.output.type ===
            'table' &&
          !!cell.output.table,
      )

    if (
      successfulCells.length ===
      0
    ) {
      return
    }

    setHistory(
      (previous) => {
        let changed =
          false

        const next =
          [...previous]

        for (
          const cell of
            successfulCells
        ) {
          if (
            !cell.output ||
            cell.output.type !==
              'table' ||
            !cell.output.table
          ) {
            continue
          }

          const table =
            cell.output.table

          const existingIndex =
            next.findIndex(
              (item) =>
                item.id ===
                cell.id,
            )

          const existing =
            existingIndex >=
            0
              ? next[
                  existingIndex
                ]
              : undefined

          const currentChartState =
            chartStates[cell.id] ?? null

          const sameResult =
            existing &&
            existing.query ===
              cell.code &&
            existing.rowCount ===
              table.rows.length &&
            existing.columns.length ===
              table.columns.length

          const sameChartState =
            JSON.stringify(
              existing?.chartState ?? null,
            ) ===
            JSON.stringify(
              currentChartState,
            )

          if (
            sameResult &&
            sameChartState &&
            existing
          ) {
            continue
          }

          const item: SavedAnalysis =
            {
              id: cell.id,
              title:
                existing
                  ?.customTitle
                  ? existing.title
                  : getAutoTitle(
                      cell.code,
                    ),
              query:
                cell.code,
              columns:
                table.columns,
              rows:
                table.rows,
              rowCount:
                table.rows.length,
              savedAt:
                Date.now(),
              customTitle:
                existing
                  ?.customTitle ??
                false,
              chartState:
                currentChartState,
            }

          if (
            existingIndex >=
            0
          ) {
            next[
              existingIndex
            ] = item
          } else {
            next.unshift(
              item,
            )
          }

          changed = true
        }

        if (!changed) {
          return previous
        }

        next.sort(
          (a, b) =>
            b.savedAt -
            a.savedAt,
        )

        writeHistory(
          next,
        )

        return next
      },
    )
  }, [
    cells,
    loaded,
    chartStates,
  ])

  const colors =
    useMemo(
      () => ({
        background:
          darkMode
            ? '#0B1420'
            : '#FFFFFF',

        surface:
          darkMode
            ? '#0E1926'
            : '#F8FAFC',

        border:
          darkMode
            ? '#1D2B3A'
            : '#E3E8EF',

        text:
          darkMode
            ? '#E8EEF6'
            : '#172033',

        muted:
          darkMode
            ? '#8796AA'
            : '#6B7789',

        accent:
          '#2563EB',

        accentSurface:
          darkMode
            ? '#10254A'
            : '#EFF5FF',
      }),
      [darkMode],
    )

  const renameItem = (
    item: SavedAnalysis,
  ) => {
    const nextTitle =
      window.prompt(
        'Rename analysis',
        item.title,
      )

    if (
      nextTitle ===
        null ||
      !nextTitle.trim()
    ) {
      return
    }

    setHistory(
      (previous) => {
        const next =
          previous.map(
            (
              current,
            ) =>
              current.id ===
              item.id
                ? {
                    ...current,
                    title:
                      nextTitle.trim(),
                    customTitle:
                      true,
                  }
                : current,
          )

        writeHistory(
          next,
        )

        return next
      },
    )
  }

  const clearHistory =
    () => {
      const confirmed =
        window.confirm(
          'Clear all saved analysis history?',
        )

      if (!confirmed) {
        return
      }

      try {
        localStorage.removeItem(
          HISTORY_STORAGE_KEY,
        )
      } catch {
        // Ignore storage errors.
      }

      setHistory([])
    }

  const duplicateAnalysis = (
    item: SavedAnalysis,
  ) => {
    const newId =
      Date.now() +
      Math.floor(
        Math.random() * 1000,
      )

    const duplicated: SavedAnalysis = {
      ...item,
      id: newId,
      title:
        `Copy of ${item.title}`,
      savedAt: Date.now(),
      customTitle: true,
      chartState:
        item.chartState ?? null,
    }

    setHistory(
      (previous) => {
        const next = [
          duplicated,
          ...previous.filter(
            (current) =>
              current.id !==
              newId,
          ),
        ]

        writeHistory(next)

        return next
      },
    )

    onDuplicateAnalysis?.(
      {
        id: item.id,
        title: item.title,
        query: item.query,
        columns: item.columns,
        rows: item.rows,
        chartState:
          item.chartState ?? null,
      },
      newId,
    )
  }

  const openAnalysis = (
    item: SavedAnalysis,
  ) => {
    if (
      onOpenAnalysis
    ) {
      onOpenAnalysis({
        id: item.id,
        title:
          item.title,
        query:
          item.query,
        columns:
          item.columns,
        rows:
          item.rows,
        chartState:
          item.chartState ?? null,
      })

      return
    }

    const element =
      document.getElementById(
        `dock-cell-${item.id}`,
      )

    element?.scrollIntoView(
      {
        behavior:
          'smooth',
        block:
          'center',
      },
    )
  }

  return (
    <section
      style={{
        marginBottom:
          '14px',
        border:
          `1px solid ${colors.border}`,
        borderRadius:
          '7px',
        background:
          colors.background,
        overflow:
          'hidden',
      }}
    >
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
            '9px 11px',
          borderBottom:
            open
              ? `1px solid ${colors.border}`
              : 'none',
        }}
      >
        <button
          type="button"
          onClick={() =>
            setOpen(
              (value) =>
                !value,
            )
          }
          style={{
            minWidth: 0,
            flex: 1,
            display:
              'flex',
            alignItems:
              'center',
            gap:
              '8px',
            border:
              'none',
            background:
              'transparent',
            color:
              colors.text,
            cursor:
              'pointer',
            padding:
              0,
            fontFamily:
              'inherit',
            textAlign:
              'left',
          }}
        >
          <span
            style={{
              width:
                '6px',
              height:
                '6px',
              flexShrink: 0,
              borderRadius:
                '50%',
              background:
                colors.accent,
            }}
          />

          <span
            style={{
              fontSize:
                '9px',
              fontWeight:
                700,
              letterSpacing:
                '0.07em',
              textTransform:
                'uppercase',
            }}
          >
            Analysis History
          </span>

          <span
            style={{
              color:
                colors.muted,
              fontSize:
                '9px',
            }}
          >
            {history.length}
          </span>
        </button>

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
          {history.length >
            0 && (
            <button
              type="button"
              onClick={
                clearHistory
              }
              style={{
                border:
                  'none',
                background:
                  'transparent',
                color:
                  colors.muted,
                cursor:
                  'pointer',
                padding:
                  '2px 0',
                fontFamily:
                  'inherit',
                fontSize:
                  '9px',
              }}
            >
              Clear
            </button>
          )}

          <button
            type="button"
            onClick={() =>
              setOpen(
                (value) =>
                  !value,
              )
            }
            aria-label={
              open
                ? 'Collapse history'
                : 'Expand history'
            }
            style={{
              border:
                'none',
              background:
                'transparent',
              color:
                colors.muted,
              cursor:
                'pointer',
              padding:
                '0 2px',
              fontFamily:
                'inherit',
              fontSize:
                '12px',
            }}
          >
            {open
              ? '−'
              : '+'}
          </button>
        </div>
      </div>

      {open && (
        <div>
          {!loaded ? (
            <div
              style={{
                padding:
                  '14px',
                color:
                  colors.muted,
                fontSize:
                  '10px',
              }}
            >
              Loading saved analyses…
            </div>
          ) : history.length ===
            0 ? (
            <div
              style={{
                padding:
                  '14px',
                color:
                  colors.muted,
                fontSize:
                  '10px',
                lineHeight:
                  1.5,
              }}
            >
              Run a SQL query that
              returns a table to save
              it here.
            </div>
          ) : (
            history.map(
              (
                item,
                index,
              ) => {
                const currentCell =
                  cells.some(
                    (cell) =>
                      cell.id ===
                      item.id,
                  )

                return (
                  <div
                    key={`${item.id}-${index}`}
                    style={{
                      display:
                        'flex',
                      alignItems:
                        'center',
                      gap:
                        '8px',
                      borderBottom:
                        index ===
                        history.length -
                          1
                          ? 'none'
                          : `1px solid ${colors.border}`,
                      padding:
                        '9px 11px',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        openAnalysis(
                          item,
                        )
                      }
                      style={{
                        minWidth:
                          0,
                        flex:
                          1,
                        border:
                          'none',
                        background:
                          'transparent',
                        color:
                          colors.text,
                        cursor:
                          'pointer',
                        padding:
                          0,
                        fontFamily:
                          'inherit',
                        textAlign:
                          'left',
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
                          minWidth:
                            0,
                        }}
                      >
                        <span
                          style={{
                            minWidth:
                              0,
                            overflow:
                              'hidden',
                            textOverflow:
                              'ellipsis',
                            whiteSpace:
                              'nowrap',
                            fontSize:
                              '10px',
                            fontWeight:
                              600,
                          }}
                        >
                          {
                            item.title
                          }
                        </span>

                        <span
                          style={{
                            flexShrink:
                              0,
                            padding:
                              '3px 6px',
                            borderRadius:
                              '4px',
                            background:
                              colors.accentSurface,
                            color:
                              colors.accent,
                            fontSize:
                              '8px',
                            fontWeight:
                              700,
                          }}
                        >
                          SQL
                        </span>
                      </div>

                      <div
                        style={{
                          marginTop:
                            '5px',
                          display:
                            'flex',
                          gap:
                            '8px',
                          color:
                            colors.muted,
                          fontSize:
                            '9px',
                        }}
                      >
                        <span>
                          {item.rowCount.toLocaleString()}{' '}
                          {item.rowCount ===
                          1
                            ? 'row'
                            : 'rows'}
                        </span>

                        <span>
                          ·
                        </span>

                        <span>
                          {item.columns.length}{' '}
                          {item.columns.length ===
                          1
                            ? 'column'
                            : 'columns'}
                        </span>

                        <span>
                          ·
                        </span>

                        <span>
                          {formatSavedAt(
                            item.savedAt,
                          )}
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openAnalysis(
                          item,
                        )
                      }
                      style={{
                        flexShrink:
                          0,
                        border:
                          `1px solid ${colors.border}`,
                        borderRadius:
                          '5px',
                        background:
                          colors.surface,
                        color:
                          colors.text,
                        cursor:
                          'pointer',
                        padding:
                          '5px 8px',
                        fontFamily:
                          'inherit',
                        fontSize:
                          '9px',
                        fontWeight:
                          600,
                      }}
                    >
                      Open
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        duplicateAnalysis(
                          item,
                        )
                      }
                      aria-label={`Duplicate ${item.title}`}
                      style={{
                        flexShrink:
                          0,
                        border:
                          'none',
                        background:
                          'transparent',
                        color:
                          colors.muted,
                        cursor:
                          'pointer',
                        padding:
                          '3px 2px',
                        fontFamily:
                          'inherit',
                        fontSize:
                          '9px',
                      }}
                    >
                      Duplicate
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        renameItem(
                          item,
                        )
                      }
                      aria-label={`Rename ${item.title}`}
                      style={{
                        flexShrink:
                          0,
                        border:
                          'none',
                        background:
                          'transparent',
                        color:
                          colors.muted,
                        cursor:
                          'pointer',
                        padding:
                          '3px 2px',
                        fontFamily:
                          'inherit',
                        fontSize:
                          '9px',
                      }}
                    >
                      Rename
                    </button>

                    {currentCell && (
                      <span
                        style={{
                          display:
                            'none',
                        }}
                      />
                    )}
                  </div>
                )
              },
            )
          )}
        </div>
      )}
    </section>
  )
}
