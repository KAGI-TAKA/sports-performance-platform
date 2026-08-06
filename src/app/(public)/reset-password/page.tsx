"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { resetPasswordSchema } from "@/features/auth/schema";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const urlError = searchParams.get("error");

  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError(
        "Link reset tidak valid. Minta link baru dari halaman lupa password.",
      );
      return;
    }

    const parsed = resetPasswordSchema.safeParse({ newPassword });
    if (!parsed.success) {
      setError(
        parsed.error.flatten().fieldErrors.newPassword?.[0] ??
          "Password tidak valid",
      );
      return;
    }

    setIsLoading(true);
    const { error: resetError } = await authClient.resetPassword({
      newPassword: parsed.data.newPassword,
      token,
    });
    setIsLoading(false);

    if (resetError) {
      setError(
        resetError.message ?? "Gagal reset password, link mungkin kedaluwarsa",
      );
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/login"), 2000);
  }

  if (urlError === "INVALID_TOKEN") {
    return (
      <p className="rounded-sm bg-danger-bg px-3 py-2 text-sm text-danger">
        Link reset tidak valid atau sudah kedaluwarsa. Minta link baru dari
        halaman lupa password.
      </p>
    );
  }

  if (success) {
    return (
      <p className="rounded-sm bg-success-bg px-3 py-2 text-sm text-success">
        Password berhasil diganti. Mengarahkan ke halaman login...
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label
          htmlFor="newPassword"
          className="text-xs font-medium text-secondary"
        >
          Password baru
        </label>
        <input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
          placeholder="Minimal 8 karakter"
        />
        {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="mt-2 rounded-sm bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {isLoading ? "Menyimpan..." : "Simpan password baru"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-surface-1 p-6">
        <h2 className="font-display text-base font-semibold text-foreground">
          Buat password baru
        </h2>
        <p className="mt-1 mb-6 text-sm text-secondary">
          Masukkan password baru untuk akunmu.
        </p>
        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
