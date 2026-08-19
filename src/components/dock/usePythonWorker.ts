'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  ExecutionResult,
} from './types'

interface WorkerMessage {
  id: number

  type: 'result'

  result: ExecutionResult
}

interface PendingRequest {
  resolve: (
    result: ExecutionResult,
  ) => void

  reject: (
    error: Error,
  ) => void
}

export function usePythonWorker() {
  const workerRef =
    useRef<Worker | null>(null)

  const requestIdRef =
    useRef(0)

  const pendingRef =
    useRef(
      new Map<
        number,
        PendingRequest
      >(),
    )

  const [ready, setReady] =
    useState(false)

  const [error, setError] =
    useState<string | null>(
      null,
    )

  /* ------------------------------------------------------------------------ */
  /*                              CREATE WORKER                               */
  /* ------------------------------------------------------------------------ */

  const createWorker =
    useCallback(() => {
      /*
       * Make sure an old worker is gone.
       */

      if (workerRef.current) {
        workerRef.current.terminate()
      }

      const worker =
        new Worker(
          '/workers/python.worker.js',
        )

      workerRef.current =
        worker

      worker.onmessage = (
        event: MessageEvent<WorkerMessage>,
      ) => {
        const message =
          event.data

        if (
          !message ||
          message.type !==
            'result'
        ) {
          return
        }

        const pending =
          pendingRef.current.get(
            message.id,
          )

        if (!pending) {
          return
        }

        pendingRef.current.delete(
          message.id,
        )

        pending.resolve(
          message.result,
        )
      }

      worker.onerror = (
        event,
      ) => {
        const message =
          event.message ||
          'Python worker failed.'

        setError(message)

        setReady(false)

        /*
         * Reject every pending request.
         */

        pendingRef.current.forEach(
          (pending) => {
            pending.reject(
              new Error(message),
            )
          },
        )

        pendingRef.current.clear()
      }

      /*
       * We don't mark the worker ready
       * until Python actually initializes.
       *
       * Send a tiny execution request
       * to trigger Pyodide initialization.
       */

      const id =
        ++requestIdRef.current

      pendingRef.current.set(
        id,
        {
          resolve: (
            result,
          ) => {
            if (
              result.success
            ) {
              setReady(true)
              setError(null)
            } else {
              setError(
                result.error ||
                  'Unable to initialize Python.',
              )
            }
          },

          reject: (
            workerError,
          ) => {
            setError(
              workerError.message,
            )
          },
        },
      )

      worker.postMessage({
        id,
        type: 'execute',
        code:
          'print("Python kernel ready")',
      })

      return worker
    }, [])

  /* ------------------------------------------------------------------------ */
  /*                              INITIALIZE                                  */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const worker =
      createWorker()

    return () => {
      worker?.terminate()

      workerRef.current =
        null

      pendingRef.current.forEach(
        (pending) => {
          pending.reject(
            new Error(
              'Python worker terminated.',
            ),
          )
        },
      )

      pendingRef.current.clear()
    }
  }, [createWorker])

  /* ------------------------------------------------------------------------ */
  /*                              REQUEST                                     */
  /* ------------------------------------------------------------------------ */

  const request =
    useCallback(
      (
        message: {
          type:
            | 'execute'
            | 'loadCSV'
            | 'reset'

          code?: string

          filename?: string

          content?: string
        },
      ): Promise<ExecutionResult> => {
        return new Promise(
          (
            resolve,
            reject,
          ) => {
            const worker =
              workerRef.current

            if (!worker) {
              reject(
                new Error(
                  'Python worker is not available.',
                ),
              )

              return
            }

            const id =
              ++requestIdRef.current

            pendingRef.current.set(
              id,
              {
                resolve,
                reject,
              },
            )

            worker.postMessage({
              id,
              ...message,
            })
          },
        )
      },
    [],
    )

  /* ------------------------------------------------------------------------ */
  /*                              EXECUTE                                     */
  /* ------------------------------------------------------------------------ */

  const execute =
    useCallback(
      async (
        code: string,
      ) => {
        return request({
          type: 'execute',
          code,
        })
      },
      [request],
    )

  /* ------------------------------------------------------------------------ */
  /*                              LOAD CSV                                    */
  /* ------------------------------------------------------------------------ */

  const loadCSV =
    useCallback(
      async (
        filename: string,
        content: string,
      ) => {
        return request({
          type: 'loadCSV',
          filename,
          content,
        })
      },
      [request],
    )

  /* ------------------------------------------------------------------------ */
  /*                              RESET                                       */
  /* ------------------------------------------------------------------------ */

  const reset =
    useCallback(async () => {
      /*
       * Terminate the existing worker.
       */

      if (workerRef.current) {
        workerRef.current.terminate()

        workerRef.current =
          null
      }

      /*
       * Reject pending requests.
       */

      pendingRef.current.forEach(
        (pending) => {
          pending.reject(
            new Error(
              'Python worker reset.',
            ),
          )
        },
      )

      pendingRef.current.clear()

      setReady(false)

      setError(null)

      /*
       * Start a completely fresh
       * Pyodide environment.
       */

      createWorker()
    }, [createWorker])

  return {
    ready,

    error,

    execute,

    loadCSV,

    reset,
  }
}