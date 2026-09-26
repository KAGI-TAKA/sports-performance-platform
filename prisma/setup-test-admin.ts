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

const prisma = new PrismaClient();

async function main() {
  console.log("Creating QA Admin test account...");

  const org = await prisma.organization.findFirst({
    where: { slug: "coach-zulfi-hub" },
  });

  if (!org) {
    throw new Error("Organization coach-zulfi-hub not found");
  }

  const testEmail = "admin-test@kinetiq.local";
  const testPassword = "AdminTest123!";
  const hashedPassword = await hashPassword(testPassword);

  let user = await prisma.user.findFirst({
    where: { email: testEmail },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: "Admin QA Test",
        email: testEmail,
        emailVerified: true,
      },
    });
  }

  // Update/create account credential
  await prisma.account.deleteMany({
    where: { userId: user.id },
  });

  await prisma.account.create({
    data: {
      userId: user.id,
      accountId: testEmail,
      providerId: "credential",
      password: hashedPassword,
    },
  });

  // Ensure member as admin in organization
  const existingMember = await prisma.member.findFirst({
    where: { organizationId: org.id, userId: user.id },
  });

  if (!existingMember) {
    await prisma.member.create({
      data: {
        organizationId: org.id,
        userId: user.id,
        role: "admin",
      },
    });
  } else if (existingMember.role !== "admin") {
    await prisma.member.update({
      where: { id: existingMember.id },
      data: { role: "admin" },
    });
  }

  console.log("SUCCESS: QA Admin test account is ready!");
  console.log("Email   :", testEmail);
  console.log("Password:", testPassword);
  console.log("Org     :", org.name, `(${org.id})`);
}

main()
  .catch((e) => {
    console.error("Setup error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
