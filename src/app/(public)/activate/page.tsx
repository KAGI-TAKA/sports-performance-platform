"use client";

import { useState, useTransition, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Dumbbell, ShieldAlert, KeyRound, ArrowRight, User, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { validateActivationToken, activateAthleteAccount } from "@/features/auth/athlete-actions";

interface AthleteActivatePageProps {
  searchParams: Promise<{ token?: string; u?: string }>;
}

export default function AthleteActivatePage({ searchParams }: AthleteActivatePageProps) {
  const router = useRouter();
  const resolvedParams = use(searchParams);
  const rawToken = resolvedParams.token ?? "";
  const username = resolvedParams.u ?? "";

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [validUsername, setValidUsername] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function check() {
      if (!rawToken || !username) {
        setErrorMsg("Tautan aktivasi tidak lengkap. Gunakan tautan yang dibagikan oleh pelatih atau admin Anda.");
        setLoading(false);
        return;
      }

      const res = await validateActivationToken(rawToken, username);
      if (!res.valid || !res.username) {
        setErrorMsg(res.error || "Tautan aktivasi tidak valid atau sudah kedaluwarsa.");
      } else {
        setValidUsername(res.username);
      }
      setLoading(false);
    }

    check();
  }, [rawToken, username]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Konfirmasi password tidak cocok.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password minimal 6 karakter.");
      return;
    }

    startTransition(async () => {
      const res = await activateAthleteAccount({
        rawToken,
        username: validUsername!,
        password,
      });

      if (res.success) {
        toast.success("Akun atlet berhasil diaktifkan! Silakan masuk dengan username dan password Anda.");
        router.push("/login?activated=true");
      } else {
        toast.error(res.error || "Gagal mengaktifkan akun.");
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
          <p className="text-xs font-medium">Memvalidasi tautan aktivasi...</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !validUsername) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/90 p-8 text-center shadow-2xl space-y-4">
          <div className="flex justify-center">
            <div className="h-14 w-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
              <ShieldAlert className="h-8 w-8" />
            </div>
          </div>
          <h1 className="font-display text-lg font-bold text-white">
            Tautan Aktivasi Tidak Valid
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            {errorMsg}
          </p>
          <div className="pt-4 border-t border-slate-800">
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition"
            >
              ← Kembali ke Halaman Masuk
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 [color-scheme:dark]">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/95 backdrop-blur-md p-7 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 mb-1">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="font-display text-xl font-bold text-white tracking-tight">
            Aktivasi Akun Atlet
          </h1>
          <p className="text-xs text-slate-400">
            Atur password baru untuk mulai mengakses portal performa atlet Anda.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Username Atlet
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                value={`@${validUsername}`}
                disabled
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-800/40 text-cyan-400 cursor-not-allowed font-mono select-all font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Buat Password Baru
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-9 pr-9 py-2 text-xs rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Konfirmasi Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Ketik ulang password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-9 pr-9 py-2 text-xs rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 px-4 py-2.5 text-xs font-bold text-white transition shadow-lg shadow-cyan-600/25 disabled:opacity-50 mt-2 cursor-pointer"
          >
            {isPending ? "Mengaktifkan..." : "Aktifkan Akun"}
            <ArrowRight className="h-3.5 w-3.5 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
}
