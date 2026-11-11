import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/navigator/supabase-server";
import { validateNavigatorRequest } from "@/lib/navigator/navigator-validation";
import { createNavigatorErrorResponse, NavigatorException } from "@/lib/navigator/navigator-errors";

import { OpenAIProvider } from "@/services/navigator/OpenAIProvider";
import { NavigatorService } from "@/services/navigator/NavigatorService";
import { UsageLimitService } from "@/services/navigator/UsageLimitService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const usageLimitService = new UsageLimitService();

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new NavigatorException(
        "UNAUTHORIZED",
        "Please sign in to use The Navigator.",
        401
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      throw new NavigatorException(
        "INVALID_REQUEST",
        "The request body must contain valid JSON.",
        400
      );
    }

    const navigatorRequest = validateNavigatorRequest(body);

    if (!navigatorRequest) {
      throw new NavigatorException(
        "INVALID_REQUEST",
        "Your message could not be processed. Please check it and try again.",
        400
      );
    }

    // Check and consume one message before starting generation.
    await usageLimitService.consume(user.id);

    const provider = new OpenAIProvider();
    const navigatorService = new NavigatorService(provider);

    const abortController = new AbortController();

    const abortRequest = () => {
      abortController.abort();
    };

    if (request.signal.aborted) {
      abortController.abort();
    } else {
      request.signal.addEventListener(
        "abort",
        abortRequest,
        { once: true }
      );
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of navigatorService.generateResponse(
            navigatorRequest,
            abortController.signal
          )) {
            if (abortController.signal.aborted) {
              break;
            }

            controller.enqueue(encoder.encode(chunk));
          }

          if (!abortController.signal.aborted) {
            controller.close();
          }
        } catch (error) {
          if (!abortController.signal.aborted) {
            controller.error(error);
          }
        } finally {
          request.signal.removeEventListener(
            "abort",
            abortRequest
          );
        }
      },

      cancel() {
        abortController.abort();
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Content-Type-Options": "nosniff",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    const result = createNavigatorErrorResponse(error);

    return NextResponse.json(
      { error: result.error },
      {
        status: result.status,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
