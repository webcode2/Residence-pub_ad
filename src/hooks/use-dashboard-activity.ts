import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export interface DashboardActivity {
    type: 'entry' | 'visitor' | 'registration' | 'payment';
    action: string;
    details: string;
    timestamp: string;
}

export function useDashboardActivity(appId: string) {
    return useQuery({
        queryKey: ["dashboard-activity", appId],
        queryFn: async () => {
            const response = await api.get(`iam/dashboard/activity`, {
                headers: {
                    "X-App-Id": appId,
                },
            });
            console.log("[Dashboard Activity] API Response:", response.data);
            if (!Array.isArray(response.data)) {
                console.error("[Dashboard Activity] Expected array, got:", typeof response.data, response.data);
                return [] as DashboardActivity[];
            }
            return response.data as DashboardActivity[];
        },
        enabled: !!appId,
        refetchInterval: 30000, // Refresh every 30 seconds
    });
}
