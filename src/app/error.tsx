"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: Props) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="flex w-full max-w-md flex-col items-center text-center">
        {/* ── Icon ── */}
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/50">
          <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>

        {/* ── Heading ── */}
        <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Something went wrong
        </h1>

        {/* ── Description ── */}
        <p className="mt-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
          An unexpected error occurred. Please try again, or contact support if
          the problem persists.
        </p>

        {/* ── Actions ── */}
        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>

          <Link
            href="/"
            className="inline-flex items-center rounded-lg border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
