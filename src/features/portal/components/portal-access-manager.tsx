"use client";

import { useState, useTransition } from "react";
import { createPortalAccess, revokePortalAccess, resetPortalPassword } from "../actions";
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

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const res = await createPortalAccess(athleteId, formData);
      if (res.success && res.rawToken) {
        toast.success("Link & Kredensial Portal berhasil dibuat!");
        setCreatedToken(res.rawToken);
        form.reset();
      } else {
        toast.error(res.error ?? "Gagal membuat link akses portal");
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
              Dual-option access: Gunakan Link Instan (WA) atau Username &amp; Password untuk {athleteName}.
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
              Opsi 2: Username &amp; Password Login
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
                  Buat Link Akses Baru
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
                    Generate Link Portal
                  </Button>
                </div>
              </form>

              {/* Active Links List */}
              <div className="space-y-2 pt-3 border-t border-border text-xs">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-accent" />
                  Daftar Akses Portal Tersimpan ({accesses.length})
                </div>

                {accesses.length === 0 ? (
                  <p className="text-muted text-[11px] py-3 text-center">
                    Belum ada link portal yang dibuat untuk atlet ini.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {accesses.map((acc) => (
                      <div
                        key={acc.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-surface-2 p-2.5"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground">
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
                          <p className="text-[11px] text-muted">
                            Exp:{" "}
                            {new Date(acc.expiresAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>

                        {acc.isActive && (
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => handleRevoke(acc.id)}
                            disabled={isPending}
                            className="gap-1 text-rose-400 border-rose-500/30 hover:bg-rose-500/10 text-[11px]"
                          >
                            <Ban className="h-3 w-3" />
                            Cabut
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* TAB 2: CREDENTIALS (USERNAME & PASSWORD) */
            <div className="space-y-4 text-xs">
              <p className="text-muted leading-relaxed">
                Kredensial login ini dapat digunakan oleh Atlet dan Orang Tua untuk masuk secara resmi melalui halaman <code className="text-accent font-mono">/login</code>.
              </p>

              {accesses.filter((a) => a.isActive).length === 0 ? (
                <div className="p-4 rounded-lg border border-border bg-surface-2 text-center text-muted">
                  Belum ada akun aktif. Silakan buat akses portal terlebih dahulu pada Opsi 1.
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {accesses
                    .filter((a) => a.isActive)
                    .map((acc) => {
                      const isShowingPass = showPasswordMap[acc.id] ?? false;
                      return (
                        <div
                          key={acc.id}
                          className="p-3 rounded-xl border border-border bg-surface-2/70 space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-foreground flex items-center gap-1.5">
                              <KeyRound className="h-3.5 w-3.5 text-accent" />
                              Akun Login {acc.accessType === "PARENT" ? "Orang Tua" : "Atlet"}
                            </span>
                            <Button
                              size="xs"
                              variant="ghost"
                              onClick={() => handleResetPassword(acc.id)}
                              disabled={isPending}
                              className="gap-1 text-[10px] text-muted hover:text-accent"
                            >
                              <RotateCcw className="h-3 w-3" />
                              Reset Password
                            </Button>
                          </div>

                          {/* Username Field */}
                          <div className="flex items-center justify-between p-2 rounded-lg bg-background border border-border">
                            <div>
                              <span className="text-[10px] text-muted block uppercase tracking-wider font-semibold">
                                Username / ID
                              </span>
                              <span className="font-mono font-bold text-foreground">
                                {acc.username ?? "—"}
                              </span>
                            </div>
                            {acc.username && (
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() => handleCopyText(acc.username!, `u-${acc.id}`, "Username")}
                                className="gap-1 text-[11px]"
                              >
                                {copiedField === `u-${acc.id}` ? (
                                  <Check className="h-3 w-3 text-emerald-400" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                                {copiedField === `u-${acc.id}` ? "Tersalin!" : "Salin"}
                              </Button>
                            )}
                          </div>

                          {/* Password Field */}
                          <div className="flex items-center justify-between p-2 rounded-lg bg-background border border-border">
                            <div>
                              <span className="text-[10px] text-muted block uppercase tracking-wider font-semibold">
                                Password
                              </span>
                              <span className="font-mono font-bold text-foreground">
                                {isShowingPass
                                  ? acc.plainPassword ?? "••••••••"
                                  : "••••••••"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                size="xs"
                                variant="ghost"
                                onClick={() => togglePasswordVisibility(acc.id)}
                                className="h-7 px-2 text-muted hover:text-foreground"
                              >
                                {isShowingPass ? (
                                  <EyeOff className="h-3.5 w-3.5" />
                                ) : (
                                  <Eye className="h-3.5 w-3.5" />
                                )}
                              </Button>
                              {acc.plainPassword && (
                                <Button
                                  size="xs"
                                  variant="outline"
                                  onClick={() =>
                                    handleCopyText(acc.plainPassword!, `p-${acc.id}`, "Password")
                                  }
                                  className="gap-1 text-[11px]"
                                >
                                  {copiedField === `p-${acc.id}` ? (
                                    <Check className="h-3 w-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                  {copiedField === `p-${acc.id}` ? "Tersalin!" : "Salin"}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
