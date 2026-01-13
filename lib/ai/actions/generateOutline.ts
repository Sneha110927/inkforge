/**
 * Generate outline:
 * - Keeps frontmatter (if present)
 * - Creates a structured outline based on title
 */
export function generateOutline(markdown: string): string {
  const s = normalizeNewlines(markdown);
  const title = extractTitle(s) ?? "Document";

  const outline = `# ${title}

## Overview
- Purpose
- Audience
- Key concepts

## Architecture
- Components
- Data flow
- Key decisions

## Implementation
- Setup
- Core workflow
- Edge cases

## Examples
- Basic example
- Advanced example

## Troubleshooting
- Common issues
- FAQs

## References
- Links
- Glossary
`;

  const fm = getFrontmatterBlock(s);
  if (fm) return `${fm}\n${outline}`.trim() + "\n";

  return outline.trim() + "\n";
}

function normalizeNewlines(md: string) {
  return md.replace(/\r\n/g, "\n");
}

function getFrontmatterBlock(md: string): string | null {
  if (!md.startsWith("---\n")) return null;
  const end = md.indexOf("\n---\n", 4);
  if (end === -1) return null;
  return md.slice(0, end + "\n---\n".length).trimEnd();
}

function extractTitle(md: string): string | null {
  // frontmatter title
  const fm = md.startsWith("---\n") ? md.match(/^---\n([\s\S]*?)\n---\n/) : null;
  if (fm) {
    const m = fm[1].match(/^\s*title:\s*(.+)\s*$/m);
    if (m) return stripQuotes(m[1].trim());
  }
  // H1
  const h1 = md.match(/^#\s+(.+)$/m);
  return h1 ? h1[1].trim() : null;
}

function stripQuotes(s: string): string {
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  return s;
}
