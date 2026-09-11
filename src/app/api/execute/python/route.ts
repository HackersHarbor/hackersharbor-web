import { NextResponse } from "next/server";

import { normalizeLanguage } from "@/app/community/channels/services/execution/LanguageRegistry";
import { PythonExecutionService } from "@/app/community/channels/services/execution/PythonExecutionService";
import { JavaScriptExecutionService } from "@/app/community/channels/services/execution/JavaScriptExecutionService";
import { TypeScriptExecutionService } from "@/app/community/channels/services/execution/TypeScriptExecutionService";
import { HtmlExecutionService } from "@/app/community/channels/services/execution/HtmlExecutionService";
import { CssExecutionService } from "@/app/community/channels/services/execution/CssExecutionService";
import { JsonExecutionService } from "@/app/community/channels/services/execution/JsonExecutionService";
import { SqlExecutionService } from "@/app/community/channels/services/execution/SqlExecutionService";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("[execute] request:", {
      language: body?.language,
      sourceLength: body?.source?.length,
    });

    if (
      !body ||
      typeof body.language !== "string" ||
      typeof body.source !== "string" ||
      body.source.trim().length === 0
    ) {
      return NextResponse.json(
        {
          output: "Language and source code are required.",
          exitCode: 1,
          mode: "unsupported",
        },
        { status: 400 },
      );
    }

    const language = normalizeLanguage(body.language);

    console.log("[execute] normalized language:", language);

    const services = {
      python: new PythonExecutionService(),
      javascript: new JavaScriptExecutionService(),
      typescript: new TypeScriptExecutionService(),
      html: new HtmlExecutionService(),
      css: new CssExecutionService(),
      json: new JsonExecutionService(),
      sql: new SqlExecutionService(),
    };

    const service =
      services[language as keyof typeof services];

    if (!service) {
      return NextResponse.json(
        {
          output: `Language "${language}" is not supported yet.`,
          exitCode: 1,
          mode: "unsupported",
        },
        { status: 400 },
      );
    }

    console.log("[execute] selected service:", language);

    const result = await service.execute({
      language,
      source: body.source,
    });

    console.log("[execute] result:", result);

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    console.error("[execute] error:", error);

    return NextResponse.json(
      {
        output: message,
        exitCode: 1,
        mode: "runtime",
        error: message,
      },
      { status: 500 },
    );
  }
}