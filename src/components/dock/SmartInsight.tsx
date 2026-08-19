'use client'

import { useMemo } from 'react'

type SmartInsightProps = {
  columns: string[]
  rows: unknown[][]
  darkMode?: boolean
}

type Insight = {
  title: string
  text: string
}

function isNumericColumn(
  rows: unknown[][],
  index: number,
) {
  const sample = rows.slice(0, 100)

  return (
    sample.length > 0 &&
    sample.every(
      (row) =>
        typeof row[index] === 'number' &&
        Number.isFinite(row[index] as number),
    )
  )
}

function isDateLikeColumn(column: string) {
  const name = column.toLowerCase()

  return (
    name.includes('date') ||
    name.includes('time') ||
    name.endsWith('_at') ||
    name.includes('timestamp')
  )
}

function formatNumber(value: number) {
  if (!Number.isFinite(value)) {
    return '—'
  }

  if (Number.isInteger(value)) {
    return value.toLocaleString()
  }

  return value.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })
}

function formatPercent(value: number) {
  return `${value.toLocaleString(undefined, {
    maximumFractionDigits: 1,
  })}%`
}

function labelize(column: string) {
  return column
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    )
}

function isCountLike(column: string) {
  const name = column.toLowerCase()

  return (
    name === 'count' ||
    name.includes('count') ||
    name.includes('number') ||
    name === 'n'
  )
}

function isAverageLike(column: string) {
  return column.toLowerCase().includes('avg') ||
    column.toLowerCase().includes('average')
}

function isTotalLike(column: string) {
  const name = column.toLowerCase()

  return (
    name.includes('total') ||
    name.includes('sum')
  )
}

export function SmartInsight({
  columns,
  rows,
  darkMode = false,
}: SmartInsightProps) {
  const insight = useMemo<Insight | null>(() => {
    if (
      columns.length < 2 ||
      rows.length === 0
    ) {
      return null
    }

    const numericColumns = columns.filter(
      (_, index) =>
        isNumericColumn(rows, index),
    )

    const categoricalColumns = columns.filter(
      (_, index) =>
        !isNumericColumn(rows, index) &&
        !isDateLikeColumn(columns[index]),
    )

    const dateColumns = columns.filter(
      (column) =>
        isDateLikeColumn(column),
    )

    /*
     * Dominant category
     *
     * Example:
     * loan_status | total_loans
     */
    if (
      categoricalColumns.length > 0 &&
      numericColumns.length > 0
    ) {
      const categoryColumn =
        categoricalColumns[0]

      const categoryIndex =
        columns.indexOf(categoryColumn)

      const countColumn =
        numericColumns.find(
          (column) =>
            isCountLike(column),
        )

      const metricColumn =
        countColumn ??
        numericColumns.find(
          (column) =>
            isTotalLike(column),
        ) ??
        numericColumns[0]

      const metricIndex =
        columns.indexOf(metricColumn)

      const grouped = rows
        .map((row) => ({
          category:
            String(
              row[categoryIndex] ?? '',
            ),
          value:
            Number(
              row[metricIndex],
            ),
        }))
        .filter(
          (item) =>
            item.category &&
            Number.isFinite(
              item.value,
            ),
        )

      if (grouped.length > 0) {
        const total =
          grouped.reduce(
            (sum, item) =>
              sum + item.value,
            0,
          )

        const highest =
          grouped.reduce(
            (best, item) =>
              item.value > best.value
                ? item
                : best,
            grouped[0],
          )

        if (
          total > 0 &&
          grouped.length > 1
        ) {
          const share =
            (highest.value /
              total) *
            100

          return {
            title:
              'Dataset insight',
            text:
              `${highest.category} represents ${formatPercent(
                share,
              )} of ${labelize(
                metricColumn,
              ).toLowerCase()} across the result.`,
          }
        }
      }
    }

    /*
     * Highest average/rate metric.
     *
     * Example:
     * status | average_interest_rate
     */
    if (
      categoricalColumns.length > 0
    ) {
      const averageColumns =
        numericColumns.filter(
          (column) =>
            isAverageLike(column) ||
            column
              .toLowerCase()
              .includes('rate'),
        )

      if (
        averageColumns.length > 0
      ) {
        const categoryColumn =
          categoricalColumns[0]

        const categoryIndex =
          columns.indexOf(
            categoryColumn,
          )

        const metricColumn =
          averageColumns[0]

        const metricIndex =
          columns.indexOf(
            metricColumn,
          )

        const candidates =
          rows
            .map((row) => ({
              category:
                String(
                  row[
                    categoryIndex
                  ] ?? '',
                ),
              value:
                Number(
                  row[
                    metricIndex
                  ],
                ),
            }))
            .filter(
              (item) =>
                item.category &&
                Number.isFinite(
                  item.value,
                ),
            )

        if (
          candidates.length > 1
        ) {
          const highest =
            candidates.reduce(
              (best, item) =>
                item.value >
                best.value
                  ? item
                  : best,
              candidates[0],
            )

          return {
            title:
              'Dataset insight',
            text:
              `${highest.category} has the highest ${labelize(
                metricColumn,
              ).toLowerCase()} at ${formatNumber(
                highest.value,
              )}.`,
          }
        }
      }
    }

    /*
     * Date + numeric result.
     */
    if (
      dateColumns.length > 0 &&
      numericColumns.length > 0
    ) {
      const dateColumn =
        dateColumns[0]

      const metricColumn =
        numericColumns[0]

      return {
        title:
          'Dataset insight',
        text:
          `The result contains a time series using ${labelize(
            dateColumn,
          ).toLowerCase()} and ${labelize(
            metricColumn,
          ).toLowerCase()}.`,
      }
    }

    return null
  }, [columns, rows])

  if (!insight) {
    return null
  }

  const colors = {
    background: darkMode
      ? '#0B1420'
      : '#F8FAFC',

    border: darkMode
      ? '#1B2A3B'
      : '#E5EAF0',

    accent: '#2563EB',

    text: darkMode
      ? '#E8EEF6'
      : '#172033',

    secondary: darkMode
      ? '#8A99AC'
      : '#66758A',
  }

  return (
    <section
      aria-label="Data insight"
      style={{
        marginTop: '10px',
        marginBottom: '10px',
        border:
          `1px solid ${colors.border}`,
        borderRadius: '7px',
        background:
          colors.background,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          padding:
            '9px 11px',
          borderBottom:
            `1px solid ${colors.border}`,
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background:
              colors.accent,
            flexShrink: 0,
          }}
        />

        <span
          style={{
            fontSize: '9px',
            fontWeight: 700,
            letterSpacing:
              '0.06em',
            textTransform:
              'uppercase',
            color:
              colors.secondary,
          }}
        >
          Insight
        </span>
      </div>

      <div
        style={{
          padding:
            '11px',
        }}
      >
        <div
          style={{
            fontSize: '11px',
            lineHeight: '1.65',
            color:
              colors.text,
          }}
        >
          {insight.text}
        </div>
      </div>
    </section>
  )
}
