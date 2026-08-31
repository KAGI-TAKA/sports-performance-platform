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

import {
  PrismaClient,
  PhysicalComponent,
  ScoreDirection,
  MeasurementUnit,
  Gender,
  ScheduleStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();

function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken.trim()).digest("hex");
}

async function main() {
  console.log("🚀 Memulai seeding studi kasus 1 bulan: Coach Zulfi Athletic Performance Hub...");

  // 1. Organisasi & Akun Coach Zulfi
  let org = await prisma.organization.findFirst({
    where: { slug: "coach-zulfi-hub" },
    include: { members: { include: { user: true } } },
  });

  if (!org) {
    org = await prisma.organization.create({
      data: {
        name: "Coach Zulfi Athletic Performance",
        slug: "coach-zulfi-hub",
        metadata: JSON.stringify({ instagram: "@zulficoach" }),
      },
      include: { members: { include: { user: true } } },
    });
  }

  let coachUser = await prisma.user.findFirst({
    where: { email: "zulficoach@performance.id" },
  });

  if (!coachUser) {
    coachUser = await prisma.user.create({
      data: {
        name: "Coach Zulfi",
        email: "zulficoach@performance.id",
        emailVerified: true,
      },
    });

    const passwordHash = await bcrypt.hash("ZulfiCoach2026!", 10);
    await prisma.account.create({
      data: {
        userId: coachUser.id,
        accountId: coachUser.id,
        providerId: "credential",
        password: passwordHash,
      },
    });
  }

  let member = await prisma.member.findFirst({
    where: { organizationId: org.id, userId: coachUser.id },
  });

  if (!member) {
    member = await prisma.member.create({
      data: {
        organizationId: org.id,
        userId: coachUser.id,
        role: "admin",
      },
    });
  }

  // 2. Profil Atlet Studi Kasus: Rangga Pratama (11 Tahun, Sepak Bola / Multi-Sport)
  let athlete = await prisma.athlete.findFirst({
    where: { organizationId: org.id, fullName: "Rangga Pratama" },
  });

  if (!athlete) {
    athlete = await prisma.athlete.create({
      data: {
        organizationId: org.id,
        fullName: "Rangga Pratama",
        sportCategory: "Sepak Bola / Futsal",
        gender: Gender.MALE,
        dateOfBirth: new Date("2015-05-14"), // 11 tahun
        heightCm: 145.5,
        weightKg: 38.2,
        competitionLevel: "Junior Performance (Persiapan SSB Kota)",
        parentName: "Ibu Siska Pratama",
        parentPhone: "081234567890",
        healthNotes: "Kondisi fisik prima, riwayat kram betis ringan saat dehidrasi.",
        isActive: true,
      },
    });
  } else {
    await prisma.athlete.update({
      where: { id: athlete.id },
      data: {
        jerseyNumber: null,
      },
    });
  }

  console.log(`✅ Atlet Studi Kasus Siap: ${athlete.fullName} (ID: ${athlete.id})`);

  // 3. Buat Portal Access Credentials untuk Rangga & Orang Tua
  const athletePassHash = await bcrypt.hash("ZulfiCoach123!", 10);
  const parentPassHash = await bcrypt.hash("ZulfiOrtu123!", 10);

  const rawTokenAthlete = "case_study_athlete_token_rangga_2026";
  const rawTokenParent = "case_study_parent_token_rangga_2026";
  const tokenHashAthlete = hashToken(rawTokenAthlete);
  const tokenHashParent = hashToken(rawTokenParent);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 90);

  // Hapus portal access lama jika ada
  await prisma.portalAccess.deleteMany({
    where: { athleteId: athlete.id },
  });

  await prisma.portalAccess.createMany({
    data: [
      {
        organizationId: org.id,
        athleteId: athlete.id,
        createdByMemberId: member.id,
        tokenHash: tokenHashAthlete,
        username: "atlet_rangga",
        passwordHash: athletePassHash,
        plainPassword: "ZulfiCoach123!",
        accessType: "ATHLETE",
        expiresAt,
      },
      {
        organizationId: org.id,
        athleteId: athlete.id,
        createdByMemberId: member.id,
        tokenHash: tokenHashParent,
        username: "ortu_rangga",
        passwordHash: parentPassHash,
        plainPassword: "ZulfiOrtu123!",
        accessType: "PARENT",
        expiresAt,
      },
    ],
  });

  // 4. Buat Komponen & Test Items Resmi Standar Coach Zulfi
  const testConfigs = [
    {
      comp: PhysicalComponent.SPEED,
      name: "Sprint 30 Meter",
      unit: MeasurementUnit.SECOND,
      dir: ScoreDirection.LOWER_IS_BETTER,
      baseVal: 5.42,
      finalVal: 4.88,
      tA: 4.70,
      tB: 5.20,
      tC: 5.80,
      tD: 6.50,
    },
    {
      comp: PhysicalComponent.AGILITY,
      name: "Pro Agility 5-10-5 Shuttle",
      unit: MeasurementUnit.SECOND,
      dir: ScoreDirection.LOWER_IS_BETTER,
      baseVal: 5.85,
      finalVal: 5.20,
      tA: 5.10,
      tB: 5.60,
      tC: 6.20,
      tD: 7.00,
    },
    {
      comp: PhysicalComponent.POWER,
      name: "Vertical Jump",
      unit: MeasurementUnit.CM,
      dir: ScoreDirection.HIGHER_IS_BETTER,
      baseVal: 32.0,
      finalVal: 38.5,
      tA: 42.0,
      tB: 35.0,
      tC: 28.0,
      tD: 20.0,
    },
    {
      comp: PhysicalComponent.FLEXIBILITY,
      name: "Sit and Reach",
      unit: MeasurementUnit.CM,
      dir: ScoreDirection.HIGHER_IS_BETTER,
      baseVal: 14.0,
      finalVal: 19.0,
      tA: 22.0,
      tB: 16.0,
      tC: 10.0,
      tD: 4.0,
    },
    {
      comp: PhysicalComponent.MUSCULAR_ENDURANCE,
      name: "Push-up 1 Menit",
      unit: MeasurementUnit.REPETITION,
      dir: ScoreDirection.HIGHER_IS_BETTER,
      baseVal: 18.0,
      finalVal: 26.0,
      tA: 28.0,
      tB: 20.0,
      tC: 14.0,
      tD: 8.0,
    },
    {
      comp: PhysicalComponent.AEROBIC_ENDURANCE,
      name: "Bleep Test (Yo-Yo)",
      unit: MeasurementUnit.SCORE,
      dir: ScoreDirection.HIGHER_IS_BETTER,
      baseVal: 5.4,
      finalVal: 7.6,
      tA: 8.5,
      tB: 6.5,
      tC: 4.5,
      tD: 2.5,
    },
    {
      comp: PhysicalComponent.ANAEROBIC_ENDURANCE,
      name: "RAST Sprint Fatigue Index",
      unit: MeasurementUnit.SCORE,
      dir: ScoreDirection.LOWER_IS_BETTER,
      baseVal: 22.0,
      finalVal: 15.5,
      tA: 14.0,
      tB: 18.0,
      tC: 25.0,
      tD: 35.0,
    },
  ];

  const createdTestItems = [];
  for (const cfg of testConfigs) {
    let item = await prisma.testItem.findFirst({
      where: { organizationId: org.id, name: cfg.name },
    });
    if (!item) {
      item = await prisma.testItem.create({
        data: {
          organizationId: org.id,
          physicalComponent: cfg.comp,
          name: cfg.name,
          unit: cfg.unit,
          scoreDirection: cfg.dir,
        },
      });
    }
    createdTestItems.push({ ...cfg, id: item.id });
  }

  // 5. Hapus riwayat assessment lama untuk Rangga agar bersih
  await prisma.assessment.deleteMany({
    where: { athleteId: athlete.id },
  });

  // 6. Buat Assessment 1 (Baseline - Awal Bulan / Minggu 0: 1 Agustus 2026)
  const baseDate = new Date("2026-08-01T09:00:00Z");
  const assessmentBase = await prisma.assessment.create({
    data: {
      organizationId: org.id,
      athleteId: athlete.id,
      createdByMemberId: member.id,
      assessmentDate: baseDate,
      overallScore: 72.4,
      overallGrade: "B",
      status: "COMPLETED",
      resultItems: {
        create: createdTestItems.map((ti) => ({
          testItemId: ti.id,
          rawValue: ti.baseVal,
          score: 72.4,
        })),
      },
      analysis: {
        create: {
          componentScores: {
            SPEED: 74.0,
            AGILITY: 70.0,
            POWER: 68.0,
            FLEXIBILITY: 70.0,
            MUSCULAR_ENDURANCE: 72.0,
            AEROBIC_ENDURANCE: 71.0,
            ANAEROBIC_ENDURANCE: 78.0,
          },
          bestComponent: PhysicalComponent.ANAEROBIC_ENDURANCE,
          weakestComponents: [PhysicalComponent.POWER, PhysicalComponent.AGILITY],
          insightText:
            "Pondasi koordinasi motorik dasar Rangga cukup baik. Kecepatan akselerasi langkah awal dan mobilitas pinggul perlu ditingkatkan secara terstruktur.",
          recommendationText:
            "Fokus pada program Agility Ladder Footwork, Plyometric Box Jump rendah, dan penguatan core stability 3x seminggu.",
          ruleEngineVersion: "v1.0",
        },
      },
    },
  });

  // 7. Buat Assessment 2 (Post-Training - Akhir Bulan / Minggu 4: 28 Agustus 2026)
  const postDate = new Date("2026-08-28T09:00:00Z");
  const assessmentPost = await prisma.assessment.create({
    data: {
      organizationId: org.id,
      athleteId: athlete.id,
      createdByMemberId: member.id,
      assessmentDate: postDate,
      overallScore: 85.6,
      overallGrade: "A",
      status: "COMPLETED",
      resultItems: {
        create: createdTestItems.map((ti) => ({
          testItemId: ti.id,
          rawValue: ti.finalVal,
          score: 85.6,
        })),
      },
      analysis: {
        create: {
          componentScores: {
            SPEED: 88.0,
            AGILITY: 86.0,
            POWER: 84.0,
            FLEXIBILITY: 85.0,
            MUSCULAR_ENDURANCE: 87.0,
            AEROBIC_ENDURANCE: 84.0,
            ANAEROBIC_ENDURANCE: 86.0,
          },
          bestComponent: PhysicalComponent.SPEED,
          weakestComponents: [PhysicalComponent.AEROBIC_ENDURANCE],
          insightText:
            "Perkembangan sangat pesat (+13.2%). Waktu sprint 30m terpangkas dari 5.42s menjadi 4.88s. Loncatan vertikal bertambah +6.5cm.",
          recommendationText:
            "Lanjutkan ke program Maintenance & Game-Specific Conditioning untuk persiapan seleksi kompetisi.",
          ruleEngineVersion: "v1.0",
        },
      },
    },
  });

  // 8. Buat Training Plan 4 Minggu Aktif untuk Rangga
  await prisma.trainingPlan.deleteMany({
    where: { athleteId: athlete.id },
  });

  const trainingPlan = await prisma.trainingPlan.create({
    data: {
      organizationId: org.id,
      athleteId: athlete.id,
      title: "Program Agility Footwork & Speed Acceleration 4 Minggu",
      description: "Kurikulum pengkondisian fisik atletik khusus percepatan lari dan reaksi kelincahan langkah.",
      startDate: baseDate,
      endDate: postDate,
      status: "ACTIVE",
      exercises: {
        create: [
          {
            name: "Agility Ladder Icky Shuffle & In-Outs",
            category: "Agility",
            sets: 4,
            reps: "6 rep",
            restSeconds: 45,
            notes: "Jaga titik tumpu kaki di bola kaki depan, pandangan tetap lurus ke depan.",
            order: 0,
          },
          {
            name: "Low Box Jump (30cm) + Stick Landing",
            category: "Power",
            sets: 3,
            reps: "8 rep",
            restSeconds: 60,
            notes: "Fokus pada teknik pendaratan lembut (soft landing) dengan lutut tidak goyang ke dalam.",
            order: 1,
          },
          {
            name: "Pro Agility Shuttle Cone Drill (5-10-5)",
            category: "Agility",
            sets: 4,
            reps: "4 rep",
            restSeconds: 60,
            notes: "Sentuh garis dengan tangan rendah dan dorong kuat langkah keluar.",
            order: 2,
          },
          {
            name: "Core Plank & Side Plank Hold",
            category: "Core",
            sets: 3,
            reps: "45 detik",
            restSeconds: 30,
            notes: "Kencangkan perut dan pantat, tubuh lurus dari kepala hingga tumit.",
            order: 3,
          },
          {
            name: "Wall Acceleration March & Sprint Starts",
            category: "Speed",
            sets: 4,
            reps: "6 rep",
            restSeconds: 45,
            notes: "Sudut dorong tubuh 45 derajat, angkat lutut sejajar pinggul (triple extension).",
            order: 4,
          },
        ],
      },
    },
  });

  // 9. Buat Jadwal Sesi Latihan Mingguan (Timetable Slots)
  await prisma.scheduleSession.deleteMany({
    where: { organizationId: org.id },
  });

  const scheduleSessions = [
    {
      title: "Sesi 1: Evaluasi Baseline & Form Pendaratan",
      startTime: new Date("2026-08-04T16:00:00Z"),
      endTime: new Date("2026-08-04T17:15:00Z"),
      location: "Lapangan Atletik UNNES",
      notes: "90% Pasti - Sesi pembuka program",
      status: ScheduleStatus.COMPLETED,
    },
    {
      title: "Sesi 2: Agility Footwork & Ladder Coordination",
      startTime: new Date("2026-08-08T08:00:00Z"),
      endTime: new Date("2026-08-08T09:15:00Z"),
      location: "GOR Tri Lomba Juang",
      notes: "90% Pasti",
      status: ScheduleStatus.COMPLETED,
    },
    {
      title: "Sesi 3: Sprint Mechanics & Acceleration 20m",
      startTime: new Date("2026-08-11T16:00:00Z"),
      endTime: new Date("2026-08-11T17:15:00Z"),
      location: "Lapangan Atletik UNNES",
      notes: "60% Fleksibel - Terlaksana lancar",
      status: ScheduleStatus.COMPLETED,
    },
    {
      title: "Sesi 4: Plyometric Jump & Core Stability",
      startTime: new Date("2026-08-15T08:00:00Z"),
      endTime: new Date("2026-08-15T09:15:00Z"),
      location: "Studio Performance Coach Zulfi",
      notes: "90% Pasti",
      status: ScheduleStatus.COMPLETED,
    },
    {
      title: "Sesi 5: Shuttle Run Reaction & Change of Direction",
      startTime: new Date("2026-08-18T16:00:00Z"),
      endTime: new Date("2026-08-18T17:15:00Z"),
      location: "Lapangan Atletik UNNES",
      notes: "90% Pasti",
      status: ScheduleStatus.COMPLETED,
    },
    {
      title: "Sesi 6: Post-Assessment & Final Testing",
      startTime: new Date("2026-08-28T16:00:00Z"),
      endTime: new Date("2026-08-28T17:15:00Z"),
      location: "Lapangan Atletik UNNES",
      notes: "90% Pasti - Sesi penutup dan evaluasi akhir",
      status: ScheduleStatus.COMPLETED,
    },
  ];

  for (const s of scheduleSessions) {
    await prisma.scheduleSession.create({
      data: {
        organizationId: org.id,
        coachId: member.id,
        trainingPlanId: trainingPlan.id,
        title: s.title,
        startTime: s.startTime,
        endTime: s.endTime,
        location: s.location,
        notes: s.notes,
        status: s.status,
        athletes: {
          create: [{ athleteId: athlete.id }],
        },
      },
    });
  }

  // 10. Buat Session Logs Harian (Catatan Sesi & Umpan Balik Coach Zulfi)
  await prisma.sessionLog.deleteMany({
    where: { athleteId: athlete.id },
  });

  const sessionLogsData = [
    {
      date: new Date("2026-08-04T17:30:00Z"),
      done: "1. Pemanasan dinamis & mobilitas pergelangan kaki (15 min)\n2. Pengenalan teknik lari sprint 10m x 4 rep\n3. Pengujian awal 7 komponen tes fisik\n4. Pendinginan & peregangan hamstring",
      feedback:
        "Rangga memiliki motivasi yang sangat tinggi. Fokus koreksi hari ini adalah menjaga pandangan mata tetap lurus saat sprint dan tidak terburu-buru saat mendarat.",
    },
    {
      date: new Date("2026-08-08T09:30:00Z"),
      done: "1. Agility Ladder: Icky shuffle, 2 in 2 out (6 set)\n2. Cone drill T-Test x 4 set\n3. Core plank hold 45s x 3 set\n4. Game kelincahan reaksi bola",
      feedback:
        "Koordinasi footwork di agility ladder meningkat tajam. Ritme langkah sudah mulai stabil dan tidak lagi tersandung tali ladder.",
    },
    {
      date: new Date("2026-08-15T09:30:00Z"),
      done: "1. Plyometrics: Box jump 30cm x 8 rep x 3 set\n2. Lateral bound jump x 6 rep\n3. Push-up & core stability workout\n4. Foam rolling pemulihan otot paha",
      feedback:
        "Daya dorong loncatan Rangga terlihat semakin eksplosif. Teknik pendaratan lutut sudah sangat aman dan stabil.",
    },
    {
      date: new Date("2026-08-28T17:30:00Z"),
      done: "1. Warm-up komprehensif & reaktivasi saraf otot\n2. Tes Fisik Akhir (Sprint 30m, Agility 5-10-5, Jump, Bleep Test)\n3. Penyerahan evaluasi performa 4 minggu ke orang tua",
      feedback:
        "Luar biasa! Seluruh target 4 minggu tercapai dengan Grade A (85.6%). Rangga sudah sangat siap untuk bersaing di seleksi SSB kota.",
    },
  ];

  for (const log of sessionLogsData) {
    await prisma.sessionLog.create({
      data: {
        organizationId: org.id,
        athleteId: athlete.id,
        createdByMemberId: member.id,
        sessionDate: log.date,
        activitiesDone: log.done,
        coachFeedback: log.feedback,
      },
    });
  }

  // 11. Buat Berita & Panduan Edukasi Dinamis (Coach Guidance Bulletin)
  await prisma.coachGuidance.deleteMany({
    where: { organizationId: org.id },
  });

  await prisma.coachGuidance.createMany({
    data: [
      {
        organizationId: org.id,
        authorId: member.id,
        athleteId: null, // Broadcast untuk semua orang tua
        title: "Panduan Nutrisi & Hidrasi Sebelum Sesi Latihan Sore",
        category: "NUTRISI",
        content:
          "Halo Ayah & Bunda,\n\nUntuk memaksimalkan energi anak saat sesi latihan pukul 16.00:\n1. Berikan makanan berkarbohidrat sedang 1.5 - 2 jam sebelum latihan (contoh: pisang, roti gandum, atau nasi porsi kecil dengan telur/ayam rebus).\n2. Hindari makanan yang digoreng berlemak atau es manis sebelum latihan karena dapat memicu mual dan kram perut.\n3. Pastikan ananda membawa botol minum air putih minimal 600ml.\n\nSalam sehat,\nCoach Zulfi (@zulficoach)",
        linkUrl: "https://www.instagram.com/zulficoach/",
        isPinned: true,
        createdAt: new Date("2026-08-02T10:00:00Z"),
      },
      {
        organizationId: org.id,
        authorId: member.id,
        athleteId: null,
        title: "Pola Tidur 9 Jam & Hormon Pertumbuhan Atlet Muda (6–15 Tahun)",
        category: "KESEHATAN",
        content:
          "Fase pemulihan otot dan pembentukan tinggi badan (*growth spurt*) paling optimal terjadi saat tidur malam pulas antara jam 21.30 hingga 05.30.\n\nSangat disarankan untuk membatasi pemakaian layar gadget (HP/Tablet) 45 menit sebelum tidur agar kualitas deep sleep ananda maksimal.",
        linkUrl: null,
        isPinned: false,
        createdAt: new Date("2026-08-10T14:00:00Z"),
      },
      {
        organizationId: org.id,
        authorId: member.id,
        athleteId: athlete.id, // Khusus untuk Rangga
        title: "Instruksi Peregangan Betis & Otot Paha di Rumah untuk Rangga",
        category: "LATIHAN_MANDIRI",
        content:
          "Halo Bu Siska,\n\nBerdasarkan sesi hari ini, otot betis dan hamstring Rangga sedang merespon beban latihan lari cepat. Mohon bantu ingatkan Rangga untuk melakukan *Calf Stretch* dan *Hamstring Wall Stretch* selama 5 menit setiap malam sebelum tidur ya Bu.",
        linkUrl: "https://www.instagram.com/zulficoach/",
        isPinned: true,
        createdAt: new Date("2026-08-16T18:00:00Z"),
      },
    ],
  });

  console.log("\n==================================================================");
  console.log("🎉 SEEDING STUDI KASUS 1 BULAN BERHASIL 100%!");
  console.log("==================================================================");
  console.log("👤 Nama Atlet      : Rangga Pratama (11 Tahun, Sepak Bola / Multi-Sport)");
  console.log("🏆 Peningkatan Fisik: 72.4% (Grade B) ➡️  85.6% (Grade A) [+13.2%]");
  console.log("🔑 Kredensial Login Portal:");
  console.log("   - Login Atlet   : Username: atlet_rangga | Password: ZulfiCoach123!");
  console.log("   - Login Ortu    : Username: ortu_rangga  | Password: ZulfiOrtu123!");
  console.log("🔗 Direct Token Link:");
  console.log(`   - Link Atlet    : /portal/${tokenHashAthlete}`);
  console.log(`   - Link Ortu     : /portal/${tokenHashParent}`);
  console.log("==================================================================\n");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
