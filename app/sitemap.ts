import { MetadataRoute } from 'next';
import { slugify } from '@/lib/helpers/slugify';

export const dynamic = 'force-dynamic';
export const revalidate = 600; // Cache for 10 minutes so newly scraped/added jobs appear quickly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://buronet.co.in';

  // 1. Static Core Routes
  const staticRoutes = [
    '',
    '/home',
    '/jobs',
    '/exams',
    '/bytes',
    '/current-affairs',
    '/exam-updates',
    '/trending',
    '/login',
    '/register',
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' || route === '/home' ? 1.0 : 0.8,
  }));

  let dynamicRoutes: MetadataRoute.Sitemap = [];
  const jobsApiBase = process.env.NEXT_PUBLIC_JOBS_BACKEND_BASE || 'https://test.buronet.co.in/jobs/api';

  // 2. Fetch ALL Job details for Sitemap (Paginated to handle all jobs dynamically)
  try {
    let page = 1;
    let totalPages = 1;
    const pageSize = 500; // Fetch in chunks of 500

    do {
      const jobsRes = await fetch(`${jobsApiBase}/jobs/public?page=${page}&pageSize=${pageSize}`, {
        next: { revalidate: 600 },
      });

      if (!jobsRes.ok) break;

      const jobsData = await jobsRes.json();
      const jobs = jobsData.data || (Array.isArray(jobsData) ? jobsData : []);
      totalPages = jobsData.totalPages || 1;

      const jobRoutes = jobs
        .filter((job: any) => job && job.id)
        .map((job: any) => {
          const rawDate = job.updatedDate || job.createdDate || job.scrapedAt;
          const parsedDate = rawDate ? new Date(rawDate) : new Date();
          const validDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
          const jobSlug = slugify(job.jobTitle || 'job');

          return {
            url: `${baseUrl}/jobs/${job.id}/${jobSlug}`,
            lastModified: validDate,
            changeFrequency: 'daily' as const,
            priority: 0.7,
          };
        });

      dynamicRoutes.push(...jobRoutes);

      page++;
    } while (page <= totalPages && page <= 100); // Safety cap at 50,000 items
  } catch (e) {
    console.error('Sitemap generation: failed to fetch jobs', e);
  }

  // 3. Fetch ALL Exam details for Sitemap (Paginated)
  try {
    let page = 1;
    let totalPages = 1;
    const pageSize = 500;

    do {
      const examsRes = await fetch(`${jobsApiBase}/exams/all?page=${page}&pageSize=${pageSize}`, {
        next: { revalidate: 600 },
      });

      if (!examsRes.ok) break;

      const examsData = await examsRes.json();
      const exams = examsData.data || (Array.isArray(examsData) ? examsData : []);
      totalPages = examsData.totalPages || 1;

      const examRoutes = exams
        .filter((exam: any) => exam && exam.id)
        .map((exam: any) => {
          const rawDate = exam.updatedDate || exam.createdDate;
          const parsedDate = rawDate ? new Date(rawDate) : new Date();
          const validDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

          return {
            url: `${baseUrl}/exams/${exam.id}`,
            lastModified: validDate,
            changeFrequency: 'weekly' as const,
            priority: 0.7,
          };
        });

      dynamicRoutes.push(...examRoutes);

      page++;
    } while (page <= totalPages && page <= 100);
  } catch (e) {
    console.error('Sitemap generation: failed to fetch exams', e);
  }

  return [...staticRoutes, ...dynamicRoutes];
}

