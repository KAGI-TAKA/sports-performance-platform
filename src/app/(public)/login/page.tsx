"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { loginWithPortalCredentials } from "@/features/portal/actions";
import { Eye, EyeOff, ShieldCheck, ArrowLeft, Activity, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function LoginForm() {
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect") ?? "/dashboard";
  // Safe internal redirect only (prevent open-redirect attacks)
  const redirectTo = rawRedirect.startsWith("/") && !rawRedirect.startsWith("//") ? rawRedirect : "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isLoading) return;
    setFormError(null);

    const inputClean = email.trim();
    const passwordClean = password.trim();

    if (!inputClean) {
      setErrors({ email: "Email atau Username wajib diisi" });
      return;
    }
    if (!passwordClean) {
      setErrors({ password: "Password wajib diisi" });
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const isEmail = inputClean.includes("@");

      // 1. Jika berformat email, autentikasi via Better Auth (Admin / Coach)
      if (isEmail) {
        const { error } = await authClient.signIn.email({
          email: inputClean.toLowerCase(),
          password: passwordClean,
        });

        if (!error) {
          window.location.href = redirectTo;
          return;
        }
      }

      // 2. Autentikasi via Portal Kredensial (Atlet / Orang Tua)
      const portalRes = await loginWithPortalCredentials(inputClean, passwordClean);

      if (portalRes.success && portalRes.redirectUrl) {
        window.location.href = portalRes.redirectUrl;
        return;
      }

      setIsLoading(false);
      setFormError("Email/Username atau password tidak sesuai");
    } catch {
      setIsLoading(false);
      setFormError("Terjadi kendala saat memproses login. Silakan coba kembali.");
    }
  }

  return (
    <div className="w-full max-w-4xl grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
      {/* Left Column: Brand & Philosophy Context (Visible on Desktop) */}
      <div className="hidden lg:flex lg:col-span-6 flex-col justify-between space-y-6 text-left">
        <div className="space-y-4">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="h-8 w-1.5 rounded-full bg-accent transition-transform group-hover:scale-y-110" />
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-lg tracking-tight text-foreground leading-none">
                COACH ZULFI
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-muted leading-tight mt-0.5">
                Athletic Performance Hub
              </span>
            </div>
          </Link>

          <div className="space-y-2 pt-2">
            <Badge variant="amber" size="sm">
              PRIVATE ATHLETIC PLATFORM
            </Badge>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground leading-snug">
              Setiap Perkembangan Atlet Memiliki Prosesnya Sendiri.
            </h1>
            <p className="text-xs text-secondary leading-relaxed">
              Ruang pemantauan perkembangan fisik dan manajemen kepelatihan privat berbasis data sport science bersama Coach Zulfi.
            </p>
          </div>
        </div>

        {/* 6-Step Cycle Highlight */}
        <div className="p-4 rounded-xl border border-border bg-surface-1/80 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-accent uppercase tracking-wider">
            <Activity className="h-3.5 w-3.5" />
            <span>Alur Pembinaan Terintegrasi</span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono font-bold text-secondary divide-x divide-border pt-1">
            <span className="pr-1">ASSESS</span>
            <span className="px-1">ANALYZE</span>
            <span className="px-1">PROGRAM</span>
            <span className="px-1">DEVELOP</span>
            <span className="px-1">MONITOR</span>
            <span className="pl-1">REASSESS</span>
          </div>
        </div>

        <div className="pt-2 text-[11px] text-muted flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-accent shrink-0" />
          <span>Akses aman terenkripsi untuk Pelatih, Atlet, dan Orang Tua.</span>
        </div>
      </div>

      {/* Right Column: Authentication Card */}
      <div className="lg:col-span-6 w-full max-w-md mx-auto">
        <Card className="p-6 sm:p-8 shadow-sm space-y-6">
          {/* Header Mobile / Title */}
          <div className="space-y-1 text-left">
            <div className="lg:hidden flex items-center gap-2 mb-3">
              <div className="h-6 w-1 rounded-full bg-accent" />
              <span className="font-display font-bold text-sm text-foreground">
                COACH ZULFI ATHLETIC
              </span>
            </div>
            <h2 className="font-display text-lg sm:text-xl font-bold text-foreground">
              Masuk ke Akun Anda
            </h2>
            <p className="text-xs text-muted">
              Masukkan email pelatih atau username portal yang telah diberikan.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" required>
                Email atau Username Portal
              </Label>
              <Input
                id="email"
                type="text"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="coach@email.com atau ortu_atlet_1234"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-[11px] font-medium text-danger">{errors.email}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" required>
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-accent hover:underline"
                  tabIndex={0}
                >
                  Lupa password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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
              {errors.password && (
                <p className="text-[11px] font-medium text-danger">{errors.password}</p>
              )}
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-danger-bg border border-danger/20 text-xs font-medium text-danger animate-in fade-in-50 duration-150">
                {formError}
              </div>
            )}

            <Button
              type="submit"
              variant="amber"
              size="lg"
              loading={isLoading}
              className="w-full justify-center shadow-2xs font-bold text-xs sm:text-sm mt-2"
            >
              <span>{isLoading ? "Memproses Autentikasi..." : "Masuk ke Sistem"}</span>
            </Button>
          </form>

          {/* Return to Website */}
          <div className="pt-4 border-t border-border/60 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Kembali ke Halaman Utama</span>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
