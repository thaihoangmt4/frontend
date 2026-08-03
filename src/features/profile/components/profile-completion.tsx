import { CheckCircle2, CircleAlert } from "lucide-react";

type Props = {
  isComplete: boolean;
};

export function ProfileCompletion({ isComplete }: Props) {
  return (
    <div
      className={
        isComplete
          ? "rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/40"
          : "rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/40"
      }
      role="status"
    >
      <div className="flex items-start gap-3">
        {isComplete ? (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
        ) : (
          <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
        )}
        <div>
          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {isComplete ? "Profile complete" : "Complete your profile"}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            {isComplete
              ? "Your learning preferences are ready."
              : "Add your username, native language, and timezone to finish setting up your account."}
          </p>
        </div>
      </div>
    </div>
  );
}
