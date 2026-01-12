import { NextResponse } from "next/server";
import { readPageRaw, deletePage } from "@/lib/page";

type Ctx = {
  params: Promise<{ slug: string }>;
};

export async function GET(_: Request, ctx: Ctx) {
  const { slug } = await ctx.params;

  const raw = await readPageRaw(slug);
  if (!raw) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ markdown: raw });
}

export async function DELETE(_: Request, ctx: Ctx) {
  const { slug } = await ctx.params;

  const ok = await deletePage(slug);
  if (!ok) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
