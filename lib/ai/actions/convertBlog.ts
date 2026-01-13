/**
 * Convert to Blog:
 * - Ensures theme: blog in frontmatter
 * - Ensures a date field exists (YYYY-MM-DD) if missing
 * - Adds a short “hook” paragraph if the post starts abruptly
 */
export function convertBlog(markdown: string): string {
  let s = normalizeNewlines(markdown);

  s = ensureFrontmatterTheme(s, "blog");
  s = ensureDate(s);

  // If no H1, create it from title
  const title = extractFrontmatterField(s, "title") ?? extractFirstH1(s) ?? "New Post";
  s = ensureSingleH1(s, title);

  // Add a hook if first paragraph is missing
  s = ensureHookParagraph(s);

  return s.trim() + "\n";
}

function normalizeNewlines(md: string) {
  return md.replace(/\r\n/g, "\n");
}

type Theme = "docs" | "blog";

function ensureFrontmatterTheme(md: string, theme: Theme): string {
  const fm = getFrontmatter(md);
  if (!fm) {
    return `---\ntheme: ${theme}\n---\n\n${md}`;
  }
  const { body, restStart } = fm;

  const hasTheme = /^\s*theme:\s*(docs|blog)\s*$/m.test(body);
  const newBody = hasTheme
    ? body.replace(/^\s*theme:\s*(docs|blog)\s*$/m, `theme: ${theme}`)
    : `theme: ${theme}\n${body}`;

  return `---\n${newBody.trimEnd()}\n---\n${md.slice(restStart)}`;
}

function ensureDate(md: string): string {
  const fm = getFrontmatter(md);
  const today = new Date();
  const yyyy = String(today.getFullYear());
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const date = `${yyyy}-${mm}-${dd}`;

  if (!fm) return `---\ndate: ${date}\n---\n\n${md}`;

  const hasDate = /^\s*date:\s*.+\s*$/m.test(fm.body);
  if (hasDate) return md;

  const newBody = `date: ${date}\n${fm.body}`;
  return `---\n${newBody.trimEnd()}\n---\n${md.slice(fm.restStart)}`;
}

function getFrontmatter(md: string): { body: string; restStart: number } | null {
  if (!md.startsWith("---\n")) return null;
  const end = md.indexOf("\n---\n", 4);
  if (end === -1) return null;
  const body = md.slice(4, end);
  const restStart = end + "\n---\n".length;
  return { body, restStart };
}

function extractFrontmatterField(md: string, key: string): string | null {
  const fm = getFrontmatter(md);
  if (!fm) return null;
  const re = new RegExp(`^\\s*${escapeRegExp(key)}:\\s*(.+)\\s*$`, "m");
  const m = fm.body.match(re);
  if (!m) return null;
  return stripQuotes(m[1].trim());
}

function stripQuotes(s: string): string {
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  return s;
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractFirstH1(md: string): string | null {
  const m = md.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : null;
}

function ensureSingleH1(md: string, title: string): string {
  let s = md;

  // Remove all H1 lines
  const lines = s.split("\n");
  const filtered = lines.filter((l) => !/^#\s+/.test(l));
  s = filtered.join("\n");

  const fm = getFrontmatter(s);
  if (fm) {
    return `${s.slice(0, fm.restStart)}\n# ${title}\n\n${s.slice(fm.restStart).trimStart()}`;
  }
  return `# ${title}\n\n${s.trimStart()}`;
}

function ensureHookParagraph(md: string): string {
  const lines = md.split("\n");
  const h1Index = lines.findIndex((l) => /^#\s+/.test(l));
  if (h1Index === -1) return md;

  let i = h1Index + 1;
  while (i < lines.length && lines[i].trim() === "") i++;

  // If next line is another heading, insert a hook paragraph
  if (i < lines.length && /^##\s+/.test(lines[i])) {
    const hook = "A quick post to explain what’s going on, why it matters, and how you can use it.\n";
    const out = [...lines.slice(0, i), hook, ...lines.slice(i)].join("\n");
    return out;
  }

  return md;
}
