import axios from "axios";

const api = axios.create({
    baseURL: process.env.BACKEND_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request Logger Interceptor
api.interceptors.request.use(
    (config) => {
        const startTime = Date.now();
        // @ts-ignore - custom property for timing
        config.metadata = { startTime };

        console.log(`[API REQUEST] ${config.method?.toUpperCase()} ${config.url}`);
        if (config.data && process.env.NODE_ENV !== "production") {
            console.log("[API DATA]", JSON.stringify(config.data, null, 2));
        }

        return config;
    },
    (error) => {
        console.error("[API REQUEST ERROR]", error);
        return Promise.reject(error);
    }
);

// Response Logger Interceptor
api.interceptors.response.use(
    (response) => {
        // @ts-ignore
        const { startTime } = response.config.metadata;
        const duration = Date.now() - startTime;

        console.log(
            `[API RESPONSE] ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status} (${duration}ms)`
        );

        return response;
    },
    (error) => {
        const { config, response } = error;

        if (config) {
            // @ts-ignore
            const { startTime } = config.metadata || {};
            const duration = startTime ? `${Date.now() - startTime}ms` : "unknown";

            console.error(
                `[API ERROR] ${config.method?.toUpperCase()} ${config.url} - Status: ${response?.status || "Network Error"} (${duration})`
            );

            if (response?.data) {
                console.error("[API ERROR DATA]", JSON.stringify(response.data, null, 2));
            }
        } else {
            console.error("[API ERROR]", error.message);
        }

        return Promise.reject(error);
    }
);

export default api;
