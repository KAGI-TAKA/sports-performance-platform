import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z.string().min(2, "Nama organisasi minimal 2 karakter"),
});
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;

export function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
