"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

type AIAction =
  | "improveWriting"
  | "summarize"
  | "convertDocs"
  | "convertBlog"
  | "generateOutline"
  | "insertMermaid";

export default function AIAssistButton({
  theme,
  getMarkdown,
  setMarkdown,
  setStatus,
}: {
  theme: "docs" | "blog";
  getMarkdown: () => string;
  setMarkdown: (md: string) => void;
  setStatus: (s: string) => void;
}) {
  const [open, setOpen] = useState(false);

  async function run(action: AIAction) {
    setOpen(false);
    setStatus("AI thinking…");

    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        markdown: getMarkdown(),
      }),
    });

    const data = (await res.json().catch(() => null)) as
      | { markdown?: string; error?: string }
      | null;

    if (!res.ok || !data?.markdown) {
      setStatus(data?.error ?? "AI failed");
      return;
    }

    setMarkdown(data.markdown);
    setStatus("AI updated ✨");
    setTimeout(() => setStatus(""), 900);
  }

  function convertBasedOnTheme() {
    // If currently in blog mode, converting to docs is useful, and vice versa
    return theme === "blog" ? "convertDocs" : "convertBlog";
  }

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        className="btnLink"
        onClick={() => setOpen((v) => !v)}
        style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
        title="AI Assist"
      >
        <Sparkles size={16} />
        AI Assist
      </button>

      {open ? (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 44,
            width: 240,
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
            overflow: "hidden",
            zIndex: 50,
          }}
        >
          <MenuItem label="Improve writing" onClick={() => run("improveWriting")} />
          <MenuItem label="Summarize + TL;DR" onClick={() => run("summarize")} />

          <div style={{ height: 1, background: "var(--border)" }} />

          <MenuItem label="Convert to Docs" onClick={() => run("convertDocs")} />
          <MenuItem label="Convert to Blog" onClick={() => run("convertBlog")} />
          <MenuItem
            label={theme === "blog" ? "Convert to Docs (recommended)" : "Convert to Blog (recommended)"}
            onClick={() => run(convertBasedOnTheme())}
          />

          <div style={{ height: 1, background: "var(--border)" }} />

          <MenuItem label="Generate outline" onClick={() => run("generateOutline")} />
          <MenuItem label="Insert Mermaid diagram" onClick={() => run("insertMermaid")} />
        </div>
      ) : null}
    </div>
  );
}

function MenuItem({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "10px 12px",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        color: "var(--text)",
      }}
      className="aiMenuItem"
    >
      {label}
    </button>
  );
}
