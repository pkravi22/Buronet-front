import { Metadata } from 'next';
import React from 'react';

interface Props {
  params: { id: string };
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const postId = params.id;
  const dotnetApiBase = process.env.NEXT_PUBLIC_DOTNET_BACKEND_BASE || 'https://test.buronet.co.in/api';

  try {
    const res = await fetch(`${dotnetApiBase}/posts/${postId}`, {
      next: { revalidate: 600 },
    });

    if (res.ok) {
      const post = await res.json();

      if (post) {
        const author = post.userName || 
                       (post.firstName && post.lastName ? `${post.firstName} ${post.lastName}` : '') || 
                       'Buronet User';
        const rawTitle = post.title || `Post by ${author}`;
        const title = `${rawTitle} | Buronet`;
        const description = post.content
          ? post.content.substring(0, 160) + '...'
          : `Read this post by ${author} on Buronet. Join the professional network for study groups, exams, and career options.`;

        return {
          title,
          description,
          openGraph: {
            title,
            description,
            type: 'article',
            locale: 'en_IN',
            authors: [author],
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
    console.error('Error generating metadata for post:', error);
  }

  // Fallback metadata
  return {
    title: 'Post Details | Buronet',
    description: 'Read the latest professional updates, exam prep strategies, and networking discussions on Buronet.',
  };
}

export default function PostLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
