"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Shield,
  Building2,
  Lock,
  KeyRound,
  CheckCircle2,
  LogOut,
  Loader2,
  AlertCircle,
  Save,
  Check,
  Camera,
  Phone,
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { ROLE_DISPLAY_NAMES } from "@/lib/access-policy";
import {
  updateProfileNameAction,
  updateAvatarAction,
  updatePhoneAction,
} from "./actions";

interface ProfileClientProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    createdAt: Date;
  };
  member: {
    role: string;
    phone?: string | null;
  };
  organization: {
    name: string;
  };
}

export function ProfileClient({ user, member, organization }: ProfileClientProps) {
  const router = useRouter();

  // Name
  const [displayName, setDisplayName] = useState(user.name);
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  // Phone
  const [phone, setPhone] = useState(member.phone || "");
  const [isUpdatingPhone, setIsUpdatingPhone] = useState(false);

  // Avatar
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.image || null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Logout
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const roleName = ROLE_DISPLAY_NAMES[member.role] || member.role;

  // ─── HANDLERS ──────────────────────────────────────────────────
  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || displayName.trim().length < 2) {
      toast.error("Nama minimal 2 karakter");
      return;
    }
    setIsUpdatingName(true);
    const res = await updateProfileNameAction(displayName.trim());
    setIsUpdatingName(false);
    if (res.success) {
      toast.success("Nama tampilan berhasil diperbarui");
      router.refresh();
    } else {
      toast.error(res.error || "Gagal memperbarui nama");
    }
  };

  const handleUpdatePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingPhone(true);
    const res = await updatePhoneAction(phone.trim());
    setIsUpdatingPhone(false);
    if (res.success) {
      toast.success("Nomor telepon berhasil diperbarui");
      router.refresh();
    } else {
      toast.error(res.error || "Gagal memperbarui nomor telepon");
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Hanya file gambar yang diizinkan");
      return;
    }

    // Validate file size (max 2MB before compression)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 2MB");
      return;
    }

    setIsUploadingAvatar(true);

    // Compress image client-side using Canvas
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;

    img.onload = async () => {
      const canvas = document.createElement("canvas");
      const maxSize = 256;
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(objectUrl);

      const base64 = canvas.toDataURL("image/jpeg", 0.85);

      // Check compressed size (~500KB limit for base64)
      if (base64.length > 700_000) {
        toast.error("Foto terlalu besar setelah kompresi. Coba foto beresolusi lebih kecil.");
        setIsUploadingAvatar(false);
        return;
      }

      setAvatarPreview(base64);
      const res = await updateAvatarAction(base64);
      setIsUploadingAvatar(false);

      if (res.success) {
        toast.success("Foto profil berhasil diperbarui");
        router.refresh();
      } else {
        toast.error(res.error || "Gagal memperbarui foto profil");
        setAvatarPreview(user.image || null);
      }
    };

    img.onerror = () => {
      toast.error("Gagal memuat gambar");
      setIsUploadingAvatar(false);
      URL.revokeObjectURL(objectUrl);
    };
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error("Harap isi semua bidang kata sandi");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Kata sandi baru minimal 8 karakter");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi kata sandi baru tidak cocok");
      return;
    }
    setIsChangingPassword(true);
    setPasswordSuccess(false);
    try {
      const res = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: false,
      });
      if (res.error) {
        toast.error(res.error.message || "Gagal mengubah kata sandi");
      } else {
        toast.success("Kata sandi berhasil diubah");
        setPasswordSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      toast.error("Terjadi kesalahan saat mengubah kata sandi");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authClient.signOut();
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Gagal keluar");
      setIsLoggingOut(false);
    }
  };

  // ─── RENDER ───────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24">

      {/* ── PROFILE IDENTITY HERO ── */}
      <div className="rounded-2xl bg-surface-1 border border-border p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">

          {/* Avatar Upload */}
          <div className="relative shrink-0 group">
            <div className="h-20 w-20 rounded-2xl overflow-hidden border-2 border-accent/25 shadow-inner bg-accent/10">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar profil"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-accent font-black text-2xl uppercase">
                  {user.name.slice(0, 2)}
                </div>
              )}
            </div>

            {/* Camera overlay */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-0.5 text-white"
              title="Ganti foto profil"
            >
              {isUploadingAvatar ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Camera className="h-5 w-5" />
              )}
              <span className="text-[9px] font-bold">Ganti</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
              aria-label="Upload foto profil"
            />
          </div>

          {/* Identity */}
          <div className="space-y-1.5 text-center sm:text-left flex-1 min-w-0">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                <Shield className="h-3 w-3" />
                {roleName}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="h-3 w-3" />
                Akun Aktif
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-extrabold text-foreground truncate">
              {user.name}
            </h1>
            <p className="text-xs text-secondary font-mono">{user.email}</p>
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-muted pt-1">
              <Building2 className="h-3.5 w-3.5 text-muted/70" />
              <span>{organization.name}</span>
            </div>
          </div>

          <button
            type="button"
            disabled={isLoggingOut}
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800/50 transition self-center sm:self-start active:scale-95 disabled:opacity-50"
          >
            {isLoggingOut ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <LogOut className="h-3.5 w-3.5" />
            )}
            <span>Keluar</span>
          </button>
        </div>

        <p className="text-[10px] text-muted text-center sm:text-left mt-3 ml-0 sm:ml-25">
          Klik foto untuk mengganti avatar profil. Ukuran maksimal 2MB (JPG/PNG).
        </p>
      </div>

      {/* ── SELF-EDITABLE INFORMATION ── */}
      <div className="rounded-2xl bg-surface-1 border border-border p-6 shadow-sm space-y-6">
        <div className="border-b border-border/60 pb-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <User className="h-4 w-4 text-accent" />
            <span>Pengaturan Akun Pribadi</span>
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Informasi tampilan dan kredensial yang dapat Anda kelola secara mandiri.
          </p>
        </div>

        {/* Display Name */}
        <form onSubmit={handleUpdateName} className="space-y-2">
          <label htmlFor="displayName" className="block text-xs font-semibold text-foreground">
            Nama Tampilan Profil
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="flex-1 rounded-xl bg-surface-2 border border-border px-3.5 py-2.5 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-accent/40"
              placeholder="Nama tampilan..."
              required
            />
            <button
              type="submit"
              disabled={isUpdatingName || displayName === user.name}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold px-4 py-2.5 transition active:scale-95 disabled:opacity-50"
            >
              {isUpdatingName ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Simpan
            </button>
          </div>
        </form>

        {/* Phone */}
        <form onSubmit={handleUpdatePhone} className="space-y-2">
          <label htmlFor="phone" className="block text-xs font-semibold text-foreground">
            Nomor Telepon <span className="text-muted font-normal">(opsional)</span>
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl bg-surface-2 border border-border pl-8 pr-3.5 py-2.5 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-accent/40"
                placeholder="+62 812 3456 7890"
              />
            </div>
            <button
              type="submit"
              disabled={isUpdatingPhone || phone === (member.phone || "")}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 text-foreground border border-border text-xs font-bold px-4 py-2.5 transition active:scale-95 disabled:opacity-50"
            >
              {isUpdatingPhone ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5 text-accent" />}
              Simpan
            </button>
          </div>
        </form>

        {/* Password Change */}
        <div className="pt-4 border-t border-border/60 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <KeyRound className="h-4 w-4 text-accent" />
            <span>Ubah Kata Sandi</span>
          </div>
          <form onSubmit={handleChangePassword} className="space-y-3 max-w-md">
            <div>
              <label htmlFor="currentPassword" className="block text-[11px] font-medium text-secondary mb-1">Kata Sandi Lama</label>
              <input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-xl bg-surface-2 border border-border px-3.5 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-accent/40"
                placeholder="••••••••" required />
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-[11px] font-medium text-secondary mb-1">Kata Sandi Baru (Min. 8 Karakter)</label>
              <input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl bg-surface-2 border border-border px-3.5 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-accent/40"
                placeholder="••••••••" required />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-[11px] font-medium text-secondary mb-1">Konfirmasi Kata Sandi Baru</label>
              <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl bg-surface-2 border border-border px-3.5 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-accent/40"
                placeholder="••••••••" required />
            </div>
            {passwordSuccess && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
                <Check className="h-4 w-4" />
                <span>Kata sandi berhasil diperbarui!</span>
              </div>
            )}
            <button type="submit" disabled={isChangingPassword || !currentPassword || !newPassword}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 text-foreground border border-border text-xs font-bold px-4 py-2.5 transition active:scale-95 disabled:opacity-50">
              {isChangingPassword ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <KeyRound className="h-3.5 w-3.5 text-accent" />}
              Perbarui Kata Sandi
            </button>
          </form>
        </div>
      </div>

      {/* ── ADMIN-CONTROLLED READ-ONLY ── */}
      <div className="rounded-2xl bg-surface-1 border border-border p-6 shadow-sm space-y-4">
        <div className="border-b border-border/60 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted" />
              <span>Otoritas &amp; Hak Akses</span>
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Hanya dapat dimodifikasi oleh Head Coach atau Admin.
            </p>
          </div>
          <span className="text-[10.5px] font-mono text-muted bg-surface-2 px-2.5 py-1 rounded-full border border-border flex items-center gap-1 shrink-0">
            <Lock className="h-3 w-3" />
            Read-Only
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-surface-2/60 border border-border/70 space-y-1">
            <div className="text-[11px] font-semibold text-muted flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-accent" />
              <span>Peran Sistem</span>
            </div>
            <div className="font-bold text-foreground">{roleName}</div>
            <p className="text-[10.5px] text-secondary">
              Eksekusi sesi lapangan, presensi, stopwatch, dan input data tes fisik.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-2/60 border border-border/70 space-y-1">
            <div className="text-[11px] font-semibold text-muted flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-accent" />
              <span>Organisasi</span>
            </div>
            <div className="font-bold text-foreground">{organization.name}</div>
            <p className="text-[10.5px] text-secondary">
              Anggota resmi tim kepelatihan di bawah pengawasan Head Coach.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <p>
            Perlu penyesuaian penugasan atau peningkatan wewenang? Hubungi <strong>Head Coach / Admin</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
