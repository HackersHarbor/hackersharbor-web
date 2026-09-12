import { NextResponse } from "next/server";

import {
  normalizeLanguage,
  type SupportedLanguage,
} from "@/app/community/channels/services/execution/LanguageRegistry";

import { PythonExecutionService } from "@/app/community/channels/services/execution/PythonExecutionService";
import { JavaScriptExecutionService } from "@/app/community/channels/services/execution/JavaScriptExecutionService";
import { TypeScriptExecutionService } from "@/app/community/channels/services/execution/TypeScriptExecutionService";
import { HtmlExecutionService } from "@/app/community/channels/services/execution/HtmlExecutionService";
import { CssExecutionService } from "@/app/community/channels/services/execution/CssExecutionService";
import { JsonExecutionService } from "@/app/community/channels/services/execution/JsonExecutionService";
import { SQLExecutionService } from "@/app/community/channels/services/execution/SQLExecutionService";
import { JavaExecutionService } from "@/app/community/channels/services/execution/JavaExecutionService";
import { CExecutionService } from "@/app/community/channels/services/execution/CExecutionService";
import { CppExecutionService } from "@/app/community/channels/services/execution/CppExecutionService";

const services = {
  python: new PythonExecutionService(),
  javascript: new JavaScriptExecutionService(),
  typescript: new TypeScriptExecutionService(),
  html: new HtmlExecutionService(),
  css: new CssExecutionService(),
  json: new JsonExecutionService(),
  sql: new SQLExecutionService(),
  java: new JavaExecutionService(),
  c: new CExecutionService(),
  cpp: new CppExecutionService(),
} satisfies Record<SupportedLanguage, unknown>;

export async function POST(request: Request) {
  const startedAt = performance.now();

  try {
    const body = await request.json();

    if (
      !body ||
      typeof body.language !== "string" ||
      typeof body.source !== "string"
    ) {
      return NextResponse.json(
        {
          output: "Language and source code are required.",
          exitCode: 1,
          mode: "unsupported",
          error: "Invalid execution request.",
          durationMs: Math.round(performance.now() - startedAt),
        },
        { status: 400 },
      );
    }

    if (body.source.trim().length === 0) {
      return NextResponse.json(
        {
          output: "Please enter some code before running.",
          exitCode: 1,
          mode: "unsupported",
          error: "Source code is empty.",
          durationMs: Math.round(performance.now() - startedAt),
        },
        { status: 400 },
      );
    }

    const language = normalizeLanguage(body.language) as SupportedLanguage;
    const service = services[language];

    if (!service) {
      return NextResponse.json(
        {
          output: `Language "${language}" is not supported yet.`,
          exitCode: 1,
          mode: "unsupported",
          error: `Unsupported language: ${language}`,
          durationMs: Math.round(performance.now() - startedAt),
        },
        { status: 400 },
      );
    }

    /*
     * DuckDB-WASM runs in the browser.
     * SQL is handled by SQLExecutionService on the client.
     */

    if (language === "sql") {
      return NextResponse.json({
        output: "",
        exitCode: 0,
        mode: "client",
        error: null,
        durationMs: Math.round(performance.now() - startedAt),
        requiresClientExecution: true,
      });
    }

    let result: {
      output?: string;
      exitCode?: number | null;
      mode?: string;
      error?: string | null;
      previewHtml?: string;
      durationMs?: number;
      timedOut?: boolean;
    };

    /*
     * CppExecutionService uses an object argument:
     *
     * execute({
     *   code,
     *   input,
     *   timeoutMs
     * })
     *
     * The other execution services use:
     *
     * execute(language, source)
     */

     if (language === "cpp") {
      const cppService = service as CppExecutionService;
    
      const cppResult = await cppService.execute({
        code: body.source,
        input: typeof body.input === "string" ? body.input : "",
      });
    
      console.log("C++ execution result:", cppResult);
    
      result = {
        output: cppResult.output ?? "",
        exitCode: cppResult.exitCode ?? 1,
        mode: cppResult.timedOut ? "timeout" : "runtime",
        error: cppResult.error || null,
        timedOut: cppResult.timedOut,
      };
    } else {
      result = await (
        service as {
          execute: (
            language: SupportedLanguage,
            source: string,
          ) => Promise<{
            output?: string;
            exitCode?: number;
            mode?: string;
            error?: string | null;
            previewHtml?: string;
            durationMs?: number;
          }>;
        }
      ).execute(language, body.source);
    }

    return NextResponse.json({
      ...result,
      durationMs:
        result.durationMs ??
        Math.round(performance.now() - startedAt),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Execution failed.";

    return NextResponse.json(
      {
        output: message,
        exitCode: 1,
        mode: "runtime",
        error: message,
        durationMs: Math.round(performance.now() - startedAt),
      },
      { status: 500 },
    );
  }
}