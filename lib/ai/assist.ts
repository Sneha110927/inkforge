import { AssistMode, AssistTheme, buildInstruction } from "./prompts";

type AssistRequest = {
  mode: AssistMode;
  theme: AssistTheme;
  markdown: string;
};

type AssistResult = {
  markdown: string;
};

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

/**
 * Calls OpenAI Responses API and returns markdown text.
 */
export async function runAssist(req: AssistRequest): Promise<AssistResult> {
  const apiKey = requireEnv("OPENAI_API_KEY");
  const model = process.env.OPENAI_MODEL || "gpt-5-mini";

  const instructions = buildInstruction(req.mode, req.theme);

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      instructions,
      input: req.markdown,
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`OpenAI error ${response.status}: ${errText}`);
  }

  const data: unknown = await response.json();

  // Responses API typically includes an `output_text` convenience field in many SDKs/docs.
  // For REST, we defensively extract text from common shapes.
  const outputText =
    typeof (data as { output_text?: unknown }).output_text === "string"
      ? (data as { output_text: string }).output_text
      : extractTextFromOutputItems(data);

  const markdown = (outputText || "").trim();
  if (!markdown) throw new Error("AI returned empty output.");

  return { markdown };
}

function extractTextFromOutputItems(data: unknown): string {
  // Best-effort extraction from `output` items when `output_text` is not present.
  const output = (data as { output?: unknown }).output;
  if (!Array.isArray(output)) return "";

  const parts: string[] = [];

  for (const item of output) {
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) continue;

    for (const c of content) {
      const text = (c as { text?: unknown }).text;
      if (typeof text === "string") parts.push(text);
      const value = (c as { value?: unknown }).value;
      if (typeof value === "string") parts.push(value);
    }
  }

  return parts.join("\n").trim();
}
