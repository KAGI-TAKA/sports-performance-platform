"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "./app-sidebar";
import { AppHeader } from "./app-header";
import { MobileBottomNav } from "./mobile-bottom-nav";

interface CoachShellProps {
  userName?: string;
  userEmail?: string;
  orgName?: string;
  children: React.ReactNode;
}

export function CoachShell({
  userName,
  userEmail,
  orgName,
  children,
}: CoachShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Restore collapsed state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("coach_sidebar_collapsed");
      if (saved !== null) {
        setCollapsed(saved === "true");
      }
    } catch {
      // ignore
    }
  }, []);

  const handleToggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("coach_sidebar_collapsed", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Handle escape key and body scroll lock for mobile drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
      }
    };
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen]);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop Sidebar (3-State) */}
      <div className="hidden lg:block h-screen sticky top-0 shrink-0">
        <AppSidebar
          collapsed={collapsed}
          onToggleCollapse={handleToggleCollapse}
        />
      </div>

      {/* Mobile Sidebar Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer container */}
          <div className="fixed inset-y-0 left-0 z-50 w-[240px] max-w-[80vw] bg-surface-1 shadow-2xl animate-in slide-in-from-left duration-200">
            <AppSidebar
              collapsed={false}
              onCloseMobile={() => setMobileOpen(false)}
              className="w-full border-r-0"
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-x-hidden pb-14 lg:pb-0">
        <AppHeader
          userName={userName}
          userEmail={userEmail}
          orgName={orgName}
          collapsed={collapsed}
          onToggleCollapse={handleToggleCollapse}
          onOpenMobile={() => setMobileOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
