import { buildSearchIndex } from "@/lib/searchIndex";
import { readPageRaw } from "@/lib/page";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";

export type ExportFile = { path: string; content: string };

function pageTemplate(title: string, bodyHtml: string) {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="/assets/style.css"/>
  <script type="module">
    // Optional: enable Mermaid at runtime if you include CDN
    // window.mermaid && window.mermaid.initialize({ startOnLoad: true });
  </script>
</head>
<body>
  <main class="wrap">
    ${bodyHtml}
  </main>
</body>
</html>`;
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function exportStaticSite(): Promise<ExportFile[]> {
  const index = await buildSearchIndex();
  const files: ExportFile[] = [];

  // basic CSS
  files.push({
    path: "assets/style.css",
    content: `
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial; margin:0; background:#fff; color:#111827}
.wrap{max-width:860px; margin:0 auto; padding:32px 18px}
a{color:#2563eb}
pre{background:#f3f4f6; padding:12px; border-radius:12px; overflow:auto}
code{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace}
table{width:100%; border-collapse:collapse; margin:16px 0}
th,td{border:1px solid #e5e7eb; padding:10px 12px; vertical-align:top}
th{background:#f9fafb}
`,
  });

  // Home index page
  const homeLinks = index
    .map((d) => `<li><a href="/site/${d.slug}/">${escapeHtml(d.title)}</a></li>`)
    .join("");
  files.push({
    path: "index.html",
    content: pageTemplate("Exported Site", `<h1>Exported Site</h1><ul>${homeLinks}</ul>`),
  });

  // Search index JSON for client-side use (optional)
  files.push({
    path: "search-index.json",
    content: JSON.stringify(index, null, 2),
  });

  // Render each page to HTML
  for (const doc of index) {
    const raw = await readPageRaw(doc.slug);
    if (!raw) continue;

    const { data, content } = matter(raw);
    const title = typeof data?.title === "string" ? data.title : doc.slug;

    // NOTE: Mermaid in export:
    // We'll keep mermaid code blocks as <pre><code class="language-mermaid">...</code></pre>
    // If you want diagrams rendered, you can include Mermaid CDN and initialize it.
    const html = String(
      await remark()
        .use(remarkGfm)
        .use(remarkHtml, { sanitize: false })
        .process(content)
    );

    files.push({
      path: `site/${doc.slug}/index.html`,
      content: pageTemplate(title, html),
    });
  }

  return files;
}
