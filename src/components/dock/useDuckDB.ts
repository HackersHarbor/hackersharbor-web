'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import * as duckdb from '@duckdb/duckdb-wasm'

import {
  ExecutionResult,
  TableOutput,
} from './types'

interface DuckDBState {
  ready: boolean
  loading: boolean
  error: string | null
}

function normalizeTableName(
  filename: string,
) {
  const withoutExtension =
    filename.replace(
      /\.[^/.]+$/,
      '',
    )

  let name =
    withoutExtension
      .replace(
        /[^a-zA-Z0-9_]/g,
        '_',
      )
      .replace(
        /^(\d)/,
        '_$1',
      )

  if (!name) {
    name = 'data'
  }

  return name.toLowerCase()
}

function quoteIdentifier(
  value: string,
) {
  return `"${value.replace(
    /"/g,
    '""',
  )}"`
}

function quoteString(
  value: string,
) {
  return `'${value.replace(
    /'/g,
    "''",
  )}'`
}

export function useDuckDB() {
  const dbRef =
    useRef<
      duckdb.AsyncDuckDB | null
    >(null)

  const connectionRef =
    useRef<
      Awaited<
        ReturnType<
          duckdb.AsyncDuckDB['connect']
        >
      > | null
    >(null)

  const workerRef =
    useRef<Worker | null>(null)

  const bundleWorkerUrlRef =
    useRef<string | null>(null)

  const initializedRef =
    useRef(false)

  const [
    state,
    setState,
  ] =
    useState<DuckDBState>({
      ready: false,
      loading: false,
      error: null,
    })

  /* ---------------------------------------------------------------------- */
  /* INITIALIZE                                                             */
  /* ---------------------------------------------------------------------- */

  const initialize =
    useCallback(async () => {
      if (
        initializedRef.current &&
        dbRef.current &&
        connectionRef.current
      ) {
        return connectionRef.current
      }

      setState({
        ready: false,
        loading: true,
        error: null,
      })

      try {
        const bundles =
          duckdb.getJsDelivrBundles()

        const bundle =
          await duckdb.selectBundle(
            bundles,
          )

        if (
          !bundle.mainModule ||
          !bundle.mainWorker
        ) {
          throw new Error(
            'DuckDB-WASM browser bundle could not be loaded.',
          )
        }

        /*
         * DuckDB-WASM's documented CDN
         * instantiation approach creates a
         * worker from the selected bundle.
         */

        const workerUrl =
          URL.createObjectURL(
            new Blob(
              [
                `importScripts("${bundle.mainWorker}");`,
              ],
              {
                type: 'text/javascript',
              },
            ),
          )

        bundleWorkerUrlRef.current =
          workerUrl

        const worker =
          new Worker(
            workerUrl,
          )

        workerRef.current =
          worker

        const logger =
          new duckdb.ConsoleLogger()

        const db =
          new duckdb.AsyncDuckDB(
            logger,
            worker,
          )

        await db.instantiate(
          bundle.mainModule,
          bundle.pthreadWorker,
        )

        const connection =
          await db.connect()

        dbRef.current = db

        connectionRef.current =
          connection

        initializedRef.current =
          true

        setState({
          ready: true,
          loading: false,
          error: null,
        })

        return connection
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : String(error)

        setState({
          ready: false,
          loading: false,
          error: message,
        })

        throw error
      }
    }, [])

  /* ---------------------------------------------------------------------- */
  /* INITIALIZE ON MOUNT                                                    */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    initialize().catch(() => {
      /*
       * The error is already stored
       * in state.
       */
    })

    return () => {
      const connection =
        connectionRef.current

      if (connection) {
        connection.close().catch(
          () => {},
        )
      }

      const db =
        dbRef.current

      if (db) {
        db.terminate().catch(
          () => {},
        )
      }

      if (workerRef.current) {
        workerRef.current.terminate()

        workerRef.current =
          null
      }

      if (
        bundleWorkerUrlRef.current
      ) {
        URL.revokeObjectURL(
          bundleWorkerUrlRef.current,
        )

        bundleWorkerUrlRef.current =
          null
      }

      connectionRef.current =
        null

      dbRef.current = null

      initializedRef.current =
        false
    }
  }, [initialize])

  /* ---------------------------------------------------------------------- */
  /* LOAD CSV                                                                */
  /* ---------------------------------------------------------------------- */

  const loadCSV =
    useCallback(
      async (
        filename: string,
        content: string,
      ) => {
        const connection =
          await initialize()

        const db =
          dbRef.current

        if (!db) {
          throw new Error(
            'DuckDB database is not available.',
          )
        }

        /*
         * Register the uploaded CSV in
         * DuckDB-WASM's virtual filesystem.
         */

        await db.registerFileText(
          filename,
          content,
        )

        const tableName =
          normalizeTableName(
            filename,
          )

        /*
         * Import the CSV into an actual
         * DuckDB table.
         *
         * Example:
         *
         * sales.csv
         *
         * becomes:
         *
         * sales
         */

        await connection.query(`
          CREATE OR REPLACE TABLE
          ${quoteIdentifier(tableName)}
          AS
          SELECT *
          FROM read_csv_auto(
            ${quoteString(filename)},
            header = true,
            auto_detect = true
          );
        `)

        /*
         * Also expose the most recently
         * uploaded dataset as "data".
         *
         * This lets beginners write:
         *
         * SELECT * FROM data;
         */

        await connection.query(`
          CREATE OR REPLACE VIEW
          "data"
          AS
          SELECT *
          FROM ${quoteIdentifier(
            tableName,
          )};
        `)

        const result =
          await connection.query(`
            SELECT
              COUNT(*) AS row_count,
              COUNT(*) OVER () AS total
            FROM ${quoteIdentifier(
              tableName,
            )}
            LIMIT 1;
          `)

        const rows =
          result.toArray()

        const rowCount =
          rows.length > 0
            ? Number(
                rows[0].row_count ??
                  0,
              )
            : 0

        return {
          tableName,
          rowCount,
        }
      },
      [initialize],
    )

  /* ---------------------------------------------------------------------- */
  /* EXECUTE SQL                                                             */
  /* ---------------------------------------------------------------------- */

  const execute =
    useCallback(
      async (
        sql: string,
      ): Promise<ExecutionResult> => {
        const started =
          performance.now()

        try {
          const connection =
            await initialize()

          const result =
            await connection.query(
              sql,
            )

          const rows =
            result.toArray()

          const columns =
            result.schema.fields.map(
              (field) =>
                field.name,
            )

          const table: TableOutput = {
            columns,
            rows: rows.map(
              (row) =>
                columns.map(
                  (column) => {
                    const value =
                      row[column]

                    /*
                     * DuckDB can return BigInt.
                     * Convert it to a normal
                     * number/string for React.
                     */

                    if (
                      typeof value ===
                      'bigint'
                    ) {
                      return value.toString()
                    }

                    return value
                  },
                ),
            ),
          }

          return {
            success: true,
            type: 'table',
            table,
            executionTime:
              performance.now() -
              started,
          }
        } catch (error) {
          return {
            success: false,
            type: 'error',
            error:
              error instanceof Error
                ? error.message
                : String(error),
            executionTime:
              performance.now() -
              started,
          }
        }
      },
      [initialize],
    )

  /* ---------------------------------------------------------------------- */
  /* GET TABLE NAMES                                                         */
  /* ---------------------------------------------------------------------- */

  const getTables =
    useCallback(async () => {
      const connection =
        await initialize()

      const result =
        await connection.query(`
          SELECT
            table_name
          FROM information_schema.tables
          WHERE table_schema = 'main'
          ORDER BY table_name;
        `)

      return result
        .toArray()
        .map(
          (row) =>
            String(
              row.table_name,
            ),
        )
    }, [initialize])

  /* ---------------------------------------------------------------------- */
  /* RESET                                                                   */
  /* ---------------------------------------------------------------------- */

  const reset =
    useCallback(async () => {
      try {
        const connection =
          connectionRef.current

        if (connection) {
          await connection.close()
        }

        const db =
          dbRef.current

        if (db) {
          await db.terminate()
        }

        if (workerRef.current) {
          workerRef.current.terminate()
        }

        if (
          bundleWorkerUrlRef.current
        ) {
          URL.revokeObjectURL(
            bundleWorkerUrlRef.current,
          )
        }
      } catch {
        /*
         * Ignore cleanup errors.
         */
      }

      connectionRef.current =
        null

      dbRef.current = null

      workerRef.current = null

      bundleWorkerUrlRef.current =
        null

      initializedRef.current =
        false

      setState({
        ready: false,
        loading: false,
        error: null,
      })

      /*
       * Reinitialize the database.
       */

      await initialize()
    }, [initialize])

  return {
    ready: state.ready,

    loading: state.loading,

    error: state.error,

    initialize,

    loadCSV,

    execute,

    getTables,

    reset,
  }
}