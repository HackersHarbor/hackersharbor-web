'use client'

import {
  KeyboardEvent,
  useMemo,
  useState,
  type ComponentProps,
} from 'react'

import type { Cell, ExecutionResult } from '@/components/dock/types'
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
  onRunAll: () => void | Promise<void>
  onRunPythonCode: (code: string) => Promise<ExecutionResult>
  onChartStateChange: (id: number, state: ChartState) => void
  onPointClick: (cellId: number, column: string, value: unknown) => void
  onRemoveDashboardPin: ComponentProps<typeof Dashboard>['onRemovePin']
  onClearDashboard: () => void
  onDashboardChartStateChange: ComponentProps<typeof Dashboard>['onChartStateChange']
  onOpenAnalysis: ComponentProps<typeof AnalysisHistory>['onOpenAnalysis']
  onDuplicateAnalysis: ComponentProps<typeof AnalysisHistory>['onDuplicateAnalysis']
  onExit: () => void
}

type Surface =
  | 'overview'
  | 'workspace'
  | 'statistics'
  | 'machine-learning'
  | 'insights'
  | 'dashboard'

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
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: darkMode
? '0 12px 32px rgba(0,0,0,.18)'
          : '0 10px 30px rgba(15,23,42,.05)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          padding: '10px 12px',
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 750, color: colors.primaryText }}>
            {title}
          </div>
          {subtitle ? (
            <div style={{ marginTop: 2, fontSize: 9, color: colors.mutedText }}>
              {subtitle}
            </div>
          ) : null}
        </div>
        {action}
      </div>
      <div style={{ padding: 10, minWidth: 0 }}>{children}</div>
    </section>
  )
}

function Metric({
  label,
  value,
  colors,
}: {
  label: string
  value: string
  colors: Record<string, string>
}) {
  return (
    <div
      style={{
        border: `1px solid ${colors.border}`,
        borderRadius: 9,
        padding: '10px 11px',
        background: colors.input,
      }}
    >
      <div style={{ fontSize: 9, color: colors.mutedText }}>{label}</div>
      <div style={{ marginTop: 4, fontSize: 15, fontWeight: 750, color: colors.primaryText }}>
        {value}
      </div>
    </div>
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
  onRunAll,
  onRunPythonCode,
  onChartStateChange,
  onPointClick,
  onRemoveDashboardPin,
  onClearDashboard,
  onDashboardChartStateChange,
  onOpenAnalysis,
  onDuplicateAnalysis,
  onExit,
}: FusionWorkspaceProps) {
  const [surface, setSurface] = useState<Surface>('overview')
  const [
    executionPriority,
    setExecutionPriority,
  ] = useState<'idle' | 'running' | 'ready'>('idle')

  const [model, setModel] = useState('Random Forest')
  const [target, setTarget] = useState('')
  const [training, setTraining] = useState(false)
  const [modelStatus, setModelStatus] = useState('Ready to configure')
  const [modelResult, setModelResult] = useState('')

  const pythonCells = useMemo(
    () => cells.filter((cell) => cell.type === 'python'),
    [cells],
  )

  const sqlCells = useMemo(
    () => cells.filter((cell) => cell.type === 'sql'),
    [cells],
  )

  const tableCells = useMemo(
    () =>
      cells.filter(
        (cell) =>
          cell.output?.success &&
          cell.output.type === 'table' &&
          cell.output.table,
      ),
    [cells],
  )

  const latestTable = tableCells[tableCells.length - 1] ?? null
  const table = latestTable?.output?.table ?? null

  const numericStats = useMemo(() => {
    if (!table) return []

    return table.columns
      .map((column, index) => {
        const values = table.rows
          .map((row) => Number(row[index]))
          .filter((value) => Number.isFinite(value))

        if (!values.length) return null

        const sorted = [...values].sort((a, b) => a - b)
        const mean = values.reduce((sum, value) => sum + value, 0) / values.length
        const median =
          sorted.length % 2
            ? sorted[Math.floor(sorted.length / 2)]
            : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        const variance =
          values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length

        return {
          column,
          count: values.length,
          mean,
          median,
          std: Math.sqrt(variance),
          min: sorted[0],
          max: sorted[sorted.length - 1],
        }
      })
      .filter(Boolean) as Array<{
        column: string
        count: number
        mean: number
        median: number
        std: number
        min: number
        max: number
      }>
  }, [table])

  const formatNumber = (value: number) =>
    Number.isInteger(value)
    ? value.toLocaleString()
      : value.toLocaleString(undefined, { maximumFractionDigits: 3 })

  const modelRecommendation = useMemo(() => {
    if (!table || !target) {
      return null
    }

    const targetIndex = table.columns.indexOf(target)
    if (targetIndex < 0) {
      return null
    }

    const values = table.rows
      .map((row) => row[targetIndex])
      .filter((value) => value !== null && value !== undefined && value !== '')

    const numeric = values.length > 0 && values.every(
      (value) => Number.isFinite(Number(value)),
    )

    const unique = new Set(values.map((value) => String(value))).size

    if (numeric && unique > 20) {
      return {
        task: 'Regression',
        recommended: 'Random Forest Regressor',
        alternatives: ['Gradient Boosting Regressor', 'Linear Regression'],
      }
    }

    if (unique <= 20) {
      return {
        task: 'Classification',
        recommended: 'Random Forest Classifier',
        alternatives: ['Logistic Regression', 'Gradient Boosting Classifier'],
      }
    }

    return {
      task: 'Clustering / exploration',
      recommended: 'K-Means',
      alternatives: ['Hierarchical clustering'],
    }
  }, [table, target])

  const runModel = async () => {
    if (!table || !target) {
      setModelStatus('Select a target column after running an analysis.')
      return
    }

    setTraining(true)
    setModelResult('')
    setModelStatus(`Training ${model}...`)

    const columns = table.columns
    const numericColumns = columns.filter((column) => {
      const index = columns.indexOf(column)
      const values = table.rows
        .map((row) => Number(row[index]))
        .filter((value) => Number.isFinite(value))
      return values.length > 0
    })

    const features = numericColumns.filter((column) => column !== target)

    if (!features.length) {
      setTraining(false)
      setModelStatus('No numeric feature columns are available for this model.')
      return
    }

    const featureLiteral = JSON.stringify(features)
    const targetLiteral = JSON.stringify(target)

    const isRegression = model.includes('Regression') &&
      !model.includes('Logistic') &&
      !model.includes('Random Forest Classifier') &&
      !model.includes('Gradient Boosting Classifier')

    const code = `
import pandas as pd
import numpy as np

features = ${featureLiteral}
target_column = ${targetLiteral}

ml = df[features + [target_column]].dropna()

if len(ml) < 10:
    print("Not enough complete rows for model training.")
else:
    X = ml[features]
    y = ml[target_column]

    from sklearn.model_selection import train_test_split
    from sklearn.metrics import accuracy_score, mean_absolute_error, r2_score

    if ${isRegression ? 'True' : 'False'}:
        from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
        from sklearn.linear_model import LinearRegression

        if ${JSON.stringify(model)} == "Random Forest":
            estimator = RandomForestRegressor(n_estimators=100, random_state=42)
        elif ${JSON.stringify(model)} == "Gradient Boosting":
            estimator = GradientBoostingRegressor(random_state=42)
        else:
            estimator = LinearRegression()

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        estimator.fit(X_train, y_train)
        predictions = estimator.predict(X_test)

        print("Task: Regression")
        print("Model:", ${JSON.stringify(model)})
        print("Rows:", len(ml))
        print("MAE:", round(mean_absolute_error(y_test, predictions), 4))
        print("RÂ²:", round(r2_score(y_test, predictions), 4))
        print("Feature importance:")
        if hasattr(estimator, "feature_importances_"):
            print(dict(sorted(
                zip(features, estimator.feature_importances_),
                key=lambda item: item[1],
                reverse=True
            )))
    else:
        from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
        from sklearn.linear_model import LogisticRegression

        if ${JSON.stringify(model)} == "Logistic Regression":
            estimator = LogisticRegression(max_iter=1000)
        elif ${JSON.stringify(model)} == "Gradient Boosting":
            estimator = GradientBoostingClassifier(random_state=42)
        else:
            estimator = RandomForestClassifier(n_estimators=100, random_state=42)

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        estimator.fit(X_train, y_train)
        predictions = estimator.predict(X_test)

        print("Task: Classification")
        print("Model:", ${JSON.stringify(model)})
        print("Rows:", len(ml))
        print("Accuracy:", round(accuracy_score(y_test, predictions), 4))
        print("Feature importance:")
        if hasattr(estimator, "feature_importances_"):
            print(dict(sorted(
                zip(features, estimator.feature_importances_),
                key=lambda item: item[1],
                reverse=True
            )))
`.trim()

    try {
      const result = await onRunPythonCode(code)
      if (result.success) {
        setModelStatus(`${model} training completed.`)
        setModelResult(result.text || 'Model execution completed.')
      } else {
        setModelStatus(`Model execution failed.`)
        setModelResult(result.error || 'Unknown model error.')
      }
    } catch (error) {
      setModelStatus('Model execution failed.')
      setModelResult(
        error instanceof Error ? error.message : 'Unknown model error.',
      )
    } finally {
      setTraining(false)
    }
  }

  const editor = (cell: Cell) => (
    <div
      key={cell.id}
      style={{
        border: `1px solid ${colors.border}`,
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 8,
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
        <span style={{ fontSize: 9, fontWeight: 700, color: colors.secondaryText }}>
          {cell.type.toUpperCase()} CELL {cell.id}
        </span>
        <button
          type="button"
          onClick={() => void onRunCell(cell.id)}
          disabled={cell.running}
          style={{
            border: `1px solid ${colors.border}`,
            borderRadius: 5,
            background: colors.card,
            color: colors.primaryText,
            padding: '4px 8px',
            fontSize: 9,
            fontWeight: 700,
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
          minHeight: 125,
          resize: 'vertical',
          display: 'block',
          boxSizing: 'border-box',
          border: 'none',
          outline: 'none',
          padding: 10,
          background: colors.editor,
          color: colors.primaryText,
          fontFamily: "'JetBrains Mono', 'SFMono-Regular', Consolas, monospace",
          fontSize: 11,
          lineHeight: 1.55,
        }}
      />
    </div>
  )

  const tab = (value: Surface, label: string) => (
    <button
      key={value}
      type="button"
      onClick={() => setSurface(value)}
      style={{
        border: `1px solid ${surface === value ? colors.blue : colors.border}`,
        borderRadius: 7,
        padding: '6px 9px',
        background: surface === value ? (darkMode ? '#10233D' : '#EFF6FF') : colors.card,
        color: surface === value ? colors.blue : colors.secondaryText,
        fontSize: 9,
        fontWeight: 700,
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        minHeight: 'calc(100vh - 150px)',
        marginBottom: 24,
      }}
    >
      <section
        style={{
          border: `1px solid ${colors.blue}55`,
          borderRadius: 14,
          padding: 14,
          background: darkMode
            ? 'linear-gradient(135deg,#0B1627,#0D1520)'
            : 'linear-gradient(135deg,#F5F9FF,#FFFFFF)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: colors.primaryText }}>
                Harbor Fusion
              </span>
              <span
                style={{
                  fontSize: 8,
                  fontWeight: 800,
                  letterSpacing: '.08em',
                  color: '#FFFFFF',
                  background: colors.blue,
                  borderRadius: 999,
                  padding: '4px 7px',
                }}
              >
                FUSION
              </span>
            </div>
            <div style={{ marginTop: 5, fontSize: 11, color: colors.secondaryText, maxWidth: 720 }}>
              Python, SQL, statistics, visualization, machine learning, and AI - all connected in one Fusion workspace.
            </div>
          </div>

          <button
            type="button"
            onClick={onExit}
            style={{
              border: `1px solid ${colors.border}`,
              borderRadius: 7,
              background: colors.card,
              color: colors.secondaryText,
              padding: '6px 10px',
              fontSize: 9,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Back to Dock
          </button>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
          {tab('overview', 'Fusion Overview')}
          {tab('workspace', 'Code Workspace')}
          {tab('statistics', 'Statistics')}
          {tab('machine-learning', 'Machine Learning')}
          {tab('insights', 'AI + Intelligence')}
          {tab('dashboard', 'Dashboard')}
          <button
            type="button"
            onClick={async () => {
                    setExecutionPriority('running')
                    await onRunAll()
                    setExecutionPriority('ready')
                  }}
            style={{
              border: `1px solid ${colors.blue}`,
              borderRadius: 7,
              padding: '6px 9px',
              background: colors.blue,
              color: '#FFFFFF',
              fontSize: 9,
              fontWeight: 750,
              cursor: 'pointer',
            }}
          >
            Run all
          </button>
        </div>
      </section>

      {surface === 'overview' ? (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
              gap: 10,
              alignItems: 'stretch',
            }}
          >
            <Panel
              title="Python"
              subtitle="Code and run Python while SQL remains visible"
              colors={colors}
              darkMode={darkMode}
            >
              <div style={{ maxHeight: 360, overflow: 'auto' }}>
                {pythonCells.length ? pythonCells.map(editor)
                  : <div style={{ fontSize: 10, color: colors.mutedText }}>No Python cells yet.</div>}
              </div>
            </Panel>

            <Panel
              title="SQL"
              subtitle="Write and execute SQL beside Python"
              colors={colors}
              darkMode={darkMode}
            >
              <div style={{ maxHeight: 360, overflow: 'auto' }}>
                {sqlCells.length ? sqlCells.map(editor)
                  : <div style={{ fontSize: 10, color: colors.mutedText }}>No SQL cells yet.</div>}
              </div>
            </Panel>
          </div>

          {executionPriority === 'running' ? (
            <div
              style={{
                marginTop: 10,
                padding: '8px 10px',
                border: `1px solid ${colors.blue}`,
                borderRadius: 7,
                background: darkMode ? '#0B1627' : '#F4F8FF',
                color: darkMode ? '#DCEBFF' : '#17345C',
                fontSize: 9,
                fontWeight: 700,
              }}
            >
              Executing analysis... Results will appear first.
            </div>
          ) : null}

          {table ? (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
                  gap: 10,
                }}
              >
                <Panel
                  title="Results"
                  subtitle={`${table.rows.length} rows | ${table.columns.length} columns`}
                  colors={colors}
                  darkMode={darkMode}
                >
                  <div style={{ maxHeight: 330, overflow: 'auto' }}>
                    <SmartTable
                      columns={table.columns}
                      rows={table.rows}
                      darkMode={darkMode}
                      pageSize={15}
                    />
                  </div>
                </Panel>

                <Panel
                  title="Visualization"
                  subtitle="Build a chart directly from the current result"
                  colors={colors}
                  darkMode={darkMode}
                >
                  <SQLChart
                    columns={table.columns}
                    rows={table.rows}
                    darkMode={darkMode}
                    chartState={chartStates[latestTable!.id] ?? null}
                    onChartStateChange={(state) =>
                      onChartStateChange(latestTable!.id, state)
                    }
                    exportFilename={`hackersharbor-fusion-chart-${latestTable!.id}`}
                    onPointClick={(column, value) =>
                      onPointClick(latestTable!.id, column, value)
                    }
                  />
                </Panel>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
                  gap: 10,
                }}
              >
                <Panel title="Column Intelligence" colors={colors} darkMode={darkMode}>
                  <ColumnIntelligence
                    columns={table.columns}
                    rows={table.rows}
                    darkMode={darkMode}
                  />
                </Panel>

                <Panel title="Advanced AI Insights" colors={colors} darkMode={darkMode}>
                  <AdvancedAIInsights
                    columns={table.columns}
                    rows={table.rows}
                    darkMode={darkMode}
                  />
                </Panel>
              </div>

              <Panel
                title="Smart Insight"
                subtitle="Automatic interpretation of the current result"
                colors={colors}
                darkMode={darkMode}
              >
                <SmartInsight
                  columns={table.columns}
                  rows={table.rows}
                  darkMode={darkMode}
                />
              </Panel>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 1fr)',
                  gap: 10,
                }}
              >
                <Panel
                  title="Dashboard"
                  subtitle={`${dashboardPins.length} pinned analysis${dashboardPins.length === 1 ? '' : 'es'}`}
                  colors={colors}
                  darkMode={darkMode}
                >
                  <Dashboard
                    pins={dashboardPins}
                    darkMode={darkMode}
                    onRemovePin={onRemoveDashboardPin}
                    onClear={onClearDashboard}
                    onChartStateChange={onDashboardChartStateChange}
                  />
                </Panel>

                <Panel
                  title="Analysis History"
                  subtitle="Open or duplicate previous work"
                  colors={colors}
                  darkMode={darkMode}
                >
                  <AnalysisHistory
                    cells={cells}
                    darkMode={darkMode}
                    chartStates={chartStates}
                    onOpenAnalysis={onOpenAnalysis}
                    onDuplicateAnalysis={onDuplicateAnalysis}
                  />
                </Panel>
              </div>
            </>
          ) : (
            <Panel
              title="Analysis surface"
              subtitle="Run Python or SQL to populate your connected analysis surfaces."
              colors={colors}
              darkMode={darkMode}
            >
              <div
                style={{
                  padding: 30,
                  textAlign: 'center',
                  color: colors.mutedText,
                  fontSize: 11,
                }}
              >
                Run a SQL query with a table result to unlock Results, Visualization,
                Intelligence, Dashboard, Statistics and Machine Learning.
              </div>
            </Panel>
          )}
        </>
      ) : null}

      {surface === 'workspace' ? (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
              gap: 10,
              alignItems: 'stretch',
            }}
          >
            <Panel
              title="Python"
              subtitle="Run Python while SQL remains visible"
              colors={colors}
              darkMode={darkMode}
            >
              <div style={{ maxHeight: 390, overflow: 'auto' }}>
                {pythonCells.length ? pythonCells.map(editor)
                  : <div style={{ fontSize: 10, color: colors.mutedText }}>No Python cells yet.</div>}
              </div>
            </Panel>

            <Panel
              title="SQL"
              subtitle="Query DuckDB beside Python"
              colors={colors}
              darkMode={darkMode}
            >
              <div style={{ maxHeight: 390, overflow: 'auto' }}>
                {sqlCells.length ? sqlCells.map(editor)
                  : <div style={{ fontSize: 10, color: colors.mutedText }}>No SQL cells yet.</div>}
              </div>
            </Panel>
          </div>

          {table ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
                gap: 10,
              }}
            >
              <Panel
                title="Results"
                subtitle={`${table.rows.length} rows | ${table.columns.length} columns`}
                colors={colors}
                darkMode={darkMode}
              >
                <div style={{ maxHeight: 330, overflow: 'auto' }}>
                  <SmartTable
                    columns={table.columns}
                    rows={table.rows}
                    darkMode={darkMode}
                    pageSize={12}
                  />
                </div>
              </Panel>

              <Panel
                title="Visualization"
                subtitle="Build a chart directly from the current result"
                colors={colors}
                darkMode={darkMode}
              >
                <SQLChart
                  columns={table.columns}
                  rows={table.rows}
                  darkMode={darkMode}
                  chartState={chartStates[latestTable!.id] ?? null}
                  onChartStateChange={(state) => onChartStateChange(latestTable!.id, state)}
                  exportFilename={`hackersharbor-fusion-${latestTable!.id}`}
                  onPointClick={(column, value) =>
                    onPointClick(latestTable!.id, column, value)
                  }
                />
              </Panel>
            </div>
          ) : (
            <Panel
              title="Analysis surface"
              subtitle="Run a SQL query to populate Results, Visualization, Statistics and ML."
              colors={colors}
              darkMode={darkMode}
            >
              <div style={{ padding: 28, textAlign: 'center', color: colors.mutedText, fontSize: 11 }}>
                Your analysis surfaces will appear here as soon as a table result is available.
              </div>
            </Panel>
          )}
        </>
      ) : null}

      {surface === 'statistics' ? (
        <Panel
          title="Statistics"
          subtitle="Descriptive statistics from the latest table result"
          colors={colors}
          darkMode={darkMode}
        >
          {!table ? (
            <div style={{ padding: 30, textAlign: 'center', color: colors.mutedText, fontSize: 11 }}>
              Run a SQL query with a table result to calculate statistics.
            </div>
          ) : numericStats.length ? (
            <div style={{ display: 'grid', gap: 10 }}>
              {numericStats.map((item) => (
                <div key={item.column}>
                  <div style={{ fontSize: 10, fontWeight: 750, color: colors.primaryText, marginBottom: 6 }}>
                    {item.column}
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(6,minmax(0,1fr))',
                      gap: 6,
                    }}
                  >
                    <Metric label="Count" value={formatNumber(item.count)} colors={colors} />
                    <Metric label="Mean" value={formatNumber(item.mean)} colors={colors} />
                    <Metric label="Median" value={formatNumber(item.median)} colors={colors} />
                    <Metric label="Std dev" value={formatNumber(item.std)} colors={colors} />
                    <Metric label="Min" value={formatNumber(item.min)} colors={colors} />
                    <Metric label="Max" value={formatNumber(item.max)} colors={colors} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: 20, color: colors.mutedText, fontSize: 10 }}>
              No numeric columns were detected in the latest result.
            </div>
          )}
        </Panel>
      ) : null}

      {surface === 'machine-learning' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.3fr)', gap: 10 }}>
          <Panel
            title="Machine Learning"
            subtitle="Configure a model from the current dataset"
            colors={colors}
            darkMode={darkMode}
          >
            <div style={{ display: 'grid', gap: 10 }}>
              <label style={{ fontSize: 9, color: colors.secondaryText }}>
                Target column
                <select
                  value={target}
                  onChange={(event) => setTarget(event.target.value)}
                  style={{
                    display: 'block',
                    width: '100%',
                    marginTop: 5,
                    boxSizing: 'border-box',
                    padding: '7px 8px',
                    borderRadius: 6,
                    border: `1px solid ${colors.border}`,
                    background: colors.input,
                    color: colors.primaryText,
                  }}
                >
                  <option value="">Select target...</option>
                  {table?.columns.map((column) => (
                    <option key={column} value={column}>{column}</option>
                  ))}
                </select>
              </label>

              <label style={{ fontSize: 9, color: colors.secondaryText }}>
                Model
                <select
                  value={model}
                  onChange={(event) => setModel(event.target.value)}
                  style={{
                    display: 'block',
                    width: '100%',
                    marginTop: 5,
                    boxSizing: 'border-box',
                    padding: '7px 8px',
                    borderRadius: 6,
                    border: `1px solid ${colors.border}`,
                    background: colors.input,
                    color: colors.primaryText,
                  }}
                >
                  <option>Random Forest</option>
                  <option>Logistic Regression</option>
                  <option>Linear Regression</option>
                  <option>Gradient Boosting</option>
                  <option>K-Means</option>
                </select>
              </label>

              <button
                type="button"
                onClick={runModel}
                disabled={training}
                style={{
                  border: 'none',
                  borderRadius: 7,
                  padding: '8px 10px',
                  background: colors.blue,
                  color: '#FFFFFF',
                  fontSize: 10,
                  fontWeight: 750,
                  cursor: training ? 'wait' : 'pointer',
                }}
              >
                {training ? 'Preparing...' : 'Prepare model'}
              </button>

              <div style={{ fontSize: 9, color: colors.mutedText }}>
                {modelStatus}
              </div>
            </div>
          </Panel>

          <Panel
            title="Model workspace"
            subtitle="Metrics and training results will live here"
            colors={colors}
            darkMode={darkMode}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3,minmax(0,1fr))',
                gap: 8,
              }}
            >
              <Metric label="Target" value={target || 'Not selected'} colors={colors} />
              <Metric label="Model" value={model} colors={colors} />
              <Metric label="Data" value={table ? `${table.rows.length.toLocaleString()} rows` : 'No data'} colors={colors} />
            </div>

            {modelRecommendation ? (
              <div
                style={{
                  marginTop: 10,
                  padding: 12,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 9,
                  background: colors.input,
                  fontSize: 10,
                  lineHeight: 1.6,
                }}
              >
                <div style={{ fontWeight: 750, color: colors.primaryText }}>
                  Fusion recommendation
                </div>
                <div style={{ marginTop: 4, color: colors.secondaryText }}>
                  Task: {modelRecommendation.task}
                </div>
                <div style={{ marginTop: 4, color: colors.blue, fontWeight: 700 }}>
                  Recommended: {modelRecommendation.recommended}
                </div>
                <div style={{ marginTop: 4, color: colors.mutedText }}>
                  Alternatives: {modelRecommendation.alternatives.join(' | ')}
                </div>
              </div>
            ) : null}

            {modelResult ? (
              <pre
                style={{
                  marginTop: 10,
                  padding: 12,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 9,
                  background: colors.editor,
                  color: colors.primaryText,
                  whiteSpace: 'pre-wrap',
                  overflowX: 'auto',
                  fontSize: 10,
                  lineHeight: 1.6,
                }}
              >
                {modelResult}
              </pre>
            ) : (
              <div
                style={{
                  marginTop: 10,
                  border: `1px dashed ${colors.border}`,
                  borderRadius: 9,
                  padding: 16,
                  color: colors.mutedText,
                  fontSize: 10,
                  lineHeight: 1.6,
                }}
              >
                Select a target and run a model. Fusion will execute the generated
                training code through the same Python runtime used by your notebook.
              </div>
            )}
          </Panel>
        </div>
      ) : null}

      {surface === 'insights' ? (
        <>
          {table ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 10 }}>
                <Panel title="Column Intelligence" colors={colors} darkMode={darkMode}>
                  <ColumnIntelligence
                    columns={table.columns}
                    rows={table.rows}
                    darkMode={darkMode}
                  />
                </Panel>

                <Panel title="Advanced AI Insights" colors={colors} darkMode={darkMode}>
                  <AdvancedAIInsights
                    columns={table.columns}
                    rows={table.rows}
                    darkMode={darkMode}
                  />
                </Panel>
              </div>

              <Panel
                title="Smart Insight"
                subtitle="Automatic interpretation of the current result"
                colors={colors}
                darkMode={darkMode}
              >
                <SmartInsight
                  columns={table.columns}
                  rows={table.rows}
                  darkMode={darkMode}
                />
              </Panel>
            </>
          ) : (
            <Panel title="AI + Intelligence" colors={colors} darkMode={darkMode}>
              <div style={{ padding: 30, textAlign: 'center', color: colors.mutedText, fontSize: 11 }}>
                Run a query first. Harbor Fusion will use its result as the intelligence surface.
              </div>
            </Panel>
          )}
        </>
      ) : null}

      {surface === 'dashboard' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.25fr) minmax(0,1fr)', gap: 10 }}>
          <Panel
            title="Dashboard"
            subtitle={`${dashboardPins.length} pinned analysis${dashboardPins.length === 1 ? '' : 'es'}`}
            colors={colors}
            darkMode={darkMode}
          >
            <Dashboard
              pins={dashboardPins}
              darkMode={darkMode}
              onRemovePin={onRemoveDashboardPin}
              onClear={onClearDashboard}
              onChartStateChange={onDashboardChartStateChange}
            />
          </Panel>

          <Panel
            title="Analysis History"
            subtitle="Open or duplicate previous work"
            colors={colors}
            darkMode={darkMode}
          >
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



