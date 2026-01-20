export const DEFAULT_PROFILE_IMAGE_URL =
  'https://img.freepik.com/premium-vector/user-profile-icon-flat-style-member-avatar-vector-illustration-isolated-background-human-permission-sign-business-concept_157943-15752.jpg?semt=ais_hybrid&w=740&q=80';

export function getProfileImageUrl(url?: string | null): string {
  if (!url) return DEFAULT_PROFILE_IMAGE_URL;
  const trimmed = url.trim();
  return trimmed.length > 0 ? trimmed : DEFAULT_PROFILE_IMAGE_URL;
}
