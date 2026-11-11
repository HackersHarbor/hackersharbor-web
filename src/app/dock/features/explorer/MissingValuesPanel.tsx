

"use client";



import { useEffect, useMemo, useState } from "react";

import {

  AlertCircle,

  Check,

  Clock3,

  Redo2,

  RotateCcw,

  Undo2,

  WandSparkles,

} from "lucide-react";



import type { DockDataset } from "../../types/dataset";

import {

  missingValueService,

  type MissingValueOptions,

  type MissingValueStrategy,

  type TransformationHistoryEntry,

  type MissingRowsRemovalScope,

  type MissingRowsRemovalOptions,

} from "../../services/datasets/MissingValueService";
import { datasetRegistry } from "../../services/datasets/DatasetRegistry";



type MissingValuesPanelProps = {

  dataset: DockDataset | null;

  onDatasetChanged: () => void;

};



type OperationMode = "replace" | "remove-rows";



const STRATEGIES: {

  value: MissingValueStrategy;

  label: string;

  description: string;

}[] = [

  {

    value: "fixed",

    label: "Fixed value",

    description: "Replace missing cells with a value you choose.",

  },

  {

    value: "mean",

    label: "Mean",

    description: "Use the average of existing numeric values.",

  },

  {

    value: "median",

    label: "Median",

    description: "Use the middle existing numeric value.",

  },

  {

    value: "mode",

    label: "Most frequent",

    description: "Use the most frequently occurring value.",

  },

];



function formatValue(value: unknown): string {

  if (value === null) return "null";

  if (value === undefined) return "undefined";



  if (typeof value === "string") {

    return `"${value}"`;

  }



  if (typeof value === "number") {

    return Number.isFinite(value) ? String(value) : "—";

  }



  if (typeof value === "boolean") {

    return String(value);

  }



  try {

    return JSON.stringify(value) ?? String(value);

  } catch {

    return String(value);

  }

}



function formatTimestamp(timestamp: string): string {

  const date = new Date(timestamp);



  return Number.isNaN(date.getTime())

    ? timestamp

    : date.toLocaleString();

}



function getStrategyLabel(strategy: MissingValueStrategy): string {

  return (

    STRATEGIES.find((item) => item.value === strategy)?.label ??

    strategy

  );

}



function getErrorMessage(

  error: unknown,

  fallback: string,

): string {

  return error instanceof Error ? error.message : fallback;

}



export default function MissingValuesPanel({

  dataset,

  onDatasetChanged,

}: MissingValuesPanelProps) {

  const [mode, setMode] = useState<OperationMode>("replace");

  const [columnName, setColumnName] = useState("");

  const [strategy, setStrategy] =

    useState<MissingValueStrategy>("fixed");

  const [fixedValue, setFixedValue] = useState("");



  const [removalScope, setRemovalScope] =

    useState<MissingRowsRemovalScope>("selected-column");



  const [preview, setPreview] =

    useState<ReturnType<typeof missingValueService.preview> | null>(

      null,

    );



  const [removalPreview, setRemovalPreview] =

    useState<

      ReturnType<typeof missingValueService.previewMissingRows> | null

    >(null);



  const [error, setError] = useState<string | null>(null);

  const [notice, setNotice] = useState<string | null>(null);

  const [isApplying, setIsApplying] = useState(false);

  const [isUndoing, setIsUndoing] = useState(false);



  const [history, setHistory] = useState<

    TransformationHistoryEntry[]

  >([]);

  const [canRedo, setCanRedo] = useState(false);
  const [registryVersion, setRegistryVersion] = useState(0);



  const columns = dataset?.columns ?? [];



  const sortedColumns = useMemo(

    () =>

      [...columns].sort(

        (a, b) =>

          (b.missingCount ?? 0) - (a.missingCount ?? 0) ||

          a.name.localeCompare(b.name),

      ),

    [columns],

  );



  const selectedColumn = useMemo(

    () => columns.find((column) => column.name === columnName),

    [columns, columnName],

  );



  const missingCount = selectedColumn?.missingCount ?? 0;



  const canUseNumericStrategy =

    selectedColumn?.type === "integer" ||

    selectedColumn?.type === "float";



  const options: MissingValueOptions | null =

    dataset && columnName

      ? {

          column: columnName,

          strategy,

          ...(strategy === "fixed" ? { fixedValue } : {}),

        }

      : null;



  const removalOptions: MissingRowsRemovalOptions | null =

    dataset

      ? {

          scope: removalScope,

          column:

            removalScope === "selected-column"

              ? columnName || null

              : null,

        }

      : null;



  const busy = isApplying || isUndoing;



  function clearFeedback() {

    setError(null);

    setNotice(null);

  }



  function clearPreviews() {

    setPreview(null);

    setRemovalPreview(null);

  }



  function refreshHistory(datasetId: string) {

    setHistory(missingValueService.getHistory(datasetId));

    setCanRedo(missingValueService.canRedo(datasetId));

  }


  useEffect(() => {

    return datasetRegistry.subscribe(() => {

      setRegistryVersion((version) => version + 1);

      clearPreviews();

    });

  }, []);



  useEffect(() => {

    if (!dataset) {

      setHistory([]);

      setCanRedo(false);

      clearPreviews();

      return;

    }



    refreshHistory(dataset.id);

    // History belongs to the selected dataset.

    // eslint-disable-next-line react-hooks/exhaustive-deps

  }, [dataset?.id, registryVersion]);



  useEffect(() => {

    if (sortedColumns.length === 0) {

      setColumnName("");

      clearPreviews();

      clearFeedback();

      return;

    }



    const exists = sortedColumns.some(

      (column) => column.name === columnName,

    );



    if (!exists) {

      const columnWithMissing = sortedColumns.find(

        (column) => (column.missingCount ?? 0) > 0,

      );



      setColumnName(

        columnWithMissing?.name ?? sortedColumns[0].name,

      );



      clearPreviews();

      clearFeedback();

    }

    // eslint-disable-next-line react-hooks/exhaustive-deps

  }, [dataset?.id, sortedColumns, columnName]);



  function handleColumnChange(value: string) {

    setColumnName(value);

    clearPreviews();

    clearFeedback();

  }



  function handleStrategyChange(value: MissingValueStrategy) {

    setStrategy(value);

    clearPreviews();

    clearFeedback();

  }



  function handleFixedValueChange(value: string) {

    setFixedValue(value);

    clearPreviews();

    clearFeedback();

  }



  function handleModeChange(value: OperationMode) {

    setMode(value);

    clearPreviews();

    clearFeedback();

  }



  function handleScopeChange(value: MissingRowsRemovalScope) {

    setRemovalScope(value);

    clearPreviews();

    clearFeedback();

  }



  function handlePreviewReplacement() {

    if (!dataset || !options) {

      setError("Select a dataset and column first.");

      return;

    }



    try {

      const result = missingValueService.preview(

        dataset.id,

        options,

      );



      setPreview(result);

      setRemovalPreview(null);

      setError(null);



      setNotice(

        result.missingCount === 0

          ? "This column has no missing values."

          : "Preview ready. The dataset has not been changed.",

      );

    } catch (cause) {

      setPreview(null);

      setError(

        getErrorMessage(

          cause,

          "Could not preview the replacement.",

        ),

      );

    }

  }



  function handleApplyReplacement() {

    if (!dataset || !options || !preview) {

      setError("Preview the replacement before applying it.");

      return;

    }



    if (

      preview.datasetId !== dataset.id ||

      preview.column !== options.column ||

      preview.strategy !== options.strategy

    ) {

      setPreview(null);

      setError("Your preview is out of date. Preview again.");

      return;

    }



    if (preview.missingCount === 0) {

      setError("There are no missing values to replace.");

      return;

    }



    if (

      !window.confirm(

        `Replace ${preview.missingCount} missing value(s) in "${columnName}"?`,

      )

    ) {

      return;

    }



    setIsApplying(true);

    clearFeedback();



    try {

      const result = missingValueService.apply(

        dataset.id,

        options,

      );



      clearPreviews();



      setNotice(

        `Replaced ${result.replacedCount} missing value(s) with ${formatValue(result.replacementValue)}.`,

      );



      refreshHistory(dataset.id);

      onDatasetChanged();

    } catch (cause) {

      setError(

        getErrorMessage(

          cause,

          "Could not apply the replacement.",

        ),

      );

    } finally {

      setIsApplying(false);

    }

  }



  function handlePreviewRemoval() {

    if (!dataset || !removalOptions) {

      setError("Select a dataset first.");

      return;

    }



    if (

      removalScope === "selected-column" &&

      !columnName

    ) {

      setError("Select a column before previewing row removal.");

      return;

    }



    try {

      const result = missingValueService.previewMissingRows(

        dataset.id,

        removalOptions,

      );



      setRemovalPreview(result);

      setPreview(null);

      setError(null);



      setNotice(

        result.affectedCount === 0

          ? "No rows match this missing-value rule."

          : "Removal preview ready. The dataset has not been changed.",

      );

    } catch (cause) {

      setRemovalPreview(null);

      setError(

        getErrorMessage(

          cause,

          "Could not preview row removal.",

        ),

      );

    }

  }



  function handleRemoveRows() {

    if (!dataset || !removalOptions || !removalPreview) {

      setError("Preview row removal before applying it.");

      return;

    }



    if (

      removalPreview.datasetId !== dataset.id ||

      removalPreview.scope !== removalOptions.scope ||

      removalPreview.column !== removalOptions.column

    ) {

      setRemovalPreview(null);

      setError("Your preview is out of date. Preview again.");

      return;

    }



    if (removalPreview.affectedCount === 0) {

      setError("There are no matching rows to remove.");

      return;

    }



    const rule =

      removalScope === "selected-column"

        ? `the "${columnName}" column`

        : "any column";



    const confirmed = window.confirm(

      `Permanently remove ${removalPreview.affectedCount} row(s) with missing values in ${rule}? You can use Undo to reverse this transformation.`,

    );



    if (!confirmed) return;



    setIsApplying(true);

    clearFeedback();



    try {

      const result = missingValueService.removeMissingRows(

        dataset.id,

        removalOptions,

      );



      clearPreviews();



      setNotice(

        `Removed ${result.removedCount} row(s). ${result.remainingCount} row(s) remain.`,

      );



      refreshHistory(dataset.id);

      onDatasetChanged();

    } catch (cause) {

      setError(

        getErrorMessage(

          cause,

          "Could not remove rows with missing values.",

        ),

      );

    } finally {

      setIsApplying(false);

    }

  }



  function handleUndo() {

    if (!dataset || !missingValueService.canUndo(dataset.id)) {

      return;

    }



    const latest = missingValueService.getHistory(dataset.id)[0];



    if (!latest) return;



    if (

      !window.confirm(

        `Undo the last transformation on "${latest.column}"? This restores the state immediately before that operation.`,

      )

    ) {

      return;

    }



    setIsUndoing(true);

    clearFeedback();



    try {

      const undone = missingValueService.undoLast(dataset.id);



      clearPreviews();



      setNotice(

        undone.operation === "remove-missing-rows"

          ? `Restored rows removed by the previous transformation (${undone.column}).`

          : `Undid ${getStrategyLabel(undone.strategy).toLowerCase()} replacement in "${undone.column}".`,

      );



      refreshHistory(dataset.id);

      onDatasetChanged();

    } catch (cause) {

      setError(

        getErrorMessage(cause, "Could not undo the transformation."),

      );

    } finally {

      setIsUndoing(false);

    }

  }



  function handleRedo() {

    if (!dataset || !missingValueService.canRedo(dataset.id)) {

      return;

    }



    if (

      !window.confirm(

        "Redo the last undone transformation?",

      )

    ) {

      return;

    }



    setIsUndoing(true);

    clearFeedback();



    try {

      const redone = missingValueService.redoLast(dataset.id);



      clearPreviews();



      setNotice(

        redone.operation === "remove-missing-rows"

          ? `Repeated row removal for "${redone.column}".`

          : `Redid ${getStrategyLabel(redone.strategy).toLowerCase()} replacement in "${redone.column}".`,

      );



      refreshHistory(dataset.id);

      onDatasetChanged();

    } catch (cause) {

      setError(

        getErrorMessage(cause, "Could not redo the transformation."),

      );

    } finally {

      setIsUndoing(false);

    }

  }



  function handleRestore() {

    if (!dataset) return;



    if (

      !window.confirm(

        "Restore this dataset to its originally imported rows? All transformations applied since import will be undone.",

      )

    ) {

      return;

    }



    try {

      missingValueService.restoreOriginal(dataset.id);



      clearPreviews();

      setError(null);

      setNotice("Original imported rows restored.");



      refreshHistory(dataset.id);

      onDatasetChanged();

    } catch (cause) {

      setError(

        getErrorMessage(

          cause,

          "Could not restore the original dataset.",

        ),

      );

    }

  }



  if (!dataset) {

    return (

      <section className="dock-missing-panel">

        <div className="dock-missing-panel-heading">

          <WandSparkles size={16} aria-hidden="true" />

          <div>

            <h3>Missing values</h3>

            <p>Select a dataset to begin.</p>

          </div>

        </div>

      </section>

    );

  }



  return (

    <section className="dock-missing-panel">

      <div className="dock-missing-panel-heading">

        <WandSparkles size={16} aria-hidden="true" />

        <div>

          <h3>Missing values</h3>

          <p>Inspect, replace, or remove missing data safely.</p>

        </div>

      </div>



      <div className="dock-missing-field">

        <label htmlFor="dock-missing-operation">Operation</label>

        <select

          id="dock-missing-operation"

          value={mode}

          disabled={busy}

          onChange={(event) =>

            handleModeChange(event.target.value as OperationMode)

          }

        >

          <option value="replace">Replace missing values</option>

          <option value="remove-rows">Remove rows with missing values</option>

        </select>

      </div>



      <div className="dock-missing-field">

        <label htmlFor="dock-missing-column">Column</label>

        <select

          id="dock-missing-column"

          value={columnName}

          disabled={busy || sortedColumns.length === 0}

          onChange={(event) =>

            handleColumnChange(event.target.value)

          }

        >

          {sortedColumns.length === 0 ? (

            <option value="">No columns available</option>

          ) : (

            <>

              <option value="">Select a column</option>

              {sortedColumns.map((column) => (

                <option key={column.name} value={column.name}>

                  {column.name} · {(column.missingCount ?? 0).toLocaleString()} missing

                </option>

              ))}

            </>

          )}

        </select>

      </div>



      {selectedColumn && (

        <div className="dock-missing-stat">

          <div>

            <span>Missing values</span>

            <strong>{missingCount.toLocaleString()}</strong>

          </div>

          <div>

            <span>Column type</span>

            <strong>{selectedColumn.type}</strong>

          </div>

        </div>

      )}



      {mode === "replace" ? (

        <>

          <div className="dock-missing-field">

            <label htmlFor="dock-missing-strategy">

              Replacement strategy

            </label>

            <select

              id="dock-missing-strategy"

              value={strategy}

              disabled={busy}

              onChange={(event) =>

                handleStrategyChange(

                  event.target.value as MissingValueStrategy,

                )

              }

            >

              {STRATEGIES.map((item) => (

                <option

                  key={item.value}

                  value={item.value}

                  disabled={

                    (item.value === "mean" ||

                      item.value === "median") &&

                    !canUseNumericStrategy

                  }

                >

                  {item.label}

                </option>

              ))}

            </select>

            <p className="dock-missing-help">

              {STRATEGIES.find((item) => item.value === strategy)?.description}

            </p>

          </div>



          {strategy === "fixed" && (

            <div className="dock-missing-field">

              <label htmlFor="dock-missing-fixed">

                Replacement value

              </label>



              {selectedColumn?.type === "boolean" ? (

                <select

                  id="dock-missing-fixed"

                  value={fixedValue}

                  disabled={busy}

                  onChange={(event) =>

                    handleFixedValueChange(event.target.value)

                  }

                >

                  <option value="">Select true or false</option>

                  <option value="true">true</option>

                  <option value="false">false</option>

                </select>

              ) : (

                <input

                  id="dock-missing-fixed"

                  type={

                    selectedColumn?.type === "integer" ||

                    selectedColumn?.type === "float"

                      ? "number"

                      : selectedColumn?.type === "date"

                        ? "date"

                        : selectedColumn?.type === "datetime"

                          ? "datetime-local"

                          : "text"

                  }

                  step={

                    selectedColumn?.type === "integer"

                      ? "1"

                      : selectedColumn?.type === "float"

                        ? "any"

                        : undefined

                  }

                  value={fixedValue}

                  disabled={busy}

                  onChange={(event) =>

                    handleFixedValueChange(event.target.value)

                  }

                  placeholder="Enter a replacement value"

                />

              )}



              <p className="dock-missing-help">

                The selected value will be used for every missing cell in the chosen column.

              </p>

            </div>

          )}



          <div className="dock-missing-actions">

            <button

              type="button"

              className="dock-action-secondary"

              onClick={handlePreviewReplacement}

              disabled={!columnName || busy}

            >

              Preview changes

            </button>



            <button

              type="button"

              className="dock-action-primary"

              onClick={handleApplyReplacement}

              disabled={!preview || preview.missingCount === 0 || busy}

            >

              <Check size={14} aria-hidden="true" />

              {isApplying ? "Applying…" : "Apply replacement"}

            </button>

          </div>



          {preview && (

            <div className="dock-missing-preview">

              <div className="dock-missing-preview-heading">

                <strong>Replacement preview</strong>

                <span>{preview.missingCount.toLocaleString()} missing</span>

              </div>



              <p>

                Proposed replacement:{" "}

                <code>{formatValue(preview.replacementValue)}</code>

              </p>



              {preview.previewRows.length > 0 ? (

                <div className="dock-missing-preview-list">

                  {preview.previewRows.slice(0, 5).map((row, index) => (

                    <div key={index}>

                      <span>Preview row {index + 1}</span>

                      <code>{formatValue(row[preview.column])}</code>

                    </div>

                  ))}

                </div>

              ) : (

                <p>No missing cells need replacement.</p>

              )}

            </div>

          )}

        </>

      ) : (

        <>

          <div className="dock-missing-field">

            <label htmlFor="dock-missing-scope">Removal rule</label>

            <select

              id="dock-missing-scope"

              value={removalScope}

              disabled={busy}

              onChange={(event) =>

                handleScopeChange(

                  event.target.value as MissingRowsRemovalScope,

                )

              }

            >

              <option value="selected-column">

                Remove rows missing this column

              </option>

              <option value="any-column">

                Remove rows missing any column

              </option>

            </select>



            <p className="dock-missing-help">

              {removalScope === "selected-column"

                ? "Only rows where the selected column is missing will be removed."

                : "A row will be removed if at least one column contains a missing value."}

            </p>

          </div>



          <div className="dock-missing-actions">

            <button

              type="button"

              className="dock-action-secondary"

              onClick={handlePreviewRemoval}

              disabled={

                busy ||

                (removalScope === "selected-column" && !columnName)

              }

            >

              Preview row removal

            </button>



            <button

              type="button"

              className="dock-action-primary"

              onClick={handleRemoveRows}

              disabled={

                busy ||

                !removalPreview ||

                removalPreview.affectedCount === 0

              }

            >

              <Check size={14} aria-hidden="true" />

              {isApplying ? "Removing…" : "Remove rows"}

            </button>

          </div>



          {removalPreview && (

            <div className="dock-missing-preview">

              <div className="dock-missing-preview-heading">

                <strong>Row removal preview</strong>

                <span>

                  {removalPreview.affectedCount.toLocaleString()} affected

                </span>

              </div>



              <p>

                Total rows:{" "}

                <strong>{removalPreview.totalRows.toLocaleString()}</strong>

              </p>

              <p>

                Rows remaining after removal:{" "}

                <strong>

                  {(

                    removalPreview.totalRows -

                    removalPreview.affectedCount

                  ).toLocaleString()}

                </strong>

              </p>



              {removalPreview.previewRows.length > 0 && (

                <div className="dock-missing-preview-list">

                  {removalPreview.previewRows.slice(0, 5).map((row, index) => (

                    <div key={index}>

                      <span>Matching row {index + 1}</span>

                      <code>

                        {Object.entries(row)

                          .filter(([, value]) =>

                            value === null ||

                            value === undefined ||

                            (typeof value === "string" &&

                              value.trim() === ""),

                          )

                          .map(([name]) => name)

                          .join(", ") || "Contains a missing value"}

                      </code>

                    </div>

                  ))}

                </div>

              )}



              <p className="dock-missing-help">

                Preview only: no rows have been removed yet. Confirm the action to apply it.

              </p>

            </div>

          )}

        </>

      )}



      {error && (

        <p className="dock-missing-message is-error" role="alert">

          <AlertCircle size={14} aria-hidden="true" />

          {error}

        </p>

      )}



      {notice && !error && (

        <p className="dock-missing-message is-success" role="status">

          {notice}

        </p>

      )}



      <div className="dock-missing-history">

        <div className="dock-missing-history-heading">

          <div>

            <Clock3 size={14} aria-hidden="true" />

            <strong>Transformation history</strong>

          </div>

          <span>{history.length}</span>

        </div>



        {history.length === 0 ? (

          <p className="dock-missing-history-empty">

            No transformations yet. Applied changes will appear here.

          </p>

        ) : (

          <div className="dock-missing-history-list">

            {history.map((entry) => (

              <article

                className="dock-missing-history-item"

                key={entry.id}

              >

                <div className="dock-missing-history-item-top">

                  <strong>{entry.column}</strong>

                  <span>

                    {entry.replacedCount.toLocaleString()}{" "}

                    {entry.operation === "remove-missing-rows"

                      ? "rows removed"

                      : "values changed"}

                  </span>

                </div>



                <p>

                  {entry.operation === "remove-missing-rows"

                    ? "Remove rows with missing values"

                    : `${getStrategyLabel(entry.strategy)} replacement`}

                  {entry.operation !== "remove-missing-rows" && (

                    <>

                      {" · value "}

                      <code>{formatValue(entry.replacementValue)}</code>

                    </>

                  )}

                </p>



                <time dateTime={entry.timestamp}>

                  {formatTimestamp(entry.timestamp)}

                </time>

              </article>

            ))}

          </div>

        )}



        <div className="dock-missing-history-actions">

          <button

            type="button"

            className="dock-missing-undo"

            onClick={handleUndo}

            disabled={busy || !missingValueService.canUndo(dataset.id)}

          >

            <Undo2 size={14} aria-hidden="true" />

            Undo last transformation

          </button>



          <button

            type="button"

            className="dock-missing-redo"

            onClick={handleRedo}

            disabled={busy || !canRedo}

          >

            <Redo2 size={14} aria-hidden="true" />

            Redo last transformation

          </button>

        </div>

      </div>



      <button

        type="button"

        className="dock-missing-restore"

        onClick={handleRestore}

        disabled={busy}

      >

        <RotateCcw size={14} aria-hidden="true" />

        Restore original dataset

      </button>

    </section>

  );

}