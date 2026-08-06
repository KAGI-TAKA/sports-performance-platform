import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements } from "better-auth/plugins/organization/access";

// Resource tambahan di luar bawaan Better Auth (organization/member/invitation),
// sesuai domain produk kita.
const statement = {
  ...defaultStatements,
  athlete: ["create", "update", "delete"],
  assessment: ["create", "update", "delete"],
  benchmark: ["create", "update", "delete"],
  settings: ["update"],
} as const;

export const ac = createAccessControl(statement);

// Admin: kontrol penuh — setara pemilik akademi/klub
export const admin = ac.newRole({
  organization: ["update", "delete"],
  member: ["create", "update", "delete"],
  invitation: ["create", "cancel"],
  athlete: ["create", "update", "delete"],
  assessment: ["create", "update", "delete"],
  benchmark: ["create", "update", "delete"],
  settings: ["update"],
});

// Head coach: kelola data atlet & assessment penuh, tapi tidak mengubah
// pengaturan organisasi atau menghapus anggota
export const headCoach = ac.newRole({
  member: ["create"],
  invitation: ["create"],
  athlete: ["create", "update", "delete"],
  assessment: ["create", "update", "delete"],
  benchmark: ["create", "update"],
});

// Assistant coach: input data harian, tanpa hak hapus atau kelola tim
export const assistantCoach = ac.newRole({
  athlete: ["create", "update"],
  assessment: ["create", "update"],
});