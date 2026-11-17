import { Link } from "react-router-dom";
import { BookOpen, Users, Star, Clock, Eye } from "lucide-react";
import { DashboardPageHeader } from "@/components/layout/dashboard-shell";
import { QueryState } from "@/components/common/query-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useMentorCourses } from "@/lib/queries";

export default function MentorCourses() {
  const courses = useMentorCourses();

  return (
    <div>
      <DashboardPageHeader title="My courses" description="The courses you mentor and their performance." />

      <QueryState
        isLoading={courses.isLoading}
        isError={courses.isError}
        error={courses.error}
        onRetry={() => courses.refetch()}
        isEmpty={(courses.data ?? []).length === 0}
        empty={<EmptyState icon={BookOpen} title="No courses assigned" description="You aren't mentoring any courses yet." />}
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {(courses.data ?? []).map((course) => (
            <Card key={course.id} className="flex flex-col overflow-hidden">
              <div className="relative aspect-video bg-muted">
                <img src={course.thumbnail} alt={course.title} className="size-full object-cover" />
                <Badge variant={course.status === "active" ? "success" : "outline"} className="absolute left-3 top-3 bg-background/90 capitalize backdrop-blur">{course.status}</Badge>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-4">
                <div>
                  <h3 className="line-clamp-2 text-base font-semibold">{course.title}</h3>
                  <p className="text-xs text-muted-foreground">{course.category} · {course.level}</p>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Users className="size-3.5" /> {course.studentsCount}</span>
                  <span className="inline-flex items-center gap-1"><Star className="size-3.5 fill-amber-400 text-amber-400" /> {course.rating}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="size-3.5" /> {course.duration}</span>
                </div>
                <div className="mt-auto flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" asChild><Link to={`/course/${course.slug}`}><Eye className="size-4" /> View</Link></Button>
                  <Button size="sm" variant="ghost">Analytics</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </QueryState>
    </div>
  );
}
