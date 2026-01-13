"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Doc = {
  slug: string;
  title: string;
  description?: string;
  theme: "docs" | "blog";
  tags: string[];
  date?: string;
  text: string;
};

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [docs, setDocs] = useState<Doc[]>([]);

  useEffect(() => {
    fetch("/api/search-index")
      .then((r) => r.json())
      .then((d) => setDocs(d.index ?? []))
      .catch(() => setDocs([]));
  }, []);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return docs.slice(0, 30);

    return docs
      .filter((d) => {
        const hay = `${d.title} ${d.description ?? ""} ${d.tags.join(" ")} ${d.text}`.toLowerCase();
        return hay.includes(query);
      })
      .slice(0, 50);
  }, [q, docs]);

  return (
    <div className="container">
      <h1>Search</h1>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search pages, tags, content..."
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          background: "#f9fafb",
          outline: "none",
        }}
      />

      <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
        {results.map((d) => (
          <Link
            key={d.slug}
            href={`/site/${d.slug}`}
            style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}
          >
            <div style={{ fontWeight: 800 }}>
              {d.title} <span style={{ color: "#6b7280", fontWeight: 600 }}>({d.theme})</span>
            </div>
            {d.description ? <div style={{ color: "#6b7280" }}>{d.description}</div> : null}
            {d.tags?.length ? <div style={{ marginTop: 6, color: "#2563eb" }}>#{d.tags.join(" #")}</div> : null}
          </Link>
        ))}
      </div>
    </div>
  );
}
