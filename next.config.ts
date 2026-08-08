import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Pin tracing to this package (parent dirs may have other lockfiles)
  outputFileTracingRoot: path.join(__dirname),
  // Existing Vite app under src/ remains untouched; App Router owns app/
};

export default nextConfig;
