import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      allowedOrigins: ['*'], // 允许所有来源，仅用于开发环境
    },
    allowedDevOrigins: ['192.168.31.196', 'localhost:3000', '127.0.0.1:3000', '127.0.0.1'],
  },
  // 对于非 server actions 的普通请求
};

export default nextConfig;
