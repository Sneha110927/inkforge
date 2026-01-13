import Link from "next/link";

export default function DocsLayout({
  title,
  description,
  children,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="siteContent">
      <h1 className="siteH1">{title}</h1>
      {description ? <p className="siteDesc">{description}</p> : null}
      <div className="hr" />
      {children}
      <div style={{ marginTop: 28, color: "#6b7280" }}>
        <Link className="editLink" href="/studio">
          ✎ Edit in Studio
        </Link>
      </div>
    </div>
  );
}
