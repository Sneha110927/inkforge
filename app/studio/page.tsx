"use client";
import AIAssistButton from "@/app/components/AIAssistButton";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { FiTrash2 } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkToc from "remark-toc";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import MermaidBlock from "./Mermaid";

const MarkdownMonaco = dynamic(() => import("./MarkdownMonaco"), {
  ssr: false,
});

type ThemeType = "docs" | "blog";
type PageItem = {
  slug: string;
  title?: string;
  description?: string;
  theme?: ThemeType;
  tags?: string[];
  date?: string;
};

const STARTER_MD = `---
title: Getting Started
description: A page generated from markdown
theme: docs
tags: [docs, onboarding]
---

# Getting Started

Welcome to the Markdown Site Generator!

## Try it out

Edit this text and click **Save**.
`;

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");
}

function normalizeNewlines(md: string) {
  return md.replace(/\r\n/g, "\n");
}

/** Remove YAML frontmatter from preview/published body */
function stripFrontmatter(md: string) {
  const s = normalizeNewlines(md);
  if (!s.startsWith("---\n")) return s;

  const end = s.indexOf("\n---\n", 4);
  if (end === -1) return s;

  return s.slice(end + "\n---\n".length);
}

/** Fix indented fences so markdown doesn't break */
function fixIndentedFences(md: string) {
  return md.replace(/^\s+```/gm, "```");
}

/** If a code fence is accidentally left open, auto close it to avoid preview becoming one huge code block */
function autoCloseFences(md: string) {
  const s = normalizeNewlines(md);
  const count = s.match(/^```/gm)?.length ?? 0;
  return count % 2 === 1 ? `${s}\n\n\`\`\`\n` : s;
}

function getThemeFromMarkdown(md: string): ThemeType {
  const s = normalizeNewlines(md);
  const fm = s.match(/^---\n([\s\S]*?)\n---\n/);
  if (!fm) return "docs";
  return /^\s*theme:\s*blog\s*$/m.test(fm[1]) ? "blog" : "docs";
}

function setThemeInMarkdown(md: string, theme: ThemeType) {
  const s = normalizeNewlines(md);

  if (!s.startsWith("---\n")) {
    return `---\ntheme: ${theme}\n---\n\n${s}`;
  }

  const fm = s.match(/^---\n([\s\S]*?)\n---\n/);
  if (!fm) return s;

  const body = fm[1];

  const newBody = /^\s*theme:\s*(docs|blog)\s*$/m.test(body)
    ? body.replace(/^\s*theme:\s*(docs|blog)\s*$/m, `theme: ${theme}`)
    : `theme: ${theme}\n${body}`;

  return s.replace(/^---\n([\s\S]*?)\n---\n/, `---\n${newBody}\n---\n`);
}

export default function StudioPage() {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [slugInput, setSlugInput] = useState<string>("");
  const [markdown, setMarkdown] = useState<string>(STARTER_MD);
  const [status, setStatus] = useState<string>("");
  const [theme, setTheme] = useState<ThemeType>("docs");

  // ✅ Rich preview: frontmatter removed + fence fixes
  const preview = useMemo(() => {
    const withoutFrontmatter = stripFrontmatter(markdown);
    const fixedIndent = fixIndentedFences(withoutFrontmatter);
    return autoCloseFences(fixedIndent);
  }, [markdown]);

  async function refreshPages() {
    const res = await fetch("/api/pages", { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    const list: PageItem[] = data.pages ?? [];
    setPages(list);
    return list;
  }

  async function loadPage(slug: string) {
    setStatus("Loading...");
    const res = await fetch(`/api/pages/${slug}`, { cache: "no-store" });

    if (!res.ok) {
      setStatus("New page. Write content and Save.");
      setMarkdown(STARTER_MD);
      setTheme(getThemeFromMarkdown(STARTER_MD));
      return;
    }

    const data = await res.json().catch(() => null);
    const md = typeof data?.markdown === "string" ? data.markdown : STARTER_MD;
    setMarkdown(md);
    setTheme(getThemeFromMarkdown(md));
    setStatus("");
  }

  async function ensureFirstPage() {
    const list = await refreshPages();
    if (list.length > 0) {
      const first = list[0].slug;
      setSelectedSlug(first);
      setSlugInput(first);
      await loadPage(first);
      return;
    }

    const defaultSlug = "getting-started";
    await fetch("/api/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: defaultSlug, markdown: STARTER_MD }),
    });

    const list2 = await refreshPages();
    const first2 = list2?.[0]?.slug ?? defaultSlug;
    setSelectedSlug(first2);
    setSlugInput(first2);
    await loadPage(first2);
  }

  useEffect(() => {
    ensureFirstPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setTheme(getThemeFromMarkdown(markdown));
  }, [markdown]);

  async function onSelect(slug: string) {
    setSelectedSlug(slug);
    setSlugInput(slug);
    await loadPage(slug);
  }

  async function onCreateNew() {
    const base = "new-page";
    const existing = new Set(pages.map((p) => p.slug));
    let candidate = base;
    let i = 2;
    while (existing.has(candidate)) candidate = `${base}-${i++}`;

    const fresh = `---
title: New Page
description: Created from Studio
theme: docs
tags: [docs]
---

# New Page

Start writing...
`;

    setSelectedSlug(candidate);
    setSlugInput(candidate);
    setMarkdown(fresh);
    setTheme("docs");
    setStatus("New page. Write content and Save.");
  }

  function onThemeChange(next: ThemeType) {
    setTheme(next);
    setMarkdown((prev) => setThemeInMarkdown(prev, next));
  }

  async function onSave() {
    const safeSlug = slugify(slugInput);
    if (!safeSlug) {
      setStatus("Invalid slug.");
      return;
    }

    setStatus("Saving...");
    const res = await fetch("/api/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: safeSlug, markdown }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setStatus(
        typeof data?.error === "string" ? data.error : "Failed to save"
      );
      return;
    }

    setSelectedSlug(data.slug);
    setSlugInput(data.slug);
    await refreshPages();

    setStatus("Saved ✅");
    setTimeout(() => setStatus(""), 800);
  }

  async function onDelete(slug: string) {
    const ok = window.confirm(`Delete "${slug}"?\nThis cannot be undone.`);
    if (!ok) return;

    setStatus("Deleting...");
    const res = await fetch(`/api/pages/${slug}`, { method: "DELETE" });

    if (!res.ok) {
      setStatus("Failed to delete");
      return;
    }

    const updated = pages.filter((p) => p.slug !== slug);
    setPages(updated);

    if (slug === selectedSlug) {
      if (updated.length > 0) {
        const next = updated[0].slug;
        setSelectedSlug(next);
        setSlugInput(next);
        await loadPage(next);
      } else {
        setSelectedSlug("");
        setSlugInput("");
        setMarkdown(STARTER_MD);
        setTheme(getThemeFromMarkdown(STARTER_MD));
      }
    }

    setStatus("Deleted 🗑️");
    setTimeout(() => setStatus(""), 800);

    await refreshPages();
  }

  return (
    <div className="studioShell">
      <div className="topBar">
        <div className="topBarTitle">Markdown Site Generator</div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <AIAssistButton
            theme={theme}
            getMarkdown={() => markdown}
            setMarkdown={setMarkdown}


            setStatus={setStatus}
          />

          <span style={{ color: "#6b7280", fontSize: 13 }}>{status}</span>

          <select
            value={theme}
            onChange={(e) =>
              onThemeChange(e.target.value === "blog" ? "blog" : "docs")
            }
            style={{
              padding: "8px 10px",
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              background: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
            title="Theme"
          >
            <option value="docs">Docs</option>
            <option value="blog">Blog</option>
          </select>

          <a
            className="btnLink"
            href="/api/export"
            target="_blank"
            rel="noreferrer"
          >
            Export ZIP
          </a>

          <button className="btnPrimary" onClick={onSave}>
            Save
          </button>
        </div>
      </div>

      <div className="studioMain">
        <aside className="sidebar">
          <div className="sidebarHeader">
            <span>Pages</span>
            <button className="iconBtn" title="New page" onClick={onCreateNew}>
              +
            </button>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            {pages.map((p) => {
              const label = p.theme === "blog" ? "Blog" : "Docs";
              return (
                <div
                  key={p.slug}
                  className={`pageRow ${p.slug === selectedSlug ? "pageRowActive" : ""}`}
                >
                  <button
                    className="pageRowMain"
                    onClick={() => onSelect(p.slug)}
                  >
                    <div className="pageTitle">
                      {p.title ?? p.slug}
                      <span
                        className={`themeBadge ${p.theme === "blog" ? "themeBlog" : "themeDocs"}`}
                      >
                        {label}
                      </span>
                    </div>
                    <div className="pageSlug">/{p.slug}</div>
                  </button>

                  <button
                    className="deleteBtn"
                    title="Delete page"
                    aria-label={`Delete ${p.slug}`}
                    onClick={() => onDelete(p.slug)}
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </aside>

        <section className="editorCol">
          <div className="colTop">
            <div className="slugRow">
              <span>/site/</span>
              <input
                className="slugInput"
                value={slugInput}
                onChange={(e) => setSlugInput(e.target.value)}
                placeholder="getting-started"
              />
            </div>

            <a
              className="openPageBtn"
              href={`/site/${slugify(slugInput) || "getting-started"}`}
              target="_blank"
              rel="noreferrer"
            >
              ↗ Open Page
            </a>
          </div>

          <div className="colLabel">Markdown</div>

          <div className="editorArea">
            <MarkdownMonaco value={markdown} onChange={setMarkdown} />
          </div>
        </section>

        <section className="previewCol">
          <div className="colTop">
            <div style={{ fontWeight: 700, color: "#374151" }}>Preview</div>
          </div>

          <div
            className={`previewArea ${theme === "blog" ? "previewBlog" : "previewDocs"}`}
          >
            <ReactMarkdown
              remarkPlugins={[
                remarkGfm,
                [remarkToc, { heading: "Table of Contents", tight: true }],
              ]}
              rehypePlugins={[
                rehypeSlug,
                [rehypeAutolinkHeadings, { behavior: "wrap" }],
              ]}
              components={{
                code({ inline, className, children, ...props }) {
                  const cls = className ?? "";
                  const lang = cls.startsWith("language-")
                    ? cls.replace("language-", "")
                    : cls;

                  if (!inline && lang === "mermaid") {
                    return (
                      <div className="mermaidWrap">
                        <MermaidBlock chart={String(children)} />
                      </div>
                    );
                  }

                  if (inline)
                    return <code className={className}>{children}</code>;

                  return (
                    <pre>
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  );
                },
              }}
            >
              {preview}
            </ReactMarkdown>
          </div>
        </section>
      </div>
    </div>
  );
}
