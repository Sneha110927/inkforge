import { listPages, readPageRaw } from "@/lib/page";
import matter from "gray-matter";

export type SearchDoc = {
  slug: string;
  title: string;
  description?: string;
  theme: "docs" | "blog";
  tags: string[];
  date?: string;
  text: string;
};

function normalizeText(s: string) {
  return s.replace(/\s+/g, " ").trim();
}

export async function buildSearchIndex(): Promise<SearchDoc[]> {
  const pages = await listPages();
  const docs: SearchDoc[] = [];

  for (const p of pages) {
    const raw = await readPageRaw(p.slug);
    if (!raw) continue;

    const { data, content } = matter(raw);

    const title = typeof data?.title === "string" ? data.title : p.slug;
    const description = typeof data?.description === "string" ? data.description : undefined;
    const theme = data?.theme === "blog" ? "blog" : "docs";
    const tags = Array.isArray(data?.tags) ? data.tags.filter((t: unknown) => typeof t === "string") : [];
    const date = typeof data?.date === "string" ? data.date : undefined;

    // Basic text for search (strip markdown symbols lightly)
    const text = normalizeText(
      content
        .replace(/```[\s\S]*?```/g, " ")
        .replace(/[#>*_\-\[\]\(\)`]/g, " ")
    );

    docs.push({
      slug: p.slug,
      title,
      description,
      theme,
      tags,
      date,
      text,
    });
  }

  return docs;
}
