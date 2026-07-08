export interface ApplyLinkInfo {
  link: string;
  fileName: string;
}

export interface Job {
  id?: string;
  jobTitle: string;
  companyName: string;
  sector: string; // New
  referenceNumber: string;
  organizationName: string;
  location: string;
  compensation: string;
  jobDescription: string;
  contactInformation: string;
  employmentType: string;
  dateOfIssue: string;
  lastDateToApply: string;
  qualifications: string[];
  benefits: string[];
  applicationProcess: string[];
  eligibilityNotes: string[];
  applyLink?: ApplyLinkInfo;
  status: string; // New
  createdDate: string; // DateTime serializes to string (ISO 8601)
  updatedDate: string; // DateTime serializes to string (ISO 8601)
  originalExtraction?: Job; // New recursive property
  // Scraper fields
  source?: string;       // "SarkariResult" | "IndGovtJobs" | "Manual"
  type?: string;         // "job" | "admit_card" | "result" | "update"
  isScraped?: boolean;
  scrapedAt?: string;
  shortDescription?: string[];
  importantDatesStructured?: { label: string; value: string }[];
  applicationFee?: { category: string; amount: string }[];
  ageLimits?: string[];
  vacancyDetails?: Record<string, string>[];
  categoryVacancyDetails?: Record<string, string>[];
  howToApply?: string[];
  importantLinks?: { label: string; url: string; type: string }[];
  sourceUrl?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}