let pyodide = null

let initialized = false

let initializationPromise = null

async function initializePyodide() {
  if (pyodide) {
    return pyodide
  }

  if (initializationPromise) {
    return initializationPromise
  }

  initializationPromise =
    (async () => {
      try {
        /*
         * Pyodide is loaded from its official CDN.
         *
         * The worker keeps Python execution away
         * from the main browser thread.
         */

        if (
          typeof loadPyodide ===
          'undefined'
        ) {
          importScripts(
            'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js',
          )
        }

        pyodide =
          await loadPyodide({
            indexURL:
              'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/',
          })

        /*
         * Pandas and NumPy are required by
         * The Dock's browser Python MVP.
         */

        await pyodide.loadPackage([
          'numpy',
          'pandas',
        ])

        initialized = true

        return pyodide
      } catch (error) {
        initializationPromise =
          null

        throw error
      }
    })()

  return initializationPromise
}

/* -------------------------------------------------------------------------- */
/*                              SEND RESULT                                   */
/* -------------------------------------------------------------------------- */

function send(id, result) {
  self.postMessage({
    id,
    type: 'result',
    result,
  })
}

/* -------------------------------------------------------------------------- */
/*                              EXECUTE PYTHON                                */
/* -------------------------------------------------------------------------- */

async function executePython(
  id,
  code,
) {
  const started =
    performance.now()

  try {
    const runtime =
      await initializePyodide()

    /*
     * Capture stdout/stderr from Python.
     */

    const output = []

    runtime.setStdout({
      batched: (text) => {
        output.push(text)
      },
    })

    runtime.setStderr({
      batched: (text) => {
        output.push(text)
      },
    })

    /*
     * Make the user's code available
     * exactly as written.
     */

    await runtime.runPythonAsync(
      code,
    )

    send(id, {
      success: true,

      type: 'text',

      text: output.join(''),

      executionTime:
        performance.now() -
        started,
    })
  } catch (error) {
    send(id, {
      success: false,

      type: 'error',

      error:
        error &&
        error.message
          ? error.message
          : String(error),

      executionTime:
        performance.now() -
        started,
    })
  }
}

/* -------------------------------------------------------------------------- */
/*                                LOAD CSV                                    */
/* -------------------------------------------------------------------------- */

async function loadCSV(
  id,
  filename,
  content,
) {
  const started =
    performance.now()

  try {
    const runtime =
      await initializePyodide()

    /*
     * IMPORTANT:
     *
     * Persist the uploaded CSV inside
     * the Pyodide filesystem.
     *
     * This allows:
     *
     * pd.read_csv("sales.csv")
     *
     * from later notebook cells.
     */

    runtime.FS.writeFile(
      filename,
      content,
    )

    runtime.globals.set(
      '__csv_filename__',
      filename,
    )

    await runtime.runPythonAsync(`
import pandas as pd

__filename__ = __csv_filename__

df = pd.read_csv(__filename__)

print(
    f"Loaded {len(df):,} rows × {len(df.columns):,} columns"
)

print()

print(
    df.head(10).to_string(index=False)
)
`)

    send(id, {
      success: true,

      type: 'text',

      text:
        `CSV "${filename}" loaded into the Python filesystem.`,

      executionTime:
        performance.now() -
        started,
    })
  } catch (error) {
    send(id, {
      success: false,

      type: 'error',

      error:
        error &&
        error.message
          ? error.message
          : String(error),

      executionTime:
        performance.now() -
        started,
    })
  }
}

/* -------------------------------------------------------------------------- */
/*                              RESET PYTHON                                  */
/* -------------------------------------------------------------------------- */

async function resetPython(id) {
  try {
    /*
     * Terminating the worker is handled
     * by the React hook.
     *
     * This message exists so the protocol
     * remains explicit.
     */

    initialized = false

    pyodide = null

    initializationPromise = null

    send(id, {
      success: true,

      type: 'text',

      text: 'Python kernel reset.',
    })
  } catch (error) {
    send(id, {
      success: false,

      type: 'error',

      error:
        error &&
        error.message
          ? error.message
          : String(error),
    })
  }
}

/* -------------------------------------------------------------------------- */
/*                              MESSAGE HANDLER                               */
/* -------------------------------------------------------------------------- */

self.onmessage = async (
  event,
) => {
  const message =
    event.data

  if (!message) {
    return
  }

  const {
    id,
    type,
    code,
    filename,
    content,
  } = message

  try {
    if (type === 'execute') {
      await executePython(
        id,
        code || '',
      )

      return
    }

    if (type === 'loadCSV') {
      await loadCSV(
        id,
        filename || 'data.csv',
        content || '',
      )

      return
    }

    if (type === 'reset') {
      await resetPython(id)

      return
    }

    send(id, {
      success: false,

      type: 'error',

      error:
        `Unknown worker message type: ${type}`,
    })
  } catch (error) {
    send(id, {
      success: false,

      type: 'error',

      error:
        error &&
        error.message
          ? error.message
          : String(error),
    })
  }
}