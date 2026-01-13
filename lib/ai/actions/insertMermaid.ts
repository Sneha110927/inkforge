/**
 * Insert Mermaid diagram template:
 * - If a "Architecture" / "Diagram" heading exists, inserts after it.
 * - Otherwise appends to end.
 */
export function insertMermaid(markdown: string): string {
  const s = normalizeNewlines(markdown);
  const lines = s.split("\n");

  const block = [
    "```mermaid",
    "graph TD",
    "  A[Start] --> B[Step 1]",
    "  B --> C[Step 2]",
    "  C --> D[Done]",
    "```",
    "",
  ].join("\n");

  const insertAfter = findHeadingIndex(lines, ["architecture", "diagram", "system architecture", "data flow"]);
  if (insertAfter !== -1) {
    let i = insertAfter + 1;
    while (i < lines.length && lines[i].trim() === "") i++;
    const out = [...lines.slice(0, i), block, ...lines.slice(i)].join("\n");
    return out.trimEnd() + "\n";
  }

  return (s.trimEnd() + "\n\n" + block).trimEnd() + "\n";
}

function normalizeNewlines(md: string) {
  return md.replace(/\r\n/g, "\n");
}

function findHeadingIndex(lines: string[], keywords: string[]): number {
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    const m = l.match(/^#{2,6}\s+(.+)$/);
    if (!m) continue;
    const text = m[1].trim().toLowerCase();
    if (keywords.some((k) => text.includes(k))) return i;
  }
  return -1;
}
