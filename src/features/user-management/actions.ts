"use server";

import { requireOrgContext } from "@/lib/auth-context";
import { prisma } from "@/lib/prisma";
import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import {
  provisionUserSchema,
  updateUserProfileSchema,
  type ProvisionUserInput,
  type ProvisionedUserResult,
  type UserManagementItem,
  type UpdateUserProfileInput,
  type UserAccountStatus,
} from "./types";
import { type MemberRole } from "@/lib/constants";
import {
  addChildToParent,
  removeChildFromParent,
  getParentLinkedChildren,
  setParentAthleteRelationships,
} from "@/features/portal/parent-queries";
import {
  sendAssistantCoachInvitationEmail,
  sendParentInvitationEmail,
} from "@/lib/email";
import { generateAthleteActivationToken } from "@/features/auth/athlete-actions";

export async function provisionUser(
  input: ProvisionUserInput
): Promise<ProvisionedUserResult> {
  const ctx = await requireOrgContext();

  if (ctx.role !== "admin") {
    return {
      success: false,
      error: "Hanya Admin yang memiliki hak untuk menambah dan mengatur pengguna organisasi.",
    };
  }

  const validation = provisionUserSchema.safeParse(input);
  if (!validation.success) {
    const firstIssue = validation.error.issues[0];
    return {
      success: false,
      error: firstIssue ? firstIssue.message : "Data input pengguna tidak valid.",
    };
  }

  const parsed = validation.data;
  const role = parsed.role;
  const name = parsed.name || "";

  try {
    // ── 1. Role Head Coach / Assistant Coach ──────────────────────────────
    if (role === "head_coach" || role === "assistant_coach") {
      if (!parsed.email) {
        return { success: false, error: "Email wajib diisi untuk pelatih." };
      }
      const normalizedEmail = parsed.email.toLowerCase().trim();

      const existingMember = await prisma.member.findFirst({
        where: {
          organizationId: ctx.organizationId,
          user: { email: normalizedEmail },
        },
      });

      if (existingMember) {
        return { success: false, error: "Email sudah terdaftar sebagai anggota dalam organisasi ini." };
      }

      let user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            name: name.trim(),
            email: normalizedEmail,
            emailVerified: false,
            image: parsed.image && parsed.image.trim() ? parsed.image.trim() : null,
          },
        });
      } else if (parsed.image && parsed.image.trim()) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { image: parsed.image.trim() },
        });
      }

      await prisma.member.create({
        data: {
          organizationId: ctx.organizationId,
          userId: user.id,
          role,
        },
      });

      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const invitation = await prisma.invitation.create({
        data: {
          organizationId: ctx.organizationId,
          email: normalizedEmail,
          role,
          status: "pending",
          inviterId: ctx.userId,
          expiresAt,
        },
      });

      const inviteUrl = `/invitations/accept?id=${invitation.id}`;

      await sendAssistantCoachInvitationEmail({
        to: normalizedEmail,
        recipientName: name.trim(),
        inviterName: ctx.userName,
        inviteUrl,
        expiresInDays: 7,
      }).catch((err) => {
        console.error("[provisionUser] Gagal mengirim email undangan pelatih (non-fatal):", err);
      });

      revalidatePath("/users");
      revalidatePath("/settings");
      return {
        success: true,
        inviteUrl,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: role as MemberRole,
        },
      };
    }

    // ── 2. Role Parent (Orang Tua / Wali) ────────────────────────────────
    if (role === "parent") {
      if (!parsed.email) {
        return { success: false, error: "Email wajib diisi untuk akun orang tua." };
      }
      const normalizedEmail = parsed.email.toLowerCase().trim();

      const existingMember = await prisma.member.findFirst({
        where: {
          organizationId: ctx.organizationId,
          user: { email: normalizedEmail },
        },
      });

      if (existingMember) {
        return { success: false, error: "Email orang tua sudah terdaftar dalam organisasi ini." };
      }

      const athleteIds = parsed.athleteIds || [];
      let orgAthletes: { id: string; fullName: string }[] = [];

      if (athleteIds.length > 0) {
        orgAthletes = await prisma.athlete.findMany({
          where: {
            id: { in: athleteIds },
            organizationId: ctx.organizationId,
            isActive: true,
          },
          select: { id: true, fullName: true },
        });

        if (orgAthletes.length !== athleteIds.length) {
          return {
            success: false,
            error: "Satu atau lebih atlet yang dipilih tidak valid atau tidak terdaftar di organisasi.",
          };
        }
      }

      let user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            name: name.trim(),
            email: normalizedEmail,
            emailVerified: false,
            image: parsed.image && parsed.image.trim() ? parsed.image.trim() : null,
          },
        });
      } else if (parsed.image && parsed.image.trim()) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { image: parsed.image.trim() },
        });
      }

      await prisma.member.create({
        data: {
          organizationId: ctx.organizationId,
          userId: user.id,
          role: "parent",
        },
      });

      if (orgAthletes.length > 0) {
        await prisma.athlete.updateMany({
          where: {
            id: { in: orgAthletes.map((a) => a.id) },
            parentName: null,
          },
          data: { parentName: name.trim() },
        });
      }

      await setParentAthleteRelationships(
        user.id,
        ctx.organizationId,
        orgAthletes.map((a) => a.id)
      );

      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const invitation = await prisma.invitation.create({
        data: {
          organizationId: ctx.organizationId,
          email: normalizedEmail,
          role: "parent",
          status: "pending",
          inviterId: ctx.userId,
          expiresAt,
        },
      });

      const inviteUrl = `/invitations/accept?id=${invitation.id}`;

      await sendParentInvitationEmail({
        to: normalizedEmail,
        parentName: name.trim(),
        athleteNames: orgAthletes.map((a) => a.fullName),
        activationUrl: inviteUrl,
        expiresInDays: 7,
      }).catch((err) => {
        console.error("[provisionUser] Gagal mengirim email orang tua (non-fatal):", err);
      });

      revalidatePath("/users");
      revalidatePath("/settings");
      return {
        success: true,
        inviteUrl,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: "parent",
        },
      };
    }

    // ── 3. Role Athlete (Akun Atlet) ─────────────────────────────────────
    if (role === "athlete") {
      if (!parsed.username) {
        return { success: false, error: "Username wajib diisi untuk akun atlet." };
      }
      const normalizedUsername = parsed.username.toLowerCase().trim();

      const existingPortalUsername = await prisma.portalAccess.findUnique({
        where: { username: normalizedUsername },
      });

      if (existingPortalUsername) {
        return { success: false, error: "Username sudah digunakan." };
      }

      if (!parsed.athleteId) {
        return { success: false, error: "Pilih profil atlet yang ingin dikaitkan dengan akun ini." };
      }

      const athleteRecord = await prisma.athlete.findFirst({
        where: {
          id: parsed.athleteId,
          organizationId: ctx.organizationId,
        },
      });

      if (!athleteRecord) {
        return { success: false, error: "Profil atlet tidak ditemukan dalam organisasi ini." };
      }

      const athleteName = athleteRecord.fullName;
      const athleteEmail = parsed.email
        ? parsed.email.toLowerCase().trim()
        : `${normalizedUsername}@athlete.internal`;

      let user = await prisma.user.findUnique({
        where: { email: athleteEmail },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            name: athleteName,
            email: athleteEmail,
            emailVerified: false,
          },
        });
      }

      await prisma.member.create({
        data: {
          organizationId: ctx.organizationId,
          userId: user.id,
          role: "athlete",
        },
      });

      const tokenHash = crypto.randomBytes(32).toString("hex");
      await prisma.portalAccess.create({
        data: {
          organizationId: ctx.organizationId,
          athleteId: athleteRecord.id,
          createdByMemberId: ctx.memberId,
          username: normalizedUsername,
          tokenHash,
          accessType: "ATHLETE",
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      // Auto-generate single-use activation token
      const actRes = await generateAthleteActivationToken(
        normalizedUsername,
        parsed.email ? parsed.email.toLowerCase().trim() : undefined
      );

      revalidatePath("/users");
      revalidatePath("/settings");
      return {
        success: true,
        inviteUrl: actRes.activationUrl,
        rawToken: actRes.rawToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: "athlete",
        },
      };
    }

    return { success: false, error: "Peran pengguna tidak valid." };
  } catch (err) {
    console.error("[provisionUser] Gagal memproses:", err);
    return {
      success: false,
      error: (err as Error).message || "Terjadi kesalahan pada server saat provisioning pengguna.",
    };
  }
}

export async function updateUserProfile(
  input: UpdateUserProfileInput
): Promise<{ success: boolean; error?: string }> {
  const ctx = await requireOrgContext();

  if (ctx.role !== "admin") {
    return {
      success: false,
      error: "Hanya Admin yang berwenang mengubah profil atau peran pengguna.",
    };
  }

  const validation = updateUserProfileSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || "Data profil tidak valid.",
    };
  }

  const { userId, memberId, name, email, image, username, role } = validation.data;

  try {
    const member = await prisma.member.findFirst({
      where: { id: memberId, organizationId: ctx.organizationId, userId },
      include: { user: true },
    });

    if (!member) {
      return { success: false, error: "Anggota tidak ditemukan dalam organisasi ini." };
    }

    // 1. Update User basic info
    const updateUserData: { name: string; email?: string; image?: string | null } = { name: name.trim() };
    if (image !== undefined) {
      updateUserData.image = image && image.trim() ? image.trim() : null;
    }
    if (email && email.trim() && !member.user.email.endsWith("@athlete.internal")) {
      const normalizedEmail = email.toLowerCase().trim();
      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
      if (existingUser && existingUser.id !== userId) {
        return { success: false, error: "Email sudah digunakan oleh akun lain." };
      }
      updateUserData.email = normalizedEmail;
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateUserData,
    });

    // 2. Update Member Role if provided and not self-demoting the primary admin
    if (role && role !== member.role) {
      if (member.userId === ctx.userId && role !== "admin") {
        return {
          success: false,
          error: "Anda tidak dapat mengubah peran akun Anda sendiri dari Admin.",
        };
      }

      await prisma.member.update({
        where: { id: memberId },
        data: { role },
      });
    }

    // 3. If athlete and username changed, update PortalAccess
    if (member.role === "athlete" && username && username.trim()) {
      const normalizedUsername = username.toLowerCase().trim();
      const existingPa = await prisma.portalAccess.findFirst({
        where: {
          username: normalizedUsername,
          NOT: {
            athlete: {
              organizationId: ctx.organizationId,
            },
          },
        },
      });

      if (existingPa) {
        return { success: false, error: "Username atlet sudah digunakan." };
      }

      await prisma.portalAccess.updateMany({
        where: {
          organizationId: ctx.organizationId,
          username: member.user.name.toLowerCase().replace(/\s+/g, "_"),
        },
        data: { username: normalizedUsername },
      });
    }

    revalidatePath("/users");
    revalidatePath("/settings");
    return { success: true };
  } catch (err) {
    console.error("[updateUserProfile] Gagal:", err);
    return {
      success: false,
      error: (err as Error).message || "Gagal memperbarui profil pengguna.",
    };
  }
}

export async function updateMyProfile(input: {
  name: string;
  image?: string | null;
}): Promise<{ success: boolean; error?: string }> {
  const ctx = await requireOrgContext();

  if (!input.name || input.name.trim().length < 2) {
    return { success: false, error: "Nama lengkap minimal 2 karakter." };
  }

  try {
    await prisma.user.update({
      where: { id: ctx.userId },
      data: {
        name: input.name.trim(),
        image: input.image !== undefined ? (input.image && input.image.trim() ? input.image.trim() : null) : undefined,
      },
    });

    revalidatePath("/settings");
    revalidatePath("/users");
    revalidatePath("/dashboard");
    revalidatePath("/schedule");
    return { success: true };
  } catch (err) {
    console.error("[updateMyProfile] Gagal:", err);
    return {
      success: false,
      error: (err as Error).message || "Gagal memperbarui profil akun Anda.",
    };
  }
}

export async function toggleUserActiveStatus(
  userId: string,
  memberId: string,
  targetActive: boolean
): Promise<{ success: boolean; error?: string }> {
  const ctx = await requireOrgContext();

  if (ctx.role !== "admin") {
    return {
      success: false,
      error: "Hanya Admin yang berwenang mengubah status aktif pengguna.",
    };
  }

  if (userId === ctx.userId) {
    return {
      success: false,
      error: "Anda tidak dapat menonaktifkan akun Anda sendiri.",
    };
  }

  try {
    const member = await prisma.member.findFirst({
      where: { id: memberId, organizationId: ctx.organizationId, userId },
    });

    if (!member) {
      return { success: false, error: "Pengguna tidak ditemukan dalam organisasi ini." };
    }

    const identifier = `user-deactivated:${userId}:${ctx.organizationId}`;

    if (!targetActive) {
      // Deactivate: store deactivated flag in Verification table and purge active sessions
      await prisma.verification.create({
        data: {
          identifier,
          value: JSON.stringify({ deactivatedAt: new Date(), deactivatedBy: ctx.userId }),
          expiresAt: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000), // 10 years
        },
      });

      // Purge sessions to terminate existing logins
      await prisma.session.deleteMany({
        where: { userId },
      });
    } else {
      // Reactivate: delete deactivated flag
      await prisma.verification.deleteMany({
        where: { identifier },
      });
    }

    revalidatePath("/users");
    revalidatePath("/settings");
    return { success: true };
  } catch (err) {
    console.error("[toggleUserActiveStatus] Gagal:", err);
    return {
      success: false,
      error: (err as Error).message || "Gagal mengubah status aktif pengguna.",
    };
  }
}

export async function deleteUserPermanently(
  userId: string,
  memberId: string
): Promise<{ success: boolean; error?: string }> {
  const ctx = await requireOrgContext();

  if (ctx.role !== "admin") {
    return {
      success: false,
      error: "Hanya Admin yang berwenang menghapus akun pengguna secara permanen.",
    };
  }

  if (userId === ctx.userId) {
    return {
      success: false,
      error: "Anda tidak dapat menghapus akun Anda sendiri.",
    };
  }

  try {
    const member = await prisma.member.findFirst({
      where: { id: memberId, organizationId: ctx.organizationId, userId },
      include: { user: true },
    });

    if (!member) {
      return { success: false, error: "Data anggota tidak ditemukan dalam organisasi ini." };
    }

    const userEmail = member.user.email;

    // 1. Terminate all active sessions for this user
    await prisma.session.deleteMany({ where: { userId } });

    // 2. Delete member record in this organization
    await prisma.member.delete({ where: { id: memberId } });

    // 3. Invalidate/delete any pending invitations for this email in this org
    await prisma.invitation.deleteMany({
      where: { organizationId: ctx.organizationId, email: userEmail },
    });

    // 4. Delete related verification tokens
    await prisma.verification.deleteMany({
      where: {
        identifier: {
          in: [
            `user-deactivated:${userId}:${ctx.organizationId}`,
            `parent-children:${userId}:${ctx.organizationId}`,
            `athlete-activate:${member.user.name.toLowerCase()}`,
          ],
        },
      },
    });

    // 5. Clean up PortalAccess if athlete
    if (member.role === "athlete") {
      const emailPrefix = userEmail.split("@")[0].toLowerCase();
      await prisma.portalAccess.deleteMany({
        where: {
          organizationId: ctx.organizationId,
          username: emailPrefix,
        },
      });
    }

    // 6. Delete user record if no remaining memberships across any org
    const remainingCount = await prisma.member.count({ where: { userId } });
    if (remainingCount === 0) {
      await prisma.user.delete({ where: { id: userId } }).catch((err) => {
        console.warn("[deleteUserPermanently] User record retained due to foreign references:", err);
      });
    }

    revalidatePath("/users");
    revalidatePath("/settings");
    return { success: true };
  } catch (err) {
    console.error("[deleteUserPermanently] Gagal:", err);
    return {
      success: false,
      error: (err as Error).message || "Gagal menghapus akun pengguna.",
    };
  }
}

export async function resendInvitationAction(
  email: string,
  role: string
): Promise<{ success: boolean; error?: string; inviteUrl?: string }> {
  const ctx = await requireOrgContext();

  if (ctx.role !== "admin") {
    return {
      success: false,
      error: "Hanya Admin yang dapat mengirim ulang undangan.",
    };
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    // Invalidate prior pending invitations
    await prisma.invitation.deleteMany({
      where: {
        organizationId: ctx.organizationId,
        email: normalizedEmail,
        status: "pending",
      },
    });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const invitation = await prisma.invitation.create({
      data: {
        organizationId: ctx.organizationId,
        email: normalizedEmail,
        role,
        status: "pending",
        inviterId: ctx.userId,
        expiresAt,
      },
    });

    const inviteUrl = `/invitations/accept?id=${invitation.id}`;

    if (role === "parent") {
      await sendParentInvitationEmail({
        to: normalizedEmail,
        parentName: normalizedEmail.split("@")[0],
        activationUrl: inviteUrl,
        expiresInDays: 7,
      }).catch((err) => {
        console.error("[resendInvitationAction] Gagal mengirim email orang tua:", err);
      });
    } else {
      await sendAssistantCoachInvitationEmail({
        to: normalizedEmail,
        recipientName: normalizedEmail.split("@")[0],
        inviterName: ctx.userName,
        inviteUrl,
        expiresInDays: 7,
      }).catch((err) => {
        console.error("[resendInvitationAction] Gagal mengirim email staf:", err);
      });
    }

    revalidatePath("/users");
    return { success: true, inviteUrl };
  } catch (err) {
    console.error("[resendInvitationAction] Gagal:", err);
    return {
      success: false,
      error: (err as Error).message || "Gagal membuat tautan undangan baru.",
    };
  }
}

export async function addChildToParentAction(
  parentUserId: string,
  athleteId: string
) {
  const res = await addChildToParent(parentUserId, athleteId);
  if (res.success) {
    revalidatePath("/users");
    revalidatePath("/settings");
  }
  return res;
}

export async function removeChildFromParentAction(
  parentUserId: string,
  athleteId: string
) {
  const res = await removeChildFromParent(parentUserId, athleteId);
  if (res.success) {
    revalidatePath("/users");
    revalidatePath("/settings");
  }
  return res;
}

export async function getParentLinkedChildrenAction(parentUserId: string) {
  return getParentLinkedChildren(parentUserId);
}

export async function listOrganizationUsers(): Promise<UserManagementItem[]> {
  const ctx = await requireOrgContext();

  const [members, athletes, portalAccesses, verifications, pendingInvitations] = await Promise.all([
    prisma.member.findMany({
      where: { organizationId: ctx.organizationId },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.athlete.findMany({
      where: { organizationId: ctx.organizationId },
      select: { id: true, fullName: true, sportCategory: true, parentName: true },
    }),
    prisma.portalAccess.findMany({
      where: { organizationId: ctx.organizationId },
      select: {
        id: true,
        athleteId: true,
        username: true,
        passwordHash: true,
        revokedAt: true,
        expiresAt: true,
      },
    }),
    prisma.verification.findMany({
      select: {
        identifier: true,
        value: true,
        expiresAt: true,
      },
    }),
    prisma.invitation.findMany({
      where: {
        organizationId: ctx.organizationId,
        status: "pending",
        expiresAt: { gt: new Date() },
      },
      select: {
        email: true,
        expiresAt: true,
      },
    }),
  ]);

  const verificationMap = new Map<string, { value: string; expiresAt: Date }>();
  for (const v of verifications) {
    verificationMap.set(v.identifier, { value: v.value, expiresAt: v.expiresAt });
  }

  const pendingInvitationEmails = new Set(
    pendingInvitations.map((inv) => inv.email.toLowerCase())
  );

  const athleteMap = new Map(athletes.map((a) => [a.id, a]));
  const portalAccessByAthleteId = new Map(portalAccesses.map((p) => [p.athleteId, p]));
  const portalAccessByUsername = new Map(
    portalAccesses.filter((p) => p.username).map((p) => [p.username!.toLowerCase(), p])
  );

  return members.map((m) => {
    let linkedAthletes: { id: string; fullName: string; sportCategory?: string | null }[] | undefined;
    let linkedAthleteNames: string[] | undefined;
    let username: string | undefined;
    let activationStatus: UserManagementItem["activationStatus"];
    let activationExpiresAt: string | undefined;

    // Check if user is deactivated
    const deactKey = `user-deactivated:${m.user.id}:${ctx.organizationId}`;
    const isDeactivated = verificationMap.has(deactKey);

    let status: UserAccountStatus = "ACTIVE";

    // ── Role Parent ──────────────────────────────────────────────────────────
    if (m.role === "parent") {
      const parentRelKey = `parent-children:${m.user.id}:${ctx.organizationId}`;
      const relRecord = verificationMap.get(parentRelKey);

      if (relRecord && new Date() <= new Date(relRecord.expiresAt)) {
        try {
          const ids: string[] = JSON.parse(relRecord.value);
          if (Array.isArray(ids)) {
            const matched = ids
              .map((id) => athleteMap.get(id))
              .filter((a): a is typeof athletes[0] => a != null);

            linkedAthletes = matched.map((a) => ({
              id: a.id,
              fullName: a.fullName,
              sportCategory: a.sportCategory,
            }));
            linkedAthleteNames = matched.map((a) => a.fullName);
          }
        } catch {
          // ignore
        }
      }

      if (!linkedAthleteNames || linkedAthleteNames.length === 0) {
        linkedAthleteNames = athletes
          .filter((a) => a.parentName && a.parentName.toLowerCase() === m.user.name.toLowerCase())
          .map((a) => a.fullName);
      }

      // If parent has not verified email or has a pending invitation, show INVITATION_PENDING
      if (!m.user.emailVerified || pendingInvitationEmails.has(m.user.email.toLowerCase())) {
        status = "INVITATION_PENDING";
      }
    }

    // ── Role Athlete ─────────────────────────────────────────────────────────
    if (m.role === "athlete") {
      const emailPrefix = m.user.email.split("@")[0].toLowerCase();
      let pa = portalAccessByUsername.get(emailPrefix);

      if (!pa) {
        const ath = athletes.find((a) => a.fullName.toLowerCase() === m.user.name.toLowerCase());
        if (ath) {
          pa = portalAccessByAthleteId.get(ath.id);
        }
      }

      if (pa && pa.username) {
        username = pa.username;

        if (pa.revokedAt != null) {
          activationStatus = "ACTIVATION_REVOKED";
          status = "ACTIVATION_REVOKED";
        } else if (pa.passwordHash != null) {
          activationStatus = "ACTIVE";
          status = "ACTIVE";
        } else {
          const actKey = `athlete-activate:${pa.username.toLowerCase()}`;
          const actRecord = verificationMap.get(actKey);

          if (!actRecord) {
            activationStatus = "NO_ACTIVATION_LINK";
            status = "NO_ACTIVATION_LINK";
          } else if (new Date() > new Date(actRecord.expiresAt)) {
            activationStatus = "ACTIVATION_EXPIRED";
            status = "ACTIVATION_EXPIRED";
          } else {
            activationStatus = "PENDING_ACTIVATION";
            status = "PENDING_ACTIVATION";
            activationExpiresAt = actRecord.expiresAt.toISOString();
          }
        }
      } else {
        activationStatus = "NO_ACTIVATION_LINK";
        status = "NO_ACTIVATION_LINK";
      }
    }

    // ── Check Pending Invitation for Staff (Head Coach & Assistant Coach) ─────
    if (m.role === "head_coach" || m.role === "assistant_coach") {
      if (!m.user.emailVerified || pendingInvitationEmails.has(m.user.email.toLowerCase())) {
        status = "INVITATION_PENDING";
      }
    }

    if (isDeactivated) {
      status = "DEACTIVATED";
    }

    return {
      id: m.user.id,
      memberId: m.id,
      name: m.user.name,
      email: m.user.email,
      image: m.user.image,
      role: m.role as MemberRole,
      createdAt: m.createdAt,
      username,
      status,
      isDeactivated,
      activationStatus,
      activationExpiresAt,
      linkedAthletes,
      linkedAthleteNames,
    };
  });
}
