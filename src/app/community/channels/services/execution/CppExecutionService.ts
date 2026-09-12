import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";

export type CppExecutionInput = {
  code: string;
  input?: string;
  timeoutMs?: number;
};

export type CppExecutionResult = {
  output: string;
  error: string;
  exitCode: number | null;
  timedOut: boolean;
};

class CppExecutionService {
  private readonly bashPath = "C:\\msys64\\usr\\bin\\bash.exe";
  private readonly defaultTimeoutMs = 30_000;

  async execute({
    code,
    input = "",
    timeoutMs = this.defaultTimeoutMs,
  }: CppExecutionInput): Promise<CppExecutionResult> {
    if (typeof code !== "string" || code.trim().length === 0) {
      return {
        output: "",
        error: "C++ source code is required.",
        exitCode: 1,
        timedOut: false,
      };
    }

    const temporaryDirectory = path.join(
      process.cwd(),
      ".tmp",
      "cpp-execution",
      randomUUID(),
    );

    await fs.mkdir(temporaryDirectory, { recursive: true });

    const sourcePath = path.join(temporaryDirectory, "main.cpp");
    const executablePath = path.join(temporaryDirectory, "main.exe");

    await fs.writeFile(sourcePath, code, "utf8");

    const bashDirectory = temporaryDirectory
      .replace(/\\/g, "/")
      .replace(/^([A-Za-z]):/, (_, drive: string) => {
        return `/${drive.toLowerCase()}`;
      });

    const quoteForBash = (value: string): string => {
      return `'${value.replace(/'/g, `'\\''`)}'`;
    };

    const compileCommand = [
      `cd ${quoteForBash(bashDirectory)}`,
      "export PATH=/ucrt64/bin:/usr/bin:$PATH",
      "g++ --version",
      "g++ -std=c++17 -O0 main.cpp -o main.exe",
    ].join(" && ");

    const runCommand = [
      `cd ${quoteForBash(bashDirectory)}`,
      "export PATH=/ucrt64/bin:/usr/bin:$PATH",
      "exec ./main.exe",
    ].join(" && ");

    try {
      const compileResult = await this.runProcess(
        this.bashPath,
        ["-c", compileCommand],
        "",
        timeoutMs,
      );

      if (compileResult.timedOut) {
        return {
          output: compileResult.output,
          error: "C++ compilation timed out.",
          exitCode: null,
          timedOut: true,
        };
      }

      if (compileResult.exitCode !== 0) {
        return {
          output: compileResult.output,
          error: compileResult.error || "C++ compilation failed.",
          exitCode: compileResult.exitCode,
          timedOut: false,
        };
      }

      const runResult = await this.runProcess(
        this.bashPath,
        ["-c", runCommand],
        input,
        timeoutMs,
      );

      return {
        output: runResult.output,
        error: runResult.error,
        exitCode: runResult.exitCode,
        timedOut: runResult.timedOut,
      };
    } finally {
      await fs.rm(temporaryDirectory, {
        recursive: true,
        force: true,
      });
    }
  }

  private runProcess(
    command: string,
    args: string[],
    input: string,
    timeoutMs: number,
  ): Promise<CppExecutionResult> {
    return new Promise((resolve) => {
      const child = spawn(command, args, {
        windowsHide: true,
        cwd: process.cwd(),
        env: {
          ...process.env,
          PATH: `C:\\msys64\\ucrt64\\bin;C:\\msys64\\usr\\bin;${process.env.PATH ?? ""}`,
        },
        stdio: ["pipe", "pipe", "pipe"],
      });

      let output = "";
      let error = "";
      let timedOut = false;
      let settled = false;

      const finish = (result: CppExecutionResult) => {
        if (settled) {
          return;
        }

        settled = true;
        resolve(result);
      };

      const timer = setTimeout(() => {
        timedOut = true;
        child.kill();
      }, timeoutMs);

      child.stdout.on("data", (chunk: Buffer | string) => {
        output += chunk.toString();
      });

      child.stderr.on("data", (chunk: Buffer | string) => {
        error += chunk.toString();
      });

      child.on("error", (processError: Error) => {
        clearTimeout(timer);

        finish({
          output,
          error: processError.message,
          exitCode: null,
          timedOut,
        });
      });

      child.on("close", (exitCode: number | null) => {
        clearTimeout(timer);

        finish({
          output,
          error,
          exitCode,
          timedOut,
        });
      });

      if (input.length > 0) {
        child.stdin.write(input);
      }

      child.stdin.end();
    });
  }
}

export { CppExecutionService };