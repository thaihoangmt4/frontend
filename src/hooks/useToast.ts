"use client";

import { toast as sonnerToast } from "sonner";

const BASE_OPTS = {
  duration: 4000,
  closeButton: true,
} as const;

export function useToast() {
  return {
    success(message: string, description?: string) {
      return sonnerToast.success(message, {
        ...BASE_OPTS,
        description,
      });
    },
    error(message: string, description?: string) {
      return sonnerToast.error(message, {
        ...BASE_OPTS,
        description,
      });
    },
    info(message: string, description?: string) {
      return sonnerToast(message, {
        ...BASE_OPTS,
        description,
      });
    },
    warning(message: string, description?: string) {
      return sonnerToast.warning(message, {
        ...BASE_OPTS,
        description,
      });
    },
    loading(message: string, description?: string) {
      return sonnerToast.loading(message, {
        description,
      });
    },
    dismiss(id?: string | number) {
      sonnerToast.dismiss(id);
    },
    promise<T>(
      promise: Promise<T> | (() => Promise<T>),
      messages: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: unknown) => string);
      },
    ) {
      return sonnerToast.promise(promise, messages);
    },
  } as const;
}
