import { LessonGenerationSettingsPage } from "@/features/admin-lesson-generation-settings";
import { SystemSettingsSection } from "@/features/admin-logging-settings";

export function AdminSettingsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <header>
        <p className="text-sm font-medium text-primary">Administration</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Settings
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Manage runtime configuration for AI lesson generation and application
          logging.
        </p>
      </header>

      <LessonGenerationSettingsPage />
      <SystemSettingsSection />
    </div>
  );
}
