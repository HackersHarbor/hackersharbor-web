'use client'

import { KeyboardEvent, useMemo, useState, type ComponentProps } from 'react'

import type { Cell } from '@/components/dock/types'
import { SmartTable } from '@/components/dock/SmartTable'
import { SQLChart, ChartState } from '@/components/dock/SQLChart'
import { ColumnIntelligence } from '@/components/dock/ColumnIntelligence'
import { AdvancedAIInsights } from '@/components/dock/AdvancedAIInsights'
import { SmartInsight } from '@/components/dock/SmartInsight'
import { Dashboard } from '@/components/dock/Dashboard'
import type { DashboardPin } from '@/components/dock/Dashboard'
import { AnalysisHistory } from '@/components/dock/AnalysisHistory'

interface FusionWorkspaceProps {
  cells: Cell[]
  darkMode: boolean
  colors: Record<string, string>
  chartStates: Record<number, ChartState | null>
  dashboardPins: DashboardPin[]
  onUpdateCode: (id: number, code: string) => void
  onRunCell: (id: number) => void | Promise<void>
  onChartStateChange: (id: number, state: ChartState) => void
  onPointClick: (cellId: number, column: string, value: unknown) => void
  onRemoveDashboardPin: ComponentProps<typeof Dashboard>['onRemovePin']
  onClearDashboard: () => void
  onDashboardChartStateChange: ComponentProps<typeof Dashboard>['onChartStateChange']
  onOpenAnalysis: ComponentProps<typeof AnalysisHistory>['onOpenAnalysis']
  onDuplicateAnalysis: ComponentProps<typeof AnalysisHistory>['onDuplicateAnalysis']
}

function Panel({
  title,
  subtitle,
  children,
  colors,
  darkMode,
  action,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  colors: Record<string, string>
  darkMode: boolean
  action?: React.ReactNode
}) {
  return (
    <section
      style={{
        minWidth: 0,
        minHeight: 0,
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: darkMode
          ? '0 8px 28px rgba(0,0,0,0.16)'
          : '0 8px 28px rgba(15,23,42,0.045)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          padding: '10px 12px',
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: colors.primaryText,
              letterSpacing: '0.02em',
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div
              style={{
                marginTop: '2px',
                fontSize: '9px',
                color: colors.mutedText,
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>
        {action}
      </div>
      <div style={{ padding: '10px', minWidth: 0 }}>{children}</div>
    </section>
  )
}

export function FusionWorkspace({
  cells,
  darkMode,
  colors,
  chartStates,
  dashboardPins,
  onUpdateCode,
  onRunCell,
  onChartStateChange,
  onPointClick,
  onRemoveDashboardPin,
  onClearDashboard,
  onDashboardChartStateChange,
  onOpenAnalysis,
  onDuplicateAnalysis,
}: FusionWorkspaceProps) {
  const [focus, setFocus] = useState<'all' | 'python' | 'sql' | 'results' | 'insights' | 'visuals'>('all')

  const pythonCells = useMemo(
    () => cells.filter((cell) => cell.type === 'python'),
    [cells],
  )
  const sqlCells = useMemo(
    () => cells.filter((cell) => cell.type === 'sql'),
    [cells],
  )
  const tableCells = useMemo(
    () => cells.filter((cell) => cell.output?.success && cell.output.type === 'table' && cell.output.table),
    [cells],
  )
  const latestTable = tableCells[tableCells.length - 1] ?? null
  const latestTableData = latestTable?.output?.table ?? null

  const visible = (name: typeof focus) => focus === 'all' || focus === name

  const editor = (cell: Cell) => (
    <div
      key={cell.id}
      style={{
        border: `1px solid ${colors.border}`,
        borderRadius: '7px',
        overflow: 'hidden',
        marginBottom: '8px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '6px 8px',
          background: darkMode ? '#0D1520' : '#F8FAFC',
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <span style={{ fontSize: '9px', fontWeight: 650, color: colors.secondaryText }}>
          {cell.type.toUpperCase()} CELL {cell.id}
        </span>
        <button
          type="button"
          onClick={() => void onRunCell(cell.id)}
          disabled={cell.running}
          style={{
            border: `1px solid ${colors.border}`,
            borderRadius: '5px',
            background: colors.card,
            color: colors.primaryText,
            padding: '4px 8px',
            fontSize: '9px',
            fontWeight: 650,
            cursor: cell.running ? 'wait' : 'pointer',
          }}
        >
          {cell.running ? 'Running...' : 'Run'}
        </button>
      </div>
      <textarea
        value={cell.code}
        onChange={(event) => onUpdateCode(cell.id, event.target.value)}
        onKeyDown={(event: KeyboardEvent<HTMLTextAreaElement>) => {
          if (event.shiftKey && event.key === 'Enter') {
            event.preventDefault()
            void onRunCell(cell.id)
          }
        }}
        spellCheck={false}
        style={{
          width: '100%',
          minHeight: '128px',
          resize: 'vertical',
          display: 'block',
          boxSizing: 'border-box',
          border: 'none',
          outline: 'none',
          padding: '10px',
          background: colors.editor,
          color: colors.primaryText,
          fontFamily: "'JetBrains Mono', 'SFMono-Regular', Consolas, monospace",
          fontSize: '11px',
          lineHeight: 1.55,
        }}
      />
    </div>
  )

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        height: 'calc(100vh - 170px)',
        minHeight: '560px',
        overflow: 'auto',
        marginBottom: '24px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          flexWrap: 'wrap',
          padding: '8px 10px',
          border: `1px solid ${colors.border}`,
          borderRadius: '9px',
          background: colors.card,
        }}
      >
        <div style={{ marginRight: '8px' }}>
          <div style={{ fontSize: '12px', fontWeight: 750, color: colors.primaryText }}>Harbor Fusion</div>
          <div style={{ fontSize: '9px', color: colors.mutedText }}>One workspace. Every analysis surface.</div>
        </div>
        {(['all', 'python', 'sql', 'results', 'insights', 'visuals'] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFocus(item)}
            style={{
              border: `1px solid ${focus === item ? colors.blue : colors.border}`,
              borderRadius: '5px',
              background: focus === item ? (darkMode ? '#10233D' : '#EFF6FF') : colors.card,
              color: focus === item ? colors.blue : colors.secondaryText,
              padding: '5px 8px',
              fontSize: '9px',
              fontWeight: 650,
              cursor: 'pointer',
            }}
          >
            {item === 'all' ? 'All surfaces' : item.charAt(0).toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
          gap: '10px',
          alignItems: 'stretch',

        }}
      >
        {visible('python') ? (
          <Panel title="Python" subtitle="Code and run Python without leaving SQL" colors={colors} darkMode={darkMode}>
            {pythonCells.length ? pythonCells.map(editor) : <div style={{ fontSize: '10px', color: colors.mutedText }}>No Python cells yet.</div>}
          </Panel>
        ) : null}

        {visible('sql') ? (
          <Panel title="SQL" subtitle="Write and execute SQL beside Python" colors={colors} darkMode={darkMode}>
            {sqlCells.length ? sqlCells.map(editor) : <div style={{ fontSize: '10px', color: colors.mutedText }}>No SQL cells yet.</div>}
          </Panel>
        ) : null}
      </div>

      {visible('results') && latestTableData ? (
        <Panel title="Results" subtitle={`${latestTableData.rows.length} rows and ${latestTableData.columns.length} columns`} colors={colors} darkMode={darkMode}>
          <div style={{ maxHeight: '360px', overflow: 'auto' }}>
            <SmartTable columns={latestTableData.columns} rows={latestTableData.rows} darkMode={darkMode} pageSize={15} />
          </div>
        </Panel>
      ) : null}

      {visible('visuals') && latestTableData ? (
        <Panel title="Visualizations" subtitle="Live chart from the latest table result" colors={colors} darkMode={darkMode}>
          <SQLChart
            columns={latestTableData.columns}
            rows={latestTableData.rows}
            darkMode={darkMode}
            chartState={chartStates[latestTable!.id] ?? null}
            onChartStateChange={(state) => onChartStateChange(latestTable!.id, state)}
            exportFilename={`hackersharbor-fusion-chart-${latestTable!.id}`}
            onPointClick={(column, value) => onPointClick(latestTable!.id, column, value)}
          />
        </Panel>
      ) : null}

      {visible('insights') && latestTableData ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '10px' }}>
          <Panel title="Column Intelligence" colors={colors} darkMode={darkMode}>
            <ColumnIntelligence columns={latestTableData.columns} rows={latestTableData.rows} darkMode={darkMode} />
          </Panel>
          <Panel title="Advanced AI Insights" colors={colors} darkMode={darkMode}>
            <AdvancedAIInsights columns={latestTableData.columns} rows={latestTableData.rows} darkMode={darkMode} />
          </Panel>
        </div>
      ) : null}

      {focus === 'all' && latestTableData ? (
        <Panel title="Smart Insight" subtitle="Automatic interpretation of the current result" colors={colors} darkMode={darkMode}>
          <SmartInsight columns={latestTableData.columns} rows={latestTableData.rows} darkMode={darkMode} />
        </Panel>
      ) : null}

      {focus === 'all' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '10px' }}>
          <Panel title="Dashboard" subtitle={`${dashboardPins.length} pinned analysis${dashboardPins.length === 1 ? '' : 'es'}`} colors={colors} darkMode={darkMode}>
            <Dashboard
              pins={dashboardPins}
              darkMode={darkMode}
              onRemovePin={onRemoveDashboardPin}
              onClear={onClearDashboard}
              onChartStateChange={onDashboardChartStateChange}
            />
          </Panel>
          <Panel title="Analysis History" subtitle="Open or duplicate previous work" colors={colors} darkMode={darkMode}>
            <AnalysisHistory
              cells={cells}
              darkMode={darkMode}
              chartStates={chartStates}
              onOpenAnalysis={onOpenAnalysis}
              onDuplicateAnalysis={onDuplicateAnalysis}
            />
          </Panel>
        </div>
      ) : null}
    </div>
  )
}
