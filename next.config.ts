import type { NextConfig } from "next";

import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();


const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    ppr: 'incremental',
  },
  images: {
    domains: ['cdn-icons-png.flaticon.com', 'res.cloudinary.com'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
};

export default withNextIntl(nextConfig);
