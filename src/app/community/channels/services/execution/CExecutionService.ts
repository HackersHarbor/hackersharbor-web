import { execFile, spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

type ExecutionResult = {
  output: string;
  exitCode: number;
  mode: "runtime";
  error: string | null;
};

type ProcessError = {
  stdout?: string;
  stderr?: string;
  message?: string;
  code?: string | number;
  killed?: boolean;
  signal?: string;
};

type ProcessResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
};

function escapeBashArgument(value: string): string {
  return `'${value.replace(/'/g, "'\\''")}'`;
}

function runProcess(
  command: string,
  args: string[],
  input: string,
  timeoutMs: number,
): Promise<ProcessResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      windowsHide: true,
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    let settled = false;

    const finishWithError = (error: Error) => {
      if (settled) return;

      settled = true;
      clearTimeout(timeout);
      reject(error);
    };

    const timeout = setTimeout(() => {
      if (settled) return;

      settled = true;

      child.kill("SIGKILL");

      reject(
        new Error(`Execution timed out after ${timeoutMs / 1000} seconds.`),
      );
    }, timeoutMs);

    child.stdout.on("data", (data: Buffer) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    child.stdin.on("error", (error) => {
      finishWithError(error);
    });

    child.on("error", (error) => {
      finishWithError(error);
    });

    child.on("close", (code) => {
      if (settled) return;

      settled = true;
      clearTimeout(timeout);

      resolve({
        stdout,
        stderr,
        exitCode: code ?? 1,
      });
    });

    if (input.length > 0) {
      child.stdin.write(input);
    }

    child.stdin.end();
  });
}

export class CExecutionService {
  async execute(
    _language: string,
    source: string,
    input = "",
  ): Promise<ExecutionResult> {
    const temporaryDirectory = await fs.mkdtemp(
      path.join(os.tmpdir(), "harbor-c-"),
    );

    const sourcePath = path.join(temporaryDirectory, "main.c");

    const bash =
      process.env.MSYS2_BASH ?? "C:\\msys64\\usr\\bin\\bash.exe";

    const bashDirectory = temporaryDirectory
      .replace(/\\/g, "/")
      .replace(
        /^([A-Za-z]):/,
        (_, drive: string) => `/${drive.toLowerCase()}`,
      );

    console.log("C Bash directory:", bashDirectory);

    try {
      await fs.writeFile(sourcePath, source, "utf8");

      const compileCommand = [
        `cd ${escapeBashArgument(bashDirectory)}`,
        "export PATH=/ucrt64/bin:/usr/bin:$PATH",
        "gcc -std=c17 -O0 main.c -o main.exe",
      ].join(" && ");

      try {
        await execFileAsync(
          bash,
          ["--login", "-lc", compileCommand],
          {
            timeout: 15000,
            maxBuffer: 1024 * 1024,
            windowsHide: true,
          },
        );
      } catch (error) {
        const compilationError = error as ProcessError;

        const errorMessage = [
          compilationError.stderr?.trim(),
          compilationError.stdout?.trim(),
          compilationError.message,
        ]
          .filter(Boolean)
          .join("\n");

        return {
          output: errorMessage || "C compilation failed.",
          exitCode:
            typeof compilationError.code === "number"
              ? compilationError.code
              : 1,
          mode: "runtime",
          error: errorMessage || "C compilation failed.",
        };
      }

      const runCommand = [
        `cd ${escapeBashArgument(bashDirectory)}`,
        "exec ./main.exe",
      ].join(" && ");

      const result = await runProcess(
        bash,
        ["--login", "-lc", runCommand],
        input,
        15000,
      );

      const output = [result.stdout.trim(), result.stderr.trim()]
        .filter(Boolean)
        .join("\n");

      return {
        output: output || "Program finished without output.",
        exitCode: result.exitCode,
        mode: "runtime",
        error: result.exitCode === 0 ? null : output || "C execution failed.",
      };
    } catch (error) {
      const executionError = error as ProcessError;

      const errorMessage = [
        executionError.stderr?.trim(),
        executionError.stdout?.trim(),
        executionError.message,
      ]
        .filter(Boolean)
        .join("\n");

      const timedOut = errorMessage.includes(
        "Execution timed out after 15 seconds.",
      );

      return {
        output: errorMessage || "C execution failed.",
        exitCode:
          typeof executionError.code === "number"
            ? executionError.code
            : 1,
        mode: "runtime",
        error: timedOut
          ? "Execution timed out after 15 seconds."
          : errorMessage || "C execution failed.",
      };
    } finally {
      await fs.rm(temporaryDirectory, {
        recursive: true,
        force: true,
      });
    }
  }
}