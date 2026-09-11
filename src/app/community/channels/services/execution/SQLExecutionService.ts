import type {
  ExecutionRequest,
  ExecutionResult,
} from "./ExecutionTypes";

type SqlValue = string | number | null | Uint8Array;

type SqlQueryResult = {
  columns: string[];
  values: SqlValue[][];
};

type SqlDatabase = {
  exec: (sql: string) => SqlQueryResult[];
  close?: () => void;
};

type SqlJsModule = {
  Database: new () => SqlDatabase;
};

type SqlJsInitializer = (config: {
  locateFile: (file: string) => string;
}) => Promise<SqlJsModule>;

type FormattedRow = Record<string, string>;

export class SQLExecutionService {
  async execute(
    request: ExecutionRequest,
  ): Promise<ExecutionResult> {
    const startedAt = Date.now();

    try {
      const sql = this.normalizeSql(request.source);

      if (!sql.trim()) {
        return {
          output: "No SQL query provided.",
          exitCode: 1,
          durationMs: Date.now() - startedAt,
          mode: "runtime",
          error: "No SQL query provided.",
        };
      }

      const database = await this.createDatabase();

      try {
        const results = database.exec(sql);

        return {
          output: this.formatResults(results),
          exitCode: 0,
          durationMs: Date.now() - startedAt,
          mode: "runtime",
        };
      } finally {
        database.close?.();
      }
    } catch (error) {
      const message = this.getErrorMessage(error);

      return {
        output: message,
        exitCode: 1,
        durationMs: Date.now() - startedAt,
        mode: "runtime",
        error: message,
      };
    }
  }

  private async createDatabase(): Promise<SqlDatabase> {
    const wasmPath = process.cwd() + "/public/sql-wasm/sql-wasm.wasm";

    if (!existsSync(wasmPath)) {
      throw new Error(
        [
          "SQL WASM file was not found.",
          `Expected location: ${wasmPath}`,
          "Create public/sql-wasm/sql-wasm.wasm before running SQL.",
        ].join("\n"),
      );
    }

    console.log("Using SQL WASM:", wasmPath);

    const initSqlJs = await this.loadSqlJs();

    const sqlJs = await initSqlJs({
      locateFile: () => "/sql-wasm/sql-wasm.wasm",
    });

    return new sqlJs.Database();
  }

  private async loadSqlJs(): Promise<SqlJsInitializer> {
    const module = await import("sql.js");

    return module.default as unknown as SqlJsInitializer;
  }

  private normalizeSql(source: string): string {
    return source
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/div>/gi, "\n")
      .replace(/<div[^>]*>/gi, "")
      .replace(/<\/p>/gi, "\n")
      .replace(/<p[^>]*>/gi, "")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&#39;/gi, "'")
      .replace(/&quot;/gi, '"')
      .replace(/<[^>]*>/g, "")
      .replace(/\u00a0/g, " ")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .trim();
  }

  private formatResults(
    results: SqlQueryResult[],
  ): string {
    if (!results.length) {
      return "Query executed successfully.";
    }

    return results
      .map((result, resultIndex) => {
        if (!result.columns.length) {
          return `Statement ${resultIndex + 1} executed successfully.`;
        }

        const rows: FormattedRow[] = result.values.map(
          (values) => {
            const row: FormattedRow = {};

            result.columns.forEach((column, columnIndex) => {
              row[column] = this.formatValue(
                values[columnIndex],
              );
            });

            return row;
          },
        );

        return [
          `Result ${resultIndex + 1}`,
          this.formatTable(result.columns, rows),
        ].join("\n");
      })
      .join("\n\n");
  }

  private formatTable(
    columns: string[],
    rows: FormattedRow[],
  ): string {
    if (!rows.length) {
      return "No rows returned.";
    }

    const widths = columns.map((column) => {
      const values = rows.map(
        (row) => row[column] ?? "NULL",
      );

      return Math.max(
        column.length,
        ...values.map((value) => value.length),
      );
    });

    const header = columns
      .map((column, index) => {
        return ` ${column.padEnd(widths[index])} `;
      })
      .join("|");

    const separator = widths
      .map((width) => "-".repeat(width + 2))
      .join("+");

    const body = rows
      .map((row) => {
        return columns
          .map((column, index) => {
            const value = row[column] ?? "NULL";

            return ` ${value.padEnd(widths[index])} `;
          })
          .join("|");
      })
      .join("\n");

    return [
      header,
      separator,
      body,
      "",
      `${rows.length} row(s) returned.`,
    ].join("\n");
  }

  private formatValue(value: SqlValue): string {
    if (value === null || value === undefined) {
      return "NULL";
    }

    if (value instanceof Uint8Array) {
      return `[Binary data: ${value.length} bytes]`;
    }

    return String(value);
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === "string") {
      return error;
    }

    try {
      return JSON.stringify(error);
    } catch {
      return "SQL execution failed.";
    }
  }
}



