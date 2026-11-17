import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  AnalyticsSummary,
  AtsReport,
  Certificate,
  CommunityPost,
  Course,
  Enrollment,
  Fellowship,
  Internship,
  Job,
  JobApplication,
  Mentor,
  MockInterview,
  Notification,
  Paginated,
  Project,
  Review,
  User,
} from "@/lib/types";

type Params = Record<string, string | number | boolean | undefined>;

function toQuery(params?: Params) {
  if (!params) return undefined;
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== "" && v !== "all");
  return entries.length ? Object.fromEntries(entries) : undefined;
}

async function get<T>(url: string, params?: Params): Promise<T> {
  const { data } = await api.get<T>(url, { params: toQuery(params) });
  return data;
}

export const queryKeys = {
  stats: ["stats"] as const,
  courses: (params?: Params) => ["courses", params ?? {}] as const,
  course: (slug: string) => ["course", slug] as const,
  internships: (params?: Params) => ["internships", params ?? {}] as const,
  internship: (slug: string) => ["internship", slug] as const,
  fellowships: ["fellowships"] as const,
  fellowship: (slug: string) => ["fellowship", slug] as const,
  jobs: (params?: Params) => ["jobs", params ?? {}] as const,
  job: (slug: string) => ["job", slug] as const,
  mentors: ["mentors"] as const,
  mentor: (id: number) => ["mentor", id] as const,
  testimonials: ["testimonials"] as const,
  dashboard: ["dashboard"] as const,
  enrollments: ["enrollments"] as const,
  projects: ["projects"] as const,
  certificates: ["certificates"] as const,
  jobApplications: ["job-applications"] as const,
  savedJobs: ["saved-jobs"] as const,
  atsReports: ["ats-reports"] as const,
  mockInterviews: ["mock-interviews"] as const,
  community: (params?: Params) => ["community", params ?? {}] as const,
  notifications: ["notifications"] as const,
  analytics: ["analytics"] as const,
  adminUsers: (params?: Params) => ["admin-users", params ?? {}] as const,
};

export function useStats() {
  return useQuery({ queryKey: queryKeys.stats, queryFn: () => get<{
    studentsTrained: number; courses: number; mentors: number; projects: number;
    hiringPartners: number; certifications: number; internships: number; fellowships: number;
  }>("/stats") });
}

export function useCourses(params?: Params) {
  return useQuery({ queryKey: queryKeys.courses(params), queryFn: () => get<Paginated<Course>>("/courses", params) });
}

export function useCourse(slug: string, options?: Partial<UseQueryOptions<Course>>) {
  return useQuery({
    queryKey: queryKeys.course(slug),
    queryFn: () => get<Course>(`/courses/${slug}`),
    enabled: Boolean(slug),
    ...options,
  });
}

export function useInternships(params?: Params) {
  return useQuery({ queryKey: queryKeys.internships(params), queryFn: () => get<Paginated<Internship>>("/internships", params) });
}

export function useInternship(slug: string) {
  return useQuery({ queryKey: queryKeys.internship(slug), queryFn: () => get<Internship>(`/internships/${slug}`), enabled: Boolean(slug) });
}

export function useFellowships() {
  return useQuery({ queryKey: queryKeys.fellowships, queryFn: () => get<Fellowship[]>("/fellowships") });
}

export function useFellowship(slug: string) {
  return useQuery({ queryKey: queryKeys.fellowship(slug), queryFn: () => get<Fellowship>(`/fellowships/${slug}`), enabled: Boolean(slug) });
}

export function useJobs(params?: Params) {
  return useQuery({ queryKey: queryKeys.jobs(params), queryFn: () => get<Paginated<Job>>("/jobs", params) });
}

export function useJob(slug: string) {
  return useQuery({ queryKey: queryKeys.job(slug), queryFn: () => get<Job>(`/jobs/${slug}`), enabled: Boolean(slug) });
}

export function useMentors() {
  return useQuery({ queryKey: queryKeys.mentors, queryFn: () => get<Mentor[]>("/mentors") });
}

export function useMentor(id: number) {
  return useQuery({ queryKey: queryKeys.mentor(id), queryFn: () => get<Mentor>(`/mentors/${id}`), enabled: Boolean(id) });
}

export function useTestimonials() {
  return useQuery({ queryKey: queryKeys.testimonials, queryFn: () => get<Review[]>("/testimonials") });
}

export interface DashboardData {
  user: User;
  stats: { courses: number; internships: number; certificates: number; projects: number; streak: number; overallProgress: number };
  enrollments: Enrollment[];
  upcomingClasses: { id: number; title: string; course: string; startsAt: string; mentor: string }[];
  pendingAssignments: { id: number; title: string; course: string; dueDate: string }[];
  projects: Project[];
  certificates: Certificate[];
  recommendedJobs: Job[];
  mentorMessages: { id: number; mentor: string; message: string; createdAt: string }[];
  activity: { id: number; label: string; createdAt: string }[];
}

export function useDashboard() {
  return useQuery({ queryKey: queryKeys.dashboard, queryFn: () => get<DashboardData>("/dashboard") });
}

export function useEnrollments() {
  return useQuery({ queryKey: queryKeys.enrollments, queryFn: () => get<Enrollment[]>("/enrollments") });
}

export function useProjects() {
  return useQuery({ queryKey: queryKeys.projects, queryFn: () => get<Project[]>("/projects") });
}

export function useCertificates() {
  return useQuery({ queryKey: queryKeys.certificates, queryFn: () => get<Certificate[]>("/certificates") });
}

export function useJobApplications() {
  return useQuery({ queryKey: queryKeys.jobApplications, queryFn: () => get<JobApplication[]>("/job-applications") });
}

export function useSavedJobs() {
  return useQuery({ queryKey: queryKeys.savedJobs, queryFn: () => get<Job[]>("/saved-jobs") });
}

export function useAtsReports() {
  return useQuery({ queryKey: queryKeys.atsReports, queryFn: () => get<AtsReport[]>("/ats/reports") });
}

export function useMockInterviews() {
  return useQuery({ queryKey: queryKeys.mockInterviews, queryFn: () => get<MockInterview[]>("/mock-interviews") });
}

export function useCommunityPosts(params?: Params) {
  return useQuery({ queryKey: queryKeys.community(params), queryFn: () => get<Paginated<CommunityPost>>("/community/posts", params) });
}

export function useNotifications() {
  return useQuery({ queryKey: queryKeys.notifications, queryFn: () => get<Notification[]>("/notifications") });
}

export function useAnalytics() {
  return useQuery({ queryKey: queryKeys.analytics, queryFn: () => get<AnalyticsSummary>("/admin/analytics") });
}

export function useAdminUsers(params?: Params) {
  return useQuery({ queryKey: queryKeys.adminUsers(params), queryFn: () => get<Paginated<User>>("/admin/users", params) });
}

export interface UpcomingClass { id: number; title: string; course: string; startsAt: string; mentor: string }
export interface PendingAssignment { id: number; title: string; course: string; dueDate: string }
export interface CoursePlayerData {
  course: { slug: string; title: string; thumbnail: string };
  modules: import("@/lib/types").CourseModule[];
  progress: { completedLessons: number; percent: number; lastLessonId: number };
}

export function useClasses() {
  return useQuery({ queryKey: ["classes"], queryFn: () => get<UpcomingClass[]>("/classes") });
}

export function useAssignments() {
  return useQuery({ queryKey: ["assignments"], queryFn: () => get<PendingAssignment[]>("/assignments") });
}

export function useCoursePlayer(slug: string) {
  return useQuery({ queryKey: ["course-player", slug], queryFn: () => get<CoursePlayerData>(`/course-player/${slug}`), enabled: Boolean(slug) });
}

export function useResumes() {
  return useQuery({ queryKey: ["resumes"], queryFn: () => get<{ id: number; title: string; template: string; data: Record<string, unknown>; updatedAt: string }[]>("/resumes") });
}

export function useMentorOverview() {
  return useQuery({
    queryKey: ["mentor-overview"],
    queryFn: () => get<{
      stats: { students: number; courses: number; pendingReviews: number; sessions: number; rating: number };
      courses: { id: number; slug: string; title: string; students: number; rating: number; status: string }[];
      students: { id: number; name: string; email: string; progress: number }[];
      upcomingSessions: { id: number; title: string; mentor: string; scheduledAt: string; status: string }[];
    }>("/mentor/overview"),
  });
}

export function useMentorStudents() {
  return useQuery({
    queryKey: ["mentor-students"],
    queryFn: () => get<{ id: number; name: string; email: string; headline?: string; progress: number; joinedAt?: string }[]>("/mentor/students"),
  });
}

export function useMentorCourses() {
  return useQuery({ queryKey: ["mentor-courses"], queryFn: () => get<Course[]>("/mentor/courses") });
}

export function useMentorProjects() {
  return useQuery({
    queryKey: ["mentor-projects"],
    queryFn: () => get<(Project & { userId?: number; submittedAt?: string })[]>("/mentor/projects"),
  });
}

export function useAdminAnalytics() {
  return useQuery({ queryKey: ["admin-analytics"], queryFn: () => get<AnalyticsSummary>("/admin/analytics") });
}

export function useAdminPayments(params?: Params) {
  return useQuery({
    queryKey: ["admin-payments", params ?? {}],
    queryFn: () => get<Paginated<Order>>("/admin/payments", params),
  });
}

export function useAdminCertificates() {
  return useQuery({
    queryKey: ["admin-certificates"],
    queryFn: () => get<(Certificate & { userId: number })[]>("/admin/certificates"),
  });
}

export interface Order {
  id: number;
  userId: number;
  program: string;
  plan?: string;
  amount: number;
  baseAmount?: number;
  discount?: number;
  status: string;
  provider: string;
  createdAt: string;
}
