"use client";

import type { ReactNode } from "react";
import { QueryProvider } from "./query-provider";

type Props = {
  children: ReactNode;
};

export function AppProvider({ children }: Props) {
  return <QueryProvider>{children}</QueryProvider>;
}
