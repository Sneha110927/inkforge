/**
 * Rule-based “Summarize + TL;DR”:
 * - Adds a TL;DR section after the H1 (or at top if no H1)
 * - Uses: first paragraph + list of H2 headings as key points
 */
export function summarize(markdown: string): string {
  const s = normalizeNewlines(markdown);
  const lines = s.split("\n");

  const h1Index = lines.findIndex((l) => /^#\s+/.test(l));
  const firstPara = extractFirstParagraphAfter(lines, h1Index >= 0 ? h1Index : -1);
  const h2s = lines.filter((l) => /^##\s+/.test(l)).map((l) => l.replace(/^##\s+/, "").trim());

  const bullets: string[] = [];
  if (firstPara) bullets.push(firstPara.length > 120 ? firstPara.slice(0, 120).trim() + "…" : firstPara);
  for (const h of h2s.slice(0, 6)) bullets.push(h);

  const tldr = [
    "## TL;DR",
    ...bullets.map((b) => `- ${b}`),
    "",
  ].join("\n");

  // Insert TL;DR after H1 block if possible
  if (h1Index >= 0) {
    const insertAt = findInsertionPointAfterHeadingBlock(lines, h1Index);
    const out = [...lines.slice(0, insertAt), tldr, ...lines.slice(insertAt)].join("\n");
    return out.trim() + "\n";
  }

  // Otherwise, place at top
  return (tldr + "\n" + s).trim() + "\n";
}

function normalizeNewlines(md: string) {
  return md.replace(/\r\n/g, "\n");
}

function extractFirstParagraphAfter(lines: string[], startIndex: number): string {
  // find first non-empty line after startIndex
  let i = startIndex + 1;
  while (i < lines.length && lines[i].trim() === "") i++;

  const para: string[] = [];
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === "") break;
    if (/^#{1,6}\s+/.test(line)) break;
    if (/^```/.test(line)) break;
    para.push(line.trim());
    i++;
  }

  return para.join(" ").trim();
}

function findInsertionPointAfterHeadingBlock(lines: string[], headingIndex: number): number {
  // Insert after the heading and any immediate blank lines
  let i = headingIndex + 1;
  while (i < lines.length && lines[i].trim() === "") i++;
  return i;
}
