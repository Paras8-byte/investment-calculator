"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function PlausiblePageview() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const plausible = (window as any).plausible;
    if (typeof plausible !== "function") return;

    const qs = searchParams?.toString();
    const url = pathname + (qs ? `?${qs}` : "");

    plausible("pageview", { u: url });
  }, [pathname, searchParams]);

  return null;
}
