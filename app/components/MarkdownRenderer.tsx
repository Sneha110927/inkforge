import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkToc from "remark-toc";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import MermaidBlock from "@/app/studio/Mermaid"; // adjust path if needed

type Props = {
  content: string;
};

export default function MarkdownRenderer({ content }: Props) {
  return (
    <ReactMarkdown
      remarkPlugins={[
        remarkGfm,
        [remarkToc, { heading: "Table of Contents", tight: true }],
      ]}
      rehypePlugins={[
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: "wrap" }],
      ]}
      components={{
        code({ inline, className, children, ...props }) {
          const lang = (className || "").replace("language-", "");

          if (!inline && lang === "mermaid") {
            return <MermaidBlock chart={String(children)} />;
          }

          if (inline) return <code className={className}>{children}</code>;

          return (
            <pre>
              <code className={className} {...props}>
                {children}
              </code>
            </pre>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
