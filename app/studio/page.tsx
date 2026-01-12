"use client";

import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import dynamic from "next/dynamic";
import { FiTrash2 } from "react-icons/fi";

const MarkdownMonaco = dynamic(() => import("./MarkdownMonaco"), {
  ssr: false,
});

type PageItem = { slug: string; title?: string; description?: string };

const STARTER_MD = `---
title: Getting Started
description: A page generated from markdown
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

// Hide YAML frontmatter in preview (keep it in editor)
function stripFrontmatter(md: string) {
  return md.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, "");
}

export default function StudioPage() {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [slugInput, setSlugInput] = useState<string>("");
  const [markdown, setMarkdown] = useState<string>(STARTER_MD);
  const [status, setStatus] = useState<string>("");

  const preview = useMemo(() => stripFrontmatter(markdown), [markdown]);

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
      return;
    }

    const data = await res.json().catch(() => null);

    // /api/pages/[slug] should return { markdown: "..." }
    setMarkdown(data?.markdown ?? STARTER_MD);
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

    setSelectedSlug(candidate);
    setSlugInput(candidate);
    setMarkdown(`---
title: New Page
description: Created from Studio
---

# New Page

Start writing...
`);
    setStatus("New page. Write content and Save.");
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
      setStatus(data?.error ?? "Failed to save");
      return;
    }

    setSelectedSlug(data.slug);
    setSlugInput(data.slug);

    const list = await refreshPages();

    // Ensure title/desc updates reflect in sidebar (frontmatter parsing happens server-side)
    // Just keep UX smooth
    setStatus("Saved ✅");
    setTimeout(() => setStatus(""), 800);

    // If it was a brand-new page, make sure it’s selected
    if (!list.find((p) => p.slug === data.slug)) {
      await refreshPages();
    }
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

    // Update local list immediately
    const updated = pages.filter((p) => p.slug !== slug);
    setPages(updated);

    // If deleted page was selected, move selection
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
      }
    }

    setStatus("Deleted 🗑️");
    setTimeout(() => setStatus(""), 800);

    // Also refresh from server to stay consistent
    await refreshPages();
  }

  return (
    <div className="studioShell">
      <div className="topBar">
        <div className="topBarTitle">Markdown Site Generator</div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ color: "#6b7280", fontSize: 13 }}>{status}</span>
          <button className="btnPrimary" onClick={onSave}>
            Save
          </button>
        </div>
      </div>

      <div className="studioMain">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebarHeader">
            <span>Pages</span>
            <button className="iconBtn" title="New page" onClick={onCreateNew}>
              +
            </button>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            {pages.map((p) => (
              <div
                key={p.slug}
                className={`pageRow ${p.slug === selectedSlug ? "pageRowActive" : ""}`}
              >
                <button
                  className="pageRowMain"
                  onClick={() => onSelect(p.slug)}
                >
                  <div className="pageTitle">{p.title ?? p.slug}</div>
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
            ))}
          </div>
        </aside>

        {/* Editor */}
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

          <div className="editorArea" style={{ height: "100%" }}>
            <MarkdownMonaco value={markdown} onChange={setMarkdown} />
          </div>
        </section>

        {/* Preview */}
        <section className="previewCol">
          <div className="colTop">
            <div style={{ fontWeight: 700, color: "#374151" }}>Preview</div>
          </div>

          <div className="previewArea">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{preview}</ReactMarkdown>
          </div>
        </section>
      </div>
    </div>
  );
}
