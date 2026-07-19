import { NextResponse } from "next/server";

import { generateResponse } from "@/lib/ai/gemini";

interface ChatRequestBody {
  message?: unknown;
}

export async function POST(request: Request): Promise<Response> {
  let body: ChatRequestBody;

  try {
    // Parse incoming JSON payload.
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // Validate input shape and ensure message is non-empty.
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!message) {
    return NextResponse.json(
      { error: "Invalid input: message must be a non-empty string." },
      { status: 400 },
    );
  }

  try {
    // Delegate LLM generation to the reusable Gemini service.
    const response = await generateResponse(message);
    return NextResponse.json({ response }, { status: 200 });
  } catch (error) {
    // Local debugging: log full error details before returning a simplified response.
    console.error(error);

    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}