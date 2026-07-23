import { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Cache for 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://buronet.co.in';

  // 1. Static Routes
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

  // 2. Fetch Job details for Sitemap
  try {
    const jobsApiBase = process.env.NEXT_PUBLIC_JOBS_BACKEND_BASE || 'https://test.buronet.co.in/jobs/api';
    const jobsRes = await fetch(`${jobsApiBase}/jobs/public?pageSize=100`, {
      next: { revalidate: 3600 },
    });
    if (jobsRes.ok) {
      const jobsData = await jobsRes.json();
      const jobs = jobsData.data || [];
      const jobRoutes = jobs.map((job: any) => ({
        url: `${baseUrl}/jobs/${job.id}`,
        lastModified: new Date(job.updatedDate || job.createdDate || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }));
      dynamicRoutes = [...dynamicRoutes, ...jobRoutes];
    }
  } catch (e) {
    console.error('Sitemap generation: failed to fetch jobs', e);
  }

  // 3. Fetch Exam details for Sitemap
  try {
    const jobsApiBase = process.env.NEXT_PUBLIC_JOBS_BACKEND_BASE || 'https://test.buronet.co.in/jobs/api';
    const examsRes = await fetch(`${jobsApiBase}/exams/all?pageSize=100`, {
      next: { revalidate: 3600 },
    });
    if (examsRes.ok) {
      const examsData = await examsRes.json();
      const exams = examsData.data || [];
      const examRoutes = exams.map((exam: any) => ({
        url: `${baseUrl}/exams/${exam.id}`,
        lastModified: new Date(exam.updatedDate || exam.createdDate || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }));
      dynamicRoutes = [...dynamicRoutes, ...examRoutes];
    }
  } catch (e) {
    console.error('Sitemap generation: failed to fetch exams', e);
  }

  return [...staticRoutes, ...dynamicRoutes];
}
