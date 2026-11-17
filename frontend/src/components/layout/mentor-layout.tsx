import {
  LayoutDashboard, Users, BookOpen, Video, FolderKanban, Star,
  HelpCircle, Mail, CalendarClock, Bell,
} from "lucide-react";
import { DashboardShell, type NavItem } from "./dashboard-shell";

const nav: NavItem[] = [
  { label: "Overview", to: "/mentor", icon: LayoutDashboard, end: true },
  { label: "Students", to: "/mentor/students", icon: Users },
  { label: "Courses", to: "/mentor/courses", icon: BookOpen },
  { label: "Classes", to: "/mentor/classes", icon: Video },
  { label: "Projects", to: "/mentor/projects", icon: FolderKanban },
  { label: "Reviews", to: "/mentor/reviews", icon: Star },
  { label: "Questions", to: "/mentor/questions", icon: HelpCircle },
  { label: "Messages", to: "/mentor/messages", icon: Mail },
  { label: "Sessions", to: "/mentor/sessions", icon: CalendarClock },
  { label: "Notifications", to: "/mentor/notifications", icon: Bell },
];

export function MentorLayout() {
  return <DashboardShell nav={nav} roleLabel="Mentor" basePath="/mentor" />;
}
