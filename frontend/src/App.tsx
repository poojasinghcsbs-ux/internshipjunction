import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { PublicLayout } from "@/components/layout/public-layout";
import { ProtectedRoute } from "@/components/layout/protected-route";
import { StudentLayout } from "@/components/layout/student-layout";
import { MentorLayout } from "@/components/layout/mentor-layout";
import { AdminLayout } from "@/components/layout/admin-layout";

const Home = lazy(() => import("@/pages/Home"));
const Courses = lazy(() => import("@/pages/Courses"));
const CourseDetail = lazy(() => import("@/pages/CourseDetail"));
const Internships = lazy(() => import("@/pages/Internships"));
const InternshipDetail = lazy(() => import("@/pages/InternshipDetail"));
const Fellowships = lazy(() => import("@/pages/Fellowships"));
const FellowshipDetail = lazy(() => import("@/pages/FellowshipDetail"));
const Jobs = lazy(() => import("@/pages/Jobs"));
const JobDetail = lazy(() => import("@/pages/JobDetail"));
const Mentors = lazy(() => import("@/pages/Mentors"));
const Resources = lazy(() => import("@/pages/Resources"));
const About = lazy(() => import("@/pages/About"));
const Pricing = lazy(() => import("@/pages/Pricing"));
const Contact = lazy(() => import("@/pages/Contact"));
const VerifyCertificate = lazy(() => import("@/pages/VerifyCertificate"));
const Legal = lazy(() => import("@/pages/Legal"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const StudentDashboard = lazy(() => import("@/pages/student/Dashboard"));
const MyCourses = lazy(() => import("@/pages/student/MyCourses"));
const CoursePlayer = lazy(() => import("@/pages/student/CoursePlayer"));
const MyEnrollments = lazy(() => import("@/pages/student/MyEnrollments"));
const MyProjects = lazy(() => import("@/pages/student/MyProjects"));
const Assignments = lazy(() => import("@/pages/student/Assignments"));
const Classes = lazy(() => import("@/pages/student/Classes"));
const CalendarPage = lazy(() => import("@/pages/student/CalendarPage"));
const Certificates = lazy(() => import("@/pages/student/Certificates"));
const ResumeBuilder = lazy(() => import("@/pages/student/ResumeBuilder"));
const AtsChecker = lazy(() => import("@/pages/student/AtsChecker"));
const StudentJobs = lazy(() => import("@/pages/student/StudentJobs"));
const MockInterviews = lazy(() => import("@/pages/student/MockInterviews"));
const Community = lazy(() => import("@/pages/student/Community"));
const Notifications = lazy(() => import("@/pages/student/Notifications"));
const Profile = lazy(() => import("@/pages/student/Profile"));
const Settings = lazy(() => import("@/pages/student/Settings"));

const MentorOverview = lazy(() => import("@/pages/mentor/MentorOverview"));
const MentorStudents = lazy(() => import("@/pages/mentor/MentorStudents"));
const MentorCourses = lazy(() => import("@/pages/mentor/MentorCourses"));
const MentorProjects = lazy(() => import("@/pages/mentor/MentorProjects"));
const MentorSimple = lazy(() => import("@/pages/mentor/MentorSimple"));

const AdminOverview = lazy(() => import("@/pages/admin/AdminOverview"));
const AdminAnalytics = lazy(() => import("@/pages/admin/AdminAnalytics"));
const AdminUsers = lazy(() => import("@/pages/admin/AdminUsers"));
const AdminCourses = lazy(() => import("@/pages/admin/AdminCourses"));
const AdminContent = lazy(() => import("@/pages/admin/AdminContent"));
const AdminPayments = lazy(() => import("@/pages/admin/AdminPayments"));
const AdminCertificates = lazy(() => import("@/pages/admin/AdminCertificates"));

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <span className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/course/:slug" element={<CourseDetail />} />
          <Route path="/internships" element={<Internships />} />
          <Route path="/internship/:slug" element={<InternshipDetail />} />
          <Route path="/fellowships" element={<Fellowships />} />
          <Route path="/fellowship/:slug" element={<FellowshipDetail />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/job/:slug" element={<JobDetail />} />
          <Route path="/mentors" element={<Mentors />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/about" element={<About />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/verify-certificate" element={<VerifyCertificate />} />
          <Route path="/verify-certificate/:certificateId" element={<VerifyCertificate />} />
          <Route path="/privacy-policy" element={<Legal kind="privacy" />} />
          <Route path="/terms-and-conditions" element={<Legal kind="terms" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route element={<ProtectedRoute roles={["student"]} />}>
          <Route element={<StudentLayout />}>
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/dashboard/courses" element={<MyCourses />} />
            <Route path="/dashboard/courses/:slug/player" element={<CoursePlayer />} />
            <Route path="/dashboard/internships" element={<MyEnrollments />} />
            <Route path="/dashboard/projects" element={<MyProjects />} />
            <Route path="/dashboard/assignments" element={<Assignments />} />
            <Route path="/dashboard/classes" element={<Classes />} />
            <Route path="/dashboard/calendar" element={<CalendarPage />} />
            <Route path="/dashboard/certificates" element={<Certificates />} />
            <Route path="/dashboard/resume" element={<ResumeBuilder />} />
            <Route path="/dashboard/ats" element={<AtsChecker />} />
            <Route path="/dashboard/jobs" element={<StudentJobs />} />
            <Route path="/dashboard/interviews" element={<MockInterviews />} />
            <Route path="/dashboard/community" element={<Community />} />
            <Route path="/dashboard/notifications" element={<Notifications />} />
            <Route path="/dashboard/profile" element={<Profile />} />
            <Route path="/dashboard/settings" element={<Settings />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={["mentor"]} />}>
          <Route element={<MentorLayout />}>
            <Route path="/mentor" element={<MentorOverview />} />
            <Route path="/mentor/students" element={<MentorStudents />} />
            <Route path="/mentor/courses" element={<MentorCourses />} />
            <Route path="/mentor/classes" element={<MentorSimple kind="classes" />} />
            <Route path="/mentor/projects" element={<MentorProjects />} />
            <Route path="/mentor/reviews" element={<MentorSimple kind="reviews" />} />
            <Route path="/mentor/questions" element={<MentorSimple kind="questions" />} />
            <Route path="/mentor/messages" element={<MentorSimple kind="messages" />} />
            <Route path="/mentor/sessions" element={<MentorSimple kind="sessions" />} />
            <Route path="/mentor/notifications" element={<Notifications />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={["admin"]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminOverview />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/courses" element={<AdminCourses />} />
            <Route path="/admin/internships" element={<AdminContent kind="internships" />} />
            <Route path="/admin/fellowships" element={<AdminContent kind="fellowships" />} />
            <Route path="/admin/projects" element={<AdminContent kind="projects" />} />
            <Route path="/admin/jobs" element={<AdminContent kind="jobs" />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/admin/certificates" element={<AdminCertificates />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/notifications" element={<Notifications />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
