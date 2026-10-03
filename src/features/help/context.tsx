"use client";

import React, { createContext, useContext, useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import { HelpArticle } from "./types";
import { getHelpArticleForPath } from "./matcher";

interface HelpContextType {
  isOpen: boolean;
  openHelp: () => void;
  closeHelp: () => void;
  toggleHelp: () => void;
  currentArticle: HelpArticle;
  role?: string;
}

const HelpContext = createContext<HelpContextType | null>(null);

export function HelpProvider({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const currentArticle = useMemo(() => {
    return getHelpArticleForPath(pathname);
  }, [pathname]);

  const openHelp = () => setIsOpen(true);
  const closeHelp = () => setIsOpen(false);
  const toggleHelp = () => setIsOpen((prev) => !prev);

  return (
    <HelpContext.Provider
      value={{
        isOpen,
        openHelp,
        closeHelp,
        toggleHelp,
        currentArticle,
        role,
      }}
    >
      {children}
    </HelpContext.Provider>
  );
}

export function useHelp(): HelpContextType {
  const context = useContext(HelpContext);
  if (!context) {
    throw new Error("useHelp must be used within a HelpProvider");
  }
  return context;
}
