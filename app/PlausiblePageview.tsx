"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function PlausiblePageview() {
  const pathname = usePathname();

  useEffect(() => {
    const plausible = (window as any).plausible;
    if (typeof plausible !== "function") return;

    // für MVP reicht pathname völlig (keine Suspense-Probleme)
    plausible("pageview", { u: pathname });
  }, [pathname]);

  return null;
}
