"use client";
import React, { createContext, useContext, useState, type ReactNode } from "react";

type SelectedSite = {
  name: string;
    id: string;
}

interface SelectedSiteContextProps {
  selectedSite: SelectedSite;
  setSelectedSite: (site: SelectedSite) => void;
}

const SelectedSiteContext = createContext<SelectedSiteContextProps | undefined>(undefined);

export const SelectedSiteProvider = ({ children }: { children: ReactNode }) => {
  const [selectedSite, setSelectedSite] = useState<SelectedSite>({ name: "", id: "" });

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