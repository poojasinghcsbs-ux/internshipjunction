export type Role = "student" | "mentor" | "admin" | "super_admin";

export interface User {
  id: number;
  fullName: string;
  email: string;
  phone?: string | null;
  role: Role;
  avatarUrl?: string | null;
  headline?: string | null;
  createdAt?: string;
}

export interface Course {
  id: number;
  slug: string;
  title: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  mode: "live" | "self-paced";
  thumbnail: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewsCount: number;
  studentsCount: number;
  duration: string;
  technologies: string[];
  shortDescription: string;
  overview: string;
  outcomes: string[];
  prerequisites: string[];
  audience: string[];
  certification: string;
  careerOutcomes: string[];
  isFeatured: boolean;
  status: "active" | "draft";
  createdAt: string;
  modules?: CourseModule[];
  mentor?: Mentor | null;
  reviews?: Review[];
}

export interface CourseModule {
  id: number;
  title: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: number;
  title: string;
  type: "video" | "reading" | "quiz" | "assignment" | "live";
  duration: string;
  isPreview?: boolean;
}

export interface Internship {
  id: number;
  slug: string;
  title: string;
  domain: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  mode: "remote" | "hybrid" | "onsite";
  duration: string;
  stipend: string;
  location: string;
  thumbnail: string;
  skills: string[];
  shortDescription: string;
  overview: string;
  eligibility: string[];
  roadmap: { week: string; title: string; tasks: string[] }[];
  perks: string[];
  certification: string;
  applicationDeadline: string;
  status: "open" | "closed";
  openings: number;
  applicantsCount: number;
  isFeatured: boolean;
  mentor?: Mentor | null;
}

export interface Fellowship {
  id: number;
  slug: string;
  title: string;
  domain: string;
  cohort: string;
  startDate: string;
  duration: string;
  seats: number;
  seatsLeft: number;
  price: number;
  originalPrice: number;
  thumbnail: string;
  shortDescription: string;
  overview: string;
  highlights: string[];
  curriculum: { title: string; items: string[] }[];
  mentors: string[];
  careerSupport: string[];
  isFeatured: boolean;
}

export interface Job {
  id: number;
  slug: string;
  title: string;
  company: string;
  companyLogo?: string | null;
  location: string;
  remote: boolean;
  experience: string;
  salaryMin: number;
  salaryMax: number;
  type: "Full-time" | "Part-time" | "Internship" | "Contract";
  skills: string[];
  description: string;
  responsibilities: string[];
  requirements: string[];
  postedAt: string;
  status: "open" | "closed";
  applicantsCount: number;
}

export interface Mentor {
  id: number;
  name: string;
  role: string;
  company: string;
  avatarUrl?: string | null;
  expertise: string[];
  experienceYears: number;
  rating: number;
  reviewsCount: number;
  bio: string;
  linkedin?: string | null;
  availability: string;
  isFeatured: boolean;
}

export interface Review {
  id: number;
  author: string;
  role: string;
  rating: number;
  content: string;
  createdAt: string;
}

export interface Project {
  id: number;
  title: string;
  courseSlug?: string | null;
  courseTitle?: string | null;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  requirements: string[];
  skills: string[];
  estimatedHours: number;
  status: "not-started" | "in-progress" | "submitted" | "under-review" | "changes-requested" | "approved" | "completed";
  submissionUrl?: string | null;
  repoUrl?: string | null;
  feedback?: string | null;
  score?: number | null;
}

export interface Certificate {
  id: number;
  certificateId: string;
  program: string;
  programType: "course" | "internship" | "fellowship";
  studentName: string;
  issuedAt: string;
  status: "valid" | "revoked";
  grade?: string | null;
}

export interface Enrollment {
  id: number;
  programType: "course" | "internship" | "fellowship";
  programId: number;
  title: string;
  thumbnail: string;
  progress: number;
  plan: "self-paced" | "pro" | "advanced";
  status: "active" | "completed";
  enrolledAt: string;
}

export interface JobApplication {
  id: number;
  jobId: number;
  jobTitle: string;
  company: string;
  status: "applied" | "shortlisted" | "interview" | "selected" | "rejected";
  appliedAt: string;
  resumeUrl?: string | null;
}

export interface AtsReport {
  id: number;
  fileName: string;
  createdAt: string;
  overallScore: number;
  targetRole?: string | null;
  sections: { name: string; score: number; note: string }[];
  missingKeywords: string[];
  recommendedSkills: string[];
  suggestions: { issue: string; before: string; after: string }[];
  summary: string;
}

export interface MockInterview {
  id: number;
  role: string;
  technology: string;
  experience: string;
  type: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
  createdAt: string;
  questions?: { question: string; answer: string; score: number; feedback: string }[];
}

export interface CommunityPost {
  id: number;
  author: string;
  authorRole: Role;
  title: string;
  content: string;
  tags: string[];
  likes: number;
  commentsCount: number;
  createdAt: string;
  liked?: boolean;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AnalyticsSummary {
  revenue: number;
  students: number;
  enrollments: number;
  completionRate: number;
  internshipApplications: number;
  jobApplications: number;
  conversionRate: number;
  activeUsers: number;
  revenueByMonth: { month: string; revenue: number }[];
  enrollmentsByCategory: { category: string; count: number }[];
}
