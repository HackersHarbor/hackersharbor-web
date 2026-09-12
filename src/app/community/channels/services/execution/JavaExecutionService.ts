import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export class JavaExecutionService {
  async execute(
    _language: string,
    source: string,
  ) {
    const temporaryDirectory = await fs.mkdtemp(
      path.join(os.tmpdir(), "harbor-java-"),
    );

    const sourcePath = path.join(
      temporaryDirectory,
      "Main.java",
    );

    try {
      await fs.writeFile(sourcePath, source, "utf8");

      await execFileAsync(
        "javac",
        ["Main.java"],
        {
          cwd: temporaryDirectory,
          timeout: 15000,
        },
      );

      const result = await execFileAsync(
        "java",
        ["Main"],
        {
          cwd: temporaryDirectory,
          timeout: 15000,
        },
      );

      return {
        output: result.stdout.trim(),
        exitCode: 0,
        mode: "runtime",
        error: null,
      };
    } catch (error) {
      const executionError = error as {
        stdout?: string;
        stderr?: string;
        message?: string;
      };

      return {
        output:
          executionError.stdout?.trim() ||
          executionError.stderr?.trim() ||
          executionError.message ||
          "Java execution failed.",
        exitCode: 1,
        mode: "runtime",
        error:
          executionError.stderr?.trim() ||
          executionError.message ||
          "Java execution failed.",
      };
    } finally {
      await fs.rm(temporaryDirectory, {
        recursive: true,
        force: true,
      });
    }
  }
}