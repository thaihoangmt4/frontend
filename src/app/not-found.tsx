import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="flex w-full max-w-md flex-col items-center text-center">
        {/* ── Icon ── */}
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800">
          <SearchX className="h-8 w-8 text-neutral-400 dark:text-neutral-500" />
        </div>

        {/* ── Status ── */}
        <span className="text-sm font-semibold tracking-wide text-blue-600 uppercase dark:text-blue-400">
          404
        </span>

        {/* ── Heading ── */}
        <h1 className="mt-2 text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Page not found
        </h1>

        {/* ── Description ── */}
        <p className="mt-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>

        {/* ── Actions ── */}
        <div className="mt-8 flex gap-3">
          <Link
            href="/"
            className="inline-flex items-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Go home
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-lg border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
