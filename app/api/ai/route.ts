import { NextResponse } from "next/server";
import { runAction, type AIAction } from "@/lib/ai";

export const runtime = "nodejs";

type Body = {
  action?: unknown;
  markdown?: unknown;
};

const allowed: AIAction[] = [
  "improveWriting",
  "summarize",
  "convertDocs",
  "convertBlog",
  "generateOutline",
  "insertMermaid",
];

export async function POST(req: Request) {
  let body: Body;

  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const action = typeof body.action === "string" ? body.action : "";
  const markdown = typeof body.markdown === "string" ? body.markdown : "";

  if (!allowed.includes(action as AIAction)) {
    return NextResponse.json({ error: `Invalid action: ${action}` }, { status: 400 });
  }

  if (!markdown.trim()) {
    return NextResponse.json({ error: "Markdown is required" }, { status: 400 });
  }

  try {
    const result = await runAction(action as AIAction, markdown);
    return NextResponse.json({ markdown: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("AI route error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
