"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Route label map ──

const LABEL_MAP: Record<string, string> = {
  admin: "Admin",
  dashboard: "Dashboard",
  lessons: "Lessons",
  practice: "Practice",
  settings: "Settings",
  profile: "Profile",
};

export function Breadcrumb() {
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);

  const crumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label =
      LABEL_MAP[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1);
    const isLast = index === segments.length - 1;

    return { href, label, isLast };
  });

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
      {/* ── Home ── */}
      <Link
        href="/"
        className="rounded-md p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>

      {crumbs.length > 0 && (
        <ChevronRight className="h-3.5 w-3.5 text-neutral-300 dark:text-neutral-700" />
      )}

      {/* ── Segments ── */}
      {crumbs.map((crumb) => (
        <span key={crumb.href} className="flex items-center gap-1">
          {crumb.isLast ? (
            <span className="font-medium text-neutral-900 dark:text-neutral-100">
              {crumb.label}
            </span>
          ) : (
            <>
              <Link
                href={crumb.href}
                className={cn(
                  "rounded-md px-1 py-0.5 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200",
                )}
              >
                {crumb.label}
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-neutral-300 dark:text-neutral-700" />
            </>
          )}
        </span>
      ))}
    </nav>
  );
}
