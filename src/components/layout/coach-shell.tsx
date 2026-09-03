"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "./app-sidebar";
import { AppHeader } from "./app-header";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { CommandPalette } from "@/features/command-palette/command-palette";
import { NavigationProgressBar } from "./navigation-progress";

interface CoachShellProps {
  userName?: string;
  userEmail?: string;
  userImage?: string | null;
  orgName?: string;
  role?: string;
  children: React.ReactNode;
}

export function CoachShell({
  userName,
  userEmail,
  userImage,
  orgName,
  role,
  children,
}: CoachShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

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

  return (
    <div className="flex h-screen overflow-hidden bg-surface-base text-foreground font-sans antialiased">
      {/* Navigation Progress Indicator */}
      <NavigationProgressBar />

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
      />

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex shrink-0">
        <AppSidebar
          collapsed={collapsed}
          onToggleCollapse={handleToggleCollapse}
          role={role}
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
              role={role}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-x-hidden pb-14 lg:pb-0">
        <AppHeader
          userName={userName}
          userEmail={userEmail}
          userImage={userImage}
          orgName={orgName}
          role={role}
          collapsed={collapsed}
          onToggleCollapse={handleToggleCollapse}
          onOpenMobile={() => setMobileOpen(true)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav role={role} />
    </div>
  );
}
