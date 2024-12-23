"use client";
import React, { createContext, useContext, useState, type ReactNode } from "react";
import type { Site } from "@/types/site";
interface SelectedSiteContextProps {
  selectedSite: Site;
  setSelectedSite: (site: Site) => void;
}

const SelectedSiteContext = createContext<SelectedSiteContextProps | undefined>(undefined);

export const SelectedSiteProvider = ({ children }: { children: ReactNode }) => {
  const [selectedSite, setSelectedSite] = useState<Site>({} as Site);

  return (
    <SelectedSiteContext.Provider value={{ selectedSite, setSelectedSite }}>
      {children}
    </SelectedSiteContext.Provider>
  );
};

export const useSelectedSite = () => {
  const context = useContext(SelectedSiteContext);
  if (!context) {
    throw new Error("useSelectedSite must be used within a SelectedSiteProvider");
  }
  return context;
};