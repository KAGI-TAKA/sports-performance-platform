"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export function AthleteSearchInput({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState(defaultValue);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (value) params.set("q", value);
      router.push(`${pathname}${params.toString() ? `?${params}` : ""}`);
    }, 300);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Cari atlet..."
      className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
    />
  );
}
