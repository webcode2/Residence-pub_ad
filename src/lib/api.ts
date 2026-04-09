import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost/api/v1/";
if (typeof window !== 'undefined') {
    console.log("[API Configuration] baseURL:", baseURL);
}

const api = axios.create({
    baseURL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request Logger & Auth Interceptor
api.interceptors.request.use(
    (config) => {
        const startTime = Date.now();
        // @ts-ignore - custom property for timing
        config.metadata = { startTime };

        // Attach token if available
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('access_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            const appId = localStorage.getItem('app_id');
            if (appId && !config.headers['X-App-Id']) {
                config.headers['X-App-Id'] = appId;
            }
        }

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

            if (response?.status === 401 && typeof window !== 'undefined') {
                localStorage.removeItem('access_token');
                // Optional: redirect to login
                // window.location.href = '/login';
            }

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
