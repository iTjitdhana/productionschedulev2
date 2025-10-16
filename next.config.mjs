/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'standalone',
  // Ensure static files are served correctly
  trailingSlash: false,
  // Disable image optimization for Docker
  experimental: {
    outputFileTracingRoot: undefined,
  },
}

export default nextConfig
