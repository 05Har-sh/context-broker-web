import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: '/integrations',
        destination: '/settings/integrations',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
