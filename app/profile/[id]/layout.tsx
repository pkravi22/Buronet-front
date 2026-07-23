import { Metadata } from 'next';
import React from 'react';

interface Props {
  params: { id: string };
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const profileId = params.id;
  const dotnetApiBase = process.env.NEXT_PUBLIC_DOTNET_BACKEND_BASE || 'https://test.buronet.co.in/api';

  try {
    const res = await fetch(`${dotnetApiBase}/Users/profile/${profileId}`, {
      next: { revalidate: 600 },
    });

    if (res.ok) {
      const profile = await res.json();

      if (profile) {
        const name = profile.firstName && profile.lastName 
          ? `${profile.firstName} ${profile.lastName}`
          : profile.username || 'Buronet Member';
        const title = `${name} - Professional Profile | Buronet`;
        
        const description = profile.headline 
          ? `${profile.headline}. ${profile.bio || ''}`.substring(0, 160) + '...'
          : `Connect with ${name} on Buronet, the professional network for study groups, exams, and career opportunities.`;

        const location = [profile.city, profile.stateProvince, profile.country]
          .filter(Boolean)
          .join(', ') || 'India';

        return {
          title,
          description,
          openGraph: {
            title,
            description,
            type: 'profile',
            firstName: profile.firstName || undefined,
            lastName: profile.lastName || undefined,
            username: profile.username || undefined,
            locale: 'en_IN',
          },
          twitter: {
            card: 'summary',
            title,
            description,
          },
          other: {
            'geo.placename': location,
            'geo.region': 'IN',
          }
        };
      }
    }
  } catch (error) {
    console.error('Error generating metadata for profile:', error);
  }

  // Fallback metadata
  return {
    title: 'Professional Profile | Buronet',
    description: 'Connect with professionals, share knowledge, and grow your network on Buronet.',
  };
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
