"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function NavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [, startTransition] = useTransition();

  // Reset navigation indicator on path/query change
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname, searchParams]);

  // Intercept client link clicks for instant visual feedback (<10ms)
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http://") || href.startsWith("https://") || target.target === "_blank") {
        return;
      }

      // If clicking same page without search param change, ignore
      const currentUrl = window.location.pathname + window.location.search;
      if (href === currentUrl) return;

      startTransition(() => {
        setIsNavigating(true);
      });
    };

    document.addEventListener("click", handleClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
    };
  }, []);

  if (!isNavigating) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-1 overflow-hidden bg-primary/20 pointer-events-none">
      <div className="h-full bg-primary animate-[nav-progress_1.5s_ease-in-out_infinite] w-full origin-left" />
    </div>
  );
}
