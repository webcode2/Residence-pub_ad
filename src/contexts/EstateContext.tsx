"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { fetchEstateConfigAction } from '@/actions/estate';
import { useUser } from '@/contexts/UserContext';

interface EstateConfig {
  appId: string;
  estateName: string;
  tier: string;
}

interface EstateContextType {
  estate: EstateConfig;
  updateEstate: (updates: Partial<EstateConfig>) => void;
  isLoading: boolean;
}

const defaultEstate: EstateConfig = {
  appId: '',
  estateName: 'Resident Pass',
  tier: 'pro',
};

const EstateContext = createContext<EstateContextType | undefined>(undefined);

export function EstateProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [estate, setEstate] = useState<EstateConfig>(defaultEstate);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!user?.app_id) {
      setEstate(defaultEstate);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setEstate({ ...defaultEstate, appId: user.app_id });
    fetchEstateConfigAction(user.app_id).then(result => {
      if (active && result.success && result.data) {
        setEstate({ appId: result.data.app_id, estateName: result.data.name,
          tier: result.data.tier });
      }
    }).finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [user?.app_id]);

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
