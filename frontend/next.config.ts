import type { NextConfig } from "next";

const gatewayBaseUrl = (
  process.env.API_GATEWAY_URL ??
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ??
  "http://localhost:8080/api"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${gatewayBaseUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
