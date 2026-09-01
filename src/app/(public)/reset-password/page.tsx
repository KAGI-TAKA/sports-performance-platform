"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { resetPasswordSchema } from "@/features/auth/schema";
import { Eye, EyeOff, CheckCircle2, AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const urlError = searchParams.get("error");

  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isLoading) return;
    setError(null);

    if (!token) {
      setError("Tautan reset tidak valid atau tidak memiliki token.");
      return;
    }

    const parsed = resetPasswordSchema.safeParse({ newPassword });
    if (!parsed.success) {
      setError(
        parsed.error.flatten().fieldErrors.newPassword?.[0] ?? "Password minimal 8 karakter"
      );
      return;
    }

    setIsLoading(true);
    try {
      const { error: resetError } = await authClient.resetPassword({
        newPassword: parsed.data.newPassword,
        token,
      });
      setIsLoading(false);

      if (resetError) {
        setError(resetError.message ?? "Gagal reset password, tautan mungkin sudah kedaluwarsa.");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setIsLoading(false);
      setError("Terjadi kesalahan saat menyimpan password baru. Silakan coba kembali.");
    }
  }

  if (urlError === "INVALID_TOKEN" || (!token && !success)) {
    return (
      <div className="space-y-4 text-left animate-in fade-in-50 duration-150">
        <div className="p-4 rounded-xl bg-danger-bg border border-danger/20 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-danger">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Tautan Kedaluwarsa atau Tidak Valid</span>
          </div>
          <p className="text-xs text-secondary leading-relaxed">
            Tautan reset password ini sudah tidak berlaku. Silakan minta tautan baru melalui halaman lupa password.
          </p>
        </div>

        <Link href="/forgot-password" className="block">
          <Button variant="outline" size="default" className="w-full justify-center">
            <span>Minta Tautan Baru</span>
          </Button>
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="p-5 rounded-xl bg-success-bg border border-success/20 space-y-2 text-left animate-in fade-in-50 duration-200">
        <div className="flex items-center gap-2 text-xs font-bold text-success">
          <CheckCircle2 className="h-4 w-4" />
          <span>Password Berhasil Diperbarui</span>
        </div>
        <p className="text-xs text-secondary leading-relaxed">
          Password baru akun Anda telah berhasil disimpan. Mengalihkan Anda ke halaman login...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="newPassword" required>
          Password Baru
        </Label>
        <div className="relative">
          <Input
            id="newPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Minimal 8 karakter"
            className="pr-10"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition p-1"
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {error && <p className="text-[11px] font-medium text-danger">{error}</p>}
      </div>

      <Button
        type="submit"
        variant="amber"
        size="lg"
        loading={isLoading}
        className="w-full justify-center shadow-2xs font-bold text-xs sm:text-sm"
      >
        <span>{isLoading ? "Menyimpan Password..." : "Simpan Password Baru"}</span>
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        <Card className="p-6 sm:p-8 shadow-sm space-y-6">
          {/* Header */}
          <div className="space-y-1.5 text-left">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-6 w-1 rounded-full bg-accent" />
              <span className="font-display font-bold text-xs uppercase tracking-wider text-accent">
                Keamanan Akun
              </span>
            </div>
            <h1 className="font-display text-xl font-bold text-foreground">
              Buat Password Baru
            </h1>
            <p className="text-xs text-secondary">
              Tentukan password baru yang kuat untuk akun Coach Zulfi Anda.
            </p>
          </div>

          <Suspense fallback={null}>
            <ResetPasswordForm />
          </Suspense>

          {/* Navigation Links */}
          <div className="pt-4 border-t border-border/60 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Kembali ke Halaman Login</span>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
