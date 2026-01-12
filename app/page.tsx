import Link from "next/link";
import { listPages } from "@/lib/page";

function DocIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 3h7l3 3v15a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Z"
        stroke="#2563eb"
        strokeWidth="2"
      />
      <path d="M14 3v4a2 2 0 0 0 2 2h4" stroke="#2563eb" strokeWidth="2" />
      <path
        d="M8 13h8M8 17h8M8 9h4"
        stroke="#2563eb"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M8 9 5 12l3 3M16 9l3 3-3 3"
        stroke="#2563eb"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 7 10 17"
        stroke="#2563eb"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default async function Home() {
  const pages = await listPages().catch(() => []);
  const sampleSlug = pages?.[0]?.slug ?? "getting-started";

  return (
    <div className="landing">
      <div className="landingInner">
        <div className="heroIcons">
          <div className="iconPill">
            <DocIcon />
          </div>
          <div style={{ opacity: 0.6, fontWeight: 800 }}>→</div>
          <div className="iconPill">
            <CodeIcon />
          </div>
        </div>

        <h1 className="heroTitle">Markdown Site Generator</h1>
        <p className="heroSubtitle">
          Write markdown. Instantly preview a website.
        </p>

        <div className="heroActions">
          <Link className="btnPrimary" href="/studio">
            Open Studio <span style={{ fontWeight: 900 }}>→</span>
          </Link>

          {/* open published page in new tab */}
          <a
            className="btnLink"
            href="/site/getting-started"
            target="_blank"
            rel="noreferrer"
          >
            View Sample Page
          </a>
        </div>

        <div className="featureRow">
          <div className="featureCard">
            <div className="featureIcon">
              <DocIcon />
            </div>
            <p className="featureTitle">Write Markdown</p>
            <p className="featureDesc">
              Use familiar markdown syntax to create your content
            </p>
          </div>

          <div className="featureCard">
            <div className="featureIcon">
              <CodeIcon />
            </div>
            <p className="featureTitle">Live Preview</p>
            <p className="featureDesc">
              See your changes instantly as you type
            </p>
          </div>

          <div className="featureCard">
            <div className="featureIcon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12h14"
                  stroke="#2563eb"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M13 5l7 7-7 7"
                  stroke="#2563eb"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="featureTitle">Clean URLs</p>
            <p className="featureDesc">
              Generate pages with beautiful, SEO-friendly URLs
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
