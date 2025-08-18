import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'http://192.168.56.1:3000, http://localhost:3000',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
