import { redirect } from 'next/navigation';
import { slugify } from '@/lib/helpers/slugify';

interface Props {
  params: { id: string };
}

export default async function JobRedirectPage({ params }: Props) {
  const jobId = params.id;
  let slug = 'job';

  try {
    const jobsApiBase = process.env.NEXT_PUBLIC_JOBS_BACKEND_BASE || 'https://test.buronet.co.in/jobs/api';
    const res = await fetch(`${jobsApiBase}/Jobs/${jobId}`, {
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const apiResponse = await res.json();
      const job = apiResponse.data || apiResponse;
      if (job && job.jobTitle) {
        slug = slugify(job.jobTitle);
      }
    }
  } catch (error) {
    console.error('Redirect Page: Failed to fetch job details for slug:', error);
  }

  // Redirect to the SEO-friendly URL
  redirect(`/jobs/${jobId}/${slug}`);
}
