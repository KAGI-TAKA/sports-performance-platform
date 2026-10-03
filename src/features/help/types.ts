export interface HelpCallout {
  type: "tip" | "info" | "warning";
  title?: string;
  message: string;
}

export interface HelpSection {
  title: string;
  description?: string;
  steps?: string[];
  bullets?: string[];
  callout?: HelpCallout;
}

export interface RoleNote {
  role: "admin" | "head_coach" | "assistant_coach" | "parent" | "athlete";
  note: string;
}

export interface HelpArticle {
  id: string;
  title: string;
  badge?: string;
  subtitle: string;
  description: string;
  sections: HelpSection[];
  roleNotes?: RoleNote[];
  tips?: string[];
}
