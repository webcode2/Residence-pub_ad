import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

interface DashboardStats {
    totalResidents: number;
    activeVisitors: number;
    todayCheckins: number;
    residentTrend: number;
    visitorTrend: number;
    checkinTrend: number;
}

export function useDashboardStats(appId: string) {
    return useQuery({
        queryKey: ["dashboard-stats", appId],
        queryFn: async () => {
            const response = await api.get(`iam/dashboard/stats`, {
                headers: {
                    "X-App-Id": appId,
                },
            });
            return response.data as DashboardStats;
        },
        enabled: !!appId,
    });
}
