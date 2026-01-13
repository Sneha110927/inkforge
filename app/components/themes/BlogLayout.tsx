import Link from "next/link";

export default function BlogLayout({
  title,
  description,
  date,
  tags,
  children,
}: {
  title?: string;
  description?: string;
  date?: string;
  tags?: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="siteContent">
      <div style={{ color: "#6b7280", marginBottom: 8 }}>
        {date ? <span>{date}</span> : null}
        {tags?.length ? <span> • {tags.join(", ")}</span> : null}
      </div>

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
















