import {
  LayoutDashboard, BookOpen, Briefcase, FolderKanban, ClipboardList, Video,
  CalendarDays, Award, FileText, ScanSearch, BriefcaseBusiness, MessageSquare,
  MessagesSquare, Bell, User, Settings,
} from "lucide-react";
import { DashboardShell, type NavItem } from "./dashboard-shell";

const nav: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, end: true },
  { label: "My Courses", to: "/dashboard/courses", icon: BookOpen },
  { label: "My Internships", to: "/dashboard/internships", icon: Briefcase },
  { label: "My Projects", to: "/dashboard/projects", icon: FolderKanban },
  { label: "Assignments", to: "/dashboard/assignments", icon: ClipboardList },
  { label: "Classes", to: "/dashboard/classes", icon: Video },
  { label: "Calendar", to: "/dashboard/calendar", icon: CalendarDays },
  { label: "Certificates", to: "/dashboard/certificates", icon: Award },
  { label: "Resume Builder", to: "/dashboard/resume", icon: FileText },
  { label: "ATS Checker", to: "/dashboard/ats", icon: ScanSearch },
  { label: "Jobs", to: "/dashboard/jobs", icon: BriefcaseBusiness },
  { label: "Mock Interviews", to: "/dashboard/interviews", icon: MessagesSquare },
  { label: "Community", to: "/dashboard/community", icon: MessageSquare },
  { label: "Notifications", to: "/dashboard/notifications", icon: Bell },
  { label: "Profile", to: "/dashboard/profile", icon: User },
  { label: "Settings", to: "/dashboard/settings", icon: Settings },
];

export function StudentLayout() {
  return <DashboardShell nav={nav} roleLabel="Student" basePath="/dashboard" />;
}
