"use client";

import { useEffect, useRef, useState } from "react";
import { env } from "@/config/env";

// ── Constants ──

const GIS_SRC = "https://accounts.google.com/gsi/client";

// ── Module-level state (survives React Strict Mode remounts) ──

let sdkLoadState: "idle" | "loading" | "loaded" | "error" = "idle";
let sdkLoadPromise: Promise<void> | null = null;
let googleInitialized = false;

/**
 * Module-level callback indirection.
 *
 * `google.accounts.id.initialize()` captures the callback reference at call
 * time and can only be invoked once.  We register a stable module-level
 * trampoline that delegates to whatever the currently-mounted component
 * wants, so Strict Mode remounts still route credentials correctly.
 */
let onCredentialTrampoline: ((credential: string) => void) | null = null;

// ── Props ──

type Props = {
  onSuccess: (credential: string) => void;
  onError?: (error: Error) => void;
};

export function GoogleLoginButton({ onSuccess, onError }: Props) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(sdkLoadState === "loaded");
  const [fatal, setFatal] = useState(sdkLoadState === "error");

  // Keep latest callbacks in refs (avoids stale closures)
  const successRef = useRef(onSuccess);
  const errorRef = useRef(onError);
  successRef.current = onSuccess;
  errorRef.current = onError;

  // ── Step 1 — Load the Google Identity Services SDK (once) ──

  useEffect(() => {
    // Already loaded or errored from a previous mount (Strict Mode)
    if (sdkLoadState === "loaded") {
      setReady(true);
      return;
    }
    if (sdkLoadState === "error") {
      setFatal(true);
      return;
    }

    // Already loading — wait for the in-flight promise
    if (sdkLoadState === "loading" && sdkLoadPromise) {
      let cancelled = false;
      sdkLoadPromise
        .then(() => {
          if (!cancelled) setReady(true);
        })
        .catch(() => {
          if (!cancelled) setFatal(true);
        });
      return () => {
        cancelled = true;
      };
    }

    // First load attempt
    sdkLoadState = "loading";
    sdkLoadPromise = new Promise<void>((resolve, reject) => {
      // Don't load if another instance already injected the tag
      if (document.querySelector(`script[src="${GIS_SRC}"]`)) {
        sdkLoadState = "loaded";
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = GIS_SRC;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        sdkLoadState = "loaded";
        resolve();
      };

      script.onerror = () => {
        sdkLoadState = "error";
        reject(new Error("Failed to load Google Identity Services SDK"));
      };

      document.head.appendChild(script);
    });

    sdkLoadPromise
      .then(() => setReady(true))
      .catch((err) => {
        setFatal(true);
        errorRef.current?.(err instanceof Error ? err : new Error(String(err)));
      });
  }, []);

  // ── Step 2 — Initialize Google & render the button ──

  useEffect(() => {
    if (!ready) return;
    if (!buttonRef.current) return;

    const accounts = window.google?.accounts;
    if (!accounts) {
      // Script loaded but `google.accounts` not available yet — retry
      const id = window.setTimeout(() => setReady(true), 50);
      return () => window.clearTimeout(id);
    }

    // Clear any button rendered by a previous Strict Mode mount
    buttonRef.current.innerHTML = "";

    // Update the module-level trampoline to point to the current component
    onCredentialTrampoline = (credential: string) => {
      successRef.current(credential);
    };

    try {
      // `initialize()` MUST be called exactly once per page load.
      // Subsequent calls are silently ignored by the SDK.
      if (!googleInitialized) {
        accounts.id.initialize({
          client_id: env.GOOGLE_CLIENT_ID,
          callback: (response: GoogleCredentialResponse) => {
            onCredentialTrampoline?.(response.credential);
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        googleInitialized = true;
      }

      accounts.id.renderButton(buttonRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "signin_with",
        shape: "pill",
        width: 280,
      });
    } catch (err) {
      setFatal(true);
      errorRef.current?.(
        err instanceof Error ? err : new Error("Google Sign-In initialization failed"),
      );
    }
  }, [ready]);

  // ── Render ──

  if (fatal) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400">
        Failed to load Google Sign-In. Please refresh the page.
      </div>
    );
  }

  if (!env.GOOGLE_CLIENT_ID) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400">
        Google Client ID is not configured.
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="h-12 w-[280px] animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-800" />
    );
  }

  return <div ref={buttonRef} className="flex justify-center" />;
}
