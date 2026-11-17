import { Link } from "react-router-dom";
import { BookOpen, PlayCircle, Clock, ArrowRight } from "lucide-react";
import { DashboardPageHeader } from "@/components/layout/dashboard-shell";
import { QueryState } from "@/components/common/query-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useCourses, useEnrollments } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export default function MyCourses() {
  const enrollments = useEnrollments();
  const courses = useCourses({ pageSize: 50 });

  const courseEnrollments = enrollments.data?.filter((e) => e.programType === "course") ?? [];
  const slugById = new Map(courses.data?.data.map((c) => [c.id, c.slug]) ?? []);
  const courseById = new Map(courses.data?.data.map((c) => [c.id, c]) ?? []);

  return (
    <div>
      <DashboardPageHeader
        title="My courses"
        description="Pick up where you left off and keep building momentum."
        action={<Button variant="outline" asChild><Link to="/courses">Browse more courses</Link></Button>}
      />

      <QueryState
        isLoading={enrollments.isLoading || courses.isLoading}
        isError={enrollments.isError}
        error={enrollments.error}
        onRetry={() => enrollments.refetch()}
        skeleton={
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}
          </div>
        }
        isEmpty={courseEnrollments.length === 0}
        empty={
          <EmptyState
            icon={BookOpen}
            title="You haven't enrolled in a course yet"
            description="Explore our project-based courses and start building job-ready skills today."
            action={<Button asChild><Link to="/courses">Explore courses</Link></Button>}
          />
        }
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courseEnrollments.map((enrollment) => {
            const slug = slugById.get(enrollment.programId);
            const course = courseById.get(enrollment.programId);
            return (
              <Card key={enrollment.id} className="flex flex-col overflow-hidden">
                <div className="relative aspect-video overflow-hidden bg-muted">
                  <img src={enrollment.thumbnail} alt={enrollment.title} className="size-full object-cover" />
                  <Badge variant="success" className="absolute left-3 top-3 bg-background/90 backdrop-blur">
                    {enrollment.progress >= 100 ? "Completed" : "In progress"}
                  </Badge>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <h3 className="line-clamp-2 text-base font-semibold">{enrollment.title}</h3>
                  {course && (
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Clock className="size-3.5" /> {course.duration}</span>
                      <Badge variant="outline" className="font-normal">{course.level}</Badge>
                    </div>
                  )}
                  <div className="mt-auto flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span className="font-semibold text-foreground">{enrollment.progress}%</span>
                    </div>
                    <Progress value={enrollment.progress} className="h-1.5" />
                    <p className="text-xs text-muted-foreground">Enrolled {formatDate(enrollment.enrolledAt)}</p>
                    <Button variant="gradient" size="sm" className="mt-1" asChild disabled={!slug}>
                      <Link to={slug ? `/dashboard/courses/${slug}/player` : "/dashboard/courses"}>
                        <PlayCircle className="size-4" /> {enrollment.progress === 0 ? "Start" : "Continue"}
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-border bg-muted/40 p-8 text-center">
          <h2 className="text-lg font-bold">Want to go deeper?</h2>
          <p className="max-w-md text-sm text-muted-foreground">Apply your skills in a real internship or career fellowship with placement support.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild><Link to="/internships">Explore internships <ArrowRight className="size-4" /></Link></Button>
            <Button variant="outline" asChild><Link to="/fellowships">View fellowships</Link></Button>
          </div>
        </div>
      </QueryState>
    </div>
  );
}
