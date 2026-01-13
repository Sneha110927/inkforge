/**
 * Convert to Docs:
 * - Ensures theme: docs in frontmatter
 * - Ensures a single H1 exists (creates if missing using title)
 * - Inserts "## Table of Contents" (for remark-toc to fill)
 * - Numbers H2 sections (## 1. ..., ## 2. ...)
 */
export function convertDocs(markdown: string): string {
  let s = normalizeNewlines(markdown);

  s = ensureFrontmatterTheme(s, "docs");

  const title = extractFrontmatterField(s, "title") ?? extractFirstH1(s) ?? "Documentation";
  s = ensureSingleH1(s, title);

  s = ensureTocHeading(s);

  s = numberH2Headings(s);

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
  const { block, body, restStart } = fm;

  const hasTheme = /^\s*theme:\s*(docs|blog)\s*$/m.test(body);
  const newBody = hasTheme
    ? body.replace(/^\s*theme:\s*(docs|blog)\s*$/m, `theme: ${theme}`)
    : `theme: ${theme}\n${body}`;

  return `---\n${newBody.trimEnd()}\n---\n${md.slice(restStart)}`;
}

function getFrontmatter(md: string): { block: string; body: string; restStart: number } | null {
  if (!md.startsWith("---\n")) return null;
  const end = md.indexOf("\n---\n", 4);
  if (end === -1) return null;
  const body = md.slice(4, end);
  const restStart = end + "\n---\n".length;
  return { block: md.slice(0, restStart), body, restStart };
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

  // Add H1 after frontmatter if present, else at top
  const fm = getFrontmatter(s);
  if (fm) {
    return `${s.slice(0, fm.restStart)}\n# ${title}\n\n${s.slice(fm.restStart).trimStart()}`;
  }
  return `# ${title}\n\n${s.trimStart()}`;
}

function ensureTocHeading(md: string): string {
  // If already contains "## Table of Contents", do nothing
  if (/^##\s+Table of Contents\s*$/m.test(md)) return md;

  // Insert after H1 block
  const lines = md.split("\n");
  const h1Index = lines.findIndex((l) => /^#\s+/.test(l));
  if (h1Index === -1) return `## Table of Contents\n\n${md}`;

  let i = h1Index + 1;
  while (i < lines.length && lines[i].trim() === "") i++;

  const insert = ["## Table of Contents", ""].join("\n");
  const out = [...lines.slice(0, i), insert, ...lines.slice(i)].join("\n");
  return out;
}

function numberH2Headings(md: string): string {
  const lines = md.split("\n");
  let n = 1;

  return lines
    .map((l) => {
      if (!/^##\s+/.test(l)) return l;

      const text = l.replace(/^##\s+/, "").trim();
      // If already numbered, keep
      if (/^\d+(\.\d+)?\s+/.test(text)) return l;

      const numbered = `## ${n}. ${text}`;
      n++;
      return numbered;
    })
    .join("\n");
}
