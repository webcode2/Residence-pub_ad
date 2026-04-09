"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { fetchEstateConfigAction } from '@/actions/estate';

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
  isLoading: boolean;
}

const defaultEstate: EstateConfig = {
  appId: '',
  estateName: 'Resident Pass',
  globalFee: 0,
  currency: 'NGN',
  tier: 'pro',
};

const EstateContext = createContext<EstateContextType | undefined>(undefined);

export function EstateProvider({ children }: { children: ReactNode }) {
  const [estate, setEstate] = useState<EstateConfig>(() => {
    if (typeof window !== 'undefined') {
      const storedAppId = localStorage.getItem('app_id');
      if (storedAppId) {
        return { ...defaultEstate, appId: storedAppId };
      }
    }
    return defaultEstate;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initEstate() {
      const storedAppId = typeof window !== 'undefined' ? localStorage.getItem('app_id') : null;

      if (!storedAppId) {
        setIsLoading(false);
        return;
      }

      console.log("[EstateContext] Initializing with appId:", storedAppId);
      try {
        const result = await fetchEstateConfigAction(storedAppId);
        if (result.success && result.data) {
          setEstate({
            appId: result.data.app_id,
            estateName: result.data.name,
            globalFee: result.data.global_fee,
            currency: result.data.currency,
            tier: 'pro',
          });
        } else {
          console.warn("Estate config not found for:", storedAppId);
        }
      } catch (error) {
        console.error("Failed to initialize estate context", error);
      } finally {
        setIsLoading(false);
      }
    }
    initEstate();
  }, []);

  const updateEstate = (updates: Partial<EstateConfig>) => {
    setEstate(prev => ({ ...prev, ...updates }));
    if (updates.appId) {
      localStorage.setItem('app_id', updates.appId);
    }
  };

  return (
    <EstateContext.Provider value={{ estate, updateEstate, isLoading }}>
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
