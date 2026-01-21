"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface EstateConfig {
  appId: string;
  estateName: string;
  globalFee: number;
  currency: string;
  tier: 'community' | 'pro' | 'enterprise';
}

interface EstateContextType {
  estate: EstateConfig;
  updateEstate: (updates: Partial<EstateConfig>) => void;
  setGlobalFee: (fee: number) => void;
}

const defaultEstate: EstateConfig = {
  appId: 'estate_001',
  estateName: 'Lekki Gardens Phase 2',
  globalFee: 50000,
  currency: 'NGN',
  tier: 'pro',
};

const EstateContext = createContext<EstateContextType | undefined>(undefined);

export function EstateProvider({ children }: { children: ReactNode }) {
  const [estate, setEstate] = useState<EstateConfig>(defaultEstate);

  const updateEstate = (updates: Partial<EstateConfig>) => {
    setEstate(prev => ({ ...prev, ...updates }));
  };

  const setGlobalFee = (fee: number) => {
    setEstate(prev => ({ ...prev, globalFee: fee }));
  };

  return (
    <EstateContext.Provider value={{ estate, updateEstate, setGlobalFee }}>
      {children}
    </EstateContext.Provider>
  );
}

export function useEstate() {
  const context = useContext(EstateContext);
  if (context === undefined) {
    throw new Error('useEstate must be used within an EstateProvider');
  }
  return context;
}
