import { format, formatDistanceToNow, differenceInYears } from 'date-fns';

type DateLike = string | number | Date | null | undefined;

const ISO_DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;
const DD_MM_YYYY_RE = /^\d{2}-\d{2}-\d{4}$/;

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function hasTimeZoneDesignator(value: string): boolean {
  // Z or +/-HH:MM at the end (covers most ISO strings)
  return /([zZ]|[+-]\d{2}:?\d{2})$/.test(value);
}

function safeTrim(value: string): string {
  return value.trim();
}

/**
 * Converts backend date strings that are meant to be date-only into `YYYY-MM-DD`.
 * Supports:
 * - `YYYY-MM-DD`
 * - `DD-MM-YYYY`
 * - ISO datetime strings (uses the leading date portion)
 */
export function toDateOnly(value: DateLike): string | null {
  if (value === null || value === undefined) return null;

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return format(value, 'yyyy-MM-dd');
  }

  if (typeof value === 'number') {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return format(date, 'yyyy-MM-dd');
  }

  if (!isString(value)) return null;
  const raw = safeTrim(value);
  if (!raw) return null;

  if (ISO_DATE_ONLY_RE.test(raw)) return raw;

  if (DD_MM_YYYY_RE.test(raw)) {
    const [day, month, year] = raw.split('-');
    return `${year}-${month}-${day}`;
  }

  // ISO datetime (or other) -> use first 10 chars if it looks like YYYY-MM-DD...
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    return raw.slice(0, 10);
  }

  return null;
}

/**
 * Parse a date-only string into a local Date (calendar date semantics).
 * This avoids off-by-one issues caused by interpreting `YYYY-MM-DD` as UTC.
 */
export function parseDateOnlyToLocalDate(value: DateLike): Date | null {
  const dateOnly = toDateOnly(value);
  if (!dateOnly) return null;
  const [yearStr, monthStr, dayStr] = dateOnly.split('-');
  const year = Number(yearStr);
  const monthIndex = Number(monthStr) - 1;
  const day = Number(dayStr);
  const date = new Date(year, monthIndex, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Parse a datetime that should be treated as UTC on the wire and displayed in the user's locale.
 * - If timezone is missing, we assume UTC.
 */
export function parseUtcDateTime(value: DateLike): Date | null {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (!isString(value)) return null;
  const raw = safeTrim(value);
  if (!raw) return null;

  // Date-only inputs are not datetimes.
  if (ISO_DATE_ONLY_RE.test(raw) || DD_MM_YYYY_RE.test(raw)) {
    return parseDateOnlyToLocalDate(raw);
  }

  // ISO without TZ: assume UTC
  if (raw.includes('T') && !hasTimeZoneDesignator(raw)) {
    const assumedUtc = `${raw}Z`;
    const date = new Date(assumedUtc);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Convert a date-only (`YYYY-MM-DD`) into an ISO string at UTC midnight.
 * This keeps storage stable in UTC without timezone drift.
 */
export function dateOnlyToUtcIsoString(dateOnly: string): string {
  return `${dateOnly}T00:00:00.000Z`;
}

export function formatDateOnly(value: DateLike, pattern: string): string {
  const date = parseDateOnlyToLocalDate(value);
  if (!date) return 'N/A';
  return format(date, pattern);
}

export function formatDateTimeLocal(value: DateLike, pattern: string): string {
  const date = parseUtcDateTime(value);
  if (!date) return 'N/A';
  return format(date, pattern);
}

export function formatTimeAgo(value: DateLike): string {
  const date = parseUtcDateTime(value);
  if (!date) return 'N/A';
  return formatDistanceToNow(date, { addSuffix: true });
}

export function calculateAge(dob: DateLike): string | null {
  const date = parseDateOnlyToLocalDate(dob);
  if (!date) return null;
  return differenceInYears(new Date(), date).toString();
}
