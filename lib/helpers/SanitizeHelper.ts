export const sanitizeText = (text: string | undefined | null) => {
  if (!text) return '';
  return text
    .replace(/sarkari\s*result\.com/gi, 'buronet.co.in')
    .replace(/sarkari\s*result/gi, 'Buronet')
    .replace(/sarkariresult/gi, 'Buronet')
    .replace(/since 2012/gi, '') // Usually associated with their tagline
    .trim();
};

export const isValidNote = (n: string | undefined | null) => {
  if (!n) return false;
  const lower = n.toLowerCase();
  if (lower.includes('pay the exam fee through online / offline fee mode only')) return false;
  if (lower.includes('sarkari result tools')) return false;
  return true;
};
