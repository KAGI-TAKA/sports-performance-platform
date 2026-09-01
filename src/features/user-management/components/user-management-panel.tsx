"use client";

import { useState, useTransition } from "react";
import {
  Users,
  UserPlus,
  Shield,
  ShieldAlert,
  Search,
  CheckCircle,
  Clock,
  KeyRound,
  Copy,
  Check,
  RefreshCw,
  Ban,
  AlertTriangle,
  X,
  Plus,
  Info,
  UserCheck,
  Edit2,
  Power,
  Mail,
  Send,
  Trash2,
  Activity,
  Award,
  Link2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import {
  provisionUser,
  addChildToParentAction,
  removeChildFromParentAction,
  getParentLinkedChildrenAction,
  updateUserProfile,
  toggleUserActiveStatus,
  resendInvitationAction,
  deleteUserPermanently,
} from "../actions";
import {
  generateAthleteActivationToken,
  invalidateAthleteActivationToken,
} from "@/features/auth/athlete-actions";
import { generateQuickAccess } from "@/features/portal/actions";
import type {
  UserManagementItem,
  LinkedChildItem,
  AthleteActivationStatus,
  UserAccountStatus,
} from "../types";
import { ROLE_LABELS, type MemberRole } from "@/lib/constants";
import { AssistantPerformancePanel } from "@/features/assistant-performance/components/assistant-performance-panel";
import type { AssistantPerformanceSummary } from "@/features/assistant-performance/types";

interface UserManagementPanelProps {
  users: UserManagementItem[];
  athletes: { id: string; fullName: string; sportCategory?: string | null }[];
  isAdmin: boolean;
  perfData?: {
    role: string;
    isSupervisory: boolean;
    assistants: AssistantPerformanceSummary[];
    unreviewedFeedbackCount: number;
  };
}

const STATUS_CONFIG: Record<
  UserAccountStatus,
  { label: string; style: string; icon: React.ElementType }
> = {
  ACTIVE: {
    label: "Aktif",
    style: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    icon: CheckCircle,
  },
  PENDING_ACTIVATION: {
    label: "Menunggu Aktivasi",
    style: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    icon: Clock,
  },
  INVITATION_PENDING: {
    label: "Undangan Terkirim",
    style: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    icon: Mail,
  },
  ACTIVATION_EXPIRED: {
    label: "Link Kedaluwarsa",
    style: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    icon: AlertTriangle,
  },
  ACTIVATION_REVOKED: {
    label: "Akses Dicabut",
    style: "bg-red-500/15 text-red-400 border-red-500/30",
    icon: Ban,
  },
  NO_ACTIVATION_LINK: {
    label: "Belum Ada Link",
    style: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
    icon: KeyRound,
  },
  DEACTIVATED: {
    label: "Dinonaktifkan",
    style: "bg-red-950/40 text-red-400 border-red-500/40",
    icon: Power,
  },
};

export function UserManagementPanel({
  users: initialUsers,
  athletes,
  isAdmin,
  perfData,
}: UserManagementPanelProps) {
  const [activeTab, setActiveTab] = useState<"directory" | "supervision">("directory");
  const [users, setUsers] = useState<UserManagementItem[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Provisioning Form State
  const [targetRole, setTargetRole] = useState<
    "head_coach" | "assistant_coach" | "parent" | "athlete"
  >("assistant_coach");
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formUsername, setFormUsername] = useState("");
  const [selectedAthleteIds, setSelectedAthleteIds] = useState<string[]>([]);
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>("");

  // ── Success Modal (Post-Creation Link Display) ──────────────────────────────
  const [createdSuccessInfo, setCreatedSuccessInfo] = useState<{
    userName: string;
    role: MemberRole;
    emailOrUsername: string;
    inviteUrl: string;
  } | null>(null);
  const [isCopiedSuccessLink, setIsCopiedSuccessLink] = useState(false);

  // ── Activation Modal State (Athlete) ────────────────────────────────────────
  const [activationUser, setActivationUser] = useState<UserManagementItem | null>(null);
  const [activationStatus, setActivationStatus] = useState<AthleteActivationStatus>("NO_ACTIVATION_LINK");
  const [activationUrl, setActivationUrl] = useState<string | null>(null);
  const [activationExpiresAt, setActivationExpiresAt] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isActivationLoading, setIsActivationLoading] = useState(false);

  // ── Quick Access Portal Modal State (Passwordless) ──────────────────────────
  const [quickAccessUser, setQuickAccessUser] = useState<UserManagementItem | null>(null);
  const [quickAccessAthleteId, setQuickAccessAthleteId] = useState<string>("");
  const [quickAccessDuration, setQuickAccessDuration] = useState<"1h" | "24h" | "7d" | "custom">("24h");
  const [quickAccessCustomHours, setQuickAccessCustomHours] = useState<number>(720); // 30 days
  const [quickAccessUrl, setQuickAccessUrl] = useState<string | null>(null);
  const [quickAccessExpiresAt, setQuickAccessExpiresAt] = useState<string | null>(null);
  const [isQuickAccessLoading, setIsQuickAccessLoading] = useState(false);
  const [isCopiedQuickAccess, setIsCopiedQuickAccess] = useState(false);

  // ── Parent Relationship Modal State ─────────────────────────────────────────
  const [parentUser, setParentUser] = useState<UserManagementItem | null>(null);
  const [parentLinkedAthletes, setParentLinkedAthletes] = useState<LinkedChildItem[]>([]);
  const [selectedNewChildId, setSelectedNewChildId] = useState<string>("");
  const [isParentActionLoading, setIsParentActionLoading] = useState(false);

  // ── Edit User Modal State ───────────────────────────────────────────────────
  const [editUser, setEditUser] = useState<UserManagementItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editRole, setEditRole] = useState<MemberRole>("assistant_coach");
  const [isEditLoading, setIsEditLoading] = useState(false);

  // ── Deactivation Confirmation Modal State ───────────────────────────────────
  const [deactivateUser, setDeactivateUser] = useState<UserManagementItem | null>(null);
  const [isDeactivateLoading, setIsDeactivateLoading] = useState(false);

  // ── Permanent Delete Confirmation Modal State ───────────────────────────────
  const [deleteUser, setDeleteUser] = useState<UserManagementItem | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.username && u.username.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = selectedRoleFilter === "ALL" || u.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  const handleOpenModal = (
    role: "head_coach" | "assistant_coach" | "parent" | "athlete" = "assistant_coach"
  ) => {
    setTargetRole(role);
    setFormName("");
    setFormEmail("");
    setFormUsername("");
    setSelectedAthleteIds([]);
    const defaultAth = athletes[0]?.id ?? "";
    setSelectedAthleteId(defaultAth);
    if (role === "athlete" && athletes[0]) {
      setFormName(athletes[0].fullName);
    }
    setIsModalOpen(true);
  };

  const handleToggleAthlete = (id: string) => {
    setSelectedAthleteIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      let finalName = formName.trim();
      if (targetRole === "athlete" && !finalName && selectedAthleteId) {
        const found = athletes.find((a) => a.id === selectedAthleteId);
        if (found) finalName = found.fullName;
      }

      const res = await provisionUser({
        role: targetRole,
        name: finalName,
        email: formEmail ? formEmail.trim() : undefined,
        username: formUsername ? formUsername.trim() : undefined,
        athleteIds: targetRole === "parent" ? selectedAthleteIds : undefined,
        athleteId: targetRole === "athlete" ? selectedAthleteId : undefined,
      });

      if (res.success && res.user) {
        toast.success(`Pengguna ${res.user.name} (${ROLE_LABELS[res.user.role]}) berhasil dibuat.`);

        let linkedAthletes: LinkedChildItem[] | undefined;
        let linkedAthleteNames: string[] | undefined;
        if (targetRole === "parent") {
          const matched = athletes.filter((a) => selectedAthleteIds.includes(a.id));
          linkedAthletes = matched;
          linkedAthleteNames = matched.map((a) => a.fullName);
        }

        const initialStatus: UserAccountStatus =
          targetRole === "athlete" ? "PENDING_ACTIVATION" : "INVITATION_PENDING";

        setUsers((prev) => [
          ...prev,
          {
            id: res.user!.id,
            memberId: res.user!.id,
            name: res.user!.name,
            email: res.user!.email,
            role: res.user!.role,
            createdAt: new Date(),
            username: targetRole === "athlete" ? formUsername : undefined,
            status: initialStatus,
            isDeactivated: false,
            activationStatus: targetRole === "athlete" ? "PENDING_ACTIVATION" : undefined,
            linkedAthletes,
            linkedAthleteNames,
          },
        ]);

        setIsModalOpen(false);

        // Show Success Link Modal if inviteUrl returned
        if (res.inviteUrl) {
          setCreatedSuccessInfo({
            userName: res.user.name,
            role: res.user.role,
            emailOrUsername: targetRole === "athlete" ? `@${formUsername}` : res.user.email,
            inviteUrl: res.inviteUrl,
          });
          setIsCopiedSuccessLink(false);
        }
      } else {
        toast.error(res.error || "Gagal membuat pengguna.");
      }
    });
  };

  // ── Quick Access Portal Handlers ────────────────────────────────────────────

  const handleOpenQuickAccessModal = (user: UserManagementItem) => {
    setQuickAccessUser(user);
    setQuickAccessUrl(null);
    setQuickAccessExpiresAt(null);
    setIsCopiedQuickAccess(false);

    if (user.role === "athlete") {
      const match = athletes.find(
        (a) => a.fullName.toLowerCase() === user.name.toLowerCase()
      );
      setQuickAccessAthleteId(match?.id || athletes[0]?.id || "");
    } else if (user.role === "parent") {
      setQuickAccessAthleteId(user.linkedAthletes?.[0]?.id || athletes[0]?.id || "");
    }
  };

  const handleGenerateQuickAccess = async () => {
    if (!quickAccessUser || !quickAccessAthleteId) return;
    setIsQuickAccessLoading(true);

    const res = await generateQuickAccess({
      athleteId: quickAccessAthleteId,
      accessType: quickAccessUser.role === "parent" ? "PARENT" : "ATHLETE",
      durationPreset: quickAccessDuration,
      customHours: quickAccessDuration === "custom" ? quickAccessCustomHours : undefined,
    });

    setIsQuickAccessLoading(false);
    if (res.success && res.portalUrl) {
      setQuickAccessUrl(res.portalUrl);
      setQuickAccessExpiresAt(res.expiresAt || null);
      toast.success("Tautan Quick Access Portal berhasil dibuat!");
    } else {
      toast.error(res.error || "Gagal membuat Quick Access token.");
    }
  };

  const handleCopyQuickAccess = () => {
    if (!quickAccessUrl) return;
    const fullUrl = `${window.location.origin}${quickAccessUrl}`;
    navigator.clipboard.writeText(fullUrl);
    setIsCopiedQuickAccess(true);
    toast.success("Tautan Portal disalin ke clipboard!");
    setTimeout(() => setIsCopiedQuickAccess(false), 2000);
  };

  // ── Activation Handlers (Athlete) ───────────────────────────────────────────

  const handleOpenActivationModal = async (user: UserManagementItem) => {
    setActivationUser(user);
    setActivationUrl(null);
    setIsCopied(false);

    const username = user.username || user.email.split("@")[0];
    setActivationStatus(user.activationStatus || "NO_ACTIVATION_LINK");
    setActivationExpiresAt(user.activationExpiresAt || null);
  };

  const handleGenerateActivationLink = async () => {
    if (!activationUser) return;
    setIsActivationLoading(true);

    const username = activationUser.username || activationUser.email.split("@")[0];
    const res = await generateAthleteActivationToken(username);

    setIsActivationLoading(false);
    if (res.success && res.activationUrl) {
      setActivationUrl(res.activationUrl);
      setActivationStatus("PENDING_ACTIVATION");
      setActivationExpiresAt(res.expiresAt ?? null);
      toast.success("Link aktivasi berhasil dibuat!");

      setUsers((prev) =>
        prev.map((u) =>
          u.id === activationUser.id
            ? {
                ...u,
                activationStatus: "PENDING_ACTIVATION",
                status: "PENDING_ACTIVATION",
                activationExpiresAt: res.expiresAt,
              }
            : u
        )
      );
    } else {
      toast.error(res.error || "Gagal membuat link aktivasi.");
    }
  };

  const handleRevokeActivationLink = async () => {
    if (!activationUser) return;
    setIsActivationLoading(true);

    const username = activationUser.username || activationUser.email.split("@")[0];
    const res = await invalidateAthleteActivationToken(username);

    setIsActivationLoading(false);
    if (res.success) {
      setActivationUrl(null);
      setActivationStatus("ACTIVATION_REVOKED");
      toast.success("Akses aktivasi atlet berhasil dicabut.");

      setUsers((prev) =>
        prev.map((u) =>
          u.id === activationUser.id
            ? {
                ...u,
                activationStatus: "ACTIVATION_REVOKED",
                status: "ACTIVATION_REVOKED",
              }
            : u
        )
      );
    } else {
      toast.error(res.error || "Gagal mencabut aktivasi.");
    }
  };

  const handleCopyLink = () => {
    if (!activationUrl) return;
    const fullUrl = `${window.location.origin}${activationUrl}`;
    navigator.clipboard.writeText(fullUrl);
    setIsCopied(true);
    toast.success("Link aktivasi disalin ke clipboard!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  // ── Parent Relationship Handlers ────────────────────────────────────────────

  const handleOpenParentModal = async (user: UserManagementItem) => {
    setParentUser(user);
    setSelectedNewChildId("");
    setIsParentActionLoading(true);

    const children = await getParentLinkedChildrenAction(user.id);
    setParentLinkedAthletes(
      children.map((c) => ({
        id: c.id,
        fullName: c.fullName,
        sportCategory: c.sportCategory,
      }))
    );
    setIsParentActionLoading(false);
  };

  const handleAddChildToParent = async () => {
    if (!parentUser || !selectedNewChildId) return;
    setIsParentActionLoading(true);

    const res = await addChildToParentAction(parentUser.id, selectedNewChildId);
    setIsParentActionLoading(false);

    if (res.success) {
      const addedChild = athletes.find((a) => a.id === selectedNewChildId);
      if (addedChild) {
        const updated = [...parentLinkedAthletes, addedChild];
        setParentLinkedAthletes(updated);

        setUsers((prev) =>
          prev.map((u) =>
            u.id === parentUser.id
              ? {
                  ...u,
                  linkedAthletes: updated,
                  linkedAthleteNames: updated.map((c) => c.fullName),
                }
              : u
          )
        );
      }
      setSelectedNewChildId("");
      toast.success("Atlet berhasil dihubungkan ke orang tua.");
    } else {
      toast.error(res.error || "Gagal menambahkan atlet.");
    }
  };

  const handleRemoveChildFromParent = async (childId: string) => {
    if (!parentUser) return;
    setIsParentActionLoading(true);

    const res = await removeChildFromParentAction(parentUser.id, childId);
    setIsParentActionLoading(false);

    if (res.success) {
      const updated = parentLinkedAthletes.filter((c) => c.id !== childId);
      setParentLinkedAthletes(updated);

      setUsers((prev) =>
        prev.map((u) =>
          u.id === parentUser.id
            ? {
                ...u,
                linkedAthletes: updated,
                linkedAthleteNames: updated.map((c) => c.fullName),
              }
            : u
        )
      );
      toast.success("Hubungan atlet dengan orang tua telah dihapus.");
    } else {
      toast.error(res.error || "Gagal menghapus hubungan atlet.");
    }
  };

  // ── Edit User Handlers ──────────────────────────────────────────────────────

  const handleOpenEditModal = (user: UserManagementItem) => {
    setEditUser(user);
    setEditName(user.name);
    setEditEmail(user.email.endsWith("@athlete.internal") ? "" : user.email);
    setEditUsername(user.username || "");
    setEditRole(user.role);
  };

  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setIsEditLoading(true);

    const res = await updateUserProfile({
      userId: editUser.id,
      memberId: editUser.memberId,
      name: editName,
      email: editEmail ? editEmail : undefined,
      username: editUsername ? editUsername : undefined,
      role: editRole,
    });

    setIsEditLoading(false);
    if (res.success) {
      toast.success("Profil pengguna berhasil diperbarui.");
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editUser.id
            ? {
                ...u,
                name: editName,
                email: editEmail || u.email,
                username: editUsername || u.username,
                role: editRole,
              }
            : u
        )
      );
      setEditUser(null);
    } else {
      toast.error(res.error || "Gagal memperbarui pengguna.");
    }
  };

  // ── Toggle Active Status Handlers ───────────────────────────────────────────

  const handleToggleDeactivate = async () => {
    if (!deactivateUser) return;
    setIsDeactivateLoading(true);

    const targetActive = deactivateUser.isDeactivated;
    const res = await toggleUserActiveStatus(
      deactivateUser.id,
      deactivateUser.memberId,
      targetActive
    );

    setIsDeactivateLoading(false);
    if (res.success) {
      toast.success(
        targetActive
          ? `Akun ${deactivateUser.name} berhasil diaktifkan kembali.`
          : `Akun ${deactivateUser.name} telah dinonaktifkan.`
      );

      setUsers((prev) =>
        prev.map((u) =>
          u.id === deactivateUser.id
            ? {
                ...u,
                isDeactivated: !targetActive,
                status: targetActive ? "ACTIVE" : "DEACTIVATED",
              }
            : u
        )
      );
      setDeactivateUser(null);
    } else {
      toast.error(res.error || "Gagal mengubah status akun.");
    }
  };

  // ── Permanent Delete Handlers ───────────────────────────────────────────────

  const handleDeleteUserPermanently = async () => {
    if (!deleteUser) return;
    setIsDeleteLoading(true);

    const res = await deleteUserPermanently(deleteUser.id, deleteUser.memberId);
    setIsDeleteLoading(false);

    if (res.success) {
      toast.success(`Akun ${deleteUser.name} berhasil dihapus permanen.`);
      setUsers((prev) => prev.filter((u) => u.id !== deleteUser.id));
      setDeleteUser(null);
    } else {
      toast.error(res.error || "Gagal menghapus akun pengguna.");
    }
  };

  // ── Resend / Copy Staff & Parent Invitation ──────────────────────────────────

  const handleResendInvitation = async (user: UserManagementItem) => {
    const res = await resendInvitationAction(user.email, user.role);
    if (res.success && res.inviteUrl) {
      setCreatedSuccessInfo({
        userName: user.name,
        role: user.role,
        emailOrUsername: user.email,
        inviteUrl: res.inviteUrl,
      });
      setIsCopiedSuccessLink(false);
      toast.success(`Undangan baru dibuat untuk ${user.email}`);
    } else {
      toast.error(res.error || "Gagal membuat ulang undangan.");
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-xl font-bold text-foreground tracking-tight">
              Manajemen Pengguna &amp; Tim
            </h1>
            <span className="inline-flex items-center text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 px-2.5 py-0.5 rounded-full">
              {users.length} Akun Terdaftar
            </span>
          </div>
          <p className="text-xs text-muted mt-1">
            Kelola akun, akses, peran pelatih, orang tua, atlet, dan evaluasi mutu pendampingan sesi latihan.
          </p>
        </div>

        {isAdmin && activeTab === "directory" && (
          <button
            onClick={() => handleOpenModal("assistant_coach")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 px-4 py-2 text-xs font-semibold text-white shadow-sm transition"
          >
            <UserPlus className="h-4 w-4 text-white" />
            + Tambah Pengguna
          </button>
        )}
      </div>

      {/* ── Tab Switcher (Direktori Pengguna vs Supervisi Mutu) ──────────────── */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab("directory")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === "directory"
              ? "bg-surface-2 text-foreground border border-border shadow-2xs"
              : "text-muted hover:text-foreground hover:bg-surface-1"
          }`}
        >
          <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          Direktori Akun &amp; Hak Akses
        </button>

        {perfData && (
          <button
            onClick={() => setActiveTab("supervision")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === "supervision"
                ? "bg-surface-2 text-foreground border border-border shadow-2xs"
                : "text-muted hover:text-foreground hover:bg-surface-1"
            }`}
          >
            <Award className="h-4 w-4 text-amber-500" />
            Supervisi Tim Pelatih &amp; Evaluasi Mutu
            {perfData.unreviewedFeedbackCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                {perfData.unreviewedFeedbackCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* ── Section A: Direktori Pengguna ───────────────────────────────────── */}
      {activeTab === "directory" && (
        <div className="space-y-4">
          {/* Filters & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted" />
              <input
                type="text"
                placeholder="Cari nama, email, username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-border bg-surface-1 text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            {/* Role Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {[
                { id: "ALL", label: "Semua" },
                { id: "admin", label: "Admin / Owner" },
                { id: "head_coach", label: "Head Coach" },
                { id: "assistant_coach", label: "Asisten Pelatih" },
                { id: "parent", label: "Orang Tua / Wali" },
                { id: "athlete", label: "Atlet" },
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRoleFilter(r.id)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg border transition whitespace-nowrap ${
                    selectedRoleFilter === r.id
                      ? "bg-surface-3 text-foreground border-border font-semibold shadow-2xs"
                      : "bg-surface-1 text-muted border-transparent hover:text-foreground hover:bg-surface-2"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* User List Cards */}
          <div className="space-y-2.5">
            {filteredUsers.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-8 text-center bg-surface-1/50">
                <Users className="h-8 w-8 text-muted mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold text-foreground">Tidak ada pengguna ditemukan</p>
                <p className="text-[11px] text-muted mt-0.5">
                  Coba sesuaikan kata kunci pencarian atau filter peran di atas.
                </p>
              </div>
            ) : (
              filteredUsers.map((u) => {
                const isAthlete = u.role === "athlete";
                const isParent = u.role === "parent";
                const isStaff = u.role === "head_coach" || u.role === "assistant_coach";
                const statusInfo = STATUS_CONFIG[u.status] || STATUS_CONFIG.ACTIVE;
                const StatusIcon = statusInfo.icon;

                return (
                  <div
                    key={u.id}
                    className={`rounded-xl border p-4 bg-surface-1 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      u.isDeactivated
                        ? "border-red-500/20 bg-red-950/10 opacity-75"
                        : "border-border hover:border-border/80"
                    }`}
                  >
                    {/* Left Side: Identity & Details */}
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 border ${
                          u.role === "admin"
                            ? "bg-violet-500/10 border-violet-500/20 text-violet-400"
                            : u.role === "head_coach"
                            ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                            : u.role === "assistant_coach"
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : u.role === "parent"
                            ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                            : "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                        }`}
                      >
                        {u.role === "admin" ? (
                          <Shield className="h-4 w-4" />
                        ) : isParent ? (
                          <Users className="h-4 w-4" />
                        ) : isAthlete ? (
                          <UserCheck className="h-4 w-4" />
                        ) : (
                          <ShieldAlert className="h-4 w-4" />
                        )}
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-xs text-foreground truncate">
                            {u.name}
                          </span>

                          {/* Authoritative Role Badge */}
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-2 border border-border text-secondary">
                            {ROLE_LABELS[u.role] || u.role}
                          </span>

                          {/* Account Status Badge */}
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded border ${statusInfo.style}`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {statusInfo.label}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
                          {isAthlete ? (
                            <span className="font-mono text-cyan-400/90">
                              @{u.username || u.email.split("@")[0]}
                            </span>
                          ) : (
                            <span>{u.email}</span>
                          )}

                          {/* Parent's linked children list */}
                          {isParent && (
                            <div className="flex flex-wrap items-center gap-1">
                              <span className="text-[10px] text-muted font-medium">Anak:</span>
                              {u.linkedAthletes && u.linkedAthletes.length > 0 ? (
                                u.linkedAthletes.map((ch) => (
                                  <span
                                    key={ch.id}
                                    className="text-[10px] font-medium text-amber-300 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.2 rounded"
                                  >
                                    {ch.fullName}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[10px] text-muted italic">
                                  Belum terhubung
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Side: Lifecycle Action Buttons */}
                    <div className="flex flex-wrap items-center gap-1.5 shrink-0 self-end sm:self-center">
                      {/* Quick Access Portal Button (Passwordless for Parent & Athlete) */}
                      {(isParent || isAthlete) && isAdmin && (
                        <button
                          onClick={() => handleOpenQuickAccessModal(u)}
                          className="inline-flex items-center gap-1 rounded-lg border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 px-2.5 py-1 text-xs font-semibold text-purple-300 transition"
                          title="Buat tautan portal langsung tanpa password"
                        >
                          <Link2 className="h-3.5 w-3.5" />
                          Quick Access
                        </button>
                      )}

                      {/* Athlete Activation Link Action */}
                      {isAthlete && isAdmin && (
                        <button
                          onClick={() => handleOpenActivationModal(u)}
                          className="inline-flex items-center gap-1 rounded-lg border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 px-2.5 py-1 text-xs font-semibold text-cyan-300 transition"
                        >
                          <KeyRound className="h-3.5 w-3.5" />
                          Kelola Aktivasi
                        </button>
                      )}

                      {/* Parent Relationship Action */}
                      {isParent && isAdmin && (
                        <button
                          onClick={() => handleOpenParentModal(u)}
                          className="inline-flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-300 transition"
                        >
                          <Users className="h-3.5 w-3.5" />
                          Hubungan Anak
                        </button>
                      )}

                      {/* Staff / Parent Resend Invitation Action */}
                      {(isStaff || isParent) && u.status === "INVITATION_PENDING" && isAdmin && (
                        <button
                          onClick={() => handleResendInvitation(u)}
                          className="inline-flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 px-2.5 py-1 text-xs font-semibold text-blue-300 transition"
                          title="Kirim ulang atau salin tautan undangan"
                        >
                          <Send className="h-3.5 w-3.5" />
                          Salin / Kirim Ulang
                        </button>
                      )}

                      {/* Edit User Action */}
                      {isAdmin && (
                        <button
                          onClick={() => handleOpenEditModal(u)}
                          className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface-2 hover:bg-surface-3 px-2 py-1 text-xs font-semibold text-secondary hover:text-foreground transition"
                          title="Edit profil pengguna"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          Edit
                        </button>
                      )}

                      {/* Activate / Deactivate Toggle (except Admin self) */}
                      {isAdmin && u.role !== "admin" && (
                        <button
                          onClick={() => setDeactivateUser(u)}
                          className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-semibold transition ${
                            u.isDeactivated
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                              : "border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                          }`}
                          title={u.isDeactivated ? "Aktifkan akun" : "Nonaktifkan akun"}
                        >
                          <Power className="h-3.5 w-3.5" />
                          {u.isDeactivated ? "Aktifkan" : "Nonaktifkan"}
                        </button>
                      )}

                      {/* Delete Permanently (except Admin self) */}
                      {isAdmin && u.role !== "admin" && (
                        <button
                          onClick={() => setDeleteUser(u)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/15 px-2 py-1 text-xs font-semibold text-red-400 hover:text-red-300 transition"
                          title="Hapus akun secara permanen"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── Section B: Supervisi Tim Pelatih ────────────────────────────────── */}
      {activeTab === "supervision" && perfData && (
        <div className="space-y-4">
          <AssistantPerformancePanel initialData={perfData} />
        </div>
      )}

      {/* ── Modal 1: Tambah Pengguna Baru ───────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-surface-1 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-display text-sm font-bold text-foreground">
                  Tambah Pengguna Baru
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  Buat akun untuk Head Coach, Asisten Pelatih, Orang Tua / Wali, atau Atlet.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted hover:text-foreground text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Informational Banner */}
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-surface-2 border border-border text-[11px] text-muted">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-foreground">Aturan Keamanan:</strong> Sistem akan mengirimkan email undangan otomatis dan membuat tautan langsung di mana pengguna dapat mengatur password pertama mereka dengan aman.
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selector */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Pilih Peran Pengguna
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    [
                      { id: "assistant_coach", label: "Asisten Pelatih" },
                      { id: "head_coach", label: "Head Coach" },
                      { id: "parent", label: "Orang Tua" },
                      { id: "athlete", label: "Atlet" },
                    ] as const
                  ).map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        setTargetRole(r.id);
                        if (r.id === "athlete" && athletes[0]) {
                          setSelectedAthleteId(athletes[0].id);
                          setFormName(athletes[0].fullName);
                        }
                      }}
                      className={`p-2.5 rounded-lg border text-xs font-semibold text-center transition ${
                        targetRole === r.id
                          ? "border-blue-600 bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold"
                          : "border-border bg-surface-2/60 text-secondary hover:bg-surface-2"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Inputs Based on Role */}
              {targetRole === "athlete" ? (
                <>
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Pilih Profil Atlet Terdaftar
                    </label>
                    <select
                      value={selectedAthleteId}
                      onChange={(e) => {
                        setSelectedAthleteId(e.target.value);
                        const a = athletes.find((item) => item.id === e.target.value);
                        if (a) setFormName(a.fullName);
                      }}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-surface-2 text-foreground focus:outline-none focus:ring-1 focus:ring-blue-600"
                      required
                    >
                      <option value="">-- Pilih Atlet --</option>
                      {athletes.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.fullName} ({a.sportCategory || "Umum"})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Username Akun Atlet
                    </label>
                    <input
                      type="text"
                      placeholder="misal: faisal_youth"
                      value={formUsername}
                      onChange={(e) =>
                        setFormUsername(e.target.value.toLowerCase().replace(/\s+/g, "_"))
                      }
                      className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-surface-2 text-foreground focus:outline-none focus:ring-1 focus:ring-blue-600"
                      required
                    />
                    <p className="text-[10px] text-muted mt-1">
                      Hanya huruf kecil, angka, dan underscore (_).
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Email Atlet (Opsional)
                    </label>
                    <input
                      type="email"
                      placeholder="atlet@email.com (opsional)"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-surface-2 text-foreground focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      placeholder={
                        targetRole === "parent" ? "Nama Orang Tua / Wali" : "Nama Pelatih"
                      }
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-surface-2 text-foreground focus:outline-none focus:ring-1 focus:ring-blue-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Alamat Email
                    </label>
                    <input
                      type="email"
                      placeholder="email@domain.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-surface-2 text-foreground focus:outline-none focus:ring-1 focus:ring-blue-600"
                      required
                    />
                  </div>

                  {targetRole === "parent" && (
                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1">
                        Hubungkan dengan Atlet (Anak)
                      </label>
                      <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 rounded-lg border border-border bg-surface-2">
                        {athletes.length === 0 ? (
                          <p className="text-[11px] text-muted italic">
                            Belum ada atlet terdaftar di organisasi ini.
                          </p>
                        ) : (
                          athletes.map((a) => (
                            <label
                              key={a.id}
                              className="flex items-center gap-2 text-xs text-foreground cursor-pointer hover:bg-surface-3/50 p-1.5 rounded transition"
                            >
                              <input
                                type="checkbox"
                                checked={selectedAthleteIds.includes(a.id)}
                                onChange={() => handleToggleAthlete(a.id)}
                                className="rounded border-border text-blue-600 focus:ring-blue-600 h-3.5 w-3.5"
                              />
                              <span>{a.fullName}</span>
                              {a.sportCategory && (
                                <span className="text-[10px] text-muted">
                                  ({a.sportCategory})
                                </span>
                              )}
                            </label>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-muted hover:text-foreground rounded-lg border border-border transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition disabled:opacity-50"
                >
                  {isPending ? "Memproses..." : "Buat Pengguna"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal 2: Popup Sukses Buat Pengguna & Salin Link Setup Password ── */}
      {createdSuccessInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface-1 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-display text-sm font-bold text-foreground">
                  Akun Berhasil Dibuat
                </h3>
                <p className="text-xs text-muted truncate">
                  {createdSuccessInfo.userName} ({ROLE_LABELS[createdSuccessInfo.role]})
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-secondary leading-relaxed">
                Undangan telah diproses. Anda dapat langsung menyalin tautan aktivasi di bawah ini untuk dibagikan ke pengguna melalui WhatsApp / Chat agar dapat mengatur password pertama mereka.
              </p>

              <div className="space-y-1.5 p-3 rounded-xl bg-surface-2 border border-border">
                <label className="text-[11px] font-semibold text-foreground block">
                  Tautan Aktivasi / Setup Password:
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}${createdSuccessInfo.inviteUrl}`}
                    className="w-full px-2.5 py-1.5 text-[11px] font-mono rounded bg-surface-1 border border-border text-foreground select-all"
                  />
                  <button
                    onClick={() => {
                      const fullUrl = `${window.location.origin}${createdSuccessInfo.inviteUrl}`;
                      navigator.clipboard.writeText(fullUrl);
                      setIsCopiedSuccessLink(true);
                      toast.success("Tautan disalin ke clipboard!");
                      setTimeout(() => setIsCopiedSuccessLink(false), 2000);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shrink-0 transition"
                  >
                    {isCopiedSuccessLink ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {isCopiedSuccessLink ? "Disalin" : "Salin"}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setCreatedSuccessInfo(null)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal 3: Quick Access Portal Generator (Passwordless) ───────────── */}
      {quickAccessUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface-1 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Link2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-foreground">
                    Quick Access Portal
                  </h3>
                  <p className="text-xs text-muted">
                    {quickAccessUser.name} ({ROLE_LABELS[quickAccessUser.role]})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setQuickAccessUser(null)}
                className="text-muted hover:text-foreground text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-secondary leading-relaxed">
                Buat tautan akses instan sekali klik tanpa memerlukan password. Berguna untuk dibagikan ke orang tua atau atlet agar langsung melihat rapor performa.
              </p>

              {/* Athlete selector if parent has multiple children */}
              {quickAccessUser.role === "parent" && quickAccessUser.linkedAthletes && quickAccessUser.linkedAthletes.length > 1 && (
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Pilih Atlet (Anak):
                  </label>
                  <select
                    value={quickAccessAthleteId}
                    onChange={(e) => setQuickAccessAthleteId(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-surface-2 text-foreground focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    {quickAccessUser.linkedAthletes.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Duration Preset Selector */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Masa Berlaku Tautan:
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: "1h", label: "1 Jam" },
                    { id: "24h", label: "24 Jam" },
                    { id: "7d", label: "7 Hari" },
                    { id: "custom", label: "30 Hari" },
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setQuickAccessDuration(d.id as any)}
                      className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition text-center ${
                        quickAccessDuration === d.id
                          ? "border-purple-500 bg-purple-500/15 text-purple-300 font-bold"
                          : "border-border bg-surface-2 text-muted hover:text-foreground"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {quickAccessUrl && (
                <div className="space-y-2 p-3 rounded-xl bg-purple-950/20 border border-purple-500/30">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-purple-300">Tautan Portal Instan:</span>
                    {quickAccessExpiresAt && (
                      <span className="text-muted">
                        Berlaku s/d: {new Date(quickAccessExpiresAt).toLocaleDateString("id-ID")}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}${quickAccessUrl}`}
                      className="w-full px-2.5 py-1.5 text-[11px] font-mono rounded bg-surface-1 border border-border text-foreground select-all"
                    />
                    <button
                      onClick={handleCopyQuickAccess}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 text-white shrink-0 transition"
                    >
                      {isCopiedQuickAccess ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      {isCopiedQuickAccess ? "Disalin" : "Salin"}
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={handleGenerateQuickAccess}
                  disabled={isQuickAccessLoading || !quickAccessAthleteId}
                  className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${isQuickAccessLoading ? "animate-spin" : ""}`}
                  />
                  {quickAccessUrl ? "Buat Ulang Tautan Baru" : "Buat Tautan Quick Access"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal 4: Kelola Aktivasi Akun Atlet ──────────────────────────────── */}
      {activationUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface-1 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <KeyRound className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-foreground">
                    Aktivasi Akun Atlet
                  </h3>
                  <p className="text-xs text-muted">{activationUser.name}</p>
                </div>
              </div>
              <button
                onClick={() => setActivationUser(null)}
                className="text-muted hover:text-foreground text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-2 border border-border text-xs">
                <span className="text-muted font-medium">Status Akun:</span>
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded border ${
                    STATUS_CONFIG[activationStatus as UserAccountStatus]?.style ||
                    STATUS_CONFIG.NO_ACTIVATION_LINK.style
                  }`}
                >
                  {STATUS_CONFIG[activationStatus as UserAccountStatus]?.label ||
                    activationStatus}
                </span>
              </div>

              {activationExpiresAt && (
                <div className="flex items-center gap-2 text-[11px] text-muted px-1">
                  <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>
                    Berlaku sampai:{" "}
                    <strong>{new Date(activationExpiresAt).toLocaleString("id-ID")}</strong>
                  </span>
                </div>
              )}

              {activationUrl ? (
                <div className="space-y-2 p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/30">
                  <label className="text-[11px] font-semibold text-cyan-300 block">
                    Tautan Aktivasi:
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}${activationUrl}`}
                      className="w-full px-2.5 py-1.5 text-[11px] font-mono rounded bg-surface-1 border border-border text-foreground select-all"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded bg-cyan-600 hover:bg-cyan-700 text-white shrink-0 transition"
                    >
                      {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {isCopied ? "Disalin" : "Salin"}
                    </button>
                  </div>
                  <p className="text-[10px] text-cyan-400/80">
                    Bagikan tautan ini ke atlet agar dapat mengatur password akunnya.
                  </p>
                </div>
              ) : null}

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={handleGenerateActivationLink}
                  disabled={isActivationLoading}
                  className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${isActivationLoading ? "animate-spin" : ""}`}
                  />
                  {activationUrl ? "Buat Ulang Link (Regenerate)" : "Buat Link Aktivasi"}
                </button>

                {activationStatus === "PENDING_ACTIVATION" && (
                  <button
                    onClick={handleRevokeActivationLink}
                    disabled={isActivationLoading}
                    className="w-full py-1.5 px-3 text-xs font-semibold rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition flex items-center justify-center gap-1.5"
                  >
                    <Ban className="h-3.5 w-3.5" />
                    Batalkan / Cabut Link
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal 5: Kelola Hubungan Anak untuk Orang Tua ───────────────────── */}
      {parentUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface-1 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-foreground">
                    Kelola Hubungan Anak
                  </h3>
                  <p className="text-xs text-muted">{parentUser.name}</p>
                </div>
              </div>
              <button
                onClick={() => setParentUser(null)}
                className="text-muted hover:text-foreground text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground block">
                  Daftar Atlet Terhubung:
                </label>
                {parentLinkedAthletes.length === 0 ? (
                  <p className="text-xs text-muted italic p-3 rounded-lg bg-surface-2 border border-border text-center">
                    Belum ada atlet yang dihubungkan ke akun orang tua ini.
                  </p>
                ) : (
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {parentLinkedAthletes.map((ch) => (
                      <div
                        key={ch.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-surface-2 border border-border text-xs"
                      >
                        <span className="font-medium text-foreground">{ch.fullName}</span>
                        <button
                          onClick={() => handleRemoveChildFromParent(ch.id)}
                          disabled={isParentActionLoading}
                          className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10 transition"
                          title="Hapus hubungan"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tambah Atlet Baru ke Orang Tua */}
              <div className="pt-2 border-t border-border space-y-2">
                <label className="text-xs font-semibold text-foreground block">
                  Tambah Atlet ke Orang Tua:
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedNewChildId}
                    onChange={(e) => setSelectedNewChildId(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-surface-2 text-foreground focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="">-- Pilih Atlet --</option>
                    {athletes
                      .filter((a) => !parentLinkedAthletes.some((pa) => pa.id === a.id))
                      .map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.fullName}
                        </option>
                      ))}
                  </select>
                  <button
                    onClick={handleAddChildToParent}
                    disabled={isParentActionLoading || !selectedNewChildId}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shrink-0 transition disabled:opacity-50"
                  >
                    Tambah
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal 6: Edit Pengguna ───────────────────────────────────────────── */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface-1 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display text-sm font-bold text-foreground">
                Edit Profil Pengguna
              </h3>
              <button
                onClick={() => setEditUser(null)}
                className="text-muted hover:text-foreground text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-surface-2 text-foreground focus:outline-none focus:ring-1 focus:ring-blue-600"
                  required
                />
              </div>

              {!editUser.email.endsWith("@athlete.internal") && (
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Alamat Email
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-surface-2 text-foreground focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              )}

              {editUser.role === "athlete" && (
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Username Atlet
                  </label>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) =>
                      setEditUsername(e.target.value.toLowerCase().replace(/\s+/g, "_"))
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-surface-2 text-foreground focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              )}

              {editUser.role !== "admin" && (
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Peran (Role)
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as MemberRole)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-surface-2 text-foreground focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="assistant_coach">Asisten Pelatih</option>
                    <option value="head_coach">Head Coach</option>
                    <option value="parent">Orang Tua / Wali</option>
                    <option value="athlete">Atlet</option>
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-muted hover:text-foreground rounded-lg border border-border transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isEditLoading}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition disabled:opacity-50"
                >
                  {isEditLoading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal 7: Konfirmasi Nonaktifkan / Aktifkan Akun ──────────────────── */}
      {deactivateUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-surface-1 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                  deactivateUser.isDeactivated
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                <Power className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-sm font-bold text-foreground">
                  {deactivateUser.isDeactivated ? "Aktifkan Akun?" : "Nonaktifkan Akun?"}
                </h3>
                <p className="text-xs text-muted">{deactivateUser.name}</p>
              </div>
            </div>

            <p className="text-xs text-secondary leading-relaxed">
              {deactivateUser.isDeactivated
                ? "Akun ini akan dipulihkan dan dapat kembali masuk ke platform sesuai perannya."
                : "Pengguna yang dinonaktifkan tidak akan dapat masuk ke sistem dan seluruh sesi aktifnya akan segera dihentikan. Data historis tidak akan dihapus."}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeactivateUser(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-muted hover:text-foreground rounded-lg border border-border transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleToggleDeactivate}
                disabled={isDeactivateLoading}
                className={`px-4 py-1.5 text-xs font-semibold text-white rounded-lg shadow-xs transition disabled:opacity-50 ${
                  deactivateUser.isDeactivated
                    ? "bg-emerald-600 hover:bg-emerald-500"
                    : "bg-red-600 hover:bg-red-500"
                }`}
              >
                {isDeactivateLoading
                  ? "Memproses..."
                  : deactivateUser.isDeactivated
                  ? "Ya, Aktifkan"
                  : "Ya, Nonaktifkan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal 8: Konfirmasi Hapus Akun Permanen ─────────────────────────── */}
      {deleteUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-red-500/30 bg-surface-1 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-sm font-bold text-foreground">
                  Hapus Pengguna Permanen?
                </h3>
                <p className="text-xs text-muted">{deleteUser.name}</p>
              </div>
            </div>

            <p className="text-xs text-secondary leading-relaxed">
              Tindakan ini akan menghapus akses keanggotaan pengguna dari organisasi ini dan membatalkan seluruh sesi aktif atau token undangan yang tertunda. Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteUser(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-muted hover:text-foreground rounded-lg border border-border transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteUserPermanently}
                disabled={isDeleteLoading}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition disabled:opacity-50"
              >
                {isDeleteLoading ? "Menghapus..." : "Ya, Hapus Permanen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
