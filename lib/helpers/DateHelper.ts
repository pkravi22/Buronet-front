import { formatDateOnly } from '@/lib/dates';

const formatDate = (dateString: string): string => {
  // Backwards-compatible helper used across Jobs/Exams pages.
  // Accepts either `DD-MM-YYYY` or `YYYY-MM-DD` (and ISO strings that start with `YYYY-MM-DD`).
  return formatDateOnly(dateString, 'MMM dd, yyyy');
};

export { formatDate };