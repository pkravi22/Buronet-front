import { Metadata } from 'next';
import React from 'react';

interface Props {
  params: { id: string };
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const examId = params.id;
  const jobsApiBase = process.env.NEXT_PUBLIC_JOBS_BACKEND_BASE || 'https://test.buronet.co.in/jobs/api';

  try {
    const res = await fetch(`${jobsApiBase}/exams/${examId}`, {
      next: { revalidate: 600 },
    });

    if (res.ok) {
      const apiResponse = await res.json();
      const exam = apiResponse.data || apiResponse;

      if (exam && exam.examTitle) {
        const title = `${exam.examTitle} Exam Updates & Info | Buronet`;
        const description = exam.examSummary
          ? exam.examSummary.substring(0, 160) + '...'
          : `Get latest updates, eligibility, pattern, and details for the ${exam.examTitle} conducted by ${exam.conductingBody || 'Buronet'}.`;

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
            'geo.placename': 'India',
            'geo.region': 'IN',
          }
        };
      }
    }
  } catch (error) {
    console.error('Error generating metadata for exam:', error);
  }

  // Fallback metadata
  return {
    title: 'Exam Details | Buronet',
    description: 'View exam syllabus, patterns, eligibility criteria, and updates on Buronet.',
  };
}

export default function ExamLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
