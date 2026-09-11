import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
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

export class TypeScriptExecutionService {
  async execute(
    request: ExecutionRequest,
  ): Promise<ExecutionResult> {
    const startedAt = Date.now();

    const temporaryDirectory = await fs.mkdtemp(
      path.join(
        os.tmpdir(),
        "hackersharbor-typescript-",
      ),
    );

    const sourceFile = path.join(
      temporaryDirectory,
      "main.ts",
    );

    const configFile = path.join(
      temporaryDirectory,
      "tsconfig.json",
    );

    try {
      await fs.writeFile(
        sourceFile,
        request.source,
        "utf8",
      );

      await fs.writeFile(
        configFile,
        JSON.stringify(
          {
            compilerOptions: {
              target: "ES2020",
              module: "CommonJS",
              strict: true,
              esModuleInterop: true,
              skipLibCheck: true,
              noEmit: true,
              types: [],
            },
            include: ["main.ts"],
          },
          null,
          2,
        ),
        "utf8",
      );

      const typescriptCompiler = path.join(
        process.cwd(),
        "node_modules",
        "typescript",
        "bin",
        "tsc",
      );

      if (!existsSync(typescriptCompiler)) {
        throw new Error(
          "TypeScript compiler was not found. Run npm install.",
        );
      }

      const typeCheckResult = await this.runProcess(
        process.execPath,
        [
          typescriptCompiler,
          "--project",
          configFile,
          "--pretty",
          "false",
        ],
      );

      if (typeCheckResult.exitCode !== 0) {
        const typeError =
          typeCheckResult.output ||
          typeCheckResult.error ||
          "TypeScript type checking failed.";

        return {
          output: typeError.trim(),
          exitCode: typeCheckResult.exitCode,
          durationMs: Date.now() - startedAt,
          mode: "runtime",
          error: typeError.trim(),
        };
      }

      const tsxCliCandidates = [
        path.join(
          process.cwd(),
          "node_modules",
          "tsx",
          "dist",
          "cli.mjs",
        ),
        path.join(
          process.cwd(),
          "node_modules",
          "tsx",
          "dist",
          "cli.js",
        ),
      ];

      const tsxCli = tsxCliCandidates.find((filePath) =>
        existsSync(filePath),
      );

      if (!tsxCli) {
        throw new Error(
          "tsx runner was not found. Run npm install.",
        );
      }

      const executionResult = await this.runProcess(
        process.execPath,
        [tsxCli, sourceFile],
      );

      const output =
        executionResult.output.trim() ||
        executionResult.error?.trim() ||
        "Program finished without output.";

      return {
        output,
        exitCode: executionResult.exitCode,
        durationMs: Date.now() - startedAt,
        mode: "runtime",
        error:
          executionResult.exitCode === 0
            ? undefined
            : executionResult.error,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "TypeScript execution failed.";

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

      const child = spawn(command, args, {
        cwd: process.cwd(),
        shell: false,
        windowsHide: true,
        stdio: ["ignore", "pipe", "pipe"],
      });

      const finish = (result: ProcessResult) => {
        if (finished) {
          return;
        }

        finished = true;
        clearTimeout(timeout);
        resolve(result);
      };

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