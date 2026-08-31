export type GuidanceCategory =
  | "NUTRISI"
  | "LATIHAN_MANDIRI"
  | "PENGUMUMAN"
  | "KESEHATAN"
  | "MOTIVASI";

export interface CoachGuidanceItem {
  id: string;
  organizationId: string;
  authorId: string;
  authorName: string;
  athleteId: string | null;
  athleteName?: string | null;
  title: string;
  category: GuidanceCategory | string;
  content: string;
  linkUrl: string | null;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}
