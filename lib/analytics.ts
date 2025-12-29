export function track(eventName: string, props?: Record<string, any>) {
  if (typeof window === "undefined") return;

  const plausible = (window as any).plausible;
  if (typeof plausible === "function") {
    plausible(eventName, props ? { props } : undefined);
  }
}
