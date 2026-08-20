'use client'

import {
  useMemo,
} from 'react'

import { SQLChart } from '@/components/dock/SQLChart'
import type { ChartState } from '@/components/dock/SQLChart'

export type DashboardPin = {
  id: string
  cellId: number
  title: string
  columns: string[]
  rows: unknown[][]
  chartState:
    | ChartState
    | null
}

type DashboardProps = {
  pins: DashboardPin[]
  darkMode?: boolean
  onRemovePin: (
    id: string,
  ) => void
  onClear: () => void
  onChartStateChange?: (
    cellId: number,
    state: ChartState,
  ) => void
}

function formatValue(
  value: unknown,
) {
  if (
    value === null ||
    value === undefined
  ) {
    return '—'
  }

  if (
    typeof value ===
    'number' &&
    Number.isFinite(value)
  ) {
    return value.toLocaleString(
      undefined,
      {
        maximumFractionDigits:
          2,
      },
    )
  }

  return String(value)
}

function isNumericColumn(
  rows: unknown[][],
  index: number,
) {
  const values =
    rows
      .map(
        (row) =>
          row[index],
      )
      .filter(
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
    values.length ===
    0
  ) {
    return false
  }

  const numeric =
    values.filter(
      (value) => {
        if (
          typeof value ===
          'number'
        ) {
          return Number.isFinite(
            value,
          )
        }

        if (
          typeof value !==
          'string'
        ) {
          return false
        }

        return Number.isFinite(
          Number(
            value
              .replace(
                /,/g,
                '',
              )
              .trim(),
          ),
        )
      },
    ).length

  return (
    numeric /
      values.length >=
    0.8
  )
}

export function Dashboard({
  pins,
  darkMode = false,
  onRemovePin,
  onClear,
  onChartStateChange,
}: DashboardProps) {
  const colors =
    darkMode
      ? {
          background:
            '#0B1420',
          card:
            '#101B29',
          border:
            '#243447',
          text:
            '#E8EEF6',
          muted:
            '#8796AA',
          blue:
            '#4A8CFF',
        }
      : {
          background:
            '#FFFFFF',
          card:
            '#F8FAFC',
          border:
            '#E2E8F0',
          text:
            '#172033',
          muted:
            '#6B7789',
          blue:
            '#2563EB',
        }

  const metrics =
    useMemo(
      () =>
        pins.flatMap(
          (pin) => {
            const numericColumns =
              pin.columns
                .map(
                  (
                    column,
                    index,
                  ) => ({
                    column,
                    index,
                  }),
                )
                .filter(
                  ({
                    index,
                  }) =>
                    isNumericColumn(
                      pin.rows,
                      index,
                    ),
                )

            return numericColumns
              .slice(
                0,
                2,
              )
              .map(
                ({
                  column,
                  index,
                }) => {
                  const values =
                    pin.rows
                      .map(
                        (row) =>
                          row[index],
                      )
                      .filter(
                        (
                          value,
                        ) =>
                          typeof value ===
                            'number' ||
                          (
                            typeof value ===
                              'string' &&
                            Number.isFinite(
                              Number(
                                value
                                  .replace(
                                    /,/g,
                                    '',
                                  )
                                  .trim(),
                              ),
                            )
                          ),
                      )
                      .map(
                        (
                          value,
                        ) =>
                          Number(
                            String(
                              value,
                            ).replace(
                              /,/g,
                              '',
                            ),
                          ),
                      )

                  if (
                    values.length ===
                    0
                  ) {
                    return null
                  }

                  const total =
                    values.reduce(
                      (
                        sum,
                        value,
                      ) =>
                        sum +
                        value,
                      0,
                    )

                  return {
                    id:
                      `${pin.id}-${column}`,
                    label:
                      column,
                    value:
                      total,
                  }
                },
              )
              .filter(
                Boolean,
              )
          },
        ),
      [pins],
    )

  return (
    <section
      style={{
        margin:
          '10px 0 14px',
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
            '10px 12px',
          borderBottom:
            `1px solid ${colors.border}`,
        }}
      >
        <div>
          <div
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
                colors.muted,
            }}
          >
            Dashboard
          </div>

          <div
            style={{
              marginTop:
                '2px',
              fontSize:
                '13px',
              fontWeight:
                650,
              color:
                colors.text,
            }}
          >
            Pinned analyses
          </div>
        </div>

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
                '9px',
              color:
                colors.muted,
            }}
          >
            {pins.length}{' '}
            pinned
          </span>

          {pins.length >
            0 && (
            <button
              type="button"
              onClick={
                onClear
              }
              style={{
                border:
                  `1px solid ${colors.border}`,
                background:
                  colors.card,
                color:
                  colors.muted,
                borderRadius:
                  '4px',
                padding:
                  '5px 8px',
                fontFamily:
                  'inherit',
                fontSize:
                  '9px',
                cursor:
                  'pointer',
              }}
            >
              Clear dashboard
            </button>
          )}
        </div>
      </div>

      {pins.length ===
        0 ? (
        <div
          style={{
            padding:
              '22px',
            textAlign:
              'center',
            color:
              colors.muted,
            fontSize:
              '11px',
          }}
        >
          Pin a SQL result to
          build your dashboard.
        </div>
      ) : (
        <>
          {metrics.length >
            0 && (
            <div
              style={{
                display:
                  'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(150px, 1fr))',
                gap:
                  '8px',
                padding:
                  '10px',
                borderBottom:
                  `1px solid ${colors.border}`,
              }}
            >
              {metrics
                .slice(
                  0,
                  6,
                )
                .map(
                  (
                    metric,
                  ) => (
                    <div
                      key={
                        metric!.id
                      }
                      style={{
                        padding:
                          '10px',
                        border:
                          `1px solid ${colors.border}`,
                        borderRadius:
                          '5px',
                        background:
                          colors.card,
                      }}
                    >
                      <div
                        style={{
                          color:
                            colors.muted,
                          fontSize:
                            '8px',
                          textTransform:
                            'uppercase',
                          letterSpacing:
                            '0.05em',
                        }}
                      >
                        {
                          metric!.label
                        }
                      </div>

                      <div
                        style={{
                          marginTop:
                            '4px',
                          color:
                            colors.text,
                          fontSize:
                            '16px',
                          fontWeight:
                            650,
                        }}
                      >
                        {formatValue(
                          metric!.value,
                        )}
                      </div>
                    </div>
                  ),
                )}
            </div>
          )}

          <div
            style={{
              display:
                'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(360px, 1fr))',
              gap:
                '10px',
              padding:
                '10px',
            }}
          >
            {pins.map(
              (pin) => (
                <article
                  key={
                    pin.id
                  }
                  style={{
                    border:
                      `1px solid ${colors.border}`,
                    borderRadius:
                      '6px',
                    background:
                      colors.card,
                    overflow:
                      'hidden',
                    minWidth:
                      0,
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
                        '8px',
                      padding:
                        '8px 9px',
                      borderBottom:
                        `1px solid ${colors.border}`,
                    }}
                  >
                    <div
                      style={{
                        minWidth:
                          0,
                        color:
                          colors.text,
                        fontSize:
                          '10px',
                        fontWeight:
                          650,
                        overflow:
                          'hidden',
                        textOverflow:
                          'ellipsis',
                        whiteSpace:
                          'nowrap',
                      }}
                    >
                      {
                        pin.title
                      }
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        onRemovePin(
                          pin.id,
                        )
                      }
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
                        fontFamily:
                          'inherit',
                        fontSize:
                          '9px',
                      }}
                    >
                      Remove
                    </button>
                  </div>

                  <div
                    style={{
                      padding:
                        '4px',
                    }}
                  >
                    <SQLChart
                      columns={
                        pin.columns
                      }
                      rows={
                        pin.rows
                      }
                      darkMode={
                        darkMode
                      }
                      chartState={
                        pin.chartState
                      }
                      onChartStateChange={(
                        state,
                      ) => {
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
                          !unchanged
                        ) {
                          onChartStateChange?.(
                            pin.cellId,
                            state,
                          )
                        }
                      }}
                    />
                  </div>
                </article>
              ),
            )}
          </div>
        </>
      )}
    </section>
  )
}
