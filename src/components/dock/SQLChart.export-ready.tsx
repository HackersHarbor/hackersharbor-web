'use client'

import dynamic from 'next/dynamic'
import { useEffect, useMemo, useRef, useState } from 'react'

const Plot = dynamic(
  () => import('react-plotly.js'),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          padding: '30px',
          textAlign: 'center',
          fontSize: '11px',
          color: '#64748B',
        }}
      >
        Loading chart...
      </div>
    ),
  },
)

/* -------------------------------------------------------------------------- */
/*                                  TYPES                                     */
/* -------------------------------------------------------------------------- */

type SQLChartProps = {
  columns: string[]
  rows: unknown[][]
  darkMode?: boolean

  /*
   * Called when the user clicks a bar,
   * line point, scatter point, or pie slice.
   */
  onPointClick?: (
    column: string,
    value: unknown,
  ) => void

  exportFilename?: string
}

type ChartType =
  | 'bar'
  | 'line'
  | 'scatter'
  | 'pie'

/* -------------------------------------------------------------------------- */
/*                              HELPERS                                       */
/* -------------------------------------------------------------------------- */

function isNumericColumn(
  rows: unknown[][],
  index: number,
) {
  const sample =
    rows.slice(0, 50)

  return (
    sample.length > 0 &&
    sample.every(
      (row) =>
        typeof row[index] ===
          'number' &&
        Number.isFinite(
          row[index] as number,
        ),
    )
  )
}

function isDateLikeColumn(
  column: string,
) {
  const name =
    column.toLowerCase()

  return (
    name.includes('date') ||
    name.includes('time') ||
    name.endsWith('_at') ||
    name.includes('timestamp')
  )
}

function formatAxisValue(
  value: unknown,
) {
  if (
    value === null ||
    value === undefined
  ) {
    return ''
  }

  if (
    typeof value === 'number'
  ) {
    return value
  }

  return String(value)
}

/* -------------------------------------------------------------------------- */
/*                              SQL CHART                                     */
/* -------------------------------------------------------------------------- */

export function SQLChart({
  columns,
  rows,
  darkMode = false,
  onPointClick,
  exportFilename = 'query-chart',
}: SQLChartProps) {
  const chartElementRef =
    useRef<HTMLDivElement | null>(null)

  const [chartReady, setChartReady] =
    useState(false)

  const downloadPNG = async () => {
    const graph =
      chartElementRef.current?.querySelector(
        '.js-plotly-plot',
      ) as HTMLElement | null

    const plotly =
      (
        window as unknown as {
          Plotly?: {
            downloadImage?: (
              graphDiv: HTMLElement,
              options: {
                format: 'png'
                filename: string
                width: number
                height: number
                scale: number
              },
            ) => Promise<unknown>
          }
        }
      ).Plotly

    if (
      !graph ||
      !plotly?.downloadImage
    ) {
      return
    }

    await plotly.downloadImage(
      graph,
      {
        format: 'png',
        filename: exportFilename,
        width: 1400,
        height: 800,
        scale: 2,
      },
    )
  }
  const [
    chartType,
    setChartType,
  ] = useState<ChartType>('bar')

  const [
    xColumn,
    setXColumn,
  ] = useState(
    columns[0] ?? '',
  )

  const numericColumns =
    useMemo(
      () =>
        columns.filter(
          (_, index) =>
            isNumericColumn(
              rows,
              index,
            ),
        ),
      [columns, rows],
    )

  const [
    yColumn,
    setYColumn,
  ] = useState(
    numericColumns[0] ?? '',
  )

  const suggestion = useMemo(() => {
    if (columns.length === 0 || rows.length === 0) {
      return null
    }

    const categoricalColumns = columns.filter(
      (_, index) => !isNumericColumn(rows, index),
    )

    const dateColumns = columns.filter(
      (column) => isDateLikeColumn(column),
    )

    const countColumn = columns.find((column) => {
      const name = column.toLowerCase()
      return (
        name === 'count' ||
        name.includes('count') ||
        name.includes('total') ||
        name.includes('number') ||
        name === 'n'
      )
    })

    if (dateColumns.length > 0 && numericColumns.length > 0) {
      const x = dateColumns[0]
      const y =
        numericColumns.find((column) => column !== x) ??
        numericColumns[0]

      return {
        type: 'line' as ChartType,
        x,
        y,
        label: 'Line chart',
        description: `${x} over ${y}`,
      }
    }

    if (categoricalColumns.length > 0 && numericColumns.length > 0) {
      const x = categoricalColumns[0]
      const y =
        countColumn && numericColumns.includes(countColumn)
          ? countColumn
          : numericColumns[0]

      return {
        type: 'bar' as ChartType,
        x,
        y,
        label: 'Bar chart',
        description: `${x} by ${y}`,
      }
    }

    if (numericColumns.length >= 2) {
      return {
        type: 'scatter' as ChartType,
        x: numericColumns[0],
        y: numericColumns[1],
        label: 'Scatter plot',
        description: `${numericColumns[0]} vs ${numericColumns[1]}`,
      }
    }

    return null
  }, [columns, rows, numericColumns])

  const [showSuggestion, setShowSuggestion] =
    useState(true)

  /* ------------------------------------------------------------------------ */
  /*                                  COLORS                                  */
  /* ------------------------------------------------------------------------ */

  const colors = {
    text: darkMode
      ? '#E8EEF6'
      : '#172033',

    secondary: darkMode
      ? '#8A99AC'
      : '#66758A',

    border: darkMode
      ? '#1B2838'
      : '#E5EAF0',

    background: darkMode
      ? '#080E15'
      : '#FFFFFF',

    input: darkMode
      ? '#0C141E'
      : '#F7F9FC',

    accent: '#2563EB',
  }

  /* ------------------------------------------------------------------------ */
  /*                       SAFE COLUMN SELECTION                              */
  /* ------------------------------------------------------------------------ */

  /*
   * Keep selected columns valid when
   * a new SQL result has different columns.
   */

  const safeXColumn =
    columns.includes(xColumn)
      ? xColumn
      : columns[0] ?? ''

  const safeYColumn =
    numericColumns.includes(
      yColumn,
    )
      ? yColumn
      : numericColumns[0] ?? ''

  useEffect(() => {
    setShowSuggestion(true)
  }, [columns, rows])

  const xIndex =
    columns.indexOf(
      safeXColumn,
    )

  const yIndex =
    columns.indexOf(
      safeYColumn,
    )

  /* ------------------------------------------------------------------------ */
  /*                              CHART ROWS                                  */
  /* ------------------------------------------------------------------------ */

  const chartRows =
    useMemo(
      () => {
        if (
          xIndex < 0 ||
          yIndex < 0
        ) {
          return []
        }

        return rows.filter(
          (row) =>
            row[xIndex] !==
              null &&
            row[xIndex] !==
              undefined &&
            row[yIndex] !==
              null &&
            row[yIndex] !==
              undefined,
        )
      },
      [
        rows,
        xIndex,
        yIndex,
      ],
    )

  /* ------------------------------------------------------------------------ */
  /*                                LABELS                                    */
  /* ------------------------------------------------------------------------ */

  const labels =
    useMemo(
      () =>
        chartRows.map(
          (row) =>
            formatAxisValue(
              row[xIndex],
            ),
        ),
      [
        chartRows,
        xIndex,
      ],
    )

  /* ------------------------------------------------------------------------ */
  /*                                VALUES                                    */
  /* ------------------------------------------------------------------------ */

  const values =
    useMemo(
      () =>
        chartRows.map(
          (row) =>
            Number(
              row[yIndex],
            ),
        ),
      [
        chartRows,
        yIndex,
      ],
    )

  /* ------------------------------------------------------------------------ */
  /*                            PLOTLY DATA                                   */
  /* ------------------------------------------------------------------------ */

  const plotData =
    useMemo(
      () => {
        if (
          !safeYColumn ||
          chartRows.length === 0
        ) {
          return []
        }

        /*
         * PIE
         */
        if (
          chartType === 'pie'
        ) {
          return [
            {
              type: 'pie' as const,

              labels,

              values,

              customdata: chartRows.map(
                (_, index) => index,
              ),

              hole: 0.42,

              textinfo:
                'label+percent',

              hovertemplate:
                '%{label}<br>%{value}<extra></extra>',
            },
          ]
        }

        /*
         * SCATTER
         */
        if (
          chartType ===
          'scatter'
        ) {
          return [
            {
              type:
                'scatter' as const,

              mode:
                'markers' as const,

              x: labels,

              y: values,

              customdata: chartRows.map(
                (_, index) => index,
              ),

              hovertemplate:
                '%{x}<br>%{y}<extra></extra>',
            },
          ]
        }

        /*
         * LINE
         */
        if (
          chartType === 'line'
        ) {
          return [
            {
              type:
                'scatter' as const,

              mode:
                'lines+markers' as const,

              x: labels,

              y: values,

              customdata: chartRows.map(
                (_, index) => index,
              ),

              hovertemplate:
                '%{x}<br>%{y}<extra></extra>',
            },
          ]
        }

        /*
         * BAR
         */
        return [
          {
            type:
              'bar' as const,

            x: labels,

            y: values,

            customdata: chartRows.map(
              (_, index) => index,
            ),

            hovertemplate:
              '%{x}<br>%{y}<extra></extra>',
          },
        ]
      },
      [
        chartType,
        chartRows.length,
        labels,
        values,
        safeYColumn,
      ],
    )

  /* ------------------------------------------------------------------------ */
  /*                           EMPTY RESULT                                   */
  /* ------------------------------------------------------------------------ */

  if (
    columns.length === 0 ||
    rows.length === 0
  ) {
    return null
  }

  /* ------------------------------------------------------------------------ */
  /*                                UI                                        */
  /* ------------------------------------------------------------------------ */

  return (
    <div
      style={{
        borderTop:
          `1px solid ${colors.border}`,

        background:
          colors.background,
      }}
    >
      {/* ------------------------------------------------------------------ */}
      {/* CHART HEADER                                                        */}
      {/* ------------------------------------------------------------------ */}

      <div
        style={{
          display: 'flex',

          alignItems:
            'center',

          justifyContent:
            'space-between',

          gap: '10px',

          padding:
            '10px 12px',

          borderBottom:
            `1px solid ${colors.border}`,

          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            display: 'flex',

            alignItems:
              'center',

            gap: '7px',
          }}
        >
          <span
            style={{
              width: '7px',

              height: '7px',

              borderRadius:
                '50%',

              background:
                colors.accent,

              display:
                'inline-block',
            }}
          />

          <span
            style={{
              fontSize: '10px',

              fontWeight: 650,

              color:
                colors.text,
            }}
          >
            Visualize
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
          }}
        >
          <span
            style={{
              fontSize: '9px',
              color:
                colors.secondary,
            }}
          >
            {chartRows.length.toLocaleString()}{' '}
            points
          </span>

          <button
            type="button"
            onClick={downloadPNG}
            disabled={!chartReady}
            style={{
              border:
                `1px solid ${colors.border}`,
              borderRadius: '5px',
              background:
                colors.background,
              color:
                colors.text,
              cursor:
                chartReady
                  ? 'pointer'
                  : 'not-allowed',
              fontFamily:
                'inherit',
              fontSize: '9px',
              fontWeight: 600,
              padding:
                '4px 7px',
              opacity:
                chartReady ? 1 : 0.55,
            }}
          >
            Download PNG
          </button>
        </div>
      </div>

      {suggestion && showSuggestion && (
        <div
          style={{
            margin: '10px 10px 0',
            padding: '10px 11px',
            border: `1px solid ${colors.border}`,
            borderRadius: '7px',
            background: darkMode
              ? '#0B1420'
              : '#F8FAFC',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color: colors.secondary,
                  marginBottom: '4px',
                }}
              >
                Suggested visualization
              </div>

              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 650,
                  color: colors.text,
                }}
              >
                {suggestion.label}
              </div>

              <div
                style={{
                  marginTop: '3px',
                  fontSize: '10px',
                  color: colors.secondary,
                }}
              >
                {suggestion.description}
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowSuggestion(false)
              }
              aria-label="Dismiss chart suggestion"
              style={{
                border: 'none',
                background: 'transparent',
                color: colors.secondary,
                cursor: 'pointer',
                fontSize: '16px',
                lineHeight: '1',
                padding: '0 2px',
              }}
            >
              ×
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setChartType(suggestion.type)
              setXColumn(suggestion.x)
              setYColumn(suggestion.y)
              setShowSuggestion(false)
            }}
            style={{
              marginTop: '9px',
              border: `1px solid ${colors.border}`,
              borderRadius: '5px',
              background: colors.background,
              color: colors.text,
              cursor: 'pointer',
              fontSize: '10px',
              fontWeight: 600,
              padding: '5px 9px',
            }}
          >
            Use suggestion
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* CONTROLS                                                            */}
      {/* ------------------------------------------------------------------ */}

      <div
        style={{
          display: 'flex',

          alignItems:
            'center',

          gap: '7px',

          padding:
            '9px 10px',

          borderBottom:
            `1px solid ${colors.border}`,

          flexWrap: 'wrap',
        }}
      >
        {/* CHART TYPE */}

        <select
          value={chartType}
          onChange={(event) =>
            setChartType(
              event.target
                .value as ChartType,
            )
          }
          style={{
            padding:
              '5px 8px',

            border:
              `1px solid ${colors.border}`,

            borderRadius:
              '5px',

            background:
              colors.input,

            color:
              colors.text,

            fontSize: '10px',

            outline: 'none',

            cursor: 'pointer',
          }}
        >
          <option value="bar">
            Bar
          </option>

          <option value="line">
            Line
          </option>

          <option value="scatter">
            Scatter
          </option>

          <option value="pie">
            Pie
          </option>
        </select>

        {/* X COLUMN */}

        <select
          value={safeXColumn}
          onChange={(event) =>
            setXColumn(
              event.target.value,
            )
          }
          style={{
            padding:
              '5px 8px',

            border:
              `1px solid ${colors.border}`,

            borderRadius:
              '5px',

            background:
              colors.input,

            color:
              colors.text,

            fontSize: '10px',

            maxWidth:
              '190px',

            outline: 'none',

            cursor: 'pointer',
          }}
        >
          {columns.map(
            (column) => (
              <option
                key={column}
                value={column}
              >
                X: {column}
              </option>
            ),
          )}
        </select>

        {/* Y COLUMN */}

        <select
          value={safeYColumn}
          onChange={(event) =>
            setYColumn(
              event.target.value,
            )
          }
          disabled={
            numericColumns.length ===
            0
          }
          style={{
            padding:
              '5px 8px',

            border:
              `1px solid ${colors.border}`,

            borderRadius:
              '5px',

            background:
              colors.input,

            color:
              colors.text,

            fontSize: '10px',

            maxWidth:
              '190px',

            outline: 'none',

            opacity:
              numericColumns.length ===
              0
                ? 0.5
                : 1,

            cursor:
              numericColumns.length ===
              0
                ? 'not-allowed'
                : 'pointer',
          }}
        >
          {numericColumns.map(
            (column) => (
              <option
                key={column}
                value={column}
              >
                Y: {column}
              </option>
            ),
          )}
        </select>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* NO NUMERIC COLUMN                                                   */}
      {/* ------------------------------------------------------------------ */}

      {numericColumns.length ===
      0 ? (
        <div
          style={{
            padding:
              '30px 15px',

            textAlign:
              'center',

            color:
              colors.secondary,

            fontSize: '11px',
          }}
        >
          This SQL result does
          not contain a numeric
          column that can be
          visualized.
        </div>
      ) : chartRows.length ===
        0 ? (
        <div
          style={{
            padding:
              '30px 15px',

            textAlign:
              'center',

            color:
              colors.secondary,

            fontSize: '11px',
          }}
        >
          There is no valid data
          to visualize.
        </div>
      ) : (
        /* -------------------------------------------------------------- */
        /* CHART                                                           */
        /* -------------------------------------------------------------- */

        <div
          style={{
            width: '100%',

            minHeight:
              '380px',

            overflowX:
              'auto',

            padding:
              '4px 0 8px',
          }}
        >
          <Plot
            data={
              plotData as any
            }

            onInitialized={() =>
              setChartReady(true)
            }

            onUpdate={() =>
              setChartReady(true)
            }

            /*
             * ----------------------------------------------------------
             * CHART → TABLE INTERACTION
             * ----------------------------------------------------------
             *
             * Plotly sends the clicked point here.
             *
             * For example:
             *
             * Active bar
             *      ↓
             * pointNumber = 0
             *      ↓
             * chartRows[0]
             *      ↓
             * status = Active
             *      ↓
             * onPointClick(
             *   'status',
             *   'Active'
             * )
             */

            onClick={(event: any) => {
              if (!onPointClick) {
                return
              }

              const point =
                event?.points?.[0]

              if (!point) {
                return
              }

              const customIndex =
                Array.isArray(point.customdata)
                  ? point.customdata[0]
                  : point.customdata

              const pointIndex =
                typeof customIndex === 'number'
                  ? customIndex
                  : typeof point.pointNumber === 'number'
                    ? point.pointNumber
                    : typeof point.pointIndex === 'number'
                      ? point.pointIndex
                      : -1

              if (
                pointIndex < 0 ||
                pointIndex >= chartRows.length
              ) {
                return
              }

              const clickedRow =
                chartRows[pointIndex]

              if (!clickedRow) {
                return
              }

              const clickedValue =
                clickedRow[xIndex]

              onPointClick(
                safeXColumn,
                clickedValue,
              )
            }}

            layout={{
              autosize: true,

              height: 380,

              margin: {
                l: 55,
                r: 20,
                t: 45,
                b: 70,
              },

              paper_bgcolor:
                colors.background,

              plot_bgcolor:
                colors.background,

              font: {
                color:
                  colors.text,

                size: 10,
              },

              title: {
                text:
                  `${safeYColumn} by ${safeXColumn}`,

                font: {
                  size: 13,

                  color:
                    colors.text,
                },
              },

              xaxis: {
                title: {
                  text:
                    safeXColumn,
                },

                gridcolor:
                  colors.border,

                zerolinecolor:
                  colors.border,

                tickfont: {
                  color:
                    colors.secondary,

                  size: 9,
                },

                titlefont: {
                  color:
                    colors.secondary,

                  size: 10,
                },

                automargin:
                  true,
              },

              yaxis: {
                title: {
                  text:
                    safeYColumn,
                },

                gridcolor:
                  colors.border,

                zerolinecolor:
                  colors.border,

                tickfont: {
                  color:
                    colors.secondary,

                  size: 9,
                },

                titlefont: {
                  color:
                    colors.secondary,

                  size: 10,
                },

                automargin:
                  true,
              },

              showlegend:
                false,

              hoverlabel: {
                bgcolor:
                  darkMode
                    ? '#111C2B'
                    : '#FFFFFF',

                font: {
                  color:
                    colors.text,

                  size: 10,
                },
              },

              bargap: 0.2,
            }}

            config={{
              responsive: true,

              displaylogo:
                false,

              displayModeBar:
                true,

              modeBarButtonsToRemove:
                [
                  'lasso2d',
                  'select2d',
                ],
            }}

            style={{
              width: '100%',

              minWidth:
                '500px',
            }}
          />
        </div>
      )}
    </div>
  )
}