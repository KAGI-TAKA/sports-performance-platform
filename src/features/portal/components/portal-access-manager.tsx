"use client";

import { useState, useTransition } from "react";
import { createPortalAccess, revokePortalAccess } from "../actions";
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
  const [isPending, startTransition] = useTransition();

  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const res = await createPortalAccess(athleteId, formData);
      if (res.success && res.rawToken) {
        toast.success("Link akses portal berhasil dibuat!");
        setCreatedToken(res.rawToken);
        form.reset();
      } else {
        toast.error(res.error ?? "Gagal membuat link akses portal");
      }
    });
  }

  async function handleRevoke(accessId: string) {
    if (!confirm("Apakah Anda yakin ingin mencabut link akses portal ini?")) return;

    startTransition(async () => {
      const res = await revokePortalAccess(accessId, athleteId);
      if (res.success) {
        toast.success("Link akses portal berhasil dicabut");
      } else {
        toast.error(res.error ?? "Gagal mencabut akses");
      }
    });
  }

  function getPortalUrl(token: string) {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/portal/${token}`;
    }
    return `/portal/${token}`;
  }

  function handleCopy(token: string) {
    const url = getPortalUrl(token);
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link portal berhasil disalin!");
    setTimeout(() => setCopied(false), 2000);
  }

  function getWhatsAppShareUrl(token: string) {
    const url = getPortalUrl(token);
    const text = `🏀 *LINK PORTAL EVALUASI ATLET*\n------------------------------------\n👤 *Atlet:* ${athleteName}\n\nBerikut adalah link akses resmi untuk melihat hasil evaluasi fisik, program latihan, dan jadwal sesi:\n🔗 ${url}\n\n_Link ini bersifat rahasia dan aman (read-only)._`;
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

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="gap-1.5 font-semibold text-xs border-accent/30 text-accent hover:bg-accent/10"
      >
        <LinkIcon className="h-3.5 w-3.5" />
        Portal Akses ({accesses.filter((a) => a.isActive).length} Aktif)
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent onClose={() => setIsOpen(false)} className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-accent" />
              <DialogTitle className="text-base font-bold">
                Kelola Akses Portal Atlet &amp; Orang Tua
              </DialogTitle>
            </div>
            <p className="text-xs text-muted mt-0.5">
              Buat link akses read-only yang aman &amp; acak untuk {athleteName}.
            </p>
          </DialogHeader>

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
                  Tutup Banner
                </button>
              </div>
              <div className="font-mono text-[11px] bg-background/80 p-2 rounded border border-border break-all select-all">
                {getPortalUrl(createdToken)}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Button
                  size="xs"
                  onClick={() => handleCopy(createdToken)}
                  className="gap-1 bg-accent text-white hover:bg-accent/90"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Tersalin!" : "Salin Link"}
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
          <form onSubmit={handleCreate} className="space-y-3 pt-2 text-xs border-t border-border">
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

          {/* Active & History Access Links List */}
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
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
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
                        Dibuat oleh {acc.createdByName} • Expire:{" "}
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
                        Cabut Akses
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
