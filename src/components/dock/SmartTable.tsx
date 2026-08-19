'use client'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

type SmartTableProps = {
  columns: string[]
  rows: unknown[][]
  darkMode?: boolean
  pageSize?: number
  chartFilter?: {
    column: string
    value: unknown
  } | null
  onClearChartFilter?: () => void
}

type SortDirection =
  | 'asc'
  | 'desc'

function looksLikeDateColumn(
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

function looksLikeIdColumn(
  column: string,
) {
  const name =
    column.toLowerCase()

  return (
    name === 'id' ||
    name.endsWith('_id') ||
    name.endsWith('id')
  )
}

function looksLikeEpoch(
  value: number,
) {
  return (
    Number.isFinite(value) &&
    value >= 100000000000
  )
}

function formatDate(
  value: unknown,
) {
  if (
    value instanceof Date
  ) {
    return value.toLocaleDateString(
      undefined,
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      },
    )
  }

  if (
    typeof value === 'number' &&
    looksLikeEpoch(value)
  ) {
    const date =
      new Date(value)

    if (
      !Number.isNaN(
        date.getTime(),
      )
    ) {
      return date.toLocaleDateString(
        undefined,
        {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        },
      )
    }
  }

  if (
    typeof value === 'string'
  ) {
    const parsed =
      new Date(value)

    if (
      !Number.isNaN(
        parsed.getTime(),
      )
    ) {
      return parsed.toLocaleDateString(
        undefined,
        {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        },
      )
    }
  }

  return String(value ?? '')
}

function formatNumber(
  value: number,
) {
  if (
    Number.isInteger(value)
  ) {
    return value.toLocaleString()
  }

  return value.toLocaleString(
    undefined,
    {
      maximumFractionDigits: 4,
    },
  )
}

function formatCell(
  value: unknown,
  column: string,
) {
  if (
    value === null ||
    value === undefined
  ) {
    return '—'
  }

  if (
    looksLikeDateColumn(
      column,
    )
  ) {
    return formatDate(value)
  }

  if (
    typeof value === 'number' &&
    looksLikeEpoch(value)
  ) {
    return formatDate(value)
  }

  if (
    typeof value === 'number'
  ) {
    return formatNumber(value)
  }

  if (
    typeof value === 'boolean'
  ) {
    return value
      ? 'true'
      : 'false'
  }

  if (
    typeof value === 'object'
  ) {
    try {
      return JSON.stringify(
        value,
      )
    } catch {
      return String(value)
    }
  }

  return String(value)
}

/*
 * Convert a value into something
 * predictable for sorting.
 */
function getSortValue(
  value: unknown,
  column: string,
) {
  if (
    value === null ||
    value === undefined
  ) {
    return {
      type: 'empty',
      value: '',
    }
  }

  if (
    typeof value === 'number'
  ) {
    return {
      type: 'number',
      value,
    }
  }

  if (
    typeof value === 'boolean'
  ) {
    return {
      type: 'boolean',
      value: value ? 1 : 0,
    }
  }

  if (
    looksLikeDateColumn(
      column,
    )
  ) {
    const date =
      new Date(
        String(value),
      )

    if (
      !Number.isNaN(
        date.getTime(),
      )
    ) {
      return {
        type: 'date',
        value:
          date.getTime(),
      }
    }
  }

  if (
    typeof value === 'number' &&
    looksLikeEpoch(value)
  ) {
    return {
      type: 'date',
      value,
    }
  }

  return {
    type: 'string',
    value:
      String(value)
        .toLowerCase()
        .trim(),
  }
}

export function SmartTable({
  columns,
  rows,
  darkMode = false,
  pageSize = 25,
  chartFilter = null,
  onClearChartFilter,
}: SmartTableProps) {
  const [
    page,
    setPage,
  ] = useState(1)

  const [
    search,
    setSearch,
  ] = useState('')

  const [
    sortColumn,
    setSortColumn,
  ] = useState<number | null>(
    null,
  )

  const [
    sortDirection,
    setSortDirection,
  ] =
    useState<SortDirection>(
      'asc',
    )

  const [
    rowsPerPage,
    setRowsPerPage,
  ] = useState(
    [25, 50, 100].includes(
      pageSize,
    )
      ? pageSize
      : 25,
  )

  const colors = {
    text: darkMode
      ? '#E8EEF6'
      : '#172033',

    secondary:
      darkMode
        ? '#8A99AC'
        : '#66758A',

    border:
      darkMode
        ? '#1B2838'
        : '#E5EAF0',

    header:
      darkMode
        ? '#0C141E'
        : '#F7F9FC',

    hover:
      darkMode
        ? '#101B28'
        : '#F8FAFD',

    background:
      darkMode
        ? '#080E15'
        : '#FFFFFF',

    input:
      darkMode
        ? '#0B131D'
        : '#FFFFFF',

    accent:
      '#2563EB',

    accentSoft:
      darkMode
        ? '#0E2344'
        : '#EFF6FF',
  }

  /*
   * Determine column alignment and
   * type information.
   */
  const columnMetadata =
    useMemo(() => {
      return columns.map(
        (
          column,
          columnIndex,
        ) => {
          const values =
            rows
              .slice(0, 100)
              .map(
                (row) =>
                  row[
                    columnIndex
                  ],
              )
              .filter(
                (value) =>
                  value !==
                    null &&
                  value !==
                    undefined,
              )

          const hasNumericValues =
            values.length > 0 &&
            values.every(
              (value) =>
                typeof value ===
                  'number' &&
                Number.isFinite(
                  value,
                ),
            )

          const isId =
            looksLikeIdColumn(
              column,
            )

          const isDate =
            looksLikeDateColumn(
              column,
            )

          const isNumeric =
            hasNumericValues &&
            !isDate &&
            !isId

          return {
            isNumeric,
            isId,
            isDate,
          }
        },
      )
    }, [
      columns,
      rows,
    ])

  /*
   * SEARCH
   *
   * Search every visible value in
   * every row.
   */
  const chartFilteredRows =
    useMemo(() => {
      if (!chartFilter) {
        return rows
      }

      const columnIndex =
        columns.indexOf(chartFilter.column)

      if (columnIndex < 0) {
        return rows
      }

      return rows.filter(
        (row) => {
          const rowValue = row[columnIndex]
          const filterValue = chartFilter.value

          if (
            rowValue === null ||
            rowValue === undefined ||
            filterValue === null ||
            filterValue === undefined
          ) {
            return rowValue === filterValue
          }

          if (
            typeof rowValue === 'number' &&
            typeof filterValue === 'number'
          ) {
            return rowValue === filterValue
          }

          return (
            String(rowValue) ===
            String(filterValue)
          )
        },
      )
    }, [
      rows,
      columns,
      chartFilter,
    ])

  /*
   * SEARCH runs after a chart filter so
   * search and chart filtering compose.
   */
  const filteredRows =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase()

      if (!query) {
        return chartFilteredRows
      }

      return chartFilteredRows.filter(
        (row) =>
          row.some(
            (
              value,
              columnIndex,
            ) => {
              const column =
                columns[
                  columnIndex
                ] ?? ''

              const formatted =
                formatCell(
                  value,
                  column,
                )

              return formatted
                .toLowerCase()
                .includes(query)
            },
          ),
      )
    }, [
      chartFilteredRows,
      columns,
      search,
    ])

  /*
   * SORT
   */
  const sortedRows =
    useMemo(() => {
      if (
        sortColumn === null
      ) {
        return filteredRows
      }

      const indexed =
        filteredRows.map(
          (
            row,
            originalIndex,
          ) => ({
            row,
            originalIndex,
          }),
        )

      indexed.sort(
        (a, b) => {
          const aValue =
            getSortValue(
              a.row[
                sortColumn
              ],
              columns[
                sortColumn
              ] ?? '',
            )

          const bValue =
            getSortValue(
              b.row[
                sortColumn
              ],
              columns[
                sortColumn
              ] ?? '',
            )

          /*
           * Empty values always go
           * to the bottom.
           */
          if (
            aValue.type ===
              'empty' &&
            bValue.type !==
              'empty'
          ) {
            return 1
          }

          if (
            aValue.type !==
              'empty' &&
            bValue.type ===
              'empty'
          ) {
            return -1
          }

          if (
            aValue.type ===
              'empty' &&
            bValue.type ===
              'empty'
          ) {
            return (
              a.originalIndex -
              b.originalIndex
            )
          }

          let comparison = 0

          if (
            typeof aValue.value ===
              'number' &&
            typeof bValue.value ===
              'number'
          ) {
            comparison =
              aValue.value -
              bValue.value
          } else {
            comparison =
              String(
                aValue.value,
              ).localeCompare(
                String(
                  bValue.value,
                ),
                undefined,
                {
                  numeric: true,
                  sensitivity:
                    'base',
                },
              )
          }

          if (
            comparison === 0
          ) {
            /*
             * Stable sorting:
             * preserve original order
             * when values are equal.
             */
            return (
              a.originalIndex -
              b.originalIndex
            )
          }

          return sortDirection ===
            'asc'
            ? comparison
            : -comparison
        },
      )

      return indexed.map(
        (item) =>
          item.row,
      )
    }, [
      filteredRows,
      sortColumn,
      sortDirection,
      columns,
    ])

  /*
   * PAGINATION
   */
  const totalRows =
    sortedRows.length

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalRows /
          rowsPerPage,
      ),
    )

  /*
   * Reset pagination whenever
   * search, sorting, or page size
   * changes.
   */
  useEffect(() => {
    setPage(1)
  }, [
    search,
    chartFilter,
    sortColumn,
    sortDirection,
    rowsPerPage,
  ])

  /*
   * Keep the current page valid
   * when query results change.
   */
  useEffect(() => {
    setPage((currentPage) =>
      Math.min(
        Math.max(
          currentPage,
          1,
        ),
        totalPages,
      ),
    )
  }, [totalPages])

  const safePage =
    Math.min(
      Math.max(page, 1),
      totalPages,
    )

  const visibleRows =
    useMemo(() => {
      const start =
        (safePage - 1) *
        rowsPerPage

      return sortedRows.slice(
        start,
        start +
          rowsPerPage,
      )
    }, [
      sortedRows,
      safePage,
      rowsPerPage,
    ])

  const startRow =
    totalRows === 0
      ? 0
      : (safePage - 1) *
          rowsPerPage +
        1

  const endRow =
    Math.min(
      safePage *
        rowsPerPage,
      totalRows,
    )

  /*
   * Handle header sorting.
   */
  function handleSort(
    columnIndex: number,
  ) {
    if (
      sortColumn ===
      columnIndex
    ) {
      setSortDirection(
        (current) =>
          current === 'asc'
            ? 'desc'
            : 'asc',
      )

      return
    }

    setSortColumn(
      columnIndex,
    )

    setSortDirection('asc')
  }

  /*
   * Clear the current search.
   */
  function clearSearch() {
    setSearch('')
  }

  return (
    <div
      style={{
        background:
          colors.background,
        width: '100%',
      }}
    >
      {/* TABLE TOOLBAR */}

      <div
        style={{
          display: 'flex',
          alignItems:
            'center',
          justifyContent:
            'space-between',
          gap: '10px',
          padding:
            '9px 10px',
          borderBottom:
            `1px solid ${colors.border}`,
          flexWrap: 'wrap',
        }}
      >
        {/* SEARCH */}

        <div
          style={{
            position:
              'relative',
            flex:
              '1 1 220px',
            maxWidth:
              '360px',
            minWidth:
              '190px',
          }}
        >
          <span
            style={{
              position:
                'absolute',
              left: '9px',
              top: '50%',
              transform:
                'translateY(-50%)',
              color:
                colors.secondary,
              fontSize: '12px',
              pointerEvents:
                'none',
            }}
          >
            ⌕
          </span>

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target
                  .value,
              )
            }
            placeholder="Search rows..."
            aria-label="Search table rows"
            style={{
              width: '100%',
              boxSizing:
                'border-box',
              height: '30px',
              padding:
                '0 30px 0 27px',
              border:
                `1px solid ${colors.border}`,
              borderRadius:
                '6px',
              background:
                colors.input,
              color:
                colors.text,
              fontSize: '10px',
              outline: 'none',
              fontFamily:
                'inherit',
            }}
          />

          {search.length >
            0 && (
            <button
              type="button"
              onClick={
                clearSearch
              }
              aria-label="Clear search"
              style={{
                position:
                  'absolute',
                right: '6px',
                top: '50%',
                transform:
                  'translateY(-50%)',
                width: '20px',
                height: '20px',
                border: 'none',
                background:
                  'transparent',
                color:
                  colors.secondary,
                cursor:
                  'pointer',
                fontSize: '13px',
                lineHeight: '20px',
                padding: 0,
              }}
            >
              ×
            </button>
          )}
        </div>

        {/* ROWS PER PAGE */}

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
              color:
                colors.secondary,
              fontSize: '9px',
            }}
          >
            Rows
          </span>

          <select
            value={rowsPerPage}
            onChange={(
              event,
            ) =>
              setRowsPerPage(
                Number(
                  event.target
                    .value,
                ),
              )
            }
            aria-label="Rows per page"
            style={{
              height: '30px',
              padding:
                '0 25px 0 8px',
              border:
                `1px solid ${colors.border}`,
              borderRadius:
                '6px',
              background:
                colors.input,
              color:
                colors.text,
              fontSize: '10px',
              outline: 'none',
              cursor:
                'pointer',
            }}
          >
            <option value={25}>
              25
            </option>

            <option value={50}>
              50
            </option>

            <option value={100}>
              100
            </option>
          </select>
        </div>
      </div>

      {/* TABLE META */}

      <div
        style={{
          display: 'flex',
          alignItems:
            'center',
          justifyContent:
            'space-between',
          gap: '12px',
          padding:
            '7px 10px',
          borderBottom:
            `1px solid ${colors.border}`,
          color:
            colors.secondary,
          fontSize: '10px',
          lineHeight: '1.4',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems:
              'center',
            gap: '8px',
          }}
        >
          <span>
            {totalRows.toLocaleString()}{' '}
            {totalRows === 1
              ? 'row'
              : 'rows'}
            {' · '}
            {columns.length}{' '}
            {columns.length ===
            1
              ? 'column'
              : 'columns'}
          </span>

          {chartFilter && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '2px 6px',
                borderRadius: '4px',
                background: colors.accentSoft,
                color: colors.accent,
                fontSize: '9px',
              }}
            >
              {chartFilter.column} = {formatCell(
                chartFilter.value,
                chartFilter.column,
              )}
              {onClearChartFilter && (
                <button
                  type="button"
                  onClick={onClearChartFilter}
                  aria-label="Clear chart filter"
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: colors.accent,
                    cursor: 'pointer',
                    padding: 0,
                    fontSize: '11px',
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              )}
            </span>
          )}

          {search.trim() && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '2px 6px',
                borderRadius: '4px',
                background: colors.accentSoft,
                color: colors.accent,
                fontSize: '9px',
              }}
            >
              Search filtered
            </span>
          )}
        </div>

        {totalRows > 0 && (
          <span
            style={{
              fontVariantNumeric:
                'tabular-nums',
            }}
          >
            Showing{' '}
            {startRow.toLocaleString()}
            –
            {endRow.toLocaleString()}
          </span>
        )}
      </div>

      {/* HORIZONTAL SCROLL */}

      <div
        style={{
          width: '100%',
          overflowX: 'auto',
          overflowY: 'hidden',
          WebkitOverflowScrolling:
            'touch',
        }}
      >
        <table
          style={{
            width: 'max-content',
            minWidth: '100%',
            borderCollapse:
              'collapse',
            tableLayout:
              'auto',
            fontSize: '11px',
          }}
        >
          <thead>
            <tr>
              {columns.map(
                (
                  column,
                  columnIndex,
                ) => {
                  const metadata =
                    columnMetadata[
                      columnIndex
                    ]

                  const isSorted =
                    sortColumn ===
                    columnIndex

                  const headerAlignment =
                    metadata?.isNumeric
                      ? 'right'
                      : 'left'

                  return (
                    <th
                      key={`${column}-${columnIndex}`}
                      scope="col"
                      style={{
                        position:
                          'sticky',
                        top: 0,
                        zIndex: 1,

                        textAlign:
                          headerAlignment,

                        verticalAlign:
                          'middle',

                        padding:
                          '0',

                        background:
                          colors.header,

                        borderBottom:
                          `1px solid ${colors.border}`,

                        color:
                          isSorted
                            ? colors.accent
                            : colors.secondary,

                        fontWeight:
                          650,

                        lineHeight:
                          '1.3',

                        whiteSpace:
                          'nowrap',

                        fontVariantNumeric:
                          metadata?.isNumeric
                            ? 'tabular-nums'
                            : 'normal',

                        minWidth:
                          metadata?.isNumeric
                            ? '110px'
                            : 'auto',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          handleSort(
                            columnIndex,
                          )
                        }
                        title={`Sort by ${column}`}
                        style={{
                          width:
                            '100%',
                          display:
                            'flex',
                          alignItems:
                            'center',
                          justifyContent:
                            metadata?.isNumeric
                              ? 'flex-end'
                              : 'flex-start',
                          gap: '5px',
                          padding:
                            '8px 10px',
                          border:
                            'none',
                          background:
                            'transparent',
                          color:
                            isSorted
                              ? colors.accent
                              : colors.secondary,
                          fontSize:
                            '11px',
                          fontWeight:
                            650,
                          fontFamily:
                            'inherit',
                          cursor:
                            'pointer',
                          textAlign:
                            headerAlignment,
                          whiteSpace:
                            'nowrap',
                        }}
                      >
                        <span>
                          {column}
                        </span>

                        <span
                          style={{
                            display:
                              'inline-flex',
                            alignItems:
                              'center',
                            justifyContent:
                              'center',
                            width:
                              '12px',
                            height:
                              '12px',
                            flexShrink: 0,
                            fontSize:
                              '9px',
                            opacity:
                              isSorted
                                ? 1
                                : 0.35,
                          }}
                        >
                          {isSorted
                            ? sortDirection ===
                              'asc'
                              ? '↑'
                              : '↓'
                            : '↕'}
                        </span>
                      </button>
                    </th>
                  )
                },
              )}
            </tr>
          </thead>

          <tbody>
            {visibleRows.map(
              (
                row,
                rowIndex,
              ) => (
                <tr
                  key={`${safePage}-${rowIndex}`}
                  onMouseEnter={(
                    event,
                  ) => {
                    event.currentTarget.style.background =
                      colors.hover
                  }}
                  onMouseLeave={(
                    event,
                  ) => {
                    event.currentTarget.style.background =
                      'transparent'
                  }}
                >
                  {columns.map(
                    (
                      column,
                      columnIndex,
                    ) => {
                      const value =
                        row[
                          columnIndex
                        ]

                      const metadata =
                        columnMetadata[
                          columnIndex
                        ]

                      const numeric =
                        typeof value ===
                          'number' &&
                        Number.isFinite(
                          value,
                        )

                      const cellAlignment =
                        metadata?.isNumeric &&
                        numeric
                          ? 'right'
                          : 'left'

                      return (
                        <td
                          key={`${column}-${columnIndex}`}
                          style={{
                            padding:
                              '8px 10px',

                            borderBottom:
                              `1px solid ${colors.border}`,

                            color:
                              colors.text,

                            whiteSpace:
                              'nowrap',

                            textAlign:
                              cellAlignment,

                            verticalAlign:
                              'middle',

                            lineHeight:
                              '1.4',

                            fontVariantNumeric:
                              numeric
                                ? 'tabular-nums'
                                : 'normal',

                            fontFeatureSettings:
                              numeric
                                ? '"tnum"'
                                : 'normal',
                          }}
                        >
                          {formatCell(
                            value,
                            column,
                          )}
                        </td>
                      )
                    },
                  )}
                </tr>
              ),
            )}

            {/* EMPTY RESULT */}

            {totalRows === 0 && (
              <tr>
                <td
                  colSpan={Math.max(
                    columns.length,
                    1,
                  )}
                  style={{
                    padding:
                      '35px 15px',
                    textAlign:
                      'center',
                    color:
                      colors.secondary,
                    verticalAlign:
                      'middle',
                  }}
                >
                  {search.trim()
                    ? 'No rows match your search.'
                    : 'Query returned no rows.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}

      {totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems:
              'center',
            justifyContent:
              'center',
            gap: '5px',
            padding:
              '9px',
            borderTop:
              `1px solid ${colors.border}`,
          }}
        >
          <button
            type="button"
            disabled={
              safePage === 1
            }
            onClick={() =>
              setPage(
                (value) =>
                  Math.max(
                    1,
                    value - 1,
                  ),
              )
            }
            style={{
              border:
                `1px solid ${colors.border}`,
              background:
                colors.header,
              color:
                colors.text,
              borderRadius:
                '5px',
              padding:
                '5px 9px',
              fontSize:
                '10px',
              lineHeight: '1',
              cursor:
                safePage === 1
                  ? 'not-allowed'
                  : 'pointer',
              opacity:
                safePage === 1
                  ? 0.45
                  : 1,
            }}
          >
            ←
          </button>

          <span
            style={{
              minWidth:
                '85px',
              textAlign:
                'center',
              fontSize:
                '10px',
              color:
                colors.secondary,
              fontVariantNumeric:
                'tabular-nums',
            }}
          >
            Page{' '}
            {safePage} of{' '}
            {totalPages}
          </span>

          <button
            type="button"
            disabled={
              safePage ===
              totalPages
            }
            onClick={() =>
              setPage(
                (value) =>
                  Math.min(
                    totalPages,
                    value + 1,
                  ),
              )
            }
            style={{
              border:
                `1px solid ${colors.border}`,
              background:
                colors.header,
              color:
                colors.text,
              borderRadius:
                '5px',
              padding:
                '5px 9px',
              fontSize:
                '10px',
              lineHeight: '1',
              cursor:
                safePage ===
                totalPages
                  ? 'not-allowed'
                  : 'pointer',
              opacity:
                safePage ===
                totalPages
                  ? 0.45
                  : 1,
            }}
          >
            →
          </button>
        </div>
      )}
    </div>
  )
}