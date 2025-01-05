"use client";
import React, { createContext, useContext, useState, type ReactNode } from "react";

interface SelectedPageContextProps {
  selectedPage: string | null;
  setSelectedPage: (page: string) => void;
}

const SelectedPageContext = createContext<SelectedPageContextProps | undefined>(undefined);

export const SelectedPageProvider = ({ children }: { children: ReactNode }) => {

  const [selectedPage, setSelectedPage] = useState<string | null>("Dashboard");

  return (
    <SelectedPageContext.Provider value={{ selectedPage, setSelectedPage }}>
      {children}
    </SelectedPageContext.Provider>
  );
};

export const useSelectedPage = () => {
  const context = useContext(SelectedPageContext);
  if (!context) {
    throw new Error("useSelectedPage must be used within a SelectedPageProvider");
  }
  return context;
};