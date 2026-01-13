import Link from "next/link";
import { buildSearchIndex } from "@/lib/searchIndex";

type PageProps = { params: Promise<{ tag: string }> };

export default async function TagPage(props: PageProps) {
  const { tag } = await props.params;
  const decoded = decodeURIComponent(tag).toLowerCase();

  const index = await buildSearchIndex();
  const matches = index.filter((d) => d.tags.map((t) => t.toLowerCase()).includes(decoded));

  return (
    <div className="container">
      <h1>Tag: #{decoded}</h1>
      <div style={{ display: "grid", gap: 10 }}>
        {matches.map((d) => (
          <Link key={d.slug} href={`/site/${d.slug}`} style={{ padding: 12, border: "1px solid #e5e7eb", borderRadius: 12 }}>
            <div style={{ fontWeight: 800 }}>{d.title}</div>
            {d.description ? <div style={{ color: "#6b7280" }}>{d.description}</div> : null}
          </Link>
        ))}
      </div>
    </div>
  );
}
