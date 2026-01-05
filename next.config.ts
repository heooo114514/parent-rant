import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      allowedOrigins: ['*'], // 允许所有来源，仅用于开发环境
    },
  },
  // 对于非 server actions 的普通请求
  // 注意：Next.js 15 可能不需要显式配置 allowedDevOrigins 除非是特定的高级用法，
  // 但为了消除警告，我们可以加上具体的 IP 或通配符如果支持的话。
  // 不过根据文档，allowedDevOrigins 是顶层配置。
};

export default nextConfig;
