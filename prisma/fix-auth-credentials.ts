import fs from "fs";
import path from "path";

// Load .env.local SEBELUM import auth
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

import { auth } from "../src/lib/auth";
import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🔧 Memperbaiki kredensial autentikasi Coach Zulfi & Portal Klien...");

  // 1. Dapatkan atau buat Organisasi Coach Zulfi
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

  // 2. Bersihkan user lama jika ada agar signUpEmail Better Auth bisa membuat hash scrypt resmi
  const existingUser = await prisma.user.findFirst({
    where: { email: "zulficoach@performance.id" },
  });

  if (existingUser) {
    // Hapus account lama
    await prisma.account.deleteMany({ where: { userId: existingUser.id } });
    await prisma.session.deleteMany({ where: { userId: existingUser.id } });
    await prisma.member.deleteMany({ where: { userId: existingUser.id } });
    await prisma.user.delete({ where: { id: existingUser.id } });
  }

  // 3. Daftarkan Coach Zulfi via Better Auth signUpEmail (menghasilkan hash password scrypt resmi Better Auth)
  const signUpRes = await auth.api.signUpEmail({
    body: {
      name: "Coach Zulfi",
      email: "zulficoach@performance.id",
      password: "ZulfiCoach2026!",
    },
  });

  console.log("✅ Coach Zulfi Berhasil Didaftarkan di Better Auth:", signUpRes?.user?.email);

  if (signUpRes?.user) {
    // Kaitkan sebagai Admin di Organisasi
    await prisma.member.create({
      data: {
        organizationId: org.id,
        userId: signUpRes.user.id,
        role: "admin",
      },
    });
  }

  // 4. Perbaiki Kredensial Portal Atlet & Ortu untuk Rangga Pratama
  const athlete = await prisma.athlete.findFirst({
    where: { organizationId: org.id, fullName: "Rangga Pratama" },
  });

  if (athlete) {
    const athletePassHash = await bcrypt.hash("ZulfiCoach123!", 10);
    const parentPassHash = await bcrypt.hash("ZulfiOrtu123!", 10);

    // Dapatkan member pelatih
    const coachMember = await prisma.member.findFirst({
      where: { organizationId: org.id },
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 90);

    // Hapus portal access lama
    await prisma.portalAccess.deleteMany({
      where: { athleteId: athlete.id },
    });

    const rawTokenAthlete = "atlet_rangga_token_2026";
    const rawTokenParent = "ortu_rangga_token_2026";

    await prisma.portalAccess.createMany({
      data: [
        {
          organizationId: org.id,
          athleteId: athlete.id,
          createdByMemberId: coachMember?.id || org.id,
          tokenHash: rawTokenAthlete,
          username: "atlet_rangga",
          passwordHash: athletePassHash,
          plainPassword: "ZulfiCoach123!",
          accessType: "ATHLETE",
          expiresAt,
        },
        {
          organizationId: org.id,
          athleteId: athlete.id,
          createdByMemberId: coachMember?.id || org.id,
          tokenHash: rawTokenParent,
          username: "ortu_rangga",
          passwordHash: parentPassHash,
          plainPassword: "ZulfiOrtu123!",
          accessType: "PARENT",
          expiresAt,
        },
      ],
    });

    console.log("✅ Kredensial Portal Rangga (atlet_rangga) & Ibu Siska (ortu_rangga) berhasil diperbarui!");
  }

  console.log("🎉 SELURUH KREDENSIAL BERHASIL DIPERBAIKI!");
}

main()
  .catch((e) => {
    console.error("❌ Error fix auth:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
