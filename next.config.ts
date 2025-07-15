import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Don't use output: 'export' since you have API routes
  
  // Image optimization settings for Netlify
  images: {
    domains: [], // Add your image domains here if needed
    // Keep image optimization enabled for Netlify
  },
  
  // Ensure proper error handling during build
  experimental: {
    serverComponentsExternalPackages: [],
  },
  
  // Optional: Configure redirects
  async redirects() {
    return []
  },
  
  // Optional: Configure rewrites
  async rewrites() {
    return []
  },
}

export default nextConfig