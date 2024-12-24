"use client";
import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Site } from "@/types/site";
import { invoke } from "@tauri-apps/api/core";
import { type DriftResponse, processResponse } from "@/types/response";

interface SelectedSiteContextProps {
  sitesData: Site[];
  selectedSite: Site | null;
  setSelectedSite: (site: Site) => void;
}

const SelectedSiteContext = createContext<SelectedSiteContextProps | undefined>(undefined);

export const SelectedSiteProvider = ({ children }: { children: ReactNode }) => {

  const [sitesData, setSitesData] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadSites = async () => {
      if (isLoaded) return;
      const response = await invoke<DriftResponse<Site[]>>("list_sites");

      const result = processResponse(response);

      if (result) {
        const sites = response.body.sort((a, b) => a.name.localeCompare(b.name));
        setSitesData(sites);
        setSelectedSite(sites[5]);
        setIsLoaded(true);
      }
      else {
        alert("Failed to load sites");
      }

    };

    loadSites();
  }, [isLoaded]);

  return (
    <SelectedSiteContext.Provider value={{ sitesData, selectedSite, setSelectedSite }}>
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