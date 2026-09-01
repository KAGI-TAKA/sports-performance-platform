"use client";

import { useState, useEffect, useTransition, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, CheckCircle2, AlertTriangle, ArrowLeft, RefreshCw, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { validatePasswordResetToken, performPasswordReset } from "@/features/auth/password-reset-actions";
import { toast } from "sonner";

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string; email?: string }>;
}

export default function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const router = useRouter();
  const resolvedParams = use(searchParams);
  const token = resolvedParams.token || "";
  const emailParam = resolvedParams.email || "";

  const [isValidating, setIsValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resolvedEmail, setResolvedEmail] = useState(emailParam);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function checkToken() {
      if (!token) {
        setErrorMessage("Tautan reset password tidak valid atau tidak memiliki token.");
        setIsValidating(false);
        return;
      }

      const res = await validatePasswordResetToken(token, emailParam);
      if (res.valid) {
        setTokenValid(true);
        if (res.email) setResolvedEmail(res.email);
      } else {
        setErrorMessage(res.error || "Tautan reset password tidak valid atau sudah kedaluwarsa.");
      }
      setIsValidating(false);
    }

    checkToken();
  }, [token, emailParam]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (newPassword.length < 8) {
      toast.error("Password minimal harus 8 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi password tidak cocok.");
      return;
    }

    startTransition(async () => {
      const res = await performPasswordReset({
        token,
        email: resolvedEmail,
        newPassword,
      });

      if (res.success) {
        setSuccess(true);
        toast.success("Password berhasil diperbarui!");
        setTimeout(() => router.push("/login"), 2500);
      } else {
        toast.error(res.error || "Gagal memperbarui password.");
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        <Card className="p-6 sm:p-8 shadow-sm space-y-6">
          {/* Header */}
          <div className="space-y-1.5 text-left">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-6 w-1 rounded-full bg-brand" />
              <span className="font-display font-bold text-xs uppercase tracking-wider text-brand">
                Keamanan Akun
              </span>
            </div>
            <h1 className="font-display text-xl font-bold text-foreground">
              Atur Ulang Kata Sandi
            </h1>
            <p className="text-xs text-muted leading-relaxed">
              Buat password baru yang kuat (minimal 8 karakter) untuk akun Anda.
            </p>
          </div>

          {/* Validating State */}
          {isValidating && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
              <RefreshCw className="h-6 w-6 animate-spin text-brand" />
              <p className="text-xs text-muted">Memvalidasi tautan keamanan...</p>
            </div>
          )}

          {/* Error / Invalid Token State */}
          {!isValidating && !tokenValid && !success && (
            <div className="space-y-4 text-left animate-in fade-in-50 duration-150">
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>Tautan Kedaluwarsa atau Tidak Valid</span>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  {errorMessage || "Tautan reset password ini sudah tidak berlaku atau telah digunakan. Silakan minta tautan baru."}
                </p>
              </div>

              <Link href="/forgot-password" className="block">
                <Button variant="outline" size="default" className="w-full justify-center">
                  <span>Minta Tautan Baru</span>
                </Button>
              </Link>
            </div>
          )}

          {/* Success State */}
          {success && (
            <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-3 text-left animate-in fade-in-50 duration-200">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>Password Berhasil Diperbarui</span>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                Password baru Anda telah tersimpan secara aman. Seluruh sesi login sebelumnya telah ditutup untuk keamanan. Anda akan dialihkan ke halaman masuk...
              </p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Lanjut ke Halaman Masuk Sekarang
                </Link>
              </div>
            </div>
          )}

          {/* Password Reset Form */}
          {!isValidating && tokenValid && !success && (
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
                    disabled={isSubmitting}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" required>
                  Konfirmasi Password Baru
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password baru"
                    disabled={isSubmitting}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full justify-center gap-2 bg-brand text-brand-foreground hover:bg-brand/90"
              >
                <RefreshCw className={`h-4 w-4 ${isSubmitting ? "animate-spin" : ""}`} />
                <span>{isSubmitting ? "Menyimpan Password..." : "Simpan Password Baru"}</span>
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
