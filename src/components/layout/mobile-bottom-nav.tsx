"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Users,
  ClipboardList,
  ClipboardCheck,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { isRouteAllowedForRole } from "@/lib/access-policy";

interface MobileBottomNavProps {
  role?: string;
}

const ALL_MOBILE_NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/schedule", label: "Jadwal", icon: Calendar },
  { href: "/athletes", label: "Atlet", icon: Users },
  { href: "/assessments", label: "Assessment", icon: ClipboardList },
  { href: "/session-logs", label: "Sesi", icon: ClipboardCheck },
  { href: "/profile", label: "Profil", icon: UserCircle },
];

export function MobileBottomNav({ role }: MobileBottomNavProps) {
  const pathname = usePathname();

  const visibleItems = ALL_MOBILE_NAV_ITEMS.filter((item) => {
    return isRouteAllowedForRole(role || "admin", item.href);
  });

  // Hide bottom nav during Live Field Execution to enter immersive full-screen field mode
  if (pathname.includes("/execute")) {
    return null;
  }

  if (visibleItems.length === 0) return null;

  return (
    <nav
      aria-label="Navigasi Seluler"
      className="fixed bottom-0 left-0 right-0 z-40 flex h-14 w-full items-center justify-around border-t border-border bg-surface-1 px-2 lg:hidden shadow-lg select-none"
    >
      {visibleItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center py-1 text-[10px] font-medium transition-colors focus:outline-none",
              isActive ? "text-accent font-bold" : "text-muted hover:text-foreground"
            )}
          >
            <Icon
              className={cn(
                "h-5 w-5 mb-0.5 transition-colors",
                isActive ? "text-accent" : "text-muted"
              )}
            />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
