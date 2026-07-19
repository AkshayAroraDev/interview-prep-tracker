import { GoogleGenAI } from "@google/genai";

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing required environment variable: GEMINI_API_KEY");
  }

  if (!client) {
    client = new GoogleGenAI({ apiKey });
  }

  return client;
}

export async function generateResponse(prompt: string): Promise<string> {
  const input = prompt.trim();

  if (!input) {
    throw new Error("Prompt must be a non-empty string.");
  }

  try {
    const response = await getClient().models.generateContent({
      model: process.env.GEMINI_MODEL!,
      contents: input,
      // Keep responses concise and cost-efficient for phase-1 connectivity checks.
      config: {
        temperature: Number(process.env.GEMINI_TEMPERATURE ?? "0.1"),
        maxOutputTokens: Number(process.env.GEMINI_MAX_OUTPUT_TOKENS ?? "256"),
      },
    });

    const text = response.text?.trim();

    if (!text) {
      throw new Error("Gemini returned an empty response.");
    }

    return text;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Gemini error";
    throw new Error(`Failed to generate Gemini response: ${message}`);
  }
}