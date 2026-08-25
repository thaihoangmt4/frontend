import { AdminRoute } from "@/components/auth";
import { ExerciseGenerationSettingsPage } from "@/features/admin-exercise-generation-settings";

export default function ExerciseGenerationSettingsRoute() {
  return (
    <AdminRoute>
      <ExerciseGenerationSettingsPage />
    </AdminRoute>
  );
}
