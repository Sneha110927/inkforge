"use client";

import { useEffect, useState } from "react";

export default function LandingAnimated({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // trigger CSS transitions after first paint
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return <div className={mounted ? "animOn" : "animOff"}>{children}</div>;
}
