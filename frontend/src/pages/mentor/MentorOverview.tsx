import { Link } from "react-router-dom";
import { Users, BookOpen, ClipboardCheck, CalendarClock, Star, Video, ArrowRight } from "lucide-react";
import { DashboardPageHeader } from "@/components/layout/dashboard-shell";
import { StatCard } from "@/components/common/stat-card";
import { QueryState } from "@/components/common/query-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar } from "@/components/ui/avatar";
import { useMentorOverview } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export default function MentorOverview() {
  const overview = useMentorOverview();
  const data = overview.data;

  return (
    <div>
      <DashboardPageHeader
        title="Mentor dashboard"
        description="Track your cohort's progress and stay on top of reviews and sessions."
        action={<Button variant="gradient" asChild><Link to="/mentor/projects">Review projects <ArrowRight className="size-4" /></Link></Button>}
      />

      <QueryState isLoading={overview.isLoading} isError={overview.isError} error={overview.error} onRetry={() => overview.refetch()}>
        {data && (
          <div className="flex flex-col gap-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <StatCard icon={Users} label="Students" value={data.stats.students} />
              <StatCard icon={BookOpen} label="Courses" value={data.stats.courses} />
              <StatCard icon={ClipboardCheck} label="Pending reviews" value={data.stats.pendingReviews} />
              <StatCard icon={CalendarClock} label="Sessions" value={data.stats.sessions} />
              <StatCard icon={Star} label="Rating" value={data.stats.rating.toFixed(1)} />
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
              <Card className="p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold">My courses</h2>
                  <Button variant="ghost" size="sm" asChild><Link to="/mentor/courses">Manage</Link></Button>
                </div>
                <div className="mt-4 flex flex-col gap-4">
                  {data.courses.map((course) => (
                    <div key={course.id} className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{course.title}</p>
                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{course.students} students</span>
                          <span className="inline-flex items-center gap-1"><Star className="size-3 fill-amber-400 text-amber-400" /> {course.rating}</span>
                        </div>
                      </div>
                      <Badge variant={course.status === "active" ? "success" : "outline"} className="capitalize">{course.status}</Badge>
                    </div>
                  ))}
                  {data.courses.length === 0 && <p className="text-sm text-muted-foreground">No courses assigned yet.</p>}
                </div>
              </Card>

              <Card className="p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold">Upcoming sessions</h2>
                  <Button variant="ghost" size="sm" asChild><Link to="/mentor/sessions">All</Link></Button>
                </div>
                <div className="mt-4 flex flex-col gap-3">
                  {data.upcomingSessions.map((session) => (
                    <div key={session.id} className="flex items-start gap-3">
                      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Video className="size-4" /></span>
                      <div>
                        <p className="text-sm font-medium">{session.title}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(session.scheduledAt)}</p>
                        <Badge variant="outline" className="mt-1 capitalize">{session.status}</Badge>
                      </div>
                    </div>
                  ))}
                  {data.upcomingSessions.length === 0 && <p className="text-sm text-muted-foreground">No sessions scheduled.</p>}
                </div>
              </Card>
            </div>

            <Card className="p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">Students progress</h2>
                <Button variant="ghost" size="sm" asChild><Link to="/mentor/students">View all</Link></Button>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {data.students.slice(0, 6).map((student) => (
                  <div key={student.id} className="flex items-center gap-3">
                    <Avatar name={student.name} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{student.name}</p>
                      <Progress value={student.progress} className="mt-1.5 h-1.5" />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground">{student.progress}%</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </QueryState>
    </div>
  );
}
