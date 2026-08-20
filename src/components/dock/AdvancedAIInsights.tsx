'use client'

import { useMemo } from 'react'

type AdvancedAIInsightsProps = {
  columns: string[]
  rows: unknown[][]
  darkMode?: boolean
}

type Finding = {
  title: string
  detail: string
  priority: 'high' | 'medium' | 'low'
}

function prettyName(name: string) {
  return name
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function toNumber(value: unknown): number | null {
  if (
    typeof value === 'number' &&
    Number.isFinite(value)
  ) {
    return value
  }

  if (typeof value !== 'string') {
    return null
  }

  const cleaned = value
    .replace(/,/g, '')
    .replace(/%/g, '')
    .trim()

  if (!cleaned) {
    return null
  }

  const parsed = Number(cleaned)

  return Number.isFinite(parsed)
    ? parsed
    : null
}

function formatNumber(value: number) {
  return value.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`
}

function isNumericColumn(values: unknown[]) {
  const nonEmpty = values.filter(
    (value) =>
      value !== null &&
      value !== undefined &&
      String(value).trim() !== '',
  )

  if (nonEmpty.length === 0) {
    return false
  }

  const numericCount = nonEmpty.filter(
    (value) => toNumber(value) !== null,
  ).length

  return numericCount / nonEmpty.length >= 0.8
}

function isSemanticCategoricalName(name: string) {
  const normalized = name
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .trim()

  return [
    'status',
    'state',
    'category',
    'type',
    'class',
    'group',
    'segment',
    'region',
    'country',
    'city',
    'purpose',
    'gender',
    'stage',
    'level',
    'grade',
    'rating',
    'channel',
    'source',
    'method',
    'kind',
  ].some(
    (term) =>
      normalized === term ||
      normalized.endsWith(` ${term}`) ||
      normalized.startsWith(`${term} `),
  )
}

function isCategoricalColumn(
  name: string,
  values: unknown[],
) {
  // Critical guard: numeric columns must NEVER
  // be treated as categorical dimensions.
  if (isNumericColumn(values)) {
    return false
  }

  if (isSemanticCategoricalName(name)) {
    return true
  }

  const nonEmpty = values.filter(
    (value) =>
      value !== null &&
      value !== undefined &&
      String(value).trim() !== '',
  )

  if (nonEmpty.length < 2) {
    return false
  }

  const uniqueCount = new Set(
    nonEmpty.map((value) => String(value)),
  ).size

  // Suitable for a categorical dimension, but
  // do not classify high-cardinality text as one.
  return (
    uniqueCount >= 2 &&
    uniqueCount <= Math.min(30, nonEmpty.length)
  )
}

function isRateColumn(name: string) {
  const normalized = name
    .toLowerCase()
    .replace(/[_-]+/g, ' ')

  return (
    normalized.includes('rate') ||
    normalized.includes('percent') ||
    normalized.includes('%')
  )
}

function measureLabel(column: string) {
  const normalized = column
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .trim()

  if (
    normalized === 'total loans' ||
    normalized === 'loan count' ||
    normalized === 'loan counts'
  ) {
    return 'loan count'
  }

  if (normalized === 'total loan amount') {
    return 'total loan amount'
  }

  if (normalized === 'average loan amount') {
    return 'average loan amount'
  }

  if (normalized === 'average interest rate') {
    return 'average interest rate'
  }

  if (normalized === 'average tenure') {
    return 'average tenure'
  }

  return prettyName(column)
}

function valueLabel(
  column: string,
  value: number,
) {
  if (isRateColumn(column)) {
    return `${formatNumber(value)}%`
  }

  return formatNumber(value)
}

function buildFindings(
  columns: string[],
  rows: unknown[][],
): Finding[] {
  const metadata = columns.map(
    (column, index) => {
      const values = rows.map(
        (row) => row[index],
      )

      return {
        column,
        index,
        values,
        numeric: isNumericColumn(values),
        categorical: isCategoricalColumn(
          column,
          values,
        ),
      }
    },
  )

  const categorical = metadata.find(
    (item) => item.categorical,
  )

  const numeric = metadata.filter(
    (item) => item.numeric,
  )

  if (!categorical || numeric.length === 0) {
    return []
  }

  const findings: Finding[] = []

  /*
   * Count concentration:
   * "Active accounts for 79.3% of loans."
   */
  const counts = new Map<string, number>()

  categorical.values.forEach((value) => {
    if (
      value === null ||
      value === undefined ||
      String(value).trim() === ''
    ) {
      return
    }

    const key = String(value)
    counts.set(
      key,
      (counts.get(key) ?? 0) + 1,
    )
  })

  const rankedCounts = Array.from(
    counts.entries(),
  ).sort((a, b) => b[1] - a[1])

  if (rankedCounts.length >= 2) {
    const [name, count] = rankedCounts[0]
    const share =
      rows.length > 0
        ? (count / rows.length) * 100
        : 0

    if (share >= 50) {
      findings.push({
        title: `${name} is the largest ${prettyName(
          categorical.column,
        )} group`,
        detail: `${name} represents ${formatPercent(
          share,
        )} of the result rows.`,
        priority:
          share >= 70
            ? 'high'
            : 'medium',
      })
    }
  }

  /*
   * Group-level numeric analysis.
   *
   * For each numeric measure we calculate:
   * - total by category
   * - average by category
   *
   * Numeric columns are never used as categories.
   */
  for (const measure of numeric) {
    const groups = new Map<
      string,
      { sum: number; count: number }
    >()

    rows.forEach((row) => {
      const categoryValue =
        row[categorical.index]

      const numericValue =
        toNumber(row[measure.index])

      if (
        categoryValue === null ||
        categoryValue === undefined ||
        String(categoryValue).trim() === '' ||
        numericValue === null
      ) {
        return
      }

      const key = String(categoryValue)
      const existing = groups.get(key)

      groups.set(
        key,
        existing
          ? {
              sum:
                existing.sum +
                numericValue,
              count:
                existing.count + 1,
            }
          : {
              sum: numericValue,
              count: 1,
            },
      )
    })

    const groupEntries =
      Array.from(groups.entries())

    if (groupEntries.length < 2) {
      continue
    }

    /*
     * Total concentration is most useful for
     * amount/count measures.
     */
    const total = groupEntries.reduce(
      (sum, [, group]) =>
        sum + group.sum,
      0,
    )

    if (
      total > 0 &&
      !isRateColumn(measure.column)
    ) {
      const rankedTotals =
        [...groupEntries].sort(
          (a, b) =>
            b[1].sum - a[1].sum,
        )

      const [name, group] =
        rankedTotals[0]

      const share =
        (group.sum / total) * 100

      if (share >= 50) {
        const label =
          measureLabel(
            measure.column,
          )

        findings.push({
          title: `${name} accounts for ${formatPercent(
            share,
          )} of total ${label}`,
          detail: `${name} contributes ${formatNumber(
            group.sum,
          )} of ${formatNumber(
            total,
          )} total ${label}.`,
          priority:
            share >= 70
              ? 'high'
              : 'medium',
        })
      }
    }

    /*
     * Average comparison:
     * this catches useful insights such as:
     * "Closed has the highest average loan amount."
     */
    const rankedAverages =
      groupEntries
        .map(
          ([name, group]) => ({
            name,
            average:
              group.sum /
              group.count,
          }),
        )
        .sort(
          (a, b) =>
            b.average - a.average,
        )

    if (rankedAverages.length >= 2) {
      const highest =
        rankedAverages[0]
      const lowest =
        rankedAverages[
          rankedAverages.length - 1
        ]

      if (
        highest.average !==
        lowest.average
      ) {
        const label =
          measureLabel(
            measure.column,
          )

        const highestValue =
          valueLabel(
            measure.column,
            highest.average,
          )

        const lowestValue =
          valueLabel(
            measure.column,
            lowest.average,
          )

        const title =
          label === 'loan count'
            ? `${highest.name} has the highest loan count`
            : `${highest.name} has the highest ${label}`

        const detail =
          label === 'loan count'
            ? `${highestValue} loans, compared with ${lowestValue} for ${lowest.name}.`
            : `${highestValue}, compared with ${lowestValue} for ${lowest.name}.`

        findings.push({
          title,
          detail,
          priority: 'low',
        })
      }
    }
  }

  /*
   * Add one overall rate insight if available.
   */
  const rateColumn = numeric.find(
    (item) => isRateColumn(item.column),
  )

  if (rateColumn) {
    const rateValues = rateColumn.values
      .map(toNumber)
      .filter(
        (value): value is number =>
          value !== null,
      )

    if (rateValues.length > 0) {
      const average =
        rateValues.reduce(
          (sum, value) =>
            sum + value,
          0,
        ) / rateValues.length

      const minimum =
        Math.min(...rateValues)
      const maximum =
        Math.max(...rateValues)

      findings.push({
        title: `Average ${measureLabel(
          rateColumn.column,
        )}`,
        detail: `Average is ${formatNumber(
          average,
        )}%, ranging from ${formatNumber(
          minimum,
        )}% to ${formatNumber(
          maximum,
        )}%.`,
        priority: 'low',
      })
    }
  }

  const priorityRank = {
    high: 0,
    medium: 1,
    low: 2,
  } as const

  const unique = new Map<
    string,
    Finding
  >()

  findings
    .sort(
      (a, b) =>
        priorityRank[a.priority] -
        priorityRank[b.priority],
    )
    .forEach((finding) => {
      if (!unique.has(finding.title)) {
        unique.set(
          finding.title,
          finding,
        )
      }
    })

  return Array.from(
    unique.values(),
  ).slice(0, 6)
}

export function AdvancedAIInsights({
  columns,
  rows,
  darkMode = false,
}: AdvancedAIInsightsProps) {
  const findings = useMemo(
    () => buildFindings(columns, rows),
    [columns, rows],
  )

  const colors = darkMode
    ? {
        background: '#0B1420',
        card: '#101B29',
        border: '#243447',
        text: '#E8EEF6',
        muted: '#8796AA',
        high: '#4A8CFF',
        medium: '#6B8DB8',
        low: '#64748B',
      }
    : {
        background: '#FFFFFF',
        card: '#F8FAFC',
        border: '#E2E8F0',
        text: '#172033',
        muted: '#6B7789',
        high: '#2563EB',
        medium: '#5B7DB1',
        low: '#64748B',
      }

  if (findings.length === 0) {
    return null
  }

  return (
    <section
      style={{
        margin: '10px 0',
        border: `1px solid ${colors.border}`,
        borderRadius: '7px',
        background: colors.background,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '9px 11px',
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: colors.high,
            }}
          />

          <span
            style={{
              color: colors.text,
              fontSize: '9px',
              fontWeight: 700,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
            }}
          >
            Advanced AI Insights
          </span>
        </div>

        <span
          style={{
            color: colors.muted,
            fontSize: '9px',
          }}
        >
          {findings.length} findings
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '8px',
          padding: '10px',
        }}
      >
        {findings.map((finding) => {
          const accent =
            colors[finding.priority]

          return (
            <div
              key={finding.title}
              style={{
                border: `1px solid ${colors.border}`,
                borderLeft: `3px solid ${accent}`,
                borderRadius: '5px',
                background: colors.card,
                padding: '9px',
              }}
            >
              <div
                style={{
                  color: colors.text,
                  fontSize: '10px',
                  fontWeight: 650,
                  lineHeight: 1.35,
                }}
              >
                {finding.title}
              </div>

              <div
                style={{
                  marginTop: '4px',
                  color: colors.muted,
                  fontSize: '9px',
                  lineHeight: 1.45,
                }}
              >
                {finding.detail}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
