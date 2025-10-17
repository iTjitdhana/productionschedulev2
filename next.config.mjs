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
    // outputFileTracingRoot: undefined, // Removed - not needed
  },
  // Allow cross-origin requests from LAN IPs
  allowedDevOrigins: ['192.168.0.96'],
}

export default nextConfig
