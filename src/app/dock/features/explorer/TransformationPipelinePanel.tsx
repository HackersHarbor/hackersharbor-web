



"use client";







import { useCallback, useEffect, useState } from "react";



import {



  ArrowDownLeft,



  ArrowDownRight,



  CheckCircle2,



  Clock3,



  RotateCcw,



  RotateCw,



  Trash2,



  Workflow,



} from "lucide-react";







import type { CSSProperties } from "react";



import type { DockDataset } from "../../types/dataset";



import {



  missingValueService,



  type TransformationHistoryEntry,



} from "../../services/datasets/MissingValueService";
import { datasetRegistry } from "../../services/datasets/DatasetRegistry";







type TransformationPipelinePanelProps = {



  dataset: DockDataset | null;



  onDatasetChanged: () => void;



};







const styles: Record<string, CSSProperties> = {



  panel: {



    minWidth: 0,



    overflow: "hidden",



    padding: "0 12px 12px",



    color: "var(--foreground, #e5e7eb)",



    background: "var(--panel, #202020)",



    border: "1px solid var(--border, #383838)",



    borderRadius: 10,



  },



  header: {



    display: "flex",



    alignItems: "center",



    justifyContent: "space-between",



    gap: 12,



    padding: "15px 3px",



    borderBottom: "1px solid var(--border, #383838)",



  },



  title: {



    margin: 0,



    fontSize: 13,



    fontWeight: 650,



    letterSpacing: "-0.02em",



  },



  muted: {



    margin: "5px 0 0",



    color: "#FFFFFF",



    fontSize: 11,



    lineHeight: 1.6,



  },



  headerIcon: {



    flexShrink: 0,



    color: "#FFFFFF",



  },



  toolbar: {



    display: "flex",



    flexWrap: "wrap",



    gap: 8,



    padding: "13px 0",



  },



  button: {



    display: "inline-flex",



    minHeight: 32,



    alignItems: "center",



    justifyContent: "center",



    gap: 7,



    padding: "7px 10px",



    color: "var(--foreground, #e5e7eb)",



    background: "rgba(255,255,255,0.025)",



    border: "1px solid var(--border, #414141)",



    borderRadius: 7,



    fontSize: 11,



    fontWeight: 550,



    cursor: "pointer",



  },



  restoreButton: {



    marginLeft: "auto",



  },



  error: {



    margin: "0 0 12px",



    padding: "10px 12px",



    color: "#FFFFFF",



    background: "rgba(255,255,255,0.018)",



    border: "1px solid var(--border, #414141)",



    borderRadius: 8,



    fontSize: 11,



    lineHeight: 1.6,



  },



  confirm: {



    display: "grid",



    gap: 10,



    marginBottom: 12,



    padding: 13,



    border: "1px solid var(--border, #414141)",



    borderRadius: 9,



    background: "rgba(255,255,255,0.018)",



  },



  confirmTitle: {



    margin: 0,



    fontSize: 12,



    fontWeight: 650,



  },



  confirmText: {



    margin: 0,



    color: "#FFFFFF",



    fontSize: 11,



    lineHeight: 1.65,



  },



  empty: {



    display: "grid",



    justifyItems: "center",



    gap: 8,



    padding: "24px 14px",



    textAlign: "center",



    border: "1px dashed var(--border, #414141)",



    borderRadius: 9,



    background: "rgba(255,255,255,0.015)",



  },



  emptyIcon: {



    display: "grid",



    width: 38,



    height: 38,



    placeItems: "center",



    color: "#FFFFFF",



    border: "1px solid var(--border, #393939)",



    borderRadius: 10,



    background: "rgba(255,255,255,0.025)",



  },



  emptyTitle: {



    margin: 0,



    fontSize: 12,



    fontWeight: 600,



  },



  emptyText: {



    margin: 0,



    color: "#FFFFFF",



    fontSize: 11,



    lineHeight: 1.6,



  },



  list: {



    display: "grid",



    gap: 10,



    margin: 0,



    padding: "2px 0",



    listStyle: "none",



  },



  item: {



    minWidth: 0,



    padding: 12,



    border: "1px solid var(--border, #393939)",



    borderRadius: 9,



    background: "rgba(255,255,255,0.018)",



  },



  itemHeader: {



    display: "flex",



    alignItems: "flex-start",



    gap: 10,



  },



  operationIcon: {



    display: "grid",



    width: 31,



    height: 31,



    flex: "0 0 31px",



    placeItems: "center",



    color: "#FFFFFF",



    border: "1px solid var(--border, #414141)",



    borderRadius: 8,



    background: "rgba(255,255,255,0.018)",



  },



  itemContent: {



    flex: 1,



    minWidth: 0,



  },



  itemTitle: {



    margin: 0,



    fontSize: 12,



    fontWeight: 650,



    lineHeight: 1.55,



    overflowWrap: "anywhere",



  },



  stepNumber: {



    display: "inline-flex",



    minWidth: 21,



    height: 20,



    alignItems: "center",



    justifyContent: "center",



    marginRight: 6,



    padding: "0 5px",



    color: "#FFFFFF",



    fontSize: 10,



    fontVariantNumeric: "tabular-nums",



    border: "1px solid var(--border, #414141)",



    borderRadius: 5,



  },



  itemDetail: {



    margin: "7px 0 0",



    color: "#FFFFFF",



    fontSize: 11,



    lineHeight: 1.65,



    overflowWrap: "anywhere",



  },



  itemMeta: {



    display: "flex",



    alignItems: "center",



    flexWrap: "wrap",



    gap: 6,



    marginTop: 10,



    color: "#FFFFFF",



    fontSize: 10,



    lineHeight: 1.6,



  },



  status: {



    display: "inline-flex",



    alignItems: "center",



    gap: 5,



    padding: "3px 7px",



    color: "#FFFFFF",



    fontSize: 10,



    fontWeight: 550,



    border: "1px solid var(--border, #414141)",



    borderRadius: 999,



    background: "rgba(255,255,255,0.018)",



  },



  footer: {



    marginTop: 13,



    paddingTop: 11,



    borderTop: "1px solid var(--border, #383838)",



    color: "#FFFFFF",



    fontSize: 10,



    lineHeight: 1.7,



  },



};







function operationLabel(



  operation: TransformationHistoryEntry["operation"],



): string {



  switch (operation) {



    case "replace-missing-values":



      return "Replace missing values";



    case "remove-duplicate-rows":



      return "Remove duplicate rows";



    default:



      return "Data transformation";



  }



}







function formatValue(value: unknown): string {



  if (value === null || value === undefined) return "NULL";



  if (typeof value === "string") return value || '""';



  return String(value);



}







export default function TransformationPipelinePanel({



  dataset,



  onDatasetChanged,



}: TransformationPipelinePanelProps) {



  const [, setRefreshVersion] = useState(0);



  const [error, setError] = useState<string | null>(null);



  const [confirmRestore, setConfirmRestore] = useState(false);



  const [busy, setBusy] = useState(false);







  const refresh = useCallback(() => {



    setRefreshVersion((version) => version + 1);



  }, []);

  // Keep the pipeline in sync with changes made by other dataset panels.
  useEffect(() => {
    return datasetRegistry.subscribe(refresh);
  }, [refresh]);







  const history = dataset



    ? missingValueService.getHistory(dataset.id)



    : [];







  const canUndo = dataset



    ? missingValueService.canUndo(dataset.id)



    : false;







  const canRedo = dataset



    ? missingValueService.canRedo(dataset.id)



    : false;







  function runHistoryAction(action: "undo" | "redo") {



    if (!dataset || busy) return;







    setBusy(true);



    setError(null);







    try {



      if (action === "undo") {



        missingValueService.undoLast(dataset.id);



      } else {



        missingValueService.redoLast(dataset.id);



      }







      refresh();



      onDatasetChanged();



    } catch (caught) {



      setError(



        caught instanceof Error



          ? caught.message



          : "The transformation could not be updated.",



      );



    } finally {



      setBusy(false);



    }



  }







  function restoreOriginal() {



    if (!dataset || busy) return;







    setBusy(true);



    setError(null);







    try {



      missingValueService.restoreOriginal(dataset.id);



      setConfirmRestore(false);



      refresh();



      onDatasetChanged();



    } catch (caught) {



      setError(



        caught instanceof Error



          ? caught.message



          : "The original dataset could not be restored.",



      );



    } finally {



      setBusy(false);



    }



  }







  const buttonStyle = (disabled: boolean): CSSProperties => ({



    ...styles.button,



    opacity: disabled ? 0.4 : 1,



    cursor: disabled ? "not-allowed" : "pointer",



  });







  if (!dataset) {



    return (



      <section style={styles.panel}>



        <div style={styles.header}>



          <div>



            <h3 style={styles.title}>Transformation pipeline</h3>



            <p style={styles.muted}>



              Select a dataset to inspect its cleaning history.



            </p>



          </div>



          <Workflow size={17} style={styles.headerIcon} aria-hidden="true" />



        </div>



      </section>



    );



  }







  return (



    <section style={styles.panel} aria-labelledby="dock-pipeline-title">



      <div style={styles.header}>



        <div>



          <h3 id="dock-pipeline-title" style={styles.title}>



            Transformation pipeline



          </h3>



          <p style={styles.muted}>



            {history.length} recorded{" "}



            {history.length === 1 ? "operation" : "operations"}



          </p>



        </div>



        <Workflow size={17} style={styles.headerIcon} aria-hidden="true" />



      </div>







      <div style={styles.toolbar}>



        <button



          type="button"



          style={buttonStyle(!canUndo || busy)}



          disabled={!canUndo || busy}



          onClick={() => runHistoryAction("undo")}



          title="Undo the most recent transformation"



        >



          <RotateCcw size={14} aria-hidden="true" />



          Undo



        </button>







        <button



          type="button"



          style={buttonStyle(!canRedo || busy)}



          disabled={!canRedo || busy}



          onClick={() => runHistoryAction("redo")}



          title="Redo the most recently undone transformation"



        >



          <RotateCw size={14} aria-hidden="true" />



          Redo



        </button>







        <button



          type="button"



          style={{



            ...buttonStyle(busy || history.length === 0),



            ...styles.restoreButton,



          }}



          disabled={busy || history.length === 0}



          onClick={() => setConfirmRestore(true)}



          title="Restore the original imported rows"



        >



          <RotateCcw size={14} aria-hidden="true" />



          Restore original



        </button>



      </div>







      {error && (



        <p role="alert" style={styles.error}>



          {error}



        </p>



      )}







      {confirmRestore && (



        <div style={styles.confirm}>



          <strong style={styles.confirmTitle}>



            Restore the imported dataset?



          </strong>



          <p style={styles.confirmText}>



            This replaces the current rows with the original imported rows



            and clears the transformation history for this dataset.



          </p>



          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>



            <button



              type="button"



              style={buttonStyle(busy)}



              disabled={busy}



              onClick={restoreOriginal}



            >



              Confirm restore



            </button>



            <button



              type="button"



              style={buttonStyle(busy)}



              disabled={busy}



              onClick={() => setConfirmRestore(false)}



            >



              Cancel



            </button>



          </div>



        </div>



      )}







      {history.length === 0 ? (



        <div style={styles.empty}>



          <span style={styles.emptyIcon}>



            <CheckCircle2 size={19} aria-hidden="true" />



          </span>



          <strong style={styles.emptyTitle}>No transformations yet</strong>



          <p style={styles.emptyText}>



            Applied cleaning operations will appear here.



          </p>



        </div>



      ) : (



        <ol style={styles.list}>



          {history.map((entry, index) => (



            <li key={entry.id} style={styles.item}>



              <div style={styles.itemHeader}>



                <div style={styles.operationIcon}>



                  {entry.operation === "replace-missing-values" ? (



                    <ArrowDownRight size={15} aria-hidden="true" />



                  ) : (



                    <Trash2 size={15} aria-hidden="true" />



                  )}



                </div>







                <div style={styles.itemContent}>



                  <h4 style={styles.itemTitle}>



                    <span style={styles.stepNumber}>



                      {history.length - index}



                    </span>



                    {operationLabel(entry.operation)}



                  </h4>







                  <p style={styles.itemDetail}>



                    Column: <strong>{entry.column}</strong>



                  </p>







                  <p style={styles.itemDetail}>



                    {entry.operation === "replace-missing-values"



                      ? `Strategy: ${entry.strategy} · Value: ${formatValue(entry.replacementValue)}`



                      : `${entry.replacedCount.toLocaleString()} duplicate rows removed`}



                  </p>







                  <div style={styles.itemMeta}>



                    <Clock3 size={12} aria-hidden="true" />



                    <time dateTime={entry.timestamp}>



                      {new Date(entry.timestamp).toLocaleString()}



                    </time>







                    {entry.operation === "replace-missing-values" && (



                      <>



                        <ArrowDownLeft size={12} aria-hidden="true" />



                        {entry.replacedCount.toLocaleString()} values updated



                      </>



                    )}







                    <span style={styles.status}>



                      <CheckCircle2 size={11} aria-hidden="true" />



                      Recorded



                    </span>



                  </div>



                </div>



              </div>



            </li>



          ))}



        </ol>



      )}







      <p style={styles.footer}>



        Operations are listed newest first. Undo and Redo follow the recorded



        execution order. The history is stored in this browser.



      </p>



    </section>



  );



}
