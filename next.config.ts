import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    // Force la racine de Turbopack sur le dossier du projet
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
