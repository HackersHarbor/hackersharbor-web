
import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/navigator/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_PATTERN =
  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

export async function POST(request: NextRequest) {
  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid email address.",
        },
        { status: 400 }
      );
    }

    if (
      typeof body !== "object" ||
      body === null ||
      !("email" in body) ||
      typeof body.email !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid email address.",
        },
        { status: 400 }
      );
    }

    const email = body.email.trim().toLowerCase();

    if (
      email.length > 254 ||
      !EMAIL_PATTERN.test(email)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid email address.",
        },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
      .from("blog_newsletter_subscribers")
      .insert({ email });

    if (error?.code === "23505") {
      return NextResponse.json({
        success: true,
        alreadySubscribed: true,
        message:
          "You're already subscribed. Thanks for staying connected!",
      });
    }

    if (error) {
      console.error(
        "Newsletter subscription error:",
        error.code
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "We couldn't complete your subscription. Please try again.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      alreadySubscribed: false,
      message:
        "You're subscribed! Look out for future HackersHarbor updates.",
    });
  } catch (error) {
    console.error("Newsletter API error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Something went wrong. Please try again later.",
      },
      { status: 500 }
    );
  }
}
