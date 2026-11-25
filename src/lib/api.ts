import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost/api/v1/";

// Backend calls run in server actions; credentials come from the httpOnly session cookie
// and are passed per request (see lib/caretaker.ts and lib/owner-session.ts), never from browser storage.
const api = axios.create({
    baseURL,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const { config, response } = error;
        if (typeof window === "undefined") {
            console.error(`[API ERROR] ${config?.method?.toUpperCase()} ${config?.url} - Status: ${response?.status || "Network Error"}`);
        }
        return Promise.reject(error);
    }
);

export default api;
