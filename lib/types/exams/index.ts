export interface ApplyLinkInfo {
  link: string;
  fileName: string;
}

// Main Exam Interface
export interface Exam {
  id?: string;
  examTitle: string;
  referenceNumber?: string;
  conductingBody?: string;
  postsIncluded: string[];
  examSummary?: string;
  eligibilityCriteria?: EligibilityCriteria;
  applicationDetails?: ApplicationDetails;
  examPattern?: ExamPattern;
  syllabusSummary?: string;
  importantLinks?: ImportantLinks;
  examDates?: ExamDates;
  contentHash?: string;
  status?: string;
  createdDate?: string;
  updatedDate?: string;
  originalExtraction?: Exam; // Recursive type for nested original data
}

// Nested Interfaces for the Exam structure

export interface EligibilityCriteria {
  educationalQualification?: string;
  ageLimit?: AgeLimit;
  nationality?: string;
  otherRequirements: string[];
}

export interface AgeLimit {
  minimum?: number;
  maximum?: number;
  relaxationNotes: string[];
}

export interface ApplicationDetails {
  applicationStartDate?: string;
  applicationEndDate?: string;
  applicationFee?: Record<string, any> | null; // Flexible type for fee structure
  howToApply: string[];
}

export interface ExamPattern {
  preliminary?: ExamStage;
  main?: ExamStage;
}

export interface ExamStage {
  papers: Paper[];
  interview?: Interview;
  totalMarks?: number;
  qualifyingPapers: string[];
  summary?: string;
  otherDetails?: string[];
}

export interface Paper {
  paperName?: string;
  type?: string;
  marks?: number;
  durationHours?: number;
  notes?: string;
}

export interface Interview {
  stageName?: string;
  marks?: number;
  notes?: string;
}

export interface ImportantLinks {
  officialWebsite?: string;
  notificationPdf?: string;
}

export interface ExamDates {
  preliminaryDate?: string;
  mainDate?: string;
}


export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}