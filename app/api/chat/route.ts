import { NextResponse } from "next/server";

import { generateResponse } from "@/lib/ai/gemini";
import { buildPrompt } from "@/lib/ai/prompts";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { TrackerState } from "@/types";

interface ChatRequestBody {
  message?: unknown;
}

export async function POST(request: Request): Promise<Response> {
  // Create a request-scoped Supabase server client for secure auth checks.
  const supabase = await createServerSupabaseClient();

  // Resolve the currently authenticated user from Supabase auth cookies.
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // Authenticate first so business logic runs only for signed-in users.
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Load the authenticated user's persisted tracker state row.
  const { data: userState, error: userStateError } = await supabase
    .from("user_state")
    .select("id, user_id, state_json, created_at, updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (userStateError) {
    console.error(userStateError);
    return NextResponse.json({ error: "Failed to load user state." }, { status: 500 });
  }

  if (!userState) {
    return NextResponse.json({ error: "User state not found." }, { status: 404 });
  }

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
    const prompt = buildPrompt(userState.state_json as TrackerState, message);

    // Delegate LLM generation to the reusable Gemini service.
    const response = await generateResponse(prompt);
    return NextResponse.json({ response }, { status: 200 });
  } catch (error) {
    // Local debugging: log full error details before returning a simplified response.
    console.error(error);

    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}