"use client";

import { useEffect, useId, useRef } from "react";
import mermaid from "mermaid";

export default function Mermaid({ chart }: { chart: string }) {
  const reactId = useId();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false });
  }, []);

  useEffect(() => {
    if (!ref.current) return;

    // Mermaid IDs must not contain ":" in some cases; sanitize
    const id = `mmd-${reactId.replace(/[:]/g, "")}`;

    ref.current.innerHTML = "";

    mermaid
      .render(id, chart)
      .then(({ svg }) => {
        if (ref.current) ref.current.innerHTML = svg;
      })
      .catch((e) => {
        if (ref.current) {
          ref.current.innerHTML = `<pre style="color:#ef4444;white-space:pre-wrap;">${String(
            e
          )}</pre>`;
        }
      });
  }, [chart, reactId]);

  return <div ref={ref} />;
}
