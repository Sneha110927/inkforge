import { NextResponse } from "next/server";
import { listPages, writePage } from "@/lib/page";

type SavePagePayload = {
  slug?: unknown;
  markdown?: unknown;
};

export async function GET() {
  try {
    const pages = await listPages();
    return NextResponse.json({ pages });
  } catch {
    return NextResponse.json({ error: "Failed to list pages" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  let body: SavePagePayload;

  try {
    body = (await req.json()) as SavePagePayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  const markdown = typeof body.markdown === "string" ? body.markdown : "";

  if (!slug || !markdown) {
    return NextResponse.json(
      { error: "slug and markdown are required" },
      { status: 400 }
    );
  }

  try {
    const result = await writePage(slug, markdown);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save page";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
