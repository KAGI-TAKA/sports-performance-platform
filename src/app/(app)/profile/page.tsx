import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/lib/auth-context";
import { ProfileClient } from "./profile-client";

export const metadata = {
  title: "Profil Akun • Coach Zulfi Platform",
  description: "Kelola profil akun pribadi, foto, nama tampilan, dan kredensial akses lapangan.",
};

export default async function ProfilePage() {
  const ctx = await requireOrgContext();

  const [user, member, organization] = await Promise.all([
    prisma.user.findUnique({
      where: { id: ctx.userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
    }),
    prisma.member.findUnique({
      where: { id: ctx.memberId },
      select: { phone: true },
    }),
    prisma.organization.findUnique({
      where: { id: ctx.organizationId },
      select: { name: true },
    }),
  ]);

  if (!user || !organization) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-border/60">
        <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">
          Profil Akun &amp; Kredensial
        </h1>
        <p className="text-xs text-muted mt-0.5">
          Kelola foto profil, nama tampilan, nomor telepon, dan keamanan akun.
        </p>
      </div>

      <ProfileClient
        user={user}
        member={{ role: ctx.role, phone: member?.phone }}
        organization={organization}
      />
    </div>
  );
}
