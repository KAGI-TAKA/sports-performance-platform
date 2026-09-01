"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { forgotPasswordSchema } from "@/features/auth/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isLoading) return;
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();
    const parsed = forgotPasswordSchema.safeParse({ email: normalizedEmail });
    if (!parsed.success) {
      setError(
        parsed.error.flatten().fieldErrors.email?.[0] ?? "Format email tidak valid"
      );
      return;
    }

    setIsLoading(true);
    try {
      const { error: requestError } = await authClient.requestPasswordReset({
        email: parsed.data.email,
        redirectTo: "/reset-password",
      });
      setIsLoading(false);

      if (requestError) {
        console.warn("[AUTH_FORGOT_PASSWORD] Notice:", requestError.message);
      }

      // Anti-enumeration: Selalu tampilkan konfirmasi sukses generik
      setSent(true);
    } catch {
      setIsLoading(false);
      setSent(true);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        <Card className="p-6 sm:p-8 shadow-sm space-y-6">
          {/* Header */}
          <div className="space-y-1.5 text-left">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-6 w-1 rounded-full bg-accent" />
              <span className="font-display font-bold text-xs uppercase tracking-wider text-accent">
                Pemulihan Akses
              </span>
            </div>
            <h1 className="font-display text-xl font-bold text-foreground">
              Lupa Password Akun
            </h1>
            <p className="text-xs text-secondary leading-relaxed">
              Masukkan alamat email terdaftar Anda. Kami akan mengirimkan tautan untuk membuat password baru.
            </p>
          </div>

          {sent ? (
            <div className="p-4 rounded-xl bg-success-bg border border-success/20 space-y-2 animate-in fade-in-50 duration-200">
              <div className="flex items-center gap-2 text-xs font-bold text-success">
                <CheckCircle2 className="h-4 w-4" />
                <span>Permintaan Terkirim</span>
              </div>
              <p className="text-xs text-secondary leading-relaxed">
                Jika alamat email <strong>{email}</strong> terdaftar di sistem, tautan pemulihan password telah dikirimkan ke kotak masuk Anda.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" required>
                  Alamat Email Akun
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="coach@email.com"
                    disabled={isLoading}
                  />
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
                <Mail className="h-4 w-4 mr-1.5" />
                <span>{isLoading ? "Mengirim Tautan..." : "Kirim Tautan Reset Password"}</span>
              </Button>
            </form>
          )}

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
