"use client";
import React, { createContext, useContext, useState, type ReactNode } from "react";
import type { Post } from "@/types/post";

interface SelectedPostContextProps {
  selectedPost: Post | null;
  setSelectedPost: (Post: Post | null) => void;
}

const SelectedPostContext = createContext<SelectedPostContextProps | undefined>(undefined);

export const SelectedPostProvider = ({ children }: { children: ReactNode }) => {

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  return (
    <SelectedPostContext.Provider value={{ selectedPost, setSelectedPost }}>
      {children}
    </SelectedPostContext.Provider>
  );
};

export const useSelectedPost = () => {
  const context = useContext(SelectedPostContext);
  if (!context) {
    throw new Error("useSelectedPost must be used within a SelectedPostProvider");
  }
  return context;
};