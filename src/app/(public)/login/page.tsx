"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { loginWithPortalCredentials } from "@/features/portal/actions";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!email.trim()) {
      setErrors({ email: "Email atau username wajib diisi" });
      return;
    }
    if (!password.trim()) {
      setErrors({ password: "Password wajib diisi" });
      return;
    }

    setErrors({});
    setIsLoading(true);

    // 1. Coba login Better Auth (Pelatih / Admin)
    const { error } = await authClient.signIn.email({
      email: email.trim(),
      password: password.trim(),
    });

    if (!error) {
      setIsLoading(false);
      router.push(redirectTo);
      router.refresh();
      return;
    }

    // 2. Coba login Portal Akses (Atlet / Orang Tua)
    const portalRes = await loginWithPortalCredentials(email, password);
    setIsLoading(false);

    if (portalRes.success && portalRes.redirectUrl) {
      router.push(portalRes.redirectUrl);
      router.refresh();
      return;
    }

    setFormError("Email/Username atau password salah");
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 flex flex-col items-center gap-2">
        <svg width="32" height="32" viewBox="0 0 28 28">
          <polygon
            points="14,2 24,8.5 24,19.5 14,26 4,19.5 4,8.5"
            fill="none"
            stroke="hsl(var(--accent))"
            strokeWidth="1.6"
          />
          <polygon
            points="14,8 19,11 19,17 14,20 9,17 9,11"
            fill="hsl(var(--accent))"
            opacity="0.85"
          />
        </svg>
        <h1 className="font-display text-lg font-semibold text-foreground">
          Kinetiq
        </h1>
        <p className="text-xs text-muted">Performance OS</p>
      </div>

      <div className="rounded-lg border border-border bg-surface-1 p-6">
        <h2 className="font-display text-base font-semibold text-foreground">
          Masuk ke akun kamu
        </h2>
        <p className="mt-1 text-sm text-secondary">
          Pelatih, Atlet, atau Orang Tua — Masuk untuk mengakses platform.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label
              htmlFor="email"
              className="text-xs font-medium text-secondary"
            >
              Email / Username Portal
            </label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
              placeholder="coach@akademi.com atau atlet_budi_1234"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-danger">{errors.email}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-xs font-medium text-secondary"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-accent hover:underline"
              >
                Lupa password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-danger">{errors.password}</p>
            )}
          </div>

          {formError && <p className="text-xs text-danger">{formError}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 rounded-sm bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {isLoading ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>

      <p className="mt-4 text-center text-sm text-secondary">
        Belum punya akun?{" "}
        <Link
          href="/register"
          className="font-medium text-accent hover:underline"
        >
          Daftar
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      {/* Suspense wajib karena useSearchParams butuh boundary di App Router */}
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
