import { NextResponse } from "next/server";

import { normalizeLanguage } from "@/app/community/channels/services/execution/LanguageRegistry";

import { PythonExecutionService } from "@/app/community/channels/services/execution/PythonExecutionService";
import { JavaScriptExecutionService } from "@/app/community/channels/services/execution/JavaScriptExecutionService";
import { TypeScriptExecutionService } from "@/app/community/channels/services/execution/TypeScriptExecutionService";
import { HtmlExecutionService } from "@/app/community/channels/services/execution/HtmlExecutionService";
import { CssExecutionService } from "@/app/community/channels/services/execution/CssExecutionService";
import { JsonExecutionService } from "@/app/community/channels/services/execution/JsonExecutionService";
import { SQLExecutionService } from "@/app/community/channels/services/execution/SQLExecutionService";

const services = {
  python: new PythonExecutionService(),
  javascript: new JavaScriptExecutionService(),
  typescript: new TypeScriptExecutionService(),
  html: new HtmlExecutionService(),
  css: new CssExecutionService(),
  json: new JsonExecutionService(),
  sql: new SQLExecutionService(),
};

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
        },
        { status: 400 },
      );
    }

    const language = normalizeLanguage(body.language);

    const service =
      services[language as keyof typeof services];

    if (!service) {
      return NextResponse.json(
        {
          output: `Language "${language}" is not supported yet.`,
          exitCode: 1,
          mode: "unsupported",
          error: `Unsupported language: ${language}`,
        },
        { status: 400 },
      );
    }

    const result = await service.execute({
      language,
      source: body.source,
    });

    return NextResponse.json({
      ...result,
      durationMs:
        result.durationMs ??
        Math.round(performance.now() - startedAt),
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Execution failed.";

    return NextResponse.json(
      {
        output: message,
        exitCode: 1,
        mode: "runtime",
        error: message,
        durationMs: Math.round(
          performance.now() - startedAt,
        ),
      },
      { status: 500 },
    );
  }
}