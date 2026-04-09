"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { EstateProvider } from "@/contexts/EstateContext";
import { UserProvider } from "@/contexts/UserContext";

export function Providers({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            <UserProvider>
                <EstateProvider>
                    {children}
                </EstateProvider>
            </UserProvider>
        </QueryClientProvider>
    );
}
