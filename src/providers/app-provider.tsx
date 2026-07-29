"use client";

import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { QueryProvider } from "./query-provider";

type Props = {
  children: ReactNode;
};

export function AppProvider({ children }: Props) {
  return (
    <QueryProvider>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: "0.75rem",
            border: "1px solid #e5e5e5",
            boxShadow:
              "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
          },
        }}
      />
    </QueryProvider>
  );
}
