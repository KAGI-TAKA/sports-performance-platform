import fs from "fs";
import path from "path";

// Load .env.local SEBELUM PrismaClient di-import
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf-8");
  envConfig.split("\n").forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

import { PrismaClient } from "@prisma/client";
import { hashPassword } from "@better-auth/utils/password";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🔑 Memperbaiki kredensial Coach Zulfi (@zulficoach) & Portal...");

  let org = await prisma.organization.findFirst({
    where: { slug: "coach-zulfi-hub" },
  });

  if (!org) {
    org = await prisma.organization.create({
      data: {
        name: "Coach Zulfi Athletic Performance",
        slug: "coach-zulfi-hub",
        metadata: JSON.stringify({ instagram: "@zulficoach" }),
      },
    });
  }

  // 1. Akun Coach Zulfi dengan hash resmi Better Auth
  const coachEmail = "zulficoach@performance.id";
  const rawPasswordCoach = "ZulfiCoach2026!";
  const betterAuthHash = await hashPassword(rawPasswordCoach);

  let coachUser = await prisma.user.findFirst({
    where: { email: coachEmail },
  });

  if (!coachUser) {
    coachUser = await prisma.user.create({
      data: {
        name: "Coach Zulfi",
        email: coachEmail,
        emailVerified: true,
      },
    });
  }

  // Bersihkan account lama & buat dengan hash resmi Better Auth
  await prisma.account.deleteMany({
    where: { userId: coachUser.id },
  });

  await prisma.account.create({
    data: {
      userId: coachUser.id,
      accountId: coachEmail,
      providerId: "credential",
      password: betterAuthHash,
    },
  });

  // Pastikan terdaftar sebagai member admin
  const existingMember = await prisma.member.findFirst({
    where: { organizationId: org.id, userId: coachUser.id },
  });

  let memberId = existingMember?.id;
  if (!existingMember) {
    const newMember = await prisma.member.create({
      data: {
        organizationId: org.id,
        userId: coachUser.id,
        role: "admin",
      },
    });
    memberId = newMember.id;
  }

  console.log("✅ Akun Coach Zulfi Siap Login:");
  console.log("   - Email   :", coachEmail);
  console.log("   - Password:", rawPasswordCoach);

  // 2. Kredensial Portal Rangga & Bu Siska
  const athlete = await prisma.athlete.findFirst({
    where: { organizationId: org.id, fullName: "Rangga Pratama" },
  });

  if (athlete) {
    const athletePassHash = await bcrypt.hash("ZulfiCoach123!", 10);
    const parentPassHash = await bcrypt.hash("ZulfiOrtu123!", 10);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 90);

    // Hapus portal access lama
    await prisma.portalAccess.deleteMany({
      where: { athleteId: athlete.id },
    });

    const athleteAccess = await prisma.portalAccess.create({
      data: {
        organizationId: org.id,
        athleteId: athlete.id,
        createdByMemberId: memberId!,
        tokenHash: "atlet_rangga_token_2026",
        username: "atlet_rangga",
        passwordHash: athletePassHash,
        plainPassword: "ZulfiCoach123!",
        accessType: "ATHLETE",
        expiresAt,
      },
    });

    const parentAccess = await prisma.portalAccess.create({
      data: {
        organizationId: org.id,
        athleteId: athlete.id,
        createdByMemberId: memberId!,
        tokenHash: "ortu_rangga_token_2026",
        username: "ortu_rangga",
        passwordHash: parentPassHash,
        plainPassword: "ZulfiOrtu123!",
        accessType: "PARENT",
        expiresAt,
      },
    });

    console.log("✅ Kredensial Portal Rangga (atlet_rangga) & Bu Siska (ortu_rangga) aktif!");
  }

  console.log("🎉 SEMUA KREDENSIAL TELAH TERSINKRONISASI 100%!");
}

main()
  .catch((e) => {
    console.error("❌ Error fix credentials:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
