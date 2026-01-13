import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

export type ThemeType = "docs" | "blog";

export type PageMeta = {
  slug: string;
  title?: string;
  description?: string;
  theme?: ThemeType;
  tags?: string[];
  date?: string;
};

const CONTENT_DIR = path.join(process.cwd(), "content");

export async function listPages(): Promise<PageMeta[]> {
  try {
    const files = await fs.readdir(CONTENT_DIR);
    const mdFiles = files.filter((f) => f.endsWith(".md"));

    const pages = await Promise.all(
      mdFiles.map(async (file) => {
        const slug = file.replace(/\.md$/, "");
        const raw = await fs.readFile(path.join(CONTENT_DIR, file), "utf8");
        const { data } = matter(raw);

        const theme: ThemeType = data?.theme === "blog" ? "blog" : "docs";
        const tags = Array.isArray(data?.tags)
          ? data.tags.filter((t: unknown): t is string => typeof t === "string")
          : [];

        return {
          slug,
          title: typeof data?.title === "string" ? data.title : slug,
          description: typeof data?.description === "string" ? data.description : undefined,
          theme,
          tags,
          date: typeof data?.date === "string" ? data.date : undefined,
        };
      })
    );

    pages.sort((a, b) => (a.title ?? a.slug).localeCompare(b.title ?? b.slug));
    return pages;
  } catch {
    return [];
  }
}

export async function readPageRaw(slug: unknown): Promise<string | null> {
  if (typeof slug !== "string") return null;

  const safeSlug = slug.replace(/[^a-zA-Z0-9-_]/g, "");
  if (!safeSlug) return null;

  const filePath = path.join(CONTENT_DIR, `${safeSlug}.md`);
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return null;
  }
}

export async function readPageParsed(
  slug: unknown
): Promise<{ meta: PageMeta; content: string } | null> {
  if (typeof slug !== "string") return null;

  const safeSlug = slug.replace(/[^a-zA-Z0-9-_]/g, "");
  if (!safeSlug) return null;

  const filePath = path.join(CONTENT_DIR, `${safeSlug}.md`);
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const { data, content } = matter(raw);

    const theme: ThemeType = data?.theme === "blog" ? "blog" : "docs";
    const tags = Array.isArray(data?.tags)
      ? data.tags.filter((t: unknown): t is string => typeof t === "string")
      : [];

    return {
      meta: {
        slug: safeSlug,
        title: typeof data?.title === "string" ? data.title : safeSlug,
        description: typeof data?.description === "string" ? data.description : undefined,
        theme,
        tags,
        date: typeof data?.date === "string" ? data.date : undefined,
      },
      content,
    };
  } catch {
    return null;
  }
}

export async function writePage(slug: string, rawMarkdown: string) {
  const safeSlug = slug.replace(/[^a-zA-Z0-9-_]/g, "");
  if (!safeSlug) throw new Error("Invalid slug.");

  await fs.mkdir(CONTENT_DIR, { recursive: true });
  const filePath = path.join(CONTENT_DIR, `${safeSlug}.md`);
  await fs.writeFile(filePath, rawMarkdown, "utf8");

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
