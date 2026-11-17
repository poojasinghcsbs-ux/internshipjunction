import { useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Briefcase, Award, ArrowRight } from "lucide-react";
import { DashboardPageHeader } from "@/components/layout/dashboard-shell";
import { QueryState } from "@/components/common/query-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { useEnrollments } from "@/lib/queries";
import { formatDate } from "@/lib/utils";
import type { Enrollment } from "@/lib/types";

const iconFor = { course: GraduationCap, internship: Briefcase, fellowship: Award } as const;

function EnrollmentGrid({ items }: { items: Enrollment[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={GraduationCap}
        title="No enrollments here yet"
        description="Browse our programs and enroll to start learning and building."
        action={<Button asChild><Link to="/courses">Explore programs</Link></Button>}
      />
    );
  }
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((enrollment) => {
        const Icon = iconFor[enrollment.programType];
        return (
          <Card key={enrollment.id} className="flex flex-col overflow-hidden">
            <div className="relative aspect-video overflow-hidden bg-muted">
              <img src={enrollment.thumbnail} alt={enrollment.title} className="size-full object-cover" />
              <Badge variant="secondary" className="absolute left-3 top-3 bg-background/90 capitalize backdrop-blur">
                <Icon className="mr-1 size-3.5" /> {enrollment.programType}
              </Badge>
            </div>
            <div className="flex flex-1 flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="line-clamp-2 text-base font-semibold">{enrollment.title}</h3>
                <Badge variant={enrollment.status === "completed" ? "success" : "outline"} className="shrink-0 capitalize">{enrollment.status}</Badge>
              </div>
              <div className="mt-auto flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span className="font-semibold text-foreground">{enrollment.progress}%</span>
                </div>
                <Progress value={enrollment.progress} className="h-1.5" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <Badge variant="secondary" className="font-normal capitalize">{enrollment.plan}</Badge>
                  <span>{formatDate(enrollment.enrolledAt)}</span>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export default function MyEnrollments() {
  const enrollments = useEnrollments();
  const [tab, setTab] = useState("all");
  const data = enrollments.data ?? [];
  const filtered = tab === "all" ? data : data.filter((e) => e.programType === tab);

  return (
    <div>
      <DashboardPageHeader
        title="My enrollments"
        description="Every course, internship and fellowship you're part of — in one place."
        action={<Button variant="outline" asChild><Link to="/internships">Find internships <ArrowRight className="size-4" /></Link></Button>}
      />

      <QueryState
        isLoading={enrollments.isLoading}
        isError={enrollments.isError}
        error={enrollments.error}
        onRetry={() => enrollments.refetch()}
        skeleton={<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-64 animate-pulse rounded-xl bg-muted" />)}</div>}
      >
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="all">All ({data.length})</TabsTrigger>
            <TabsTrigger value="course">Courses ({data.filter((e) => e.programType === "course").length})</TabsTrigger>
            <TabsTrigger value="internship">Internships ({data.filter((e) => e.programType === "internship").length})</TabsTrigger>
            <TabsTrigger value="fellowship">Fellowships ({data.filter((e) => e.programType === "fellowship").length})</TabsTrigger>
          </TabsList>
          <TabsContent value={tab} className="mt-6">
            <EnrollmentGrid items={filtered} />
          </TabsContent>
        </Tabs>
      </QueryState>
    </div>
  );
}
