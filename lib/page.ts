import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

export type PageMeta = {
  slug: string;
  title?: string;
  description?: string;
};

const CONTENT_DIR = path.join(process.cwd(), "content");

/* ---------------- LIST PAGES (used by Studio & Home) ---------------- */

export async function listPages(): Promise<PageMeta[]> {
  try {
    const files = await fs.readdir(CONTENT_DIR);
    const mdFiles = files.filter((f) => f.endsWith(".md"));

    const pages = await Promise.all(
      mdFiles.map(async (file) => {
        const slug = file.replace(/\.md$/, "");
        const raw = await fs.readFile(path.join(CONTENT_DIR, file), "utf8");
        const { data } = matter(raw);

        return {
          slug,
          title: typeof data?.title === "string" ? data.title : slug,
          description:
            typeof data?.description === "string" ? data.description : undefined,
        };
      })
    );

    pages.sort((a, b) =>
      (a.title ?? a.slug).localeCompare(b.title ?? b.slug)
    );

    return pages;
  } catch {
    return [];
  }
}

/* ---------------- RAW MARKDOWN (used by Editor) ---------------- */

export async function readPageRaw(slug: unknown): Promise<string | null> {
  if (typeof slug !== "string") return null;

  const safeSlug = slug.replace(/[^a-zA-Z0-9-_]/g, "");
  if (!safeSlug) return null;

  try {
    return await fs.readFile(
      path.join(CONTENT_DIR, `${safeSlug}.md`),
      "utf8"
    );
  } catch {
    return null;
  }
}

/* ---------------- PARSED MARKDOWN (used by /site) ---------------- */

export async function readPageParsed(slug: unknown) {
  if (typeof slug !== "string") return null;

  const safeSlug = slug.replace(/[^a-zA-Z0-9-_]/g, "");
  if (!safeSlug) return null;

  try {
    const raw = await fs.readFile(
      path.join(CONTENT_DIR, `${safeSlug}.md`),
      "utf8"
    );
    const { data, content } = matter(raw);

    return {
      meta: {
        slug: safeSlug,
        title: typeof data?.title === "string" ? data.title : safeSlug,
        description:
          typeof data?.description === "string"
            ? data.description
            : undefined,
      },
      content,
    };
  } catch {
    return null;
  }
}

/* ---------------- WRITE PAGE ---------------- */

export async function writePage(slug: string, rawMarkdown: string) {
  const safeSlug = slug.replace(/[^a-zA-Z0-9-_]/g, "");
  if (!safeSlug) throw new Error("Invalid slug.");

  await fs.mkdir(CONTENT_DIR, { recursive: true });
  await fs.writeFile(
    path.join(CONTENT_DIR, `${safeSlug}.md`),
    rawMarkdown,
    "utf8"
  );

  return { slug: safeSlug };
}

export async function deletePage(slug: unknown): Promise<boolean> {
  if (typeof slug !== "string") return false;

  const safeSlug = slug.replace(/[^a-zA-Z0-9-_]/g, "");
  if (!safeSlug) return false;

  const filePath = path.join(CONTENT_DIR, `${safeSlug}.md`);

  try {
    await fs.unlink(filePath);
    return true;
  } catch {
    return false;
  }
}
