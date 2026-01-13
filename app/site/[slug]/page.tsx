import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkToc from "remark-toc";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import MermaidBlock from "@/app/studio/Mermaid";
import { readPageParsed } from "@/lib/page";

/* 🔹 ADD: theme layouts */
import DocsLayout from "@/app/components/themes/DocsLayout";
import BlogLayout from "@/app/components/themes/BlogLayout";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function SitePage(props: PageProps) {
  const { slug } = await props.params;
  const page = await readPageParsed(slug);

  if (!page) {
    return (
      <div style={{ padding: 20 }}>
        <h2>404</h2>
        <p>Page not found.</p>
        <Link href="/studio" style={{ textDecoration: "underline" }}>
          Go to Studio
        </Link>
      </div>
    );
  }

  /* 🔹 ADD: markdown body (unchanged renderer) */
  const markdownBody = (
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

          if (inline) {
            return <code className={className}>{children}</code>;
          }

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
      {page.content}
    </ReactMarkdown>
  );

  return (
    <div>
      {/* Top bar (unchanged) */}
      <div className="siteTop">
        <div style={{ width: 140 }} />
        <div className="breadcrumb">
          Markdown Site Generator{" "}
          <span style={{ opacity: 0.7 }}> / </span>
          {page.meta.slug}
        </div>
        <Link className="editLink" href="/studio">
          ✎ Edit in Studio
        </Link>
      </div>

      {/* 🔹 ADD: Theme switch */}
      {page.meta.theme === "blog" ? (
        <BlogLayout
          title={page.meta.title ?? page.meta.slug}
          description={page.meta.description}
          date={page.meta.date}
          tags={page.meta.tags}
        >
          {markdownBody}
        </BlogLayout>
      ) : (
        <DocsLayout
          title={page.meta.title ?? page.meta.slug}
          description={page.meta.description}
        >
          {markdownBody}
        </DocsLayout>
      )}
    </div>
  );
}
