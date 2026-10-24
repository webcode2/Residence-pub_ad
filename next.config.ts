import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: {serverActions: {bodySizeLimit: "6mb", allowedOrigins: ["residence.elastrocloud.com"]}},
    distDir: process.env.RESIDENCE_BUILD_DIR || ".next",
    async rewrites() {
        const api = process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:8000";
        return [
            { source: "/api/v1/:path*", destination: `${api}/api/v1/:path*` },
        ];
    },
    typescript: {
        ignoreBuildErrors: false,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
