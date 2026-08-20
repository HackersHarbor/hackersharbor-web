'use client'

import { useState } from 'react'

type ExportActionsProps = {
  columns: string[]
  rows: unknown[][]
  darkMode?: boolean
  filename?: string
}

function escapeCSV(value: unknown) {
  if (
    value === null ||
    value === undefined
  ) {
    return ''
  }

  const text =
    typeof value === 'object'
      ? JSON.stringify(value)
      : String(value)

  if (
    text.includes('"') ||
    text.includes(',') ||
    text.includes('\n') ||
    text.includes('\r')
  ) {
    return `"${text.replaceAll('"', '""')}"`
  }

  return text
}

function buildCSV(
  columns: string[],
  rows: unknown[][],
) {
  return [
    columns.map(escapeCSV).join(','),
    ...rows.map((row) =>
      columns
        .map((_, index) =>
          escapeCSV(row[index]),
        )
        .join(','),
    ),
  ].join('\r\n')
}

function buildTSV(
  columns: string[],
  rows: unknown[][],
) {
  return [
    columns.join('\t'),
    ...rows.map((row) =>
      columns
        .map((_, index) =>
          String(
            row[index] ??
              '',
          ).replace(
            /[\t\r\n]+/g,
            ' ',
          ),
        )
        .join('\t'),
    ),
  ].join('\n')
}

export function ExportActions({
  columns,
  rows,
  darkMode = false,
  filename = 'query-results.csv',
}: ExportActionsProps) {
  const [
    copied,
    setCopied,
  ] = useState(false)

  const colors = {
    border: darkMode
      ? '#263447'
      : '#DCE3EC',

    background: darkMode
      ? '#0C141E'
      : '#FFFFFF',

    hover: darkMode
      ? '#132033'
      : '#F4F7FA',

    text: darkMode
      ? '#DCE5F0'
      : '#243247',

    secondary: darkMode
      ? '#8B9AAF'
      : '#66758A',
  }

  const downloadCSV = () => {
    const csv =
      buildCSV(
        columns,
        rows,
      )

    const blob =
      new Blob(
        [csv],
        {
          type:
            'text/csv;charset=utf-8;',
        },
      )

    const url =
      URL.createObjectURL(
        blob,
      )

    const link =
      document.createElement(
        'a',
      )

    link.href = url
    link.download = filename

    document.body.appendChild(
      link,
    )

    link.click()
    link.remove()

    URL.revokeObjectURL(
      url,
    )
  }

  const copyResults =
    async () => {
      const text =
        buildTSV(
          columns,
          rows,
        )

      try {
        await navigator.clipboard.writeText(
          text,
        )

        setCopied(true)

        window.setTimeout(
          () =>
            setCopied(false),
          1600,
        )
      } catch {
        const textarea =
          document.createElement(
            'textarea',
          )

        textarea.value = text
        textarea.style.position =
          'fixed'
        textarea.style.opacity =
          '0'

        document.body.appendChild(
          textarea,
        )

        textarea.select()

        try {
          document.execCommand(
            'copy',
          )
          setCopied(true)

          window.setTimeout(
            () =>
              setCopied(false),
            1600,
          )
        } finally {
          textarea.remove()
        }
      }
    }

  const buttonStyle = {
    border:
      `1px solid ${colors.border}`,
    borderRadius: '5px',
    background:
      colors.background,
    color:
      colors.text,
    cursor: 'pointer',
    fontFamily:
      'inherit',
    fontSize: '10px',
    fontWeight: 600,
    padding:
      '5px 9px',
  } as const

  if (
    columns.length === 0 ||
    rows.length === 0
  ) {
    return null
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent:
          'space-between',
        gap: '8px',
        padding:
          '7px 10px',
        borderBottom:
          `1px solid ${colors.border}`,
        flexWrap: 'wrap',
      }}
    >
      <span
        style={{
          fontSize: '9px',
          color:
            colors.secondary,
        }}
      >
        {rows.length.toLocaleString()}{' '}
        result
        {rows.length === 1
          ? ''
          : 's'}
      </span>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
        }}
      >
        <button
          type="button"
          onClick={downloadCSV}
          style={buttonStyle}
          onMouseEnter={(event) => {
            event.currentTarget.style.background =
              colors.hover
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.background =
              colors.background
          }}
        >
          Download CSV
        </button>

        <button
          type="button"
          onClick={copyResults}
          style={buttonStyle}
          onMouseEnter={(event) => {
            event.currentTarget.style.background =
              colors.hover
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.background =
              colors.background
          }}
        >
          {copied
            ? 'Copied'
            : 'Copy results'}
        </button>
      </div>
    </div>
  )
}
