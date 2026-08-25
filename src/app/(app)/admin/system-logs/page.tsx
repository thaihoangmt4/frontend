import { AdminRoute } from "@/components/auth";
import { AdminSystemLogsPage } from "@/features/admin-logs";

export default function SystemLogsRoute() {
  return (
    <AdminRoute>
      <AdminSystemLogsPage />
    </AdminRoute>
  );
}
