import { MetadataRoute } from 'next';
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/next-api/', '/complete-profile/', '/reset-password/'],
    },
    sitemap: 'https://buronet.co.in/sitemap.xml',
  };
}
