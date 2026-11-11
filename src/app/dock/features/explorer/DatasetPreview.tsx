"use client";



import { useEffect, useMemo, useState } from "react";



import {



  ChevronDown,



  ChevronLeft,



  ChevronRight,



  ChevronUp,



  ChevronsUpDown,



  Download,



  Filter,



  Plus,



  Search,



  Trash2,



  X,



} from "lucide-react";



import type {



  DataColumnType,



  DatasetPreview as DatasetPreviewData,



} from "../../types/dataset";



type DatasetPreviewProps = {



  preview: DatasetPreviewData | null;



  rows: Record<string, unknown>[];



  isLoading: boolean;



};



type SortDirection = "asc" | "desc";



type LogicOperator = "AND" | "OR";



type FilterOperator =



  | "contains"



  | "equals"



  | "starts-with"



  | "ends-with"



  | "greater-than"



  | "less-than"



  | "range"



  | "is-missing"



  | "is-not-missing";



type FilterCondition = {



  id: string;



  column: string;



  operator: FilterOperator;



  value: string;



  secondValue: string;



};



const PAGE_SIZE = 25;



const TEXT_OPERATORS: FilterOperator[] = [



  "contains",



  "equals",



  "starts-with",



  "ends-with",



  "is-missing",



  "is-not-missing",



];



const NUMBER_OPERATORS: FilterOperator[] = [



  "equals",



  "greater-than",



  "less-than",



  "range",



  "is-missing",



  "is-not-missing",



];



const GENERAL_OPERATORS: FilterOperator[] = [



  "contains",



  "equals",



  "is-missing",



  "is-not-missing",



];



function createCondition(column = ""): FilterCondition {



  return {



    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,



    column,



    operator: "contains",



    value: "",



    secondValue: "",



  };



}



function isMissing(value: unknown): boolean {



  return (



    value === null ||



    value === undefined ||



    (typeof value === "string" && value.trim() === "")



  );



}



const PLACEHOLDER_VALUES = new Set([

  "n/a", "na", "n.a.", "null", "none", "nil", "unknown",

  "undefined", "not available", "not applicable", "-", "--", "?",

]);



function getCellIssue(value: unknown, type: DataColumnType): {

  kind: "missing" | "placeholder" | "whitespace" | "type-mismatch";

  label: string;

} | null {

  if (isMissing(value)) return { kind: "missing", label: "Missing value" };

  if (typeof value !== "string") return null;



  const trimmed = value.trim();

  if (trimmed !== value) {

    return { kind: "whitespace", label: "Leading or trailing whitespace" };

  }

  if (PLACEHOLDER_VALUES.has(trimmed.toLocaleLowerCase())) {

    return { kind: "placeholder", label: "Placeholder value" };

  }

  if ((type === "integer" || type === "float") && trimmed !== "") {

    const parsed = Number(trimmed);

    if (!Number.isFinite(parsed) || (type === "integer" && !Number.isInteger(parsed))) {

      return { kind: "type-mismatch", label: `Value does not match ${type} column type` };

    }

  }

  if ((type === "boolean") && !["true", "false", "0", "1"].includes(trimmed.toLocaleLowerCase())) {

    return { kind: "type-mismatch", label: "Value does not match boolean column type" };

  }

  return null;

}



function compareValues(left: unknown, right: unknown): number {



  if (left === null || left === undefined) {



    return right === null || right === undefined ? 0 : 1;



  }



  if (right === null || right === undefined) return -1;



  if (typeof left === "number" && typeof right === "number") {



    return left - right;



  }



  if (typeof left === "boolean" && typeof right === "boolean") {



    return Number(left) - Number(right);



  }



  const leftText = String(left).trim();



  const rightText = String(right).trim();



  if (leftText !== "" && rightText !== "") {



    const leftNumber = Number(leftText);



    const rightNumber = Number(rightText);



    if (



      Number.isFinite(leftNumber) &&



      Number.isFinite(rightNumber) &&



      !/^0\d/.test(leftText) &&



      !/^0\d/.test(rightText)



    ) {



      return leftNumber - rightNumber;



    }



  }



  return leftText.localeCompare(rightText, undefined, {



    numeric: true,



    sensitivity: "base",



  });



}



function getOperators(type: DataColumnType): FilterOperator[] {



  if (type === "integer" || type === "float") {



    return NUMBER_OPERATORS;



  }



  if (type === "string" || type === "date" || type === "datetime") {



    return TEXT_OPERATORS;



  }



  return GENERAL_OPERATORS;



}



function operatorLabel(operator: FilterOperator): string {



  switch (operator) {



    case "contains":



      return "Contains";



    case "equals":



      return "Equals";



    case "starts-with":



      return "Starts with";



    case "ends-with":



      return "Ends with";



    case "greater-than":



      return "Greater than";



    case "less-than":



      return "Less than";



    case "range":



      return "Between";



    case "is-missing":



      return "Is missing";



    case "is-not-missing":



      return "Is not missing";



  }



}



function matchesCondition(



  row: Record<string, unknown>,



  condition: FilterCondition,



  type: DataColumnType,



): boolean {



  if (!condition.column) return true;



  const actual = row[condition.column];



  const operator = condition.operator;



  if (operator === "is-missing") return isMissing(actual);



  if (operator === "is-not-missing") return !isMissing(actual);



  if (isMissing(actual)) return false;



  if (operator === "greater-than" || operator === "less-than" || operator === "range") {



    const actualNumber = Number(actual);



    const firstNumber = Number(condition.value);



    if (



      condition.value.trim() === "" ||



      !Number.isFinite(actualNumber) ||



      !Number.isFinite(firstNumber)



    ) {



      return false;



    }



    if (operator === "greater-than") return actualNumber > firstNumber;



    if (operator === "less-than") return actualNumber < firstNumber;



    const secondNumber = Number(condition.secondValue);



    return (



      condition.secondValue.trim() !== "" &&



      Number.isFinite(secondNumber) &&



      actualNumber >= Math.min(firstNumber, secondNumber) &&



      actualNumber <= Math.max(firstNumber, secondNumber)



    );



  }



  const actualText = String(actual).toLocaleLowerCase();



  const expectedText = condition.value.toLocaleLowerCase();



  if (operator === "equals") {



    if (type === "integer" || type === "float") {



      return (



        condition.value.trim() !== "" &&



        Number.isFinite(Number(condition.value)) &&



        Number(actual) === Number(condition.value)



      );



    }



    if (type === "boolean") {



      return actualText === expectedText;



    }



    return actualText === expectedText;



  }



  if (condition.value === "") return false;



  switch (operator) {



    case "contains":



      return actualText.includes(expectedText);



    case "starts-with":



      return actualText.startsWith(expectedText);



    case "ends-with":



      return actualText.endsWith(expectedText);



    default:



      return true;



  }



}



export default function DatasetPreview({



  preview,



  rows,



  isLoading,



}: DatasetPreviewProps) {



  const [query, setQuery] = useState("");



  const [conditions, setConditions] = useState<FilterCondition[]>([]);



  const [logic, setLogic] = useState<LogicOperator>("AND");



  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);



  const [page, setPage] = useState(0);



  const [sortColumn, setSortColumn] = useState<string | null>(null);



  const [sortDirection, setSortDirection] =



    useState<SortDirection>("asc");

  // Reset view-only controls when the selected dataset changes.
  useEffect(() => {
    setQuery("");
    setConditions([]);
    setLogic("AND");
    setShowAdvancedFilters(false);
    setPage(0);
    setSortColumn(null);
    setSortDirection("asc");
  }, [preview?.datasetId]);



  const columns = Array.isArray(preview?.columns) ? preview.columns : [];



  const duplicateRowIndexes = useMemo(() => {



    const seen = new Set<string>();



    const duplicates = new Set<number>();



    const columnNames = columns.map((column) => column.name);



    (Array.isArray(rows) ? rows : []).forEach((row, index) => {



      const signature = JSON.stringify(columnNames.map((name) => row[name] ?? null));



      if (seen.has(signature)) duplicates.add(index);



      else seen.add(signature);



    });



    return duplicates;



  }, [rows, columns]);



  const numericColumnNames = useMemo(() => {



    const numeric = new Set<string>();



    for (const column of columns) {



      const declaredNumeric = /int|float|number|double|decimal|numeric|real|bigint/i.test(column.type);



      const values = (Array.isArray(rows) ? rows : []).map((row) => row[column.name]).filter((value) => value !== null && value !== undefined && value !== "");



      const valuesNumeric = values.length > 0 && values.every((value) => (typeof value === "number" && Number.isFinite(value)) || (typeof value === "string" && /^[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?$/i.test(value.trim())));



      if (declaredNumeric || valuesNumeric) numeric.add(column.name);



    }



    return numeric;



  }, [columns, rows]);



  const formatCellValue = (value: unknown, columnName: string) => {



    if (value === null || value === undefined || value === "") return "NULL";



    if (!numericColumnNames.has(columnName)) return String(value);



    const numeric = typeof value === "number" ? value : Number(String(value).trim());



    return Number.isFinite(numeric) ? new Intl.NumberFormat("en-US", { maximumFractionDigits: 12 }).format(numeric) : String(value);



  };



  const filteredRows = useMemo(() => {



    if (!preview) return [];



    const normalizedQuery = query.trim().toLocaleLowerCase();



    return (Array.isArray(rows) ? rows : []).filter((row) => {



      const matchesSearch =



        !normalizedQuery ||



        Object.values(row).some((value) =>



          String(value ?? "").toLocaleLowerCase().includes(normalizedQuery),



        );



      if (!matchesSearch) return false;



      const activeConditions = conditions.filter(



        (condition) => condition.column !== "",



      );



      if (activeConditions.length === 0) return true;



      const results = activeConditions.map((condition) => {



        const column = columns.find(



          (item) => item.name === condition.column,



        );



        return matchesCondition(



          row,



          condition,



          column?.type ?? "unknown",



        );



      });



      return logic === "AND"



        ? results.every(Boolean)



        : results.some(Boolean);



    });



  }, [preview, rows, query, conditions, logic, columns]);



  const sortedRows = useMemo(() => {



    if (!sortColumn) return filteredRows;



    return [...filteredRows].sort((left, right) => {



      const result = compareValues(left[sortColumn], right[sortColumn]);



      return sortDirection === "asc" ? result : -result;



    });



  }, [filteredRows, sortColumn, sortDirection]);



  const pageCount = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));



  const currentPage = Math.min(page, pageCount - 1);



  const visibleRows = sortedRows.slice(



    currentPage * PAGE_SIZE,



    (currentPage + 1) * PAGE_SIZE,



  );



  const activeFilterCount = conditions.filter(



    (condition) => condition.column !== "",



  ).length;



  function updateCondition(



    id: string,



    changes: Partial<FilterCondition>,



  ) {



    setConditions((current) =>



      current.map((condition) =>



        condition.id === id ? { ...condition, ...changes } : condition,



      ),



    );



    setPage(0);



  }



  function addCondition() {



    setConditions((current) => [



      ...current,



      createCondition(columns[0]?.name ?? ""),



    ]);



    setShowAdvancedFilters(true);



    setPage(0);



  }



  function removeCondition(id: string) {



    setConditions((current) =>



      current.filter((condition) => condition.id !== id),



    );



    setPage(0);



  }



  function clearFilters() {



    setQuery("");



    setConditions([]);



    setLogic("AND");



    setPage(0);



  }



  function handleSort(columnName: string) {



    if (sortColumn === columnName) {



      setSortDirection((direction) =>



        direction === "asc" ? "desc" : "asc",



      );



    } else {



      setSortColumn(columnName);



      setSortDirection("asc");



    }



    setPage(0);



  }



  if (isLoading) {



    return <div className="dock-table-empty">Loading dataset preview…</div>;



  }



  if (!preview) {



    return (



      <div className="dock-table-empty">



        Select a dataset to inspect its records.



      </div>



    );



  }



  const inputStyle: React.CSSProperties = {



    minWidth: 0,



    width: "100%",



    padding: "7px 9px",



    color: "inherit",



    background: "var(--panel, #252525)",



    border: "1px solid var(--border, #454545)",



    borderRadius: 5,



    fontSize: 12,



  };



  const selectStyle: React.CSSProperties = {



    ...inputStyle,



    cursor: "pointer",



  };



  return (



    <section className="dock-preview">



      <div className="dock-preview-toolbar">



        <div>



          <strong>Data preview</strong>



          <span>



            {(Array.isArray(rows) ? rows.length : 0).toLocaleString()} total rows · {(columns ?? []).length} columns



          </span>



        </div>



        <label className="dock-table-search">



          <Search size={14} aria-hidden="true" />



          <input



            value={query}



            onChange={(event) => {



              setQuery(event.target.value);



              setPage(0);



            }}



            placeholder="Search all rows"



            aria-label="Search all dataset rows"



          />



          {query && (



            <button



              type="button"



              className="dock-mini-icon"



              onClick={() => {



                setQuery("");



                setPage(0);



              }}



              aria-label="Clear search"



              title="Clear search"



            >



              <X size={13} />



            </button>



          )}



        </label>



      </div>



      <div



        style={{



          display: "flex",



          flexWrap: "wrap",



          alignItems: "center",



          gap: 8,



          padding: "10px 12px",



          borderBottom: "1px solid var(--border, #343434)",



        }}



      >



        <button



          type="button"



          className="dock-action-secondary"



          aria-expanded={showAdvancedFilters}



          onClick={() => setShowAdvancedFilters((value) => !value)}



        >



          <Filter size={14} aria-hidden="true" />



          Advanced filters



          {activeFilterCount > 0 && ` (${activeFilterCount})`}



          <ChevronDown size={13} aria-hidden="true" />



        </button>



        <button



          type="button"



          className="dock-action-secondary"



          onClick={addCondition}



          disabled={columns.length === 0}



        >



          <Plus size={14} aria-hidden="true" />



          Add condition



        </button>



        {(query || conditions.length > 0) && (



          <button



            type="button"



            className="dock-action-secondary"



            onClick={clearFilters}



          >



            <X size={13} aria-hidden="true" />



            Clear filters



          </button>



        )}



      </div>



      {showAdvancedFilters && (



        <div



          style={{



            padding: 12,



            display: "grid",



            gap: 12,



            borderBottom: "1px solid var(--border, #343434)",



            background: "var(--panel-soft, rgba(100,100,100,.04))",



          }}



        >



          <div



            style={{



              display: "flex",



              gap: 10,



              alignItems: "center",



              flexWrap: "wrap",



            }}



          >



            <strong style={{ fontSize: 12 }}>Match conditions</strong>



            <select



              aria-label="Combine filter conditions using"



              value={logic}



              onChange={(event) => {



                setLogic(event.target.value as LogicOperator);



                setPage(0);



              }}



              style={{ ...selectStyle, width: 110 }}



            >



              <option value="AND">ALL (AND)</option>



              <option value="OR">ANY (OR)</option>



            </select>



            <span style={{ fontSize: 11, opacity: 0.7 }}>



              {logic === "AND"



                ? "Every condition must match."



                : "At least one condition must match."}



            </span>



          </div>



          {conditions.length === 0 && (



            <p style={{ fontSize: 12, opacity: 0.7, margin: 0 }}>



              Add a condition to filter by a column. Filters never modify the



              underlying dataset.



            </p>



          )}



          {conditions.map((condition, index) => {



            const column = columns.find(



              (item) => item.name === condition.column,



            );



            const type = column?.type ?? "unknown";



            const operators = getOperators(type);



            return (



              <div



                key={condition.id}



                style={{



                  display: "grid",



                  gridTemplateColumns:



                    "minmax(110px, 1fr) minmax(120px, 1fr) minmax(120px, 1fr) auto",



                  gap: 8,



                  alignItems: "center",



                }}



              >



                <div style={{ display: "grid", gap: 4 }}>



                  {index > 0 && (



                    <span style={{ fontSize: 10, opacity: 0.65 }}>



                      {logic}



                    </span>



                  )}



                  <select



                    aria-label={`Condition ${index + 1} column`}



                    value={condition.column}



                    onChange={(event) => {



                      const nextColumn = columns.find(



                        (item) => item.name === event.target.value,



                      );



                      const nextType = nextColumn?.type ?? "unknown";



                      const nextOperators = getOperators(nextType);



                      updateCondition(condition.id, {



                        column: event.target.value,



                        operator: nextOperators.includes(condition.operator)



                          ? condition.operator



                          : nextOperators[0],



                        value: "",



                        secondValue: "",



                      });



                    }}



                    style={selectStyle}



                  >



                    <option value="">Choose column</option>



                    {columns.map((item) => (



                      <option key={item.name} value={item.name}>



                        {item.name}



                      </option>



                    ))}



                  </select>



                </div>



                <select



                  aria-label={`Condition ${index + 1} operator`}



                  value={condition.operator}



                  onChange={(event) =>



                    updateCondition(condition.id, {



                      operator: event.target.value as FilterOperator,



                      value: "",



                      secondValue: "",



                    })



                  }



                  style={selectStyle}



                >



                  {operators.map((operator) => (



                    <option key={operator} value={operator}>



                      {operatorLabel(operator)}



                    </option>



                  ))}



                </select>



                <div style={{ display: "grid", gap: 6 }}>



                  {condition.operator !== "is-missing" &&



                    condition.operator !== "is-not-missing" && (



                      <>



                        <input



                          aria-label={`Condition ${index + 1} value`}



                          type={



                            condition.operator === "greater-than" ||



                            condition.operator === "less-than" ||



                            condition.operator === "range"



                              ? "number"



                              : "text"



                          }



                          value={condition.value}



                          onChange={(event) =>



                            updateCondition(condition.id, {



                              value: event.target.value,



                            })



                          }



                          placeholder={



                            condition.operator === "range"



                              ? "Minimum"



                              : "Value"



                          }



                          style={inputStyle}



                        />



                        {condition.operator === "range" && (



                          <input



                            aria-label={`Condition ${index + 1} maximum value`}



                            type="number"



                            value={condition.secondValue}



                            onChange={(event) =>



                              updateCondition(condition.id, {



                                secondValue: event.target.value,



                              })



                            }



                            placeholder="Maximum"



                            style={inputStyle}



                          />



                        )}



                      </>



                    )}



                </div>



                <button



                  type="button"



                  className="dock-mini-icon"



                  onClick={() => removeCondition(condition.id)}



                  aria-label={`Remove condition ${index + 1}`}



                  title="Remove condition"



                >



                  <Trash2 size={14} />



                </button>



              </div>



            );



          })}



          <div style={{ fontSize: 11, opacity: 0.7 }}>



            Showing {filteredRows.length.toLocaleString()} matching rows out



            of {(Array.isArray(rows) ? rows.length : 0).toLocaleString()}.



          </div>



        </div>



      )}



      <div className="dock-preview-legend" aria-label="Data preview legend" style={{ display: "flex", alignItems: "center", gap: 12, padding: "7px 12px", borderBottom: "1px solid var(--border, #343434)", color: "var(--muted, #999)", fontSize: 11 }}>



        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><span aria-hidden="true" style={{ width: 9, height: 9, borderRadius: 2, background: "rgba(217, 150, 55, .24)", border: "1px solid rgba(217, 150, 55, .45)" }} />Duplicate row</span>



        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><span aria-hidden="true" style={{ width: 9, height: 9, borderRadius: 2, background: "rgba(217, 150, 55, .14)", border: "1px solid rgba(217, 150, 55, .3)" }} />NULL / missing</span>

        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><span aria-hidden="true" style={{ width: 9, height: 9, borderRadius: 2, background: "rgba(190, 78, 68, .12)", border: "1px solid rgba(190, 78, 68, .55)" }} />Type mismatch</span>

        <span style={{ fontSize: 10, opacity: .8 }}>Hover a highlighted cell for its issue</span>



      </div>



      <div className="dock-table-scroll">



        <table className="dock-data-table">



          <thead>



            <tr>



              <th className="dock-row-index" scope="col">



                #



              </th>



              {columns.map((column) => {



                const active = sortColumn === column.name;



                const SortIcon = !active



                  ? ChevronsUpDown



                  : sortDirection === "asc"



                    ? ChevronUp



                    : ChevronDown;



                return (



                  <th key={column.name} scope="col">



                    <button



                      type="button"



                      onClick={() => handleSort(column.name)}



                      aria-label={`Sort by ${column.name}`}



                      aria-pressed={active}



                      style={{



                        display: "inline-flex",



                        alignItems: "center",



                        gap: 5,



                        width: "100%",



                        padding: 0,



                        border: 0,



                        color: "inherit",



                        background: "transparent",



                        font: "inherit",



                        textAlign: "left",



                        cursor: "pointer",



                      }}



                    >



                      <span>{column.name}</span>



                      <SortIcon size={12} aria-hidden="true" />



                    </button>



                  </th>



                );



              })}



            </tr>



          </thead>



          <tbody>



            {visibleRows.map((row, index) => (



              <tr key={`${preview.datasetId}-${currentPage}-${index}`} style={duplicateRowIndexes.has(rows.indexOf(row)) ? { background: "rgba(217, 150, 55, .075)" } : undefined} title={duplicateRowIndexes.has(rows.indexOf(row)) ? "Duplicate row" : undefined}>



                <td className="dock-row-index" style={{ color: "#858585", background: "transparent", fontVariantNumeric: "tabular-nums" }}>



                  {currentPage * PAGE_SIZE + index + 1}



                </td>



                {columns.map((column) => {



                  const value = row[column.name];

                  const cellIssue = getCellIssue(value, column.type);

                  const issueStyle = cellIssue

                    ? {

                        background: cellIssue.kind === "missing"

                          ? "rgba(217, 150, 55, .13)"

                          : cellIssue.kind === "type-mismatch"

                            ? "rgba(190, 78, 68, .12)"

                            : "rgba(217, 150, 55, .09)",

                        boxShadow: cellIssue.kind === "type-mismatch"

                          ? "inset 0 -1px 0 rgba(190, 78, 68, .65)"

                          : "inset 0 -1px 0 rgba(217, 150, 55, .45)",

                      }

                    : undefined;



                  return (



                    <td

                      key={column.name}

                      title={cellIssue ? `${cellIssue.label}: ${String(value ?? "NULL")}` : String(value ?? "NULL")}

                      style={issueStyle}

                      data-cell-issue={cellIssue?.kind}

                    >



                      {value === null || value === undefined || value === "" ? (



                        <span className="dock-null-value">NULL</span>



                      ) : (



                        String(value)



                      )}



                    </td>



                  );



                })}



              </tr>



            ))}



            {visibleRows.length === 0 && (



              <tr>



                <td



                  colSpan={columns.length + 1}



                  className="dock-no-results"



                >



                  No rows match your search and filter conditions.



                </td>



              </tr>



            )}



          </tbody>



        </table>



      </div>



      <div className="dock-table-footer">



        <span>



          Showing {visibleRows.length} of {sortedRows.length} matching rows



          out of {(Array.isArray(rows) ? rows.length : 0)} total



          {sortColumn



            ? ` · Sorted by ${sortColumn} (${sortDirection})`



            : ""}



        </span>



        <div className="dock-pagination">



          <button



            type="button"



            className="dock-mini-icon"



            disabled={currentPage === 0}



            onClick={() =>



              setPage((value) => Math.max(0, value - 1))



            }



            aria-label="Previous page"



            title="Previous page"



          >



            <ChevronLeft size={15} />



          </button>



          <span>



            {currentPage + 1} / {pageCount}



          </span>



          <button



            type="button"



            className="dock-mini-icon"



            disabled={currentPage >= pageCount - 1}



            onClick={() =>



              setPage((value) => Math.min(pageCount - 1, value + 1))



            }



            aria-label="Next page"



            title="Next page"



          >



            <ChevronRight size={15} />



          </button>



        </div>



      </div>



    </section>



  );



}
