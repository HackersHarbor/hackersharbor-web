'use client'

import { useCallback } from 'react'

type PDFReportButtonProps = {
  columns: string[]
  rows: unknown[][]
  darkMode?: boolean
}

function escapeHTML(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export function PDFReportButton({
  columns,
  rows,
  darkMode = false,
}: PDFReportButtonProps) {
  const handleExport = useCallback(() => {
    const reportWindow = window.open(
      '',
      '_blank',
      'width=1200,height=900',
    )

    if (!reportWindow) {
      window.alert(
        'The report window was blocked. Please allow pop-ups for HackersHarbor and try again.',
      )
      return
    }

    const background = darkMode ? '#080C10' : '#FFFFFF'
    const surface = darkMode ? '#0D1520' : '#F8FAFC'
    const text = darkMode ? '#E8EEF6' : '#172033'
    const muted = darkMode ? '#8292A8' : '#65758B'
    const border = darkMode ? '#243447' : '#E2E8F0'

    const headerHTML = columns
      .map((column) => `<th>${escapeHTML(column)}</th>`)
      .join('')

    const bodyHTML = rows
      .map(
        (row) => `
          <tr>
            ${columns
              .map(
                (_, index) =>
                  `<td>${escapeHTML(row[index])}</td>`,
              )
              .join('')}
          </tr>
        `,
      )
      .join('')

    reportWindow.document.open()

    reportWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta
            name="viewport"
            content="width=device-width,initial-scale=1"
          />
          <title>HackersHarbor SQL Analysis Report</title>

          <style>
            * { box-sizing: border-box; }

            body {
              margin: 0;
              padding: 40px;
              background: ${background};
              color: ${text};
              font-family:
                Inter,
                ui-sans-serif,
                system-ui,
                -apple-system,
                BlinkMacSystemFont,
                "Segoe UI",
                sans-serif;
            }

            .report {
              max-width: 1180px;
              margin: 0 auto;
            }

            .topbar {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 20px;
              margin-bottom: 30px;
            }

            .eyebrow {
              margin-bottom: 7px;
              color: ${muted};
              font-size: 10px;
              font-weight: 700;
              letter-spacing: .08em;
              text-transform: uppercase;
            }

            h1 {
              margin: 0;
              font-size: 26px;
              line-height: 1.2;
              letter-spacing: -.02em;
            }

            .meta {
              margin-top: 8px;
              color: ${muted};
              font-size: 12px;
            }

            .actions {
              display: flex;
              gap: 8px;
            }

            button {
              border: 1px solid ${border};
              border-radius: 6px;
              padding: 8px 12px;
              background: ${surface};
              color: ${text};
              cursor: pointer;
              font: inherit;
              font-size: 11px;
              font-weight: 650;
            }

            .section { margin-top: 22px; }

            .section-title {
              margin-bottom: 9px;
              color: ${muted};
              font-size: 10px;
              font-weight: 700;
              letter-spacing: .08em;
              text-transform: uppercase;
            }

            .table-wrap {
              overflow: auto;
              border: 1px solid ${border};
              border-radius: 8px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 11px;
            }

            th, td {
              padding: 9px 10px;
              border-bottom: 1px solid ${border};
              text-align: left;
              vertical-align: top;
            }

            th {
              background: ${surface};
              font-weight: 700;
              white-space: nowrap;
            }

            tr:last-child td { border-bottom: none; }

            @media print {
              body { padding: 0; }
              .actions { display: none; }

              @page {
                size: A4 landscape;
                margin: 14mm;
              }
            }
          </style>
        </head>

        <body>
          <main class="report">
            <div class="topbar">
              <div>
                <div class="eyebrow">
                  HackersHarbor · The Dock
                </div>

                <h1>SQL Analysis Report</h1>

                <div class="meta">
                  ${rows.length.toLocaleString()} rows
                  ·
                  ${columns.length.toLocaleString()} columns
                </div>
              </div>

              <div class="actions">
                <button
                  type="button"
                  onclick="window.print()"
                >
                  Save as PDF
                </button>
              </div>
            </div>

            <section class="section">
              <div class="section-title">Results</div>

              <div class="table-wrap">
                <table>
                  <thead>
                    <tr>${headerHTML}</tr>
                  </thead>

                  <tbody>${bodyHTML}</tbody>
                </table>
              </div>
            </section>
          </main>
        </body>
      </html>
    `)

    reportWindow.document.close()
    reportWindow.focus()
  }, [columns, rows, darkMode])

  return (
    <button
      type="button"
      onClick={handleExport}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: `1px solid ${
          darkMode ? '#263447' : '#DCE3EC'
        }`,
        borderRadius: '5px',
        padding: '5px 9px',
        background: darkMode ? '#0C141E' : '#FFFFFF',
        color: darkMode ? '#DCE5F0' : '#243247',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: '10px',
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      Export PDF
    </button>
  )
}
