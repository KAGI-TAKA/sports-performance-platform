"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { forgotPasswordSchema } from "@/features/auth/schema";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();
    const parsed = forgotPasswordSchema.safeParse({ email: normalizedEmail });
    if (!parsed.success) {
      setError(
        parsed.error.flatten().fieldErrors.email?.[0] ?? "Email tidak valid",
      );
      return;
    }

    setIsLoading(true);
    const { error: requestError } = await authClient.requestPasswordReset({
      email: parsed.data.email,
      redirectTo: "/reset-password",
    });
    setIsLoading(false);

    if (requestError) {
      // In case of client network offline or rate limit
      console.warn("[AUTH_FORGOT_PASSWORD] Notice:", requestError.message);
    }

    // Selalu tampilkan pesan sukses generik walau email tidak terdaftar,
    // supaya orang tidak bisa mengecek email mana yang punya akun (anti-enumeration).
    setSent(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-lg border border-border bg-surface-1 p-6">
          <h2 className="font-display text-base font-semibold text-foreground">
            Lupa password
          </h2>
          <p className="mt-1 text-sm text-secondary">
            Masukkan email akunmu, kami kirim link untuk membuat password baru.
          </p>

          {sent ? (
            <p className="mt-6 rounded-sm bg-success-bg px-3 py-2 text-sm text-success">
              Kalau email tersebut terdaftar, link reset sudah dikirim. Cek
              inbox kamu.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <div>
                <label
                  htmlFor="email"
                  className="text-xs font-medium text-secondary"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                  placeholder="coach@akademi.com"
                />
                {error && <p className="mt-1 text-xs text-danger">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 rounded-sm bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
              >
                {isLoading ? "Mengirim..." : "Kirim link reset"}
              </button>
            </form>
          )}
        </div>

        <p className="mt-4 text-center text-sm text-secondary">
          <Link
            href="/login"
            className="font-medium text-accent hover:underline"
          >
            ← Kembali ke login
          </Link>
        </p>
      </div>
    </div>
  );
}
