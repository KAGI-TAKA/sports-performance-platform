"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { forgotPasswordSchema } from "@/features/auth/schema";
import { requestPasswordReset } from "@/features/auth/password-reset-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, RefreshCw, KeyRound, Mail } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isPending) return;
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();
    const parsed = forgotPasswordSchema.safeParse({ email: normalizedEmail });
    if (!parsed.success) {
      setError(
        parsed.error.flatten().fieldErrors.email?.[0] ?? "Format email tidak valid"
      );
      return;
    }

    startTransition(async () => {
      const res = await requestPasswordReset(normalizedEmail);
      if (!res.success && res.error) {
        toast.error(res.error);
      } else {
        setSent(true);
      }
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        <Card className="p-6 sm:p-8 shadow-sm space-y-6">
          {/* Header */}
          <div className="space-y-1.5 text-left">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-6 w-1 rounded-full bg-brand" />
              <span className="font-display font-bold text-xs uppercase tracking-wider text-brand">
                Pemulihan Akses
              </span>
            </div>
            <h1 className="font-display text-xl font-bold text-foreground">
              Lupa Password Akun
            </h1>
            <p className="text-xs text-muted leading-relaxed">
              Masukkan alamat email terdaftar Anda. Kami akan mengirimkan tautan untuk membuat password baru yang berlaku selama 1 jam.
            </p>
          </div>

          {sent ? (
            <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-3 animate-in fade-in-50 duration-200">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>Permintaan Terkirim</span>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                Jika alamat email <strong>{email}</strong> terdaftar di sistem kami, instruksi dan tautan pemulihan password telah dikirimkan ke kotak masuk Anda.
              </p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Kembali ke Halaman Masuk
                </Link>
              </div>
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
                    disabled={isPending}
                    required
                  />
                </div>
                {error && <p className="text-[11px] font-medium text-rose-500">{error}</p>}
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="w-full justify-center gap-2 bg-brand text-brand-foreground hover:bg-brand/90"
              >
                <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
                <span>{isPending ? "Memproses Permintaan..." : "Kirim Tautan Pemulihan"}</span>
              </Button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground font-medium transition"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Kembali ke Halaman Masuk
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
