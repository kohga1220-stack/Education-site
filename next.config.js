/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  env: { NEXT_PUBLIC_BASE_PATH: '/Education-site' },
  basePath: '/Education-site',
  assetPrefix: '/Education-site/',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
