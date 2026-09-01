"use client";

import { useState, useEffect, useTransition, use } from "react";
import Link from "next/link";
import { CheckCircle, AlertCircle, RefreshCw, ArrowRight, ShieldCheck, Mail } from "lucide-react";
import { toast } from "sonner";
import { verifyEmailToken, resendVerificationEmail } from "@/features/auth/verification-actions";

interface VerifyEmailPageProps {
  searchParams: Promise<{ token?: string; email?: string }>;
}

export default function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const resolvedParams = use(searchParams);
  const token = resolvedParams.token || "";
  const email = resolvedParams.email || "";

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [resendEmail, setResendEmail] = useState(email);
  const [isResending, startResendTransition] = useTransition();

  useEffect(() => {
    async function verify() {
      if (!token || !email) {
        setErrorMsg("Tautan verifikasi tidak lengkap. Pastikan Anda mengklik tautan lengkap dari email.");
        setLoading(false);
        return;
      }

      const res = await verifyEmailToken({ rawToken: token, email });
      if (res.success) {
        setSuccess(true);
      } else {
        setErrorMsg(res.error || "Tautan verifikasi tidak valid atau sudah kedaluwarsa.");
      }
      setLoading(false);
    }

    verify();
  }, [token, email]);

  const handleResend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) {
      toast.error("Masukkan alamat email Anda.");
      return;
    }

    startResendTransition(async () => {
      const res = await resendVerificationEmail(resendEmail);
      if (res.success) {
        toast.success(res.message || "Tautan verifikasi baru berhasil dikirim!");
        setErrorMsg(null);
      } else {
        toast.error(res.error || "Gagal mengirim ulang email verifikasi.");
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080d1a] p-4 text-foreground">
      <div className="w-full max-w-md rounded-2xl border border-border/80 bg-surface-1/90 p-8 shadow-2xl backdrop-blur-xl">
        {/* Header Icon */}
        <div className="mb-6 flex justify-center">
          {loading ? (
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 border border-brand/20 text-brand animate-pulse">
              <RefreshCw className="h-7 w-7 animate-spin" />
            </div>
          ) : success ? (
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <CheckCircle className="h-7 w-7" />
            </div>
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
              <AlertCircle className="h-7 w-7" />
            </div>
          )}
        </div>

        {/* Title & Body */}
        <div className="text-center space-y-2 mb-6">
          <h1 className="font-display text-xl font-bold text-foreground">
            {loading
              ? "Memverifikasi Alamat Email..."
              : success
              ? "Email Berhasil Diverifikasi!"
              : "Verifikasi Email Gagal"}
          </h1>
          <p className="text-xs text-muted leading-relaxed">
            {loading
              ? "Mohon tunggu sebentar selagi kami memvalidasi kredensial email Anda..."
              : success
              ? "Alamat email Anda telah berhasil diverifikasi. Akun Anda kini aktif dan siap digunakan."
              : errorMsg || "Tautan verifikasi tidak valid atau telah kedaluwarsa."}
          </p>
        </div>

        {/* Success View */}
        {success && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                Alamat <strong>{email}</strong> telah terkonfirmasi sah. Anda dapat masuk dan mengakses seluruh fitur platform.
              </div>
            </div>

            <Link
              href="/login"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 text-xs font-bold text-brand-foreground shadow-lg shadow-brand/20 hover:bg-brand/90 transition"
            >
              Lanjut ke Halaman Masuk
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {/* Error / Resend View */}
        {!loading && !success && (
          <div className="space-y-5">
            <div className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <Mail className="h-4 w-4 text-brand" />
                <span>Kirim Ulang Tautan Verifikasi</span>
              </div>

              <form onSubmit={handleResend} className="space-y-3">
                <input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="Masukkan alamat email Anda"
                  className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-xs text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-brand"
                  required
                />

                <button
                  type="submit"
                  disabled={isResending}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-surface-3 hover:bg-surface-2 border border-border py-2 text-xs font-semibold text-foreground transition disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isResending ? "animate-spin" : ""}`} />
                  {isResending ? "Mengirim..." : "Kirim Tautan Baru"}
                </button>
              </form>
            </div>

            <div className="text-center pt-2">
              <Link
                href="/login"
                className="text-xs text-muted hover:text-foreground font-medium transition"
              >
                Kembali ke Halaman Masuk
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
