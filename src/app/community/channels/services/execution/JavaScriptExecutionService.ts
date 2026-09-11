import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

import type {
  ExecutionRequest,
  ExecutionResult,
} from "./ExecutionTypes";

type ProcessResult = {
  output: string;
  exitCode: number;
  error?: string;
};

export class JavaScriptExecutionService {
  async execute(
    request: ExecutionRequest,
  ): Promise<ExecutionResult> {
    const startedAt = Date.now();

    const temporaryDirectory = await fs.mkdtemp(
      path.join(
        os.tmpdir(),
        "hackersharbor-javascript-",
      ),
    );

    const sourceFile = path.join(
      temporaryDirectory,
      "main.js",
    );

    try {
      await fs.writeFile(
        sourceFile,
        request.source,
        "utf8",
      );

      const result = await this.runProcess(
        process.execPath,
        [sourceFile],
      );

      const output =
        result.output.trim() ||
        result.error?.trim() ||
        "Program finished without output.";

      return {
        output,
        exitCode: result.exitCode,
        durationMs: Date.now() - startedAt,
        mode: "runtime",
        error:
          result.exitCode === 0
            ? undefined
            : result.error,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "JavaScript execution failed.";

      return {
        output: message,
        exitCode: 1,
        durationMs: Date.now() - startedAt,
        mode: "runtime",
        error: message,
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
  ): Promise<ProcessResult> {
    return new Promise((resolve) => {
      let stdout = "";
      let stderr = "";
      let finished = false;

      const finish = (result: ProcessResult) => {
        if (finished) {
          return;
        }

        finished = true;
        clearTimeout(timeout);
        resolve(result);
      };

      const child = spawn(command, args, {
        cwd: process.cwd(),
        shell: false,
        windowsHide: true,
        stdio: ["ignore", "pipe", "pipe"],
      });

      const timeout = setTimeout(() => {
        child.kill();

        finish({
          output: stdout,
          exitCode: 1,
          error: "Execution timed out after 15 seconds.",
        });
      }, 15_000);

      child.stdout?.on("data", (chunk: Buffer) => {
        stdout += chunk.toString();
      });

      child.stderr?.on("data", (chunk: Buffer) => {
        stderr += chunk.toString();
      });

      child.on("error", (error) => {
        finish({
          output: stdout,
          exitCode: 1,
          error: error.message,
        });
      });

      child.on("close", (code) => {
        const combinedOutput = [
          stdout.trim(),
          stderr.trim(),
        ]
          .filter(Boolean)
          .join("\n");

        finish({
          output: combinedOutput,
          exitCode: code ?? 1,
          error:
            code === 0
              ? undefined
              : combinedOutput ||
                `Process exited with code ${code ?? 1}`,
        });
      });
    });
  }
}