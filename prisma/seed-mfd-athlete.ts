/**
 * seed-mfd-athlete.ts
 * Membuat 1 atlet MFD resmi (Bintang Erlangga, 8 tahun) dengan:
 *  - Data profil lengkap (competitionLevel = "MFD")
 *  - 3 sesi latihan (2 selesai + 1 mendatang)
 *  - Attendance records yang realistis untuk streak
 *  - Portal access (ATHLETE + PARENT)
 *
 * Model names confirmed from schema:
 *  - ScheduleSession (coachId, NOT athleteId — athletes via ScheduleSessionAthlete)
 *  - Attendance (sessionId, athleteId, status)
 *  - TrainingPlan (organizationId, athleteId, NO memberId)
 *  - PortalAccess (organizationId, athleteId, accessType, tokenHash, expiresAt)
 */

import fs from "fs";
import path from "path";

const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf-8");
  envConfig.split("\n").forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = value;
    }
  });
}

import { PrismaClient, Gender, ScheduleStatus } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

function hashToken(raw: string) {
  return crypto.createHash("sha256").update(raw.trim()).digest("hex");
}
function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(9, 0, 0, 0);
  return d;
}
function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(9, 0, 0, 0);
  return d;
}

async function main() {
  console.log("🚀 Membuat atlet MFD: Bintang Erlangga...\n");

  // 1. Cari organisasi Coach Zulfi
  const org = await prisma.organization.findFirst({
    where: { slug: "coach-zulfi-hub" },
    include: { members: true },
  });

  if (!org) {
    console.error("❌ Organisasi coach-zulfi-hub tidak ditemukan. Jalankan seed-case-study-1-month.ts terlebih dahulu.");
    process.exit(1);
  }

  const member = org.members[0];
  if (!member) {
    console.error("❌ Tidak ada member/coach di organisasi ini.");
    process.exit(1);
  }

  // 2. Fix: Update competitionLevel semua Alleyna yang masih "Berkembang" → "MFD"
  const alleynasToFix = await prisma.athlete.findMany({
    where: {
      fullName: { contains: "Alleyna" },
      organizationId: org.id,
      NOT: { competitionLevel: "MFD" },
    },
  });
  for (const a of alleynasToFix) {
    await prisma.athlete.update({
      where: { id: a.id },
      data: { competitionLevel: "MFD" },
    });
    console.log(`✅ Fixed: ${a.fullName} (${a.id}) → competitionLevel = "MFD"`);
  }
  if (alleynasToFix.length === 0) console.log("ℹ️  Alleyna sudah ber-competitionLevel MFD");

  // 3. Buat atlet MFD baru: Bintang Erlangga (8 tahun)
  let athlete = await prisma.athlete.findFirst({
    where: { organizationId: org.id, fullName: "Bintang Erlangga" },
  });

  if (!athlete) {
    athlete = await prisma.athlete.create({
      data: {
        organizationId: org.id,
        fullName: "Bintang Erlangga",
        sportCategory: "Multi-Sport & Agility",
        gender: Gender.MALE,
        dateOfBirth: new Date("2018-03-20"), // 8 tahun
        heightCm: 125.0,
        weightKg: 24.5,
        competitionLevel: "MFD",
        parentName: "Bapak Erlangga Wibowo",
        parentPhone: "081298765432",
        healthNotes: "Aktif, suka berlari. Tidak ada alergi.",
        isActive: true,
      },
    });
    console.log(`✅ Atlet MFD dibuat: ${athlete.fullName} (ID: ${athlete.id})`);
  } else {
    console.log(`ℹ️  Atlet sudah ada: ${athlete.fullName} (ID: ${athlete.id})`);
  }

  // 4. Buat Training Plan MFD (tanpa memberId — tidak ada di schema)
  let plan = await prisma.trainingPlan.findFirst({
    where: { organizationId: org.id, title: { contains: "MFD Dasar" } },
  });
  if (!plan) {
    plan = await prisma.trainingPlan.create({
      data: {
        organizationId: org.id,
        athleteId: athlete.id,
        title: "MFD Dasar – Gerak & Keseimbangan",
        description: "Program latihan dasar Movement & Fitness Development untuk usia 6-12 tahun.",
        startDate: new Date("2026-08-01"),
        endDate: new Date("2026-11-30"),
        exercises: {
          create: [
            { name: "Warm-Up Dinamis", category: "Pemanasan", sets: 1, reps: "10 menit", order: 1 },
            { name: "Lari Zig-Zag", category: "Agility", sets: 3, reps: "4x", order: 2 },
            { name: "Balance Beam Walk", category: "Keseimbangan", sets: 2, reps: "2x bolak-balik", order: 3 },
            { name: "Lompat Kotak (Ladder Drill)", category: "Koordinasi", sets: 3, reps: "2x", order: 4 },
            { name: "Cool Down & Stretching", category: "Pendinginan", sets: 1, reps: "5 menit", order: 5 },
          ],
        },
      },
    });
    console.log(`✅ Training plan dibuat: ${plan.title}`);
  } else {
    console.log(`ℹ️  Training plan sudah ada: ${plan.title}`);
  }

  // 5. Buat sesi latihan + attendance (ScheduleSession model)
  const sessionDefs = [
    {
      title: "Sesi MFD #1 – Agility Dasar",
      startDate: daysAgo(14),
      status: ScheduleStatus.COMPLETED,
      attendanceStatus: "PRESENT" as const,
    },
    {
      title: "Sesi MFD #2 – Balance & Koordinasi",
      startDate: daysAgo(7),
      status: ScheduleStatus.COMPLETED,
      attendanceStatus: "PRESENT" as const,
    },
    {
      title: "Sesi MFD #3 – Speed & Fun Movement",
      startDate: daysFromNow(3),
      status: ScheduleStatus.SCHEDULED,
      attendanceStatus: null,
    },
  ];

  for (const sd of sessionDefs) {
    const existing = await prisma.scheduleSession.findFirst({
      where: { organizationId: org.id, title: sd.title },
    });

    if (!existing) {
      const endTime = new Date(sd.startDate.getTime() + 60 * 60 * 1000); // +1 jam

      const session = await prisma.scheduleSession.create({
        data: {
          organizationId: org.id,
          coachId: member.id,
          trainingPlanId: plan.id,
          title: sd.title,
          startTime: sd.startDate,
          endTime,
          location: "Lapangan Indoor Coach Zulfi",
          status: sd.status,
          // Tambah athlete ke session via ScheduleSessionAthlete
          athletes: {
            create: { athleteId: athlete.id },
          },
        },
      });

      // Tambah attendance jika sesi sudah selesai
      if (sd.attendanceStatus) {
        await prisma.attendance.create({
          data: {
            organizationId: org.id,
            sessionId: session.id,
            athleteId: athlete.id,
            status: sd.attendanceStatus,
          },
        });
        console.log(`  ✅ Session "${sd.title}" + attendance=${sd.attendanceStatus}`);
      } else {
        console.log(`  ✅ Session "${sd.title}" (mendatang)`);
      }
    } else {
      console.log(`  ℹ️  Session sudah ada: ${sd.title}`);
    }
  }

  // 6. Portal access: ATHLETE
  const existingAthleteAccess = await prisma.portalAccess.findFirst({
    where: { athleteId: athlete.id, accessType: "ATHLETE", revokedAt: null },
  });

  let athletePortalUrl = "";
  if (!existingAthleteAccess) {
    const rawToken = `mfd-bintang-atlet-${Date.now()}`;
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 6);

    await prisma.portalAccess.create({
      data: {
        organizationId: org.id,
        athleteId: athlete.id,
        accessType: "ATHLETE",
        tokenHash,
        expiresAt,
        createdByMemberId: member.id,
      },
    });
    athletePortalUrl = `http://localhost:3000/portal/${tokenHash}`;
    console.log(`\n✅ Portal ATHLETE dibuat`);
    console.log(`   URL: ${athletePortalUrl}`);
  } else {
    athletePortalUrl = `http://localhost:3000/portal/${existingAthleteAccess.id}`;
    console.log(`ℹ️  Portal ATHLETE sudah ada: id=${existingAthleteAccess.id}`);
  }

  // 7. Portal access: PARENT
  const existingParentAccess = await prisma.portalAccess.findFirst({
    where: { athleteId: athlete.id, accessType: "PARENT", revokedAt: null },
  });

  if (!existingParentAccess) {
    const rawToken = `mfd-bintang-ortu-${Date.now()}`;
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 6);

    await prisma.portalAccess.create({
      data: {
        organizationId: org.id,
        athleteId: athlete.id,
        accessType: "PARENT",
        tokenHash,
        expiresAt,
        createdByMemberId: member.id,
      },
    });
    console.log(`✅ Portal PARENT dibuat`);
    console.log(`   URL: http://localhost:3000/portal/${tokenHash}`);
  } else {
    console.log(`ℹ️  Portal PARENT sudah ada: id=${existingParentAccess.id}`);
  }

  console.log("\n🎉 Selesai! Ringkasan:");
  console.log(`   Atlet : ${athlete.fullName}`);
  console.log(`   Level : MFD (Movement & Fitness Development)`);
  console.log(`   Usia  : 8 tahun`);
  console.log(`   ID    : ${athlete.id}`);
  if (athletePortalUrl) console.log(`   Portal: ${athletePortalUrl}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect().finally(() => process.exit(1));
});
