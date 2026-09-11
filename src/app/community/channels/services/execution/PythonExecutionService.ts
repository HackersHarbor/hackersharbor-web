import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

import type {
  ExecutionRequest,
  ExecutionResult,
  IExecutionService,
} from "./ExecutionTypes";

export class PythonExecutionService implements IExecutionService {
  async execute(request: ExecutionRequest): Promise<ExecutionResult> {
    const temporaryDirectory = await fs.mkdtemp(
      path.join(os.tmpdir(), "hackersharbor-python-"),
    );

    const filePath = path.join(temporaryDirectory, "main.py");

    try {
      await fs.writeFile(filePath, request.source, "utf8");

      return await this.runPython(filePath);
    } finally {
      await fs.rm(temporaryDirectory, {
        recursive: true,
        force: true,
      });
    }
  }

  private runPython(filePath: string): Promise<ExecutionResult> {
    return new Promise((resolve) => {
      const process = spawn("python", [filePath], {
        windowsHide: true,
      });

      let stdout = "";
      let stderr = "";

      process.stdout.on("data", (chunk: Buffer | string) => {
        stdout += chunk.toString();
      });

      process.stderr.on("data", (chunk: Buffer | string) => {
        stderr += chunk.toString();
      });

      process.on("error", (error) => {
        resolve({
          output: error.message,
          exitCode: 1,
        });
      });

      process.on("close", (exitCode) => {
        const output = [stdout.trimEnd(), stderr.trimEnd()]
          .filter(Boolean)
          .join("\n");

        resolve({
          output,
          exitCode: exitCode ?? 1,
        });
      });
    });
  }
}