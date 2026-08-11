"use client";

import { useState } from "react";
import { inviteMember, cancelInvitation } from "../actions";
import { Mail, Clock, X } from "lucide-react";
import { toast } from "sonner";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  head_coach: "Pelatih Kepala",
  assistant_coach: "Asisten Pelatih",
};

interface PendingInvitation {
  id: string;
  email: string;
  role: string;
  expiresAt: Date | string;
}

interface SettingsInvitePanelProps {
  canInvite: boolean;
  pendingInvitations: PendingInvitation[];
}

export function SettingsInvitePanel({
  canInvite,
  pendingInvitations: initialInvitations,
}: SettingsInvitePanelProps) {
  const [invitations, setInvitations] = useState(initialInvitations);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"head_coach" | "assistant_coach" | "admin">(
    "assistant_coach"
  );
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleInvite() {
    setLoading(true);
    const result = await inviteMember({ email: email.trim(), role });
    setLoading(false);
    if (result.success) {
      toast.success('Undangan berhasil dikirim ke ' + email.trim());
      setEmail("");
      // Tambahkan ke local state sementara (sampai page di-refresh)
      setInvitations((prev) => [
        ...prev,
        {
          id: `temp-${Date.now()}`,
          email: email.trim(),
          role,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      ]);
    } else {
      toast.error(result.error ?? 'Gagal mengirim undangan');
    }
  }

  async function handleCancel(invitationId: string) {
    setCancelling(invitationId);
    const result = await cancelInvitation(invitationId);
    setCancelling(null);
    if (result.success) {
      toast.success('Undangan dibatalkan');
      setInvitations((prev) => prev.filter((i) => i.id !== invitationId));
    } else {
      toast.error(result.error ?? 'Gagal membatalkan undangan');
    }
  }

  return (
    <div className="space-y-5">
      {/* Invite Form */}
      {canInvite && (
        <div className="rounded-xl border border-border bg-surface-1 p-5 space-y-4">
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground">
              Undang Pelatih / Anggota Baru
            </h3>
            <p className="text-[11px] text-muted mt-0.5">
              Kirim undangan bergabung ke anggota tim melalui email.
              {" "}<span className="text-amber-400">Catatan: Email undangan memerlukan konfigurasi provider email terlebih dahulu.</span>
            </p>
          </div>

          <div className="flex items-end gap-3">
            <div className="flex-1 space-y-1">
              <label className="text-[11px] font-medium text-muted uppercase tracking-wide">
                Email
              </label>
              <input
                id="invite-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pelatih@email.com"
                className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
              />
            </div>

            <div className="w-48 space-y-1">
              <label className="text-[11px] font-medium text-muted uppercase tracking-wide">
                Role
              </label>
              <select
                id="invite-role-select"
                value={role}
                onChange={(e) =>
                  setRole(e.target.value as typeof role)
                }
                className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
              >
                <option value="assistant_coach">Asisten Pelatih</option>
                <option value="head_coach">Pelatih Kepala</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button
              id="send-invite-btn"
              onClick={handleInvite}
              disabled={loading || !email.trim()}
              className="flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-50 whitespace-nowrap"
            >
              <Mail className="h-4 w-4" />
              {loading ? "Mengirim..." : "Kirim Undangan"}
            </button>
          </div>
        </div>
      )}

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div className="rounded-xl border border-border bg-surface-1 overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-400" />
            <h3 className="font-display text-sm font-semibold text-foreground">
              Undangan Menunggu Konfirmasi
            </h3>
            <span className="ml-auto rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] font-bold text-amber-400">
              {invitations.length}
            </span>
          </div>

          <div className="divide-y divide-border">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center gap-4 px-5 py-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-400/10">
                  <Mail className="h-4 w-4 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">
                    {inv.email}
                  </div>
                  <div className="text-[11px] text-muted">
                    {ROLE_LABELS[inv.role] ?? inv.role} · Kedaluwarsa{" "}
                    {new Date(inv.expiresAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
                {canInvite && !inv.id.startsWith("temp-") && (
                  <button
                    onClick={() => handleCancel(inv.id)}
                    disabled={cancelling === inv.id}
                    className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[11px] font-medium text-red-400 hover:bg-red-400/10 transition disabled:opacity-50"
                  >
                    <X className="h-3.5 w-3.5" />
                    {cancelling === inv.id ? "..." : "Batalkan"}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
