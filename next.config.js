/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/Education-site',
  assetPrefix: '/Education-site/',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
