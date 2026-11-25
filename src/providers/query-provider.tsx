"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { EstateProvider } from "@/contexts/EstateContext";
import { UserProvider } from "@/contexts/UserContext";

export function Providers({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                // Keep dashboard data fresh for 30s so page navigation does not
                // immediately refetch. Explicit Refresh buttons still force a fetch.
                staleTime: 30 * 1000,
                gcTime: 5 * 60 * 1000,
                refetchOnWindowFocus: false,
                refetchOnReconnect: false,
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
