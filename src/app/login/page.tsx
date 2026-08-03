"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GoogleLoginButton } from "@/components/auth";
import { useAuth } from "@/hooks/useAuth";
import { Spinner } from "@/components/ui/spinner";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const { isAuthenticated, isLoading, loginWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [loginAttempted, setLoginAttempted] = useState(false);

  // Already authenticated → redirect
  useEffect(() => {
    if (!isLoading && isAuthenticated && !loginAttempted) {
      router.replace(redirect);
    }
  }, [isAuthenticated, isLoading, loginAttempted, redirect, router]);

  const handleSuccess = async (credential: string) => {
    setError(null);
    setPending(true);
    setLoginAttempted(true);

    try {
      // POST /api/Auth/google → stores tokens in Zustand + localStorage
      await loginWithGoogle(credential, redirect);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(message);
    } finally {
      setPending(false);
    }
  };

  // ── Hydrating — show spinner ──
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // ── Already logged in ──
  if (isAuthenticated) {
    return null; // redirect effect handles navigation
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        {/* ── Heading ── */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
            <span className="text-lg font-bold text-white">E</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Welcome back
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
            Sign in to continue learning
          </p>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400">
            {error}
          </div>
        )}

        {/* ── Pending state — show spinner after Google returns, before redirect ── */}
        {pending ? (
          <div className="flex justify-center py-4">
            <Spinner size="md" label="Signing in…" />
          </div>
        ) : (
          <div className="flex justify-center">
            <GoogleLoginButton
              onSuccess={handleSuccess}
              onError={(err) => setError(err.message)}
            />
          </div>
        )}

        {/* ── Footer ── */}
        <p className="mt-6 text-center text-xs leading-relaxed text-neutral-400 dark:text-neutral-600">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </main>
  );
}
