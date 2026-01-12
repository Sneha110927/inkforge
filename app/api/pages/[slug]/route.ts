import { NextResponse } from "next/server";
import { readPageRaw, deletePage } from "@/lib/page";

type Ctx = {
  params: Promise<{ slug: string }>;
};

export async function GET(_: Request, ctx: Ctx) {
  const { slug } = await ctx.params;

  const markdown = await readPageRaw(slug);
  if (!markdown) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ markdown });
}

export async function DELETE(_: Request, ctx: Ctx) {
  const { slug } = await ctx.params;

  const ok = await deletePage(slug);
  if (!ok) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 400 });
  }

  return NextResponse.json({ ok: true, slug });
}
