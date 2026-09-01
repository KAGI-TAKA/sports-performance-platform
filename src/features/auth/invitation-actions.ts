"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/lib/auth-context";
import { sendAssistantCoachInvitationEmail } from "@/lib/email";

export async function createAssistantCoachInvitation(input: {
  name: string;
  email: string;
}): Promise<{
  success: boolean;
  error?: string;
  invitationId?: string;
  expiresAt?: string;
}> {
  try {
    const ctx = await requireOrgContext();

    if (ctx.role !== "admin") {
      return {
        success: false,
        error: "Hanya Admin / Owner yang dapat mengirimkan undangan pelatih.",
      };
    }

    const email = input.email.toLowerCase().trim();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 hari TTL

    // Invalidate previous pending invitations for this email in this org
    await prisma.invitation.updateMany({
      where: {
        organizationId: ctx.organizationId,
        email,
        status: "pending",
      },
      data: {
        status: "canceled",
      },
    });

    const invitation = await prisma.invitation.create({
      data: {
        organizationId: ctx.organizationId,
        email,
        role: "assistant_coach",
        status: "pending",
        inviterId: ctx.userId,
        expiresAt,
      },
    });

    const inviteUrl = `/invitations/accept?id=${invitation?.id || ""}`;

    // Send transactional invitation email
    await sendAssistantCoachInvitationEmail({
      to: email,
      recipientName: input.name,
      inviterName: ctx.userName,
      inviteUrl,
      expiresInDays: 7,
    }).catch((err) => {
      console.error("[createAssistantCoachInvitation] Gagal mengirim email (non-fatal):", err);
    });

    revalidatePath("/settings");
    return {
      success: true,
      invitationId: invitation?.id,
      expiresAt: invitation?.expiresAt ? invitation.expiresAt.toISOString() : expiresAt.toISOString(),
    };
  } catch (err) {
    console.error("[createAssistantCoachInvitation] Gagal:", err);
    return {
      success: false,
      error: (err as Error).message || "Gagal membuat undangan asisten pelatih.",
    };
  }
}

export async function validateInvitation(invitationId: string): Promise<{
  valid: boolean;
  error?: string;
  invitation?: {
    id: string;
    email: string;
    role: string;
    organizationName: string;
    expiresAt: string;
  };
}> {
  try {
    if (!invitationId) {
      return { valid: false, error: "ID Undangan tidak valid atau kosong." };
    }

    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
      include: {
        organization: { select: { name: true } },
      },
    });

    if (!invitation) {
      return { valid: false, error: "Undangan tidak ditemukan." };
    }

    if (invitation.status !== "pending") {
      return {
        valid: false,
        error:
          invitation.status === "accepted"
            ? "Undangan ini sudah pernah digunakan untuk aktivasi akun."
            : "Undangan ini telah dibatalkan atau dicabut oleh administrator.",
      };
    }

    if (new Date() > new Date(invitation.expiresAt)) {
      return {
        valid: false,
        error: "Masa berlaku tautan undangan telah kedaluwarsa (lebih dari 7 hari). Silakan hubungi admin.",
      };
    }

    return {
      valid: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        organizationName: invitation.organization.name,
        expiresAt: invitation.expiresAt.toISOString(),
      },
    };
  } catch (err) {
    console.error("[validateInvitation] Gagal:", err);
    return { valid: false, error: "Gagal memvalidasi undangan." };
  }
}

export async function acceptAssistantCoachInvitation(input: {
  invitationId: string;
  name: string;
  password: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { invitationId, name, password } = input;

    if (!password || password.length < 8) {
      return { success: false, error: "Password minimal 8 karakter." };
    }

    if (!name || name.trim().length < 2) {
      return { success: false, error: "Nama lengkap minimal 2 karakter." };
    }

    const validation = await validateInvitation(invitationId);
    if (!validation.valid || !validation.invitation) {
      return { success: false, error: validation.error || "Undangan tidak valid." };
    }

    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      return { success: false, error: "Undangan tidak ditemukan." };
    }

    const normalizedEmail = invitation.email.toLowerCase().trim();
    const passwordHash = await bcrypt.hash(password, 10);

    // Cari atau buat User
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          emailVerified: true, // Terverifikasi melalui klik link aktivasi email
        },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: name.trim(),
          emailVerified: true,
        },
      });
    }

    // Set / update akun kredensial password untuk Better Auth
    const existingAccount = await prisma.account.findFirst({
      where: {
        userId: user.id,
        providerId: "credential",
      },
    });

    if (existingAccount) {
      await prisma.account.update({
        where: { id: existingAccount.id },
        data: { password: passwordHash },
      });
    } else {
      await prisma.account.create({
        data: {
          userId: user.id,
          providerId: "credential",
          accountId: user.id,
          password: passwordHash,
        },
      });
    }

    // Buat atau perbarui keanggotaan Member di organisasi
    const existingMember = await prisma.member.findUnique({
      where: {
        organizationId_userId: {
          organizationId: invitation.organizationId,
          userId: user.id,
        },
      },
    });

    if (!existingMember) {
      await prisma.member.create({
        data: {
          organizationId: invitation.organizationId,
          userId: user.id,
          role: invitation.role,
        },
      });
    } else {
      await prisma.member.update({
        where: { id: existingMember.id },
        data: { role: invitation.role },
      });
    }

    // Tandai status undangan selesai digunakan
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: "accepted" },
    });

    return { success: true };
  } catch (err) {
    console.error("[acceptAssistantCoachInvitation] Gagal:", err);
    return {
      success: false,
      error: (err as Error).message || "Gagal mengaktifkan akun asisten pelatih.",
    };
  }
}
