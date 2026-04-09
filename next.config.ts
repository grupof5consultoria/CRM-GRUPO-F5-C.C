import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg", "bcryptjs"],

  // Skip type-check during Vercel build — run locally before pushing
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
