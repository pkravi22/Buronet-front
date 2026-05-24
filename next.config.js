/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    domains: ['localhost','placehold.co', 'posterjack.ca','images.indianexpress.com', 'res.cloudinary.com'],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https', // You can also use 'http' if needed, but HTTPS is recommended for security.
        hostname: '**', // The wildcard '**' matches any hostname.
        port: '',
        pathname: '/**', // The wildcard '/**' matches any path.
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/', // The incoming request path
        destination: '/home', // The path to redirect to
        permanent: true, // true for 308 (permanent) redirect, false for 307 (temporary)
      },
    ];
  },
}

module.exports = nextConfig 