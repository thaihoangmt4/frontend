import type { ReactNode } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AppLayout } from "@/components/layout";

export default function AppRouteLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}
