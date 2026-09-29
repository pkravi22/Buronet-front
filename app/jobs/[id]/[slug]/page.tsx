import { Job } from '@/lib/types/jobs';
import JobDetailsClient from './JobDetailsClient';
import { slugify } from '@/lib/helpers/slugify';

interface PageProps {
  params: { id: string; slug: string };
}

function safeToISOString(dateStr?: string | null): string | undefined {
  if (!dateStr || typeof dateStr !== 'string') return undefined;
  const trimmed = dateStr.trim();
  if (!trimmed) return undefined;

  let timestamp = Date.parse(trimmed);

  if (isNaN(timestamp)) {
    const match = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
    if (match) {
      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const year = parseInt(match[3], 10);
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) {
        timestamp = d.getTime();
      }
    }
  }

  if (isNaN(timestamp)) return undefined;

  try {
    return new Date(timestamp).toISOString();
  } catch {
    return undefined;
  }
}

export default async function JobDetailsPage({ params }: PageProps) {
  const jobId = params.id;
  const jobsApiBase = process.env.NEXT_PUBLIC_JOBS_BACKEND_BASE || 'https://test.buronet.co.in/jobs/api';
  
  let job: Job | null = null;
  
  try {
    const res = await fetch(`${jobsApiBase}/Jobs/${jobId}`, {
      next: { revalidate: 60 },
    });
    
    if (res.ok) {
      const apiResponse = await res.json();
      job = apiResponse.data || apiResponse;
    }
  } catch (error) {
    console.error('Failed to fetch job details on server:', error);
  }

  // Generate JobPosting JSON-LD for Google Search Console
  const jsonLd = job ? {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    "title": job.jobTitle,
    "description": job.jobDescription || job.shortDescription || job.jobTitle,
    "identifier": {
      "@type": "PropertyValue",
      "name": job.companyName || job.organizationName || "Buronet",
      "value": job.referenceNumber || job.id
    },
    "datePosted": safeToISOString(job.createdDate) || safeToISOString(job.updatedDate) || new Date().toISOString(),
    "validThrough": safeToISOString(job.lastDateToApply),
    "employmentType": job.employmentType ? job.employmentType.toUpperCase().replace(' ', '_') : "FULL_TIME",
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.companyName || job.organizationName || "Buronet",
      "sameAs": "https://buronet.co.in",
      "logo": "https://buronet.co.in/images/logo.png"
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": job.location || "India",
        "addressCountry": "IN"
      }
    },
    "baseSalary": (job.compensation || (job as any).salary) ? {
      "@type": "MonetaryAmount",
      "currency": "INR",
      "value": {
        "@type": "QuantitativeValue",
        "value": job.compensation || (job as any).salary,
        "unitText": "MONTH"
      }
    } : undefined
  } : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <JobDetailsClient initialJob={job} />
    </>
  );
}
