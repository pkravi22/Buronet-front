import { Metadata } from 'next';
import React from 'react';

interface Props {
  params: { id: string };
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const jobId = params.id;
  const jobsApiBase = process.env.NEXT_PUBLIC_JOBS_BACKEND_BASE || 'https://test.buronet.co.in/jobs/api';

  try {
    const res = await fetch(`${jobsApiBase}/Jobs/${jobId}`, {
      next: { revalidate: 600 },
    });
    
    if (res.ok) {
      const apiResponse = await res.json();
      const job = apiResponse.data || apiResponse;
      
      if (job && job.jobTitle) {
        const title = `${job.jobTitle} Job at ${job.companyName || job.organizationName || 'Buronet'} | Buronet`;
        const description = job.jobDescription 
          ? job.jobDescription.substring(0, 160) + '...' 
          : `Apply for ${job.jobTitle} at ${job.companyName || job.organizationName || 'Buronet'}. Find more details on Buronet.`;
        
        return {
          title,
          description,
          openGraph: {
            title,
            description,
            type: 'website',
            locale: 'en_IN',
          },
          twitter: {
            card: 'summary_large_image',
            title,
            description,
          },
          other: {
            'geo.placename': job.location || 'India',
            'geo.region': 'IN',
          }
        };
      }
    }
  } catch (error) {
    console.error('Error generating metadata for job:', error);
  }

  // Fallback metadata
  return {
    title: 'Job Details | Buronet',
    description: 'View job details, requirements, and application instructions on Buronet.',
  };
}

export default function JobLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
