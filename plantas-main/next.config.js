/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  externals: {
    react: 'umd react',
    'styled-components': 'umd styled-components',
  },
}

module.exports = nextConfig
