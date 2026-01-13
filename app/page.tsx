import Link from "next/link";
import { listPages } from "@/lib/page";
import LandingAnimated from "@/app/components/LandingAnimated";
import { DocIcon, CodeIcon } from "@/app/components/icons";

export default async function Home() {
  const pages = await listPages().catch(() => []);
  const sampleSlug = pages?.[0]?.slug ?? "getting-started";

  return (
    <LandingAnimated>
      <div className="landingBg">
        <div className="landing">
          <div className="landingInner">
            {/* ✅ hero icons wrapper */}
            <div className="heroIcons heroPop">
              <div className="iconPill iconFloat">
                <DocIcon />
              </div>
              <div className="arrowBreathe" style={{ opacity: 0.6, fontWeight: 800 }}>
                →
              </div>
              <div className="iconPill iconFloat2">
                <CodeIcon />
              </div>
            </div>

            <h1 className="heroTitle heroFadeUp">Markdown Site Generator</h1>

            <p className="heroSubtitle heroFadeUpDelay">
              Write markdown. Instantly preview a website.
            </p>

            <div className="heroActions heroFadeUpDelay2">
              <Link className="btnPrimary" href="/studio">
                Open Studio <span style={{ fontWeight: 900 }}>→</span>
              </Link>

              <a
                className="btnLink"
                href={`/site/${sampleSlug}`}
                target="_blank"
                rel="noreferrer"
              >
                View Sample Page
              </a>

              <a className="btnLink" href="/api/export" target="_blank" rel="noreferrer">
                Export ZIP
              </a>
            </div>

            <div className="featureRow featureStagger">
              <div className="featureCard featureFloat">
                <div className="featureIcon">
                  <DocIcon />
                </div>
                <p className="featureTitle">Write Markdown</p>
                <p className="featureDesc">Use familiar markdown syntax to create your content</p>
              </div>

              <div className="featureCard featureFloatDelay">
                <div className="featureIcon">
                  <CodeIcon />
                </div>
                <p className="featureTitle">Live Preview</p>
                <p className="featureDesc">See your changes instantly as you type</p>
              </div>

              <div className="featureCard featureFloatDelay2">
                <div className="featureIcon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />
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
                <p className="featureDesc">Generate pages with beautiful, SEO-friendly URLs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LandingAnimated>
  );
}
