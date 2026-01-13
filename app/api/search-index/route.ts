import { NextResponse } from "next/server";
import { buildSearchIndex } from "@/lib/searchIndex";

export const runtime = "nodejs";

export async function GET() {
  const index = await buildSearchIndex();
  return NextResponse.json({ index });
}
