"use client";
import React, { createContext, useState, useContext, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

const TokenContext = createContext<{
  hasToken: boolean;
  setHasToken: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
} | undefined>(undefined);

export const TokenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasToken, setHasToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    setIsLoading(true);
    try {
      const response = await invoke<boolean>('check_token');
      setHasToken(response);
    } catch (error) {
      console.error('Failed to check token:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TokenContext.Provider value={{ hasToken, setHasToken, isLoading }}>
      {children}
    </TokenContext.Provider>
  );
};

export const useToken = () => {
  const context = useContext(TokenContext);
  if (context === undefined) {
    throw new Error('useToken must be used within a TokenProvider');
  }
  return context;
};