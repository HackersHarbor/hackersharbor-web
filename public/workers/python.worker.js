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

  initializationPromise = (async () => {
    try {
      /*
       * Load Pyodide inside the Web Worker.
       * This keeps Python execution off the main browser thread.
       */
      if (typeof loadPyodide === 'undefined') {
        importScripts(
          'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js'
        )
      }

      pyodide = await loadPyodide({
        indexURL:
          'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/',
      })

      /*
       * Do not preload numpy/pandas here.
       * Packages are loaded automatically when the user's
       * Python code imports them.
       */

      initialized = true

      return pyodide
    } catch (error) {
      initializationPromise = null
      pyodide = null
      initialized = false

      throw error
    }
  })()

  return initializationPromise
}

/* -------------------------------------------------------------------------- */
/* PACKAGE LOADING                                                            */
/* -------------------------------------------------------------------------- */

async function loadPackagesForCode(runtime, code) {
  if (!code || !code.trim()) {
    return
  }

  await runtime.loadPackagesFromImports(code)
}

/* -------------------------------------------------------------------------- */
/* SEND RESULT                                                                */
/* -------------------------------------------------------------------------- */

function send(id, result) {
  self.postMessage({
    id,
    type: 'result',
    result,
  })
}

/* -------------------------------------------------------------------------- */
/* EXECUTE PYTHON                                                             */
/* -------------------------------------------------------------------------- */

async function executePython(id, code) {
  const started = performance.now()

  try {
    const runtime = await initializePyodide()

    /*
     * Load any packages imported by the learner.
     */
    await loadPackagesForCode(runtime, code)

    /*
     * Capture stdout and stderr.
     */
    let stdout = ''
    let stderr = ''

    runtime.setStdout({
      batched: (text) => {
        stdout += text
      },
    })

    runtime.setStderr({
      batched: (text) => {
        stderr += text
      },
    })

    /*
     * Execute the learner's code exactly as written.
     */
    const result = await runtime.runPythonAsync(code)

    /*
     * Capture the returned Python value too.
     */
    let returnedValue = null

    if (result !== undefined && result !== null) {
      try {
        if (
          typeof result === 'object' &&
          typeof result.toJs === 'function'
        ) {
          returnedValue = result.toJs({
            dict_converter: Object.fromEntries,
          })

          result.destroy()
        } else {
          returnedValue = result
        }
      } catch {
        returnedValue = null

        try {
          if (
            result &&
            typeof result.destroy === 'function'
          ) {
            result.destroy()
          }
        } catch {
          // Ignore cleanup failures.
        }
      }
    }

    /*
     * Return the REAL Python output.
     */
    send(id, {
      success: true,
      type: 'text',
      text: stdout,
      stdout,
      stderr,
      value: returnedValue,
      executionTime:
        performance.now() - started,
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
        performance.now() - started,
    })
  }
}

/* -------------------------------------------------------------------------- */
/* LOAD CSV                                                                   */
/* -------------------------------------------------------------------------- */

async function loadCSV(
  id,
  filename,
  content,
) {
  const started = performance.now()

  try {
    const runtime = await initializePyodide()

    runtime.FS.writeFile(
      filename,
      content,
    )

    runtime.globals.set(
      '__csv_filename__',
      filename,
    )

    const loadCode = `
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
`

    await runtime.runPythonAsync(loadCode)

    send(id, {
      success: true,
      type: 'text',
      text:
        `CSV "${filename}" loaded into the Python filesystem.`,
      executionTime:
        performance.now() - started,
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
        performance.now() - started,
    })
  }
}

/* -------------------------------------------------------------------------- */
/* RESET PYTHON                                                               */
/* -------------------------------------------------------------------------- */

async function resetPython(id) {
  try {
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
/* MESSAGE HANDLER                                                            */
/* -------------------------------------------------------------------------- */

self.onmessage = async (event) => {
  const message = event.data

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