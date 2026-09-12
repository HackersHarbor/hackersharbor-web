import * as duckdb from "@duckdb/duckdb-wasm";
import * as arrow from "apache-arrow";

export type SQLColumn = {
  name: string;
  type: string;
};

export type SQLResult = {
  columns: SQLColumn[];
  rows: unknown[][];
  rowCount: number;
  changes: number;
};

export class SQLExecutionService {
  private db: duckdb.AsyncDuckDB | null = null;
  private connection: duckdb.AsyncDuckDBConnection | null = null;
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized && this.db && this.connection) {
      return;
    }

    const bundles = duckdb.getJsDelivrBundles();

    const bundle = await duckdb.selectBundle(bundles);

    if (!bundle.mainWorker || !bundle.mainModule) {
      throw new Error("DuckDB-WASM bundle could not be loaded.");
    }

    const workerUrl = URL.createObjectURL(
      new Blob([`importScripts("${bundle.mainWorker}");`], {
        type: "text/javascript",
      }),
    );

    const worker = new Worker(workerUrl);

    this.db = new duckdb.AsyncDuckDB(
      new duckdb.ConsoleLogger(),
      worker,
    );

    await this.db.instantiate(bundle.mainModule);

    this.connection = await this.db.connect();
    this.initialized = true;

    URL.revokeObjectURL(workerUrl);
  }

  async execute(sql: string): Promise<SQLResult> {
    await this.initialize();

    if (!this.connection) {
      throw new Error("DuckDB connection is not initialized.");
    }

    const trimmedSql = sql.trim();

    if (!trimmedSql) {
      return {
        columns: [],
        rows: [],
        rowCount: 0,
        changes: 0,
      };
    }

    const result = await this.connection.query(trimmedSql);

    const columns = result.schema.fields.map((field) => ({
      name: field.name,
      type: field.type.toString(),
    }));

    const rows: unknown[][] = [];

    for (let index = 0; index < result.numRows; index += 1) {
      const row: unknown[] = [];

      for (const field of result.schema.fields) {
        const column = result.getChild(field.name);

        row.push(column?.get(index) ?? null);
      }

      rows.push(row);
    }

    return {
      columns,
      rows,
      rowCount: rows.length,
      changes: 0,
    };
  }

  async reset(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
    }

    if (this.db) {
      await this.db.terminate();
    }

    this.connection = null;
    this.db = null;
    this.initialized = false;
  }

  async close(): Promise<void> {
    await this.reset();
  }
}