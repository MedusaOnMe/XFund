/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',  // Static HTML export for single-service deployment
  distDir: 'out',
  trailingSlash: true,
}

module.exports = nextConfig
