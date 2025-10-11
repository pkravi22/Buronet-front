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
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}