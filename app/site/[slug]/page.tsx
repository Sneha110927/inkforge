import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { readPageParsed } from "@/lib/page";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function SitePage(props: PageProps) {
  const { slug } = await props.params; // ✅ unwrap params (Next 16)
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

  return (
    <div>
      <div className="siteTop">
        <div style={{ width: 140 }} />
        <div className="breadcrumb">
          Markdown Site Generator <span style={{ opacity: 0.7 }}> / </span> {page.meta.slug}
        </div>
        <Link className="editLink" href="/studio">
          ✎ Edit in Studio
        </Link>
      </div>

      <div className="siteContent">
        <h1 className="siteH1">{page.meta.title ?? page.meta.slug}</h1>
        <p className="siteDesc">{page.meta.description ?? "A page generated from markdown"}</p>
        <div className="hr" />

        <ReactMarkdown remarkPlugins={[remarkGfm]}>{page.content}</ReactMarkdown>
      </div>
    </div>
  );
}
