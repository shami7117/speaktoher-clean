import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // FOR STATIC EXPORT (no API routes or SSR):
  // output: 'export',
  // trailingSlash: true,
  // images: {
  //   unoptimized: true,
  // },
  
  // FOR NETLIFY WITH API ROUTES AND SSR:
  // Leave output undefined to use Netlify's Next.js plugin
  
  // Image optimization settings
  images: {
    // Netlify supports image optimization
    domains: ['example.com'], // Add your image domains here
    // For static export, set unoptimized: true
    // unoptimized: true,
  },
  
  // Optional: Configure redirects
  async redirects() {
    return [
      // Add your redirects here
    ]
  },
  
  // Optional: Configure rewrites
  async rewrites() {
    return [
      // Add your rewrites here
    ]
  },
}

export default nextConfig