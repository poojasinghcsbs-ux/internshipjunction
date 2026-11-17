import {
  LayoutDashboard, Users, BookOpen, Briefcase, Sparkles, FolderKanban,
  BriefcaseBusiness, CreditCard, Award, BarChart3, Bell,
} from "lucide-react";
import { DashboardShell, type NavItem } from "./dashboard-shell";

const nav: NavItem[] = [
  { label: "Overview", to: "/admin", icon: LayoutDashboard, end: true },
  { label: "Users", to: "/admin/users", icon: Users },
  { label: "Courses", to: "/admin/courses", icon: BookOpen },
  { label: "Internships", to: "/admin/internships", icon: Briefcase },
  { label: "Fellowships", to: "/admin/fellowships", icon: Sparkles },
  { label: "Projects", to: "/admin/projects", icon: FolderKanban },
  { label: "Jobs", to: "/admin/jobs", icon: BriefcaseBusiness },
  { label: "Payments", to: "/admin/payments", icon: CreditCard },
  { label: "Certificates", to: "/admin/certificates", icon: Award },
  { label: "Analytics", to: "/admin/analytics", icon: BarChart3 },
  { label: "Notifications", to: "/admin/notifications", icon: Bell },
];

export function AdminLayout() {
  return <DashboardShell nav={nav} roleLabel="Admin" basePath="/admin" />;
}
