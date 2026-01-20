import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      'placehold.co', // Add this hostname for your placeholder images
      'img.freepik.com',
      // Add any other external image hostnames here (e.g., 'cdn.example.com', 'your-image-storage.s3.amazonaws.com')
    ],
    // If you're using remotePatterns (Next.js 13+ recommended for more control)
    // remotePatterns: [
    //   {
    //     protocol: 'https',
    //     hostname: 'placehold.co',
    //     port: '',
    //     pathname: '/**',
    //   },
    //   // Add other remote patterns as needed
    // ],
  },
};

export default nextConfig;
