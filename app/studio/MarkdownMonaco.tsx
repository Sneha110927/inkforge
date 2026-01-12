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
      defaultLanguage="markdown"
      value={value}
      onChange={(val) => onChange(val ?? "")}
      theme="vs" // use "vs-dark" if you want dark
      options={{
        wordWrap: "on",
        minimap: { enabled: false },
        fontSize: 14,
        lineHeight: 22,
        smoothScrolling: true,
        scrollBeyondLastLine: false,
        renderLineHighlight: "line",
        cursorSmoothCaretAnimation: "on",
        formatOnPaste: true,
        formatOnType: true,
        padding: { top: 12, bottom: 12 },
        tabSize: 2,
      }}
    />
  );
}
