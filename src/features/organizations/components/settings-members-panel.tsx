"use client";

import { useState } from "react";
import { removeMember, updateMemberRole } from "../actions";
import { Shield, Trash2 } from "lucide-react";
import { toast } from "sonner";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  head_coach: "Pelatih Kepala",
  assistant_coach: "Asisten Pelatih",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-violet-500/15 text-violet-400",
  head_coach: "bg-blue-500/15 text-blue-400",
  assistant_coach: "bg-emerald-500/15 text-emerald-400",
};

interface MemberRow {
  id: string;
  role: string;
  user: { id: string; name: string; email: string };
}

interface SettingsMembersPanelProps {
  members: MemberRow[];
  currentMemberId: string;
  isAdmin: boolean;
}

export function SettingsMembersPanel({
  members: initialMembers,
  currentMemberId,
  isAdmin,
}: SettingsMembersPanelProps) {
  const [members, setMembers] = useState(initialMembers);
  const [removing, setRemoving] = useState<string | null>(null);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRemove(memberId: string, name: string) {
    if (!confirm(`Yakin ingin mengeluarkan ${name} dari organisasi?`)) return;
    setRemoving(memberId);
    const result = await removeMember(memberId);
    setRemoving(null);
    if (result.success) {
      toast.success(name + ' telah dikeluarkan dari organisasi');
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } else {
      toast.error(result.error ?? 'Gagal mengeluarkan anggota');
    }
  }

  async function handleRoleChange(memberId: string, newRole: string) {
    setUpdatingRole(memberId);
    const result = await updateMemberRole({ memberId, role: newRole });
    setUpdatingRole(null);
    if (result.success) {
      toast.success('Role berhasil diperbarui');
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
      );
    } else {
      toast.error(result.error ?? 'Gagal memperbarui role');
    }
  }

  return (
    <div className="rounded-xl border border-border bg-surface-1 overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center gap-2">
        <Shield className="h-4 w-4 text-muted" />
        <h2 className="font-display text-sm font-semibold text-foreground">
          Daftar Pelatih &amp; Anggota
        </h2>
        <span className="ml-auto text-[11px] text-muted">
          {members.length} anggota
        </span>
      </div>

      <div className="divide-y divide-border">
        {members.map((member) => {
          const isSelf = member.id === currentMemberId;
          return (
            <div
              key={member.id}
              className="flex items-center gap-4 px-5 py-3.5"
            >
              {/* Avatar */}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-3 text-xs font-bold text-secondary">
                {member.user.name
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground truncate">
                    {member.user.name}
                  </span>
                  {isSelf && (
                    <span className="rounded-full bg-surface-3 px-1.5 py-0.5 text-[9px] font-semibold text-muted uppercase tracking-wide">
                      Anda
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-muted truncate">
                  {member.user.email}
                </div>
              </div>

              {/* Role — dropdown jika admin dan bukan diri sendiri */}
              {isAdmin && !isSelf ? (
                <select
                  id={`role-select-${member.id}`}
                  value={member.role}
                  onChange={(e) => handleRoleChange(member.id, e.target.value)}
                  disabled={updatingRole === member.id}
                  className="rounded-md border border-border bg-surface-2 px-2 py-1 text-[11px] font-semibold text-foreground focus:border-accent focus:outline-none disabled:opacity-60"
                >
                  <option value="assistant_coach">Asisten Pelatih</option>
                  <option value="head_coach">Pelatih Kepala</option>
                  <option value="admin">Admin</option>
                </select>
              ) : (
                <span
                  className={`rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
                    ROLE_COLORS[member.role] ?? "bg-surface-2 text-muted"
                  }`}
                >
                  {ROLE_LABELS[member.role] ?? member.role}
                </span>
              )}

              {/* Remove button — admin only, bukan diri sendiri */}
              {isAdmin && !isSelf && (
                <button
                  id={`remove-member-${member.id}`}
                  onClick={() => handleRemove(member.id, member.user.name)}
                  disabled={removing === member.id}
                  className="flex items-center justify-center h-8 w-8 rounded-md text-muted hover:text-red-400 hover:bg-red-400/10 transition disabled:opacity-50"
                  title="Keluarkan dari organisasi"
                >
                  {removing === member.id ? (
                    <span className="text-[10px]">...</span>
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
