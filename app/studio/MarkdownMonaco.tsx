"use client";

import Editor from "@monaco-editor/react";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function MarkdownMonaco({ value, onChange }: Props) {
  return (
    <Editor
      height="100%"
      language="markdown"
      value={value}
      onChange={(v) => onChange(v ?? "")}
      options={{
        wordWrap: "on",
        minimap: { enabled: false },
        fontSize: 14,
        scrollBeyondLastLine: false,
        automaticLayout: true, // ✅ helps resize inside grids
      }}
    />
  );
}
