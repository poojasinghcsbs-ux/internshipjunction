import { Link } from "react-router-dom";
import {
  BookOpen, FolderKanban, Flame, TrendingUp, Video, ClipboardList,
  ArrowRight, Briefcase, MessageSquare, Activity, PlayCircle, CalendarDays,
} from "lucide-react";
import { DashboardPageHeader } from "@/components/layout/dashboard-shell";
import { StatCard } from "@/components/common/stat-card";
import { QueryState } from "@/components/common/query-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { JobCard } from "@/components/common/job-card";
import { useAuth } from "@/components/providers/auth-provider";
import { useDashboard } from "@/lib/queries";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function StudentDashboard() {
  const { user } = useAuth();
  const dashboard = useDashboard();
  const data = dashboard.data;

  return (
    <div>
      <DashboardPageHeader
        title={`Welcome back, ${user?.fullName?.split(" ")[0] ?? "learner"} 👋`}
        description="Here's your learning snapshot and what needs your attention today."
        action={<Button variant="gradient" asChild><Link to="/dashboard/courses">Continue learning <ArrowRight className="size-4" /></Link></Button>}
      />

      <QueryState
        isLoading={dashboard.isLoading}
        isError={dashboard.isError}
        error={dashboard.error}
        onRetry={() => dashboard.refetch()}
      >
        {data && (
          <div className="flex flex-col gap-6">
            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={BookOpen} label="Active courses" value={data.stats.courses} hint={`${data.stats.overallProgress}% average progress`} />
              <StatCard icon={Briefcase} label="Internships" value={data.stats.internships} hint="In progress" />
              <StatCard icon={FolderKanban} label="Projects" value={data.stats.projects} hint="Across your courses" />
              <StatCard icon={Flame} label="Learning streak" value={`${data.stats.streak} days`} hint="Keep it going!" />
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
              {/* Left column */}
              <div className="flex flex-col gap-6">
                {/* Continue learning */}
                <Card className="p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold">Continue learning</h2>
                    <Button variant="ghost" size="sm" asChild><Link to="/dashboard/courses">View all</Link></Button>
                  </div>
                  <div className="mt-4 flex flex-col gap-4">
                    {data.enrollments.slice(0, 3).map((enrollment) => (
                      <div key={enrollment.id} className="flex items-center gap-4">
                        <img src={enrollment.thumbnail} alt={enrollment.title} className="size-14 rounded-lg object-cover" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-semibold">{enrollment.title}</p>
                            <span className="text-xs font-medium text-muted-foreground">{enrollment.progress}%</span>
                          </div>
                          <Progress value={enrollment.progress} className="mt-2 h-1.5" />
                          <div className="mt-1.5 flex items-center gap-2">
                            <Badge variant="outline" className="font-normal capitalize">{enrollment.programType}</Badge>
                            <Badge variant="secondary" className="font-normal capitalize">{enrollment.plan}</Badge>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <Link to={enrollment.programType === "course" ? "/dashboard/courses" : "/dashboard/internships"}>
                            <PlayCircle className="size-4" /> Resume
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Projects */}
                <Card className="p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold">Your projects</h2>
                    <Button variant="ghost" size="sm" asChild><Link to="/dashboard/projects">Manage</Link></Button>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {data.projects.slice(0, 4).map((project) => (
                      <div key={project.id} className="rounded-xl border border-border p-4">
                        <div className="flex items-start justify-between gap-2">
                          <p className="line-clamp-2 text-sm font-semibold">{project.title}</p>
                          <Badge variant="outline" className="font-normal">{project.difficulty}</Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{project.courseTitle}</p>
                        <p className="mt-2 text-xs capitalize text-muted-foreground">{project.status.replace("-", " ")}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Recommended jobs */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-base font-semibold">Recommended jobs</h2>
                    <Button variant="ghost" size="sm" asChild><Link to="/dashboard/jobs">View all</Link></Button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {data.recommendedJobs.slice(0, 2).map((job) => <JobCard key={job.id} job={job} />)}
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div className="flex flex-col gap-6">
                {/* Upcoming classes */}
                <Card className="p-5">
                  <h2 className="flex items-center gap-2 text-base font-semibold"><Video className="size-4 text-primary" /> Upcoming classes</h2>
                  <div className="mt-4 flex flex-col gap-3">
                    {data.upcomingClasses.map((cls) => (
                      <div key={cls.id} className="flex items-start gap-3">
                        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                          {new Date(cls.startsAt).getDate()}
                        </span>
                        <div>
                          <p className="text-sm font-medium">{cls.title}</p>
                          <p className="text-xs text-muted-foreground">{cls.course}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(cls.startsAt)} · with {cls.mentor}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="mt-4 w-full" asChild><Link to="/dashboard/classes"><CalendarDays className="size-4" /> All classes</Link></Button>
                </Card>

                {/* Pending assignments */}
                <Card className="p-5">
                  <h2 className="flex items-center gap-2 text-base font-semibold"><ClipboardList className="size-4 text-primary" /> Pending assignments</h2>
                  <div className="mt-4 flex flex-col gap-3">
                    {data.pendingAssignments.map((assignment) => (
                      <div key={assignment.id} className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">{assignment.title}</p>
                          <p className="text-xs text-muted-foreground">{assignment.course}</p>
                        </div>
                        <Badge variant="warning" className="shrink-0">{formatDate(assignment.dueDate)}</Badge>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="mt-4 w-full" asChild><Link to="/dashboard/assignments">View assignments</Link></Button>
                </Card>

                {/* Mentor messages */}
                <Card className="p-5">
                  <h2 className="flex items-center gap-2 text-base font-semibold"><MessageSquare className="size-4 text-primary" /> Mentor messages</h2>
                  <div className="mt-4 flex flex-col gap-3">
                    {data.mentorMessages.map((message) => (
                      <div key={message.id} className="rounded-lg border border-border p-3">
                        <p className="text-sm">{message.message}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{message.mentor} · {formatDate(message.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Activity */}
                <Card className="p-5">
                  <h2 className="flex items-center gap-2 text-base font-semibold"><Activity className="size-4 text-primary" /> Recent activity</h2>
                  <div className="mt-4 flex flex-col gap-3">
                    {data.activity.map((item, index) => (
                      <div key={item.id} className="flex items-start gap-3">
                        <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", index === 0 ? "bg-primary" : "bg-border")} />
                        <div>
                          <p className="text-sm">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Progress summary */}
                <Card className="p-5">
                  <h2 className="flex items-center gap-2 text-base font-semibold"><TrendingUp className="size-4 text-primary" /> Overall progress</h2>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="relative flex size-20 items-center justify-center">
                      <svg viewBox="0 0 36 36" className="size-20 -rotate-90">
                        <circle cx="18" cy="18" r="15.9" fill="none" className="stroke-muted" strokeWidth="3" />
                        <circle cx="18" cy="18" r="15.9" fill="none" className="stroke-primary" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${data.stats.overallProgress} 100`} />
                      </svg>
                      <span className="absolute text-sm font-bold">{data.stats.overallProgress}%</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p className="font-semibold text-foreground">{data.certificates.length} certificates earned</p>
                      <p className="mt-1">You're making steady progress. Complete 2 more lessons this week to stay on track.</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
      </QueryState>
    </div>
  );
}
