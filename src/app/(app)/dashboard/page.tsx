import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dashboard — AI English Learning Platform",
};

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* ── Page heading ── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Dashboard
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
          Your learning overview and progress.
        </p>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Lessons completed"
          value="0"
          description="Start your first lesson today"
        />
        <StatCard
          title="Practice sessions"
          value="0"
          description="Practice makes perfect"
        />
        <StatCard
          title="Current streak"
          value="0 days"
          description="Come back daily to build your streak"
        />
      </div>

      {/* ── Quick start ── */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Ready to learn?
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
          Pick a lesson or start a practice session to improve your English
          skills.
        </p>
        <div className="mt-5">
          <Link
            href="/courses"
            className="inline-flex h-10 items-center rounded-lg bg-blue-600 px-5 text-sm font-medium text-white outline-none hover:bg-blue-700 focus-visible:ring-3 focus-visible:ring-blue-500/30"
          >
            Browse courses
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Stat card ──

function StatCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
        {title}
      </p>
      <p className="mt-2 text-[2rem] font-bold leading-tight tracking-tight text-neutral-900 dark:text-neutral-100">
        {value}
      </p>
      <p className="mt-1.5 text-xs leading-relaxed text-neutral-400 dark:text-neutral-500">
        {description}
      </p>
    </div>
  );
}
