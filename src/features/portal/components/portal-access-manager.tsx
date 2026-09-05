"use client";

import { useState, useTransition } from "react";
import {
  createPortalAccess,
  revokePortalAccess,
  deletePortalAccess,
  resetPortalPassword,
  updatePortalCredentials,
} from "../actions";
import { toast } from "sonner";
import {
  Link as LinkIcon,
  Copy,
  Check,
  Ban,
  Clock,
  ShieldCheck,
  User,
  Users,
  MessageSquareShare,
  Plus,
  Loader2,
  KeyRound,
  Eye,
  EyeOff,
  RotateCcw,
  Trash2,
  Edit3,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AccessItem {
  id: string;
  accessType: string;
  username?: string | null;
  plainPassword?: string | null;
  expiresAt: string;
  revokedAt: string | null;
  createdAt: string;
  createdByName: string;
  isExpired: boolean;
  isRevoked: boolean;
  isActive: boolean;
}

interface PortalAccessManagerProps {
  athleteId: string;
  athleteName: string;
  parentPhone?: string | null;
  accesses: AccessItem[];
}

export function PortalAccessManager({
  athleteId,
  athleteName,
  parentPhone,
  accesses,
}: PortalAccessManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"link" | "credentials">("link");
  const [isPending, startTransition] = useTransition();

  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});

  // Edit Credential Modal States
  const [editingAccess, setEditingAccess] = useState<AccessItem | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");

  // Filter 2 canonical accounts
  const athleteAccess = accesses.find((a) => a.accessType === "ATHLETE" && a.isActive) || accesses.find((a) => a.accessType === "ATHLETE") || null;
  const parentAccess = accesses.find((a) => a.accessType === "PARENT" && a.isActive) || accesses.find((a) => a.accessType === "PARENT") || null;

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const res = await createPortalAccess(athleteId, formData);
      if (res.success && res.rawToken) {
        toast.success("Link & Kredensial Portal berhasil dibuat/diperbarui!");
        setCreatedToken(res.rawToken);
        form.reset();
      } else {
        toast.error(res.error ?? "Gagal membuat link akses portal");
      }
    });
  }

  async function handleQuickCreate(accessType: "ATHLETE" | "PARENT") {
    const formData = new FormData();
    formData.append("accessType", accessType);
    formData.append("expiresInDays", "90");

    startTransition(async () => {
      const res = await createPortalAccess(athleteId, formData);
      if (res.success && res.rawToken) {
        toast.success(`Akun Login ${accessType === "PARENT" ? "Orang Tua" : "Atlet"} berhasil dibuat!`);
        setCreatedToken(res.rawToken);
      } else {
        toast.error(res.error ?? "Gagal membuat akun akses");
      }
    });
  }

  async function handleRevoke(accessId: string) {
    if (!confirm("Apakah Anda yakin ingin mencabut akses portal ini?")) return;

    startTransition(async () => {
      const res = await revokePortalAccess(accessId, athleteId);
      if (res.success) {
        toast.success("Akses portal berhasil dicabut");
      } else {
        toast.error(res.error ?? "Gagal mencabut akses");
      }
    });
  }

  async function handleDelete(accessId: string) {
    if (!confirm("Apakah Anda yakin ingin MENGHAPUS PERMANEN riwayat akses ini?")) return;

    startTransition(async () => {
      const res = await deletePortalAccess(accessId, athleteId);
      if (res.success) {
        toast.success("Riwayat akses portal berhasil dihapus permanen");
      } else {
        toast.error(res.error ?? "Gagal menghapus riwayat akses");
      }
    });
  }

  async function handleResetPassword(accessId: string) {
    if (!confirm("Reset password akan memperbarui kredensial login atlet/orang tua ini. Lanjutkan?")) return;

    startTransition(async () => {
      const res = await resetPortalPassword(accessId, athleteId);
      if (res.success) {
        toast.success(`Password berhasil di-reset!\nUsername: ${res.username}\nPassword Baru: ${res.plainPassword}`);
      } else {
        toast.error(res.error ?? "Gagal me-reset password");
      }
    });
  }

  function openEditModal(access: AccessItem) {
    setEditingAccess(access);
    setEditUsername(access.username ?? "");
    setEditPassword(access.plainPassword ?? "");
  }

  async function handleSaveCredentials(e: React.FormEvent) {
    e.preventDefault();
    if (!editingAccess) return;

    startTransition(async () => {
      const res = await updatePortalCredentials(
        editingAccess.id,
        athleteId,
        editUsername,
        editPassword
      );

      if (res.success) {
        toast.success(`Kredensial login berhasil diperbarui!\nUsername: ${res.username}`);
        setEditingAccess(null);
      } else {
        toast.error(res.error ?? "Gagal memperbarui username & password");
      }
    });
  }

  function getPortalUrl(token: string) {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/portal/${token}`;
    }
    return `/portal/${token}`;
  }

  function handleCopyText(text: string, fieldId: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    toast.success(`${label} berhasil disalin!`);
    setTimeout(() => setCopiedField(null), 2000);
  }

  function getWhatsAppShareUrl(token: string) {
    const url = getPortalUrl(token);
    const text = `⚡ *LINK PORTAL EVALUASI ATLET*\n------------------------------------\n👤 *Atlet:* ${athleteName}\n\nBerikut adalah link akses resmi untuk melihat hasil evaluasi fisik, program latihan, dan jadwal sesi:\n🔗 ${url}\n\n_Link ini bersifat rahasia dan aman (read-only)._`;
    const encodedText = encodeURIComponent(text);

    if (parentPhone) {
      let cleanPhone = parentPhone.replace(/[^0-9]/g, "");
      if (cleanPhone.startsWith("0")) {
        cleanPhone = "62" + cleanPhone.slice(1);
      }
      return `https://wa.me/${cleanPhone}?text=${encodedText}`;
    }
    return `https://wa.me/?text=${encodedText}`;
  }

  function togglePasswordVisibility(id: string) {
    setShowPasswordMap((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="gap-1.5 font-semibold text-xs border-accent/30 text-accent hover:bg-accent/10"
      >
        <ShieldCheck className="h-3.5 w-3.5" />
        Portal &amp; Akun Akses ({accesses.filter((a) => a.isActive).length} Aktif)
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent onClose={() => setIsOpen(false)} className="max-w-lg p-5 sm:p-6 overflow-y-auto max-h-[85vh]">
          <DialogHeader className="pr-8">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-accent shrink-0" />
              <DialogTitle className="text-base font-bold">
                Kelola Akses Portal Atlet &amp; Orang Tua
              </DialogTitle>
            </div>
            <p className="text-xs text-muted mt-0.5 leading-relaxed">
              Dual-option access: Gunakan Link Instan (WA) atau 2 Akun Login Resmi (Atlet &amp; Orang Tua) untuk {athleteName}.
            </p>
          </DialogHeader>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2 border-b border-border/80 pb-2">
            <button
              onClick={() => setActiveTab("link")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === "link"
                  ? "bg-accent/15 text-accent border border-accent/30"
                  : "text-muted hover:text-foreground hover:bg-surface-2"
              }`}
            >
              <LinkIcon className="h-3.5 w-3.5" />
              Opsi 1: Link &amp; QR Instan
            </button>
            <button
              onClick={() => setActiveTab("credentials")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === "credentials"
                  ? "bg-accent/15 text-accent border border-accent/30"
                  : "text-muted hover:text-foreground hover:bg-surface-2"
              }`}
            >
              <KeyRound className="h-3.5 w-3.5" />
              Opsi 2: 2 Akun Login (Atlet &amp; Orang Tua)
            </button>
          </div>

          {activeTab === "link" ? (
            <div className="space-y-4">
              {/* New Token Created Result Banner */}
              {createdToken && (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs space-y-2">
                  <div className="flex items-center justify-between font-semibold text-emerald-400">
                    <span className="flex items-center gap-1">
                      <Check className="h-4 w-4" />
                      Link Akses Portal Berhasil Dibuat!
                    </span>
                    <button
                      onClick={() => setCreatedToken(null)}
                      className="text-muted hover:text-foreground text-[11px]"
                    >
                      Tutup
                    </button>
                  </div>
                  <div className="font-mono text-[11px] bg-background/80 p-2 rounded border border-border break-all select-all">
                    {getPortalUrl(createdToken)}
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      size="xs"
                      onClick={() => handleCopyText(getPortalUrl(createdToken), "created-link", "Link portal")}
                      className="gap-1 bg-accent text-white hover:bg-accent/90"
                    >
                      {copiedField === "created-link" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copiedField === "created-link" ? "Tersalin!" : "Salin Link"}
                    </Button>
                    <a
                      href={getWhatsAppShareUrl(createdToken)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-500 transition"
                    >
                      <MessageSquareShare className="h-3 w-3" />
                      Kirim ke WA Orang Tua
                    </a>
                  </div>
                </div>
              )}

              {/* Form Create Access */}
              <form onSubmit={handleCreate} className="space-y-3 text-xs">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5 text-accent" />
                  Buat / Perbarui Link Akses
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-muted font-medium mb-1 flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      Tipe Penerima
                    </label>
                    <select
                      name="accessType"
                      defaultValue="PARENT"
                      className="w-full rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-foreground focus:border-accent focus:outline-none"
                    >
                      <option value="PARENT">Orang Tua (Parent)</option>
                      <option value="ATHLETE">Atlet (Athlete)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-muted font-medium mb-1 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      Masa Berlaku
                    </label>
                    <select
                      name="expiresInDays"
                      defaultValue="30"
                      className="w-full rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-foreground focus:border-accent focus:outline-none"
                    >
                      <option value="7">7 Hari</option>
                      <option value="30">30 Hari (Standard)</option>
                      <option value="90">90 Hari (3 Bulan)</option>
                      <option value="180">180 Hari (6 Bulan)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isPending}
                    size="sm"
                    className="bg-accent hover:bg-accent/90 text-white font-semibold gap-1.5"
                  >
                    {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Generate / Perbarui Link Portal
                  </Button>
                </div>
              </form>

              {/* Active & History Links List with Delete Option */}
              <div className="space-y-2 pt-3 border-t border-border text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-accent" />
                    Riwayat Link Akses ({accesses.length})
                  </span>
                  <span className="text-[10px] text-muted">
                    Hapus link usang untuk merapikan daftar
                  </span>
                </div>

                {accesses.length === 0 ? (
                  <p className="text-muted text-[11px] py-3 text-center">
                    Belum ada riwayat link portal yang dibuat untuk atlet ini.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {accesses.map((acc) => (
                      <div
                        key={acc.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-surface-2 p-2.5 gap-2"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground truncate">
                              {acc.accessType === "PARENT" ? "Orang Tua" : "Atlet"}
                            </span>
                            {acc.isActive ? (
                              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.2 text-[10px] font-semibold text-emerald-400">
                                Aktif
                              </span>
                            ) : acc.isRevoked ? (
                              <span className="rounded-full bg-rose-500/10 border border-rose-500/20 px-2 py-0.2 text-[10px] font-semibold text-rose-400">
                                Dicabut
                              </span>
                            ) : (
                              <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.2 text-[10px] font-semibold text-amber-400">
                                Kedaluwarsa
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted truncate">
                            Exp:{" "}
                            {new Date(acc.expiresAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })} · Dibuat oleh {acc.createdByName}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {acc.isActive && (
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => handleRevoke(acc.id)}
                              disabled={isPending}
                              className="h-7 px-2 text-rose-400 border-rose-500/30 hover:bg-rose-500/10 text-[11px]"
                              title="Cabut akses"
                            >
                              <Ban className="h-3 w-3" />
                              <span className="hidden sm:inline">Cabut</span>
                            </Button>
                          )}

                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={() => handleDelete(acc.id)}
                            disabled={isPending}
                            className="h-7 px-2 text-muted hover:text-rose-400 hover:bg-rose-950/20 text-[11px]"
                            title="Hapus riwayat akses permanen"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                            <span className="hidden sm:inline">Hapus</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* TAB 2: STANDARDIZED 2 CREDENTIALS ACCOUNTS (ATLET & ORANG TUA) */
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-200 text-xs">
                💡 Setiap atlet memiliki <strong>maksimal 2 akun login resmi</strong> (1 Akun Atlet &amp; 1 Akun Orang Tua). Anda dapat mengedit username &amp; password kustom di bawah ini.
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* 1. AKUN LOGIN ATLET */}
                <div className="p-4 rounded-xl border border-border bg-surface-2 space-y-3">
                  <div className="flex items-center justify-between border-b border-border/80 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-bold text-foreground text-xs">Akun Login Atlet</div>
                        <div className="text-[10px] text-muted">Untuk login mandiri atlet di /login</div>
                      </div>
                    </div>

                    {athleteAccess?.isActive ? (
                      <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                        ● Aktif
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-800 text-slate-400 px-2 py-0.5 text-[10px] font-medium">
                        Belum Dibuat
                      </span>
                    )}
                  </div>

                  {athleteAccess ? (
                    <div className="space-y-2.5">
                      {/* Username Field */}
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-background border border-border">
                        <div>
                          <span className="text-[10px] text-muted block uppercase tracking-wider font-semibold">
                            Username / ID
                          </span>
                          <span className="font-mono font-bold text-foreground text-xs">
                            {athleteAccess.username ?? "—"}
                          </span>
                        </div>
                        {athleteAccess.username && (
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => handleCopyText(athleteAccess.username!, `u-${athleteAccess.id}`, "Username")}
                            className="gap-1 text-[11px]"
                          >
                            {copiedField === `u-${athleteAccess.id}` ? (
                              <Check className="h-3 w-3 text-emerald-400" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                            {copiedField === `u-${athleteAccess.id}` ? "Tersalin!" : "Salin"}
                          </Button>
                        )}
                      </div>

                      {/* Password Field */}
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-background border border-border">
                        <div>
                          <span className="text-[10px] text-muted block uppercase tracking-wider font-semibold">
                            Password
                          </span>
                          <span className="font-mono font-bold text-foreground text-xs">
                            {showPasswordMap[athleteAccess.id]
                              ? athleteAccess.plainPassword ?? "••••••••"
                              : "••••••••"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={() => togglePasswordVisibility(athleteAccess.id)}
                            className="h-7 px-2 text-muted hover:text-foreground"
                          >
                            {showPasswordMap[athleteAccess.id] ? (
                              <EyeOff className="h-3.5 w-3.5" />
                            ) : (
                              <Eye className="h-3.5 w-3.5" />
                            )}
                          </Button>
                          {athleteAccess.plainPassword && (
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() =>
                                handleCopyText(athleteAccess.plainPassword!, `p-${athleteAccess.id}`, "Password")
                              }
                              className="gap-1 text-[11px]"
                            >
                              {copiedField === `p-${athleteAccess.id}` ? (
                                <Check className="h-3 w-3 text-emerald-400" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                              {copiedField === `p-${athleteAccess.id}` ? "Tersalin!" : "Salin"}
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between pt-1 gap-2">
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => openEditModal(athleteAccess)}
                          className="gap-1 text-[11px] border-accent/40 text-accent hover:bg-accent/10"
                        >
                          <Edit3 className="h-3 w-3" />
                          Edit Username &amp; Password
                        </Button>

                        <div className="flex items-center gap-1">
                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={() => handleResetPassword(athleteAccess.id)}
                            disabled={isPending}
                            className="gap-1 text-[10px] text-muted hover:text-accent"
                          >
                            <RotateCcw className="h-3 w-3" />
                            Reset Acak
                          </Button>
                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={() => handleDelete(athleteAccess.id)}
                            disabled={isPending}
                            className="gap-1 text-[10px] text-rose-400 hover:text-rose-300 hover:bg-rose-950/20"
                          >
                            <Trash2 className="h-3 w-3" />
                            Hapus
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-2 text-center space-y-2">
                      <p className="text-[11px] text-muted">Akun login atlet belum dibuat.</p>
                      <Button
                        size="xs"
                        onClick={() => handleQuickCreate("ATHLETE")}
                        disabled={isPending}
                        className="bg-sky-600 hover:bg-sky-500 text-white font-semibold"
                      >
                        {isPending && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                        + Buat Akun Atlet Sekarang
                      </Button>
                    </div>
                  )}
                </div>

                {/* 2. AKUN LOGIN ORANG TUA */}
                <div className="p-4 rounded-xl border border-border bg-surface-2 space-y-3">
                  <div className="flex items-center justify-between border-b border-border/80 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                        <Users className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-bold text-foreground text-xs">Akun Login Orang Tua</div>
                        <div className="text-[10px] text-muted">Untuk akses Parent Portal &amp; pemantauan</div>
                      </div>
                    </div>

                    {parentAccess?.isActive ? (
                      <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                        ● Aktif
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-800 text-slate-400 px-2 py-0.5 text-[10px] font-medium">
                        Belum Dibuat
                      </span>
                    )}
                  </div>

                  {parentAccess ? (
                    <div className="space-y-2.5">
                      {/* Username Field */}
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-background border border-border">
                        <div>
                          <span className="text-[10px] text-muted block uppercase tracking-wider font-semibold">
                            Username / ID
                          </span>
                          <span className="font-mono font-bold text-foreground text-xs">
                            {parentAccess.username ?? "—"}
                          </span>
                        </div>
                        {parentAccess.username && (
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => handleCopyText(parentAccess.username!, `u-${parentAccess.id}`, "Username")}
                            className="gap-1 text-[11px]"
                          >
                            {copiedField === `u-${parentAccess.id}` ? (
                              <Check className="h-3 w-3 text-emerald-400" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                            {copiedField === `u-${parentAccess.id}` ? "Tersalin!" : "Salin"}
                          </Button>
                        )}
                      </div>

                      {/* Password Field */}
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-background border border-border">
                        <div>
                          <span className="text-[10px] text-muted block uppercase tracking-wider font-semibold">
                            Password
                          </span>
                          <span className="font-mono font-bold text-foreground text-xs">
                            {showPasswordMap[parentAccess.id]
                              ? parentAccess.plainPassword ?? "••••••••"
                              : "••••••••"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={() => togglePasswordVisibility(parentAccess.id)}
                            className="h-7 px-2 text-muted hover:text-foreground"
                          >
                            {showPasswordMap[parentAccess.id] ? (
                              <EyeOff className="h-3.5 w-3.5" />
                            ) : (
                              <Eye className="h-3.5 w-3.5" />
                            )}
                          </Button>
                          {parentAccess.plainPassword && (
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() =>
                                handleCopyText(parentAccess.plainPassword!, `p-${parentAccess.id}`, "Password")
                              }
                              className="gap-1 text-[11px]"
                            >
                              {copiedField === `p-${parentAccess.id}` ? (
                                <Check className="h-3 w-3 text-emerald-400" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                              {copiedField === `p-${parentAccess.id}` ? "Tersalin!" : "Salin"}
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between pt-1 gap-2">
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => openEditModal(parentAccess)}
                          className="gap-1 text-[11px] border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                        >
                          <Edit3 className="h-3 w-3" />
                          Edit Username &amp; Password
                        </Button>

                        <div className="flex items-center gap-1">
                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={() => handleResetPassword(parentAccess.id)}
                            disabled={isPending}
                            className="gap-1 text-[10px] text-muted hover:text-emerald-400"
                          >
                            <RotateCcw className="h-3 w-3" />
                            Reset Acak
                          </Button>
                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={() => handleDelete(parentAccess.id)}
                            disabled={isPending}
                            className="gap-1 text-[10px] text-rose-400 hover:text-rose-300 hover:bg-rose-950/20"
                          >
                            <Trash2 className="h-3 w-3" />
                            Hapus
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-2 text-center space-y-2">
                      <p className="text-[11px] text-muted">Akun login orang tua belum dibuat.</p>
                      <Button
                        size="xs"
                        onClick={() => handleQuickCreate("PARENT")}
                        disabled={isPending}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                      >
                        {isPending && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                        + Buat Akun Orang Tua Sekarang
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── EDIT CREDENTIALS MODAL DIALOG ──────────────────────────── */}
      {editingAccess && (
        <Dialog open={!!editingAccess} onOpenChange={(open) => !open && setEditingAccess(null)}>
          <DialogContent onClose={() => setEditingAccess(null)} className="max-w-md p-5 sm:p-6">
            <DialogHeader className="pr-8">
              <div className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-accent shrink-0" />
                <DialogTitle className="text-base font-bold">
                  Edit Username &amp; Password Akun {editingAccess.accessType === "PARENT" ? "Orang Tua" : "Atlet"}
                </DialogTitle>
              </div>
              <p className="text-xs text-muted mt-0.5">
                Ubah kredensial login akun {athleteName} sesuai kebutuhan.
              </p>
            </DialogHeader>

            <form onSubmit={handleSaveCredentials} className="space-y-4 pt-2 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground block">
                  Username Baru
                </label>
                <input
                  type="text"
                  required
                  minLength={3}
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value.toLowerCase())}
                  placeholder="contoh: atlet_rangga / ortu_rangga"
                  className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-foreground font-mono focus:border-accent focus:outline-none"
                />
                <span className="text-[10px] text-muted block">
                  Huruf kecil, angka, dan underscore (_). Minimal 3 karakter.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground block">
                  Password Baru
                </label>
                <input
                  type="text"
                  required
                  minLength={6}
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-foreground font-mono focus:border-accent focus:outline-none"
                />
                <span className="text-[10px] text-muted block">
                  Password akan dienkripsi secara aman dan langsung aktif untuk login di /login.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingAccess(null)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  size="sm"
                  className="bg-accent hover:bg-accent/90 text-white font-semibold"
                >
                  {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                  Simpan Kredensial
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
