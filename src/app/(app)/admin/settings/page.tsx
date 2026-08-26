import { AdminRoute } from "@/components/auth";
import { AdminSettingsPage } from "@/features/admin-settings";

export default function AdminSettingsRoute() {
  return (
    <AdminRoute>
      <AdminSettingsPage />
    </AdminRoute>
  );
}
