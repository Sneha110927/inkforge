/**
 * Rule-based “Improve writing”:
 * - Normalize newlines
 * - Remove trailing spaces
 * - Fix excessive blank lines
 * - Ensure blank line after headings
 * - Fix indented code fences
 */
export function improveWriting(markdown: string): string {
  let s = normalizeNewlines(markdown);

  // Remove trailing whitespace per line
  s = s
    .split("\n")
    .map((line) => line.replace(/\s+$/g, ""))
    .join("\n");

  // Fix indented fences (``` should start at column 0)
  s = s.replace(/^\s+```/gm, "```");

  // Ensure blank line after headings (#, ##, ###)
  s = s.replace(/^(#{1,6}\s.+)\n(?!\n)/gm, "$1\n\n");

  // Collapse 3+ blank lines into 2
  s = s.replace(/\n{3,}/g, "\n\n");

  // Normalize bullet spacing: "-  item" => "- item"
  s = s.replace(/^(\s*[-*])\s{2,}/gm, "$1 ");

  // Normalize numbered list spacing: "1.  item" => "1. item"
  s = s.replace(/^(\s*\d+\.)\s{2,}/gm, "$1 ");

  return s.trim() + "\n";
}

function normalizeNewlines(md: string) {
  return md.replace(/\r\n/g, "\n");
}
