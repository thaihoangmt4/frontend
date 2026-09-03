"use client";

import { useEffect } from "react";

/**
 * Routes every way out of an active lesson (browser unload and in-app links)
 * through one confirmation, so the X button and app navigation behave alike.
 */
export function useLessonExitGuard(
  isActive: boolean,
  onInternalNavigation: (href: string) => void,
): void {
  useEffect(() => {
    if (!isActive) return;

    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };

    const interceptLinks = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target as Element | null;
      const anchor = target?.closest?.("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("/")) return;
      if (anchor.getAttribute("target") === "_blank") return;
      if (href === window.location.pathname) return;

      event.preventDefault();
      onInternalNavigation(href);
    };

    window.addEventListener("beforeunload", warnBeforeUnload);
    document.addEventListener("click", interceptLinks, true);

    return () => {
      window.removeEventListener("beforeunload", warnBeforeUnload);
      document.removeEventListener("click", interceptLinks, true);
    };
  }, [isActive, onInternalNavigation]);
}
