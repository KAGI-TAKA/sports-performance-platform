import { z } from "zod/v4";
import { MEMBER_ROLES, type MemberRole } from "@/lib/constants";

export const provisionUserSchema = z
  .object({
    role: z.enum(["head_coach", "assistant_coach", "parent", "athlete"]),
    name: z.string().max(100).optional().or(z.literal("")),
    email: z
      .string()
      .email("Format email tidak valid")
      .optional()
      .or(z.literal("")),
    image: z.string().optional().or(z.literal("")),
    username: z
      .string()
      .max(30, "Username maksimal 30 karakter")
      .regex(/^[a-zA-Z0-9_]+$/, "Username hanya boleh huruf, angka, dan underscore")
      .optional()
      .or(z.literal("")),
    athleteIds: z.array(z.string()).optional(),
    athleteId: z.string().optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.role !== "athlete") {
      if (!data.name || data.name.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Nama lengkap minimal 2 karakter",
          path: ["name"],
        });
      }
      if (!data.email || !data.email.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Alamat email wajib diisi",
          path: ["email"],
        });
      }
    } else {
      if (!data.athleteId || !data.athleteId.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Pilih profil atlet terlebih dahulu",
          path: ["athleteId"],
        });
      }
      if (!data.username || data.username.trim().length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Username minimal 3 karakter",
          path: ["username"],
        });
      }
    }
  });

export type ProvisionUserInput = z.infer<typeof provisionUserSchema>;

export interface ProvisionedUserResult {
  success: boolean;
  error?: string;
  inviteUrl?: string;
  rawToken?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: MemberRole;
  };
}

export interface LinkedChildItem {
  id: string;
  fullName: string;
  sportCategory?: string | null;
}

export type AthleteActivationStatus =
  | "ACTIVE"
  | "PENDING_ACTIVATION"
  | "ACTIVATION_EXPIRED"
  | "ACTIVATION_REVOKED"
  | "NO_ACTIVATION_LINK";

export type UserAccountStatus =
  | "ACTIVE"
  | "PENDING_ACTIVATION"
  | "INVITATION_PENDING"
  | "NO_ACTIVATION_LINK"
  | "ACTIVATION_EXPIRED"
  | "ACTIVATION_REVOKED"
  | "DEACTIVATED";

export interface UserManagementItem {
  id: string;
  memberId: string;
  name: string;
  email: string;
  image?: string | null;
  role: MemberRole;
  createdAt: Date;
  username?: string;
  status: UserAccountStatus;
  isDeactivated: boolean;
  activationStatus?: AthleteActivationStatus;
  activationExpiresAt?: string;
  linkedAthletes?: LinkedChildItem[];
  linkedAthleteNames?: string[];
}

export const updateUserProfileSchema = z.object({
  userId: z.string().min(1, "User ID wajib diisi"),
  memberId: z.string().min(1, "Member ID wajib diisi"),
  name: z.string().min(2, "Nama minimal 2 karakter").max(100),
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  image: z.string().optional().or(z.literal("")).nullable(),
  username: z
    .string()
    .min(3, "Username minimal 3 karakter")
    .max(30, "Username maksimal 30 karakter")
    .regex(/^[a-zA-Z0-9_]+$/, "Username hanya boleh huruf, angka, dan underscore")
    .optional()
    .or(z.literal("")),
  role: z.enum(["admin", "head_coach", "assistant_coach", "parent", "athlete"]).optional(),
});

export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
