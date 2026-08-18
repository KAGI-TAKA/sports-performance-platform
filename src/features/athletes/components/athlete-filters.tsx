"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const AGE_GROUPS = [
  { value: "ALL", label: "Semua Usia" },
  { value: "U12", label: "U-12" },
  { value: "U14", label: "U-14" },
  { value: "U16", label: "U-16" },
  { value: "U18", label: "U-18" },
  { value: "SENIOR", label: "Senior" },
];

const STATUSES = [
  { value: "active", label: "Status: Aktif" },
  { value: "inactive", label: "Status: Nonaktif" },
  { value: "all", label: "Semua Status" },
];

export function AthleteFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentAgeGroup = searchParams.get("ageGroup") ?? "ALL";
  const currentStatus = searchParams.get("status") ?? "active";

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "ALL" || (key === "status" && value === "active")) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      params.delete("athleteId");
      router.push(`/athletes?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="grid grid-cols-2 gap-2 mt-2">
      <select
        id="filter-status"
        value={currentStatus}
        onChange={(e) => updateParam("status", e.target.value)}
        className="rounded-md border border-border bg-surface-2 px-2 py-1.5 text-xs text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 transition cursor-pointer"
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      <select
        id="filter-age-group"
        value={currentAgeGroup}
        onChange={(e) => updateParam("ageGroup", e.target.value)}
        className="rounded-md border border-border bg-surface-2 px-2 py-1.5 text-xs text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 transition cursor-pointer"
      >
        {AGE_GROUPS.map((g) => (
          <option key={g.value} value={g.value}>
            {g.label}
          </option>
        ))}
      </select>
    </div>
  );
}
