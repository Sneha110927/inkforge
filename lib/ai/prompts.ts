export type AssistMode =
  | "improve"
  | "summarize"
  | "expand"
  | "to_docs"
  | "to_blog"
  | "generate_outline"
  | "mermaid_from_text";

export type AssistTheme = "docs" | "blog";

export function buildInstruction(mode: AssistMode, theme: AssistTheme): string {
  const base =
    "You are an expert technical writer. Output ONLY valid Markdown. Do not wrap in triple backticks. Preserve meaning and factual content. Keep headings and structure clean.";

  const themeHint =
    theme === "blog"
      ? "Write in a blog style: friendly, narrative, with smooth transitions."
      : "Write in docs style: crisp, scannable, with clear headings and bullet points.";

  const taskMap: Record<AssistMode, string> = {
    improve: "Improve clarity, grammar, and structure. Keep same intent.",
    summarize: "Add a short TL;DR section at the top and a brief summary at the end.",
    expand: "Expand this content with more detail, examples, and edge cases. Do not add fake facts.",
    to_docs: "Rewrite into documentation format with sections and bullet points.",
    to_blog: "Rewrite into a blog post style with a hook, sections, and conclusion.",
    generate_outline: "Create a detailed outline (headings + bullets) for this content.",
    mermaid_from_text:
      "Generate a Mermaid diagram (```mermaid fenced block) that represents the process/flow described.",
  };

  return `${base}\n${themeHint}\nTASK: ${taskMap[mode]}`;
}
