import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output = Next.js paczkuje minimalny serwer + tylko potrzebne
  // node_modules do .next/standalone. Dzięki temu obraz Dockera jest dużo
  // mniejszy i nie trzeba w produkcji trzymać całego node_modules.
  output: "standalone",
};

export default nextConfig;