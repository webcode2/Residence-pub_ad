"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getSessionAction } from '@/actions/auth';

interface User {
    id: string;
    email: string;
    full_name: string;
    roles: string[];
    app_id: string;
}

interface UserContextType {
    user: User | null;
    isLoading: boolean;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshUser = async () => {
        try {
            const session = await getSessionAction();
            if (session && session.user) {
                setUser(session.user);
            }
        } catch (error) {
            console.error("Failed to refresh user context", error);
        }
    };

    useEffect(() => {
        async function initUser() {
            try {
                const session = await getSessionAction();
                if (session && session.user) {
                    setUser(session.user);
                }
            } catch (error) {
                console.error("Failed to initialize user context", error);
            } finally {
                setIsLoading(false);
            }
        }
        initUser();
    }, []);

    const logout = () => {
        setUser(null);
    };

    return (
        <UserContext.Provider value={{ user, isLoading, logout, refreshUser }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
