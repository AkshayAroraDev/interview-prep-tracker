import { GoogleGenAI } from "@google/genai";

async function main(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing required environment variable: GEMINI_API_KEY");
  }

  // Use the SDK pager to fetch all pages of models visible to this API key.
  const ai = new GoogleGenAI({ apiKey });
  const pager = await ai.models.list();

  for await (const model of pager) {
    if (model.name) {
      // Print only model names for quick debugging output.
      console.log(model.name);
    }
  }
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});