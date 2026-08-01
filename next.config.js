/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['ui-avatars.com', 'lh3.googleusercontent.com'],
  },
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/auth',
        permanent: false,
      },
      {
        source: '/signup',
        destination: '/auth',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
