"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { registerSchema } from "@/features/auth/schema";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const parsed = registerSchema.safeParse({ name, email, password });
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors({
        name: fieldErrors.name?.[0],
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
      return;
    }
    setErrors({});
    setIsLoading(true);

    const { error } = await authClient.signUp.email({
      name: parsed.data.name,
      email: parsed.data.email,
      password: parsed.data.password,
    });

    setIsLoading(false);

    if (error) {
      setFormError(error.message ?? "Pendaftaran gagal, coba lagi");
      return;
    }

    // Coach baru pasti belum punya organisasi -> arahkan bikin organisasi dulu
    router.push("/onboarding/organization");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <svg width="32" height="32" viewBox="0 0 28 28">
            <polygon points="14,2 24,8.5 24,19.5 14,26 4,19.5 4,8.5" fill="none" stroke="hsl(var(--accent))" strokeWidth="1.6" />
            <polygon points="14,8 19,11 19,17 14,20 9,17 9,11" fill="hsl(var(--accent))" opacity="0.85" />
          </svg>
          <h1 className="font-display text-lg font-semibold text-foreground">Kinetiq</h1>
          <p className="text-xs text-muted">Performance OS</p>
        </div>

        <div className="rounded-lg border border-border bg-surface-1 p-6">
          <h2 className="font-display text-base font-semibold text-foreground">Buat akun coach</h2>
          <p className="mt-1 text-sm text-secondary">Langkah berikutnya kamu akan membuat organisasi/akademi.</p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <div>
              <label htmlFor="name" className="text-xs font-medium text-secondary">Nama lengkap</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                placeholder="Coach Andi"
              />
              {errors.name && <p className="mt-1 text-xs text-danger">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="text-xs font-medium text-secondary">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                placeholder="coach@akademi.com"
              />
              {errors.email && <p className="mt-1 text-xs text-danger">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="text-xs font-medium text-secondary">Password</label>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-sm border border-border bg-background px-3 py-2 pr-10 text-sm text-foreground outline-none focus:border-accent"
                  placeholder="Minimal 8 karakter"
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
              {errors.password && <p className="mt-1 text-xs text-danger">{errors.password}</p>}
            </div>

            {formError && <p className="text-xs text-danger">{formError}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 rounded-sm bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {isLoading ? "Memproses..." : "Daftar"}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-secondary">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-medium text-accent hover:underline">Masuk</Link>
        </p>
      </div>
    </div>
  );
}