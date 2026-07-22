import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: "standalone",
  experimental: {
    typedEnv: true
  },
  // Proxy the API through the web origin: the browser only ever talks to this
  // host, so the better-auth session cookie stays first-party and fetch/
  // EventSource work same-origin — no CORS, no base URL in client code.
  rewrites: async () => [
    { source: "/api/auth/:path*", destination: `${process.env.API_URL}/api/auth/:path*` },
    { source: "/api/compressor", destination: `${process.env.API_URL}/compressor` },
    { source: "/api/compressor/:path*", destination: `${process.env.API_URL}/compressor/:path*` },
  ],
};

export default nextConfig;
