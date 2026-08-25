"use client";

import { useMemo, type ReactNode } from "react";
import { ShieldX } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuthStore } from "@/stores/auth.store";
import { getUserFromToken } from "@/utils/jwt";

type Props = {
  children: ReactNode;
};

export function AdminRoute({ children }: Props) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAdmin = useMemo(() => {
    if (!accessToken) return false;
    return getUserFromToken(accessToken)?.role.toLowerCase() === "admin";
  }, [accessToken]);

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border bg-card shadow-sm">
        <EmptyState
          icon={ShieldX}
          headingLevel={1}
          title="Access denied"
          description="You need an administrator account to view system logs."
        />
      </div>
    );
  }

  return <>{children}</>;
}
