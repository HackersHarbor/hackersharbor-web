'use client'

import { useMemo } from 'react'

type ColumnKind =
  | 'numeric'
  | 'date'
  | 'boolean'
  | 'categorical'
  | 'identifier'
  | 'text'
  | 'empty'

type ColumnProfile = {
  name: string
  kind: ColumnKind
  uniqueCount: number
  nonEmptyCount: number
  sampleCount: number
  confidence: 'high' | 'medium'
}

type ColumnIntelligenceProps = {
  columns: string[]
  rows: unknown[][]
  darkMode?: boolean
}

const kindLabels: Record<
  ColumnKind,
  string
> = {
  numeric: 'Numeric',
  date: 'Date',
  boolean: 'Boolean',
  categorical: 'Categorical',
  identifier: 'Identifier',
  text: 'Text',
  empty: 'Empty',
}

function isNumericValue(
  value: unknown,
) {
  if (
    typeof value ===
    'number' &&
    Number.isFinite(value)
  ) {
    return true
  }

  if (
    typeof value !==
    'string'
  ) {
    return false
  }

  const trimmed =
    value.trim()

  if (!trimmed) {
    return false
  }

  return (
    Number.isFinite(
      Number(
        trimmed.replace(
          /,/g,
          '',
        ),
      ),
    ) &&
    !/[a-z]/i.test(
      trimmed,
    )
  )
}

function isDateValue(
  value: unknown,
) {
  if (
    value instanceof Date
  ) {
    return !Number.isNaN(
      value.getTime(),
    )
  }

  if (
    typeof value !==
    'string'
  ) {
    return false
  }

  const valueTrimmed =
    value.trim()

  if (
    !valueTrimmed ||
    valueTrimmed.length <
      6
  ) {
    return false
  }

  /*
   * Avoid classifying ordinary
   * numbers as dates.
   */
  if (
    /^\d+(\.\d+)?$/.test(
      valueTrimmed,
    )
  ) {
    return false
  }

  const parsed =
    Date.parse(
      valueTrimmed,
    )

  return (
    !Number.isNaN(
      parsed,
    ) &&
    (
      /[-/]/.test(
        valueTrimmed,
      ) ||
      /[A-Za-z]/.test(
        valueTrimmed,
      ) ||
      valueTrimmed.includes(
        'T',
      )
    )
  )
}

function isBooleanValue(
  value: unknown,
) {
  if (
    typeof value ===
    'boolean'
  ) {
    return true
  }

  if (
    typeof value !==
    'string'
  ) {
    return false
  }

  return [
    'true',
    'false',
    'yes',
    'no',
  ].includes(
    value
      .trim()
      .toLowerCase(),
  )
}

function normalizedColumnName(
  name: string,
) {
  return name
    .trim()
    .toLowerCase()
    .replace(
      /[\s-]+/g,
      '_',
    )
}

function isCategoricalName(
  name: string,
) {
  const normalized =
    normalizedColumnName(
      name,
    )

  const categoricalTerms = [
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
    'department',
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
  ]

  return categoricalTerms.some(
    (term) =>
      normalized === term ||
      normalized.includes(
        `_${term}`,
      ) ||
      normalized.startsWith(
        `${term}_`,
      ),
  )
}

function numericColumnPriority(
  name: string,
) {
  const normalized =
    normalizedColumnName(
      name,
    )

  const businessTerms = [
    'amount',
    'revenue',
    'sales',
    'value',
    'balance',
    'price',
    'cost',
    'profit',
    'income',
    'total',
  ]

  const countTerms = [
    'count',
    'number',
    'quantity',
    'volume',
    'loans',
    'customers',
    'orders',
    'records',
  ]

  if (
    businessTerms.some(
      (term) =>
        normalized.includes(
          term,
        ),
    )
  ) {
    return 3
  }

  if (
    countTerms.some(
      (term) =>
        normalized.includes(
          term,
        ),
    )
  ) {
    return 1
  }

  return 2
}

function isIdName(
  name: string,
) {
  const normalized =
    name
      .trim()
      .toLowerCase()
      .replace(
        /[\s-]+/g,
        '_',
      )

  return (
    /(^|_)(id|uuid|key)$/.test(
      normalized,
    ) ||
    normalized.endsWith(
      '_id',
    ) ||
    normalized.endsWith(
      '_uuid',
    ) ||
    normalized ===
      'id'
  )
}

function inferColumnKind(
  name: string,
  values: unknown[],
): {
  kind: ColumnKind
  confidence:
    | 'high'
    | 'medium'
} {
  const nonEmpty =
    values.filter(
      (value) =>
        value !==
          null &&
        value !==
          undefined &&
        String(
          value,
        ).trim() !==
          '',
    )

  if (
    nonEmpty.length ===
    0
  ) {
    return {
      kind: 'empty',
      confidence: 'high',
    }
  }

  const sample =
    nonEmpty.slice(
      0,
      250,
    )

  const numericRate =
    sample.filter(
      isNumericValue,
    ).length /
    sample.length

  const dateRate =
    sample.filter(
      isDateValue,
    ).length /
    sample.length

  const booleanRate =
    sample.filter(
      isBooleanValue,
    ).length /
    sample.length

  if (
    isIdName(name) &&
    numericRate < 0.95
  ) {
    return {
      kind: 'identifier',
      confidence: 'high',
    }
  }

  if (
    isIdName(name) &&
    numericRate >=
      0.95
  ) {
    return {
      kind: 'identifier',
      confidence: 'medium',
    }
  }

  if (
    isCategoricalName(name)
  ) {
    return {
      kind: 'categorical',
      confidence: 'high',
    }
  }

  if (
    dateRate >= 0.8
  ) {
    return {
      kind: 'date',
      confidence: 'high',
    }
  }

  if (
    booleanRate >=
    0.9
  ) {
    return {
      kind: 'boolean',
      confidence: 'high',
    }
  }

  if (
    numericRate >=
    0.9
  ) {
    return {
      kind: 'numeric',
      confidence: 'high',
    }
  }

  const uniqueCount =
    new Set(
      sample.map(
        (value) =>
          String(value),
      ),
    ).size

  const uniqueness =
    uniqueCount /
    sample.length

  if (
    uniqueCount <= 30 &&
    uniqueness <= 0.5
  ) {
    return {
      kind: 'categorical',
      confidence: 'high',
    }
  }

  if (
    uniqueCount <= 75 &&
    uniqueness <= 0.75
  ) {
    return {
      kind: 'categorical',
      confidence: 'medium',
    }
  }

  return {
    kind: 'text',
    confidence: 'medium',
  }
}

function prettyColumnName(
  name: string,
) {
  return name
    .replace(
      /[_-]+/g,
      ' ',
    )
    .replace(
      /\s+/g,
      ' ',
    )
    .trim()
}

export function ColumnIntelligence({
  columns,
  rows,
  darkMode = false,
}: ColumnIntelligenceProps) {
  const profiles =
    useMemo<ColumnProfile[]>(
      () =>
        columns.map(
          (
            column,
            columnIndex,
          ) => {
            const values =
              rows.map(
                (row) =>
                  row[
                    columnIndex
                  ],
              )

            const nonEmpty =
              values.filter(
                (value) =>
                  value !==
                    null &&
                  value !==
                    undefined &&
                  String(
                    value,
                  ).trim() !==
                    '',
              )

            const sample =
              nonEmpty.slice(
                0,
                250,
              )

            const inferred =
              inferColumnKind(
                column,
                values,
              )

            return {
              name: column,
              kind:
                inferred.kind,
              confidence:
                inferred.confidence,
              uniqueCount:
                new Set(
                  sample.map(
                    (value) =>
                      String(
                        value,
                      ),
                  ),
                ).size,
              nonEmptyCount:
                nonEmpty.length,
              sampleCount:
                sample.length,
            }
          },
        ),
      [
        columns,
        rows,
      ],
    )

  const suggestions =
    useMemo(() => {
      const categorical =
        profiles.find(
          (profile) =>
            profile.kind ===
            'categorical',
        )

      const numericProfiles =
        profiles
          .filter(
            (profile) =>
              profile.kind ===
              'numeric',
          )
          .sort(
            (a, b) =>
              numericColumnPriority(
                b.name,
              ) -
              numericColumnPriority(
                a.name,
              ),
          )

      const numeric =
        numericProfiles[0]

      const secondNumeric =
        numericProfiles.find(
          (profile) =>
            profile.name !==
            numeric?.name,
        )

      const date =
        profiles.find(
          (profile) =>
            profile.kind ===
            'date',
        )

      const results: Array<{
        title: string
        detail: string
      }> = []

      if (
        categorical &&
        numeric
      ) {
        results.push({
          title:
            'Bar chart',
          detail: `${prettyColumnName(
            categorical.name,
          )} by ${prettyColumnName(
            numeric.name,
          )}`,
        })
      }

      if (
        date &&
        numeric
      ) {
        results.push({
          title:
            'Line chart',
          detail: `${prettyColumnName(
            numeric.name,
          )} over ${prettyColumnName(
            date.name,
          )}`,
        })
      }

      if (
        numeric &&
        secondNumeric
      ) {
        results.push({
          title:
            'Scatter plot',
          detail: `${prettyColumnName(
            numeric.name,
          )} vs ${prettyColumnName(
            secondNumeric.name,
          )}`,
        })
      }

      return results.slice(
        0,
        3,
      )
    }, [profiles])

  const colors =
    darkMode
      ? {
          background:
            '#0B1420',
          border:
            '#1D2B3A',
          text:
            '#E8EEF6',
          muted:
            '#8796AA',
          chip:
            '#111E2D',
          accent:
            '#4A8CFF',
        }
      : {
          background:
            '#FFFFFF',
          border:
            '#E3E8EF',
          text:
            '#172033',
          muted:
            '#6B7789',
          chip:
            '#F5F8FC',
          accent:
            '#2563EB',
        }

  if (
    columns.length === 0
  ) {
    return null
  }

  return (
    <section
      style={{
        margin:
          '10px 0',
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
          padding:
            '9px 11px',
          borderBottom:
            `1px solid ${colors.border}`,
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
              width:
                '6px',
              height:
                '6px',
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
              color:
                colors.text,
            }}
          >
            Column Intelligence
          </span>
        </div>

        <span
          style={{
            color:
              colors.muted,
            fontSize:
              '9px',
          }}
        >
          {profiles.length}{' '}
          columns analyzed
        </span>
      </div>

      <div
        style={{
          display:
            'grid',
          gridTemplateColumns:
            'minmax(0, 1fr) minmax(260px, 0.8fr)',
          gap:
            '12px',
          padding:
            '11px',
        }}
      >
        <div>
          <div
            style={{
              display:
                'flex',
              flexWrap:
                'wrap',
              gap:
                '6px',
            }}
          >
            {profiles.map(
              (
                profile,
              ) => (
                <div
                  key={
                    profile.name
                  }
                  title={`${profile.nonEmptyCount.toLocaleString()} non-empty values`}
                  style={{
                    display:
                      'inline-flex',
                    alignItems:
                      'center',
                    gap:
                      '6px',
                    padding:
                      '5px 7px',
                    border:
                      `1px solid ${colors.border}`,
                    borderRadius:
                      '5px',
                    background:
                      colors.chip,
                    maxWidth:
                      '100%',
                  }}
                >
                  <span
                    style={{
                      color:
                        colors.text,
                      fontSize:
                        '9px',
                      fontWeight:
                        600,
                      overflow:
                        'hidden',
                      textOverflow:
                        'ellipsis',
                      whiteSpace:
                        'nowrap',
                      maxWidth:
                        '180px',
                    }}
                  >
                    {prettyColumnName(
                      profile.name,
                    )}
                  </span>

                  <span
                    style={{
                      color:
                        colors.accent,
                      fontSize:
                        '8px',
                      fontWeight:
                        700,
                      whiteSpace:
                        'nowrap',
                    }}
                  >
                    {
                      kindLabels[
                        profile.kind
                      ]
                    }
                  </span>
                </div>
              ),
            )}
          </div>
        </div>

        {suggestions.length >
          0 && (
          <div
            style={{
              borderLeft:
                `1px solid ${colors.border}`,
              paddingLeft:
                '12px',
            }}
          >
            <div
              style={{
                color:
                  colors.muted,
                fontSize:
                  '8px',
                fontWeight:
                  700,
                letterSpacing:
                  '0.07em',
                textTransform:
                  'uppercase',
                marginBottom:
                  '7px',
              }}
            >
              Suggested visualizations
            </div>

            <div
              style={{
                display:
                  'flex',
                flexDirection:
                  'column',
                gap:
                  '6px',
              }}
            >
              {suggestions.map(
                (
                  suggestion,
                ) => (
                  <div
                    key={
                      suggestion.title +
                      suggestion.detail
                    }
                    style={{
                      padding:
                        '6px 7px',
                      border:
                        `1px solid ${colors.border}`,
                      borderRadius:
                        '5px',
                      background:
                        colors.chip,
                    }}
                  >
                    <div
                      style={{
                        color:
                          colors.text,
                        fontSize:
                          '9px',
                        fontWeight:
                          600,
                      }}
                    >
                      {
                        suggestion.title
                      }
                    </div>

                    <div
                      style={{
                        marginTop:
                          '2px',
                        color:
                          colors.muted,
                        fontSize:
                          '8px',
                      }}
                    >
                      {
                        suggestion.detail
                      }
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
