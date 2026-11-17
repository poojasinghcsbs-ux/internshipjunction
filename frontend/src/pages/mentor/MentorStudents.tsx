import { Users } from "lucide-react";
import { DashboardPageHeader } from "@/components/layout/dashboard-shell";
import { QueryState, ListSkeletonRows } from "@/components/common/query-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { useMentorStudents } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export default function MentorStudents() {
  const students = useMentorStudents();

  return (
    <div>
      <DashboardPageHeader title="Students" description="Monitor progress and keep your cohort engaged." />

      <QueryState
        isLoading={students.isLoading}
        isError={students.isError}
        error={students.error}
        onRetry={() => students.refetch()}
        skeleton={<ListSkeletonRows rows={6} />}
        isEmpty={(students.data ?? []).length === 0}
        empty={<EmptyState icon={Users} title="No students yet" description="Students will appear here once they enroll in your courses." />}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(students.data ?? []).map((student) => (
            <Card key={student.id} className="flex flex-col gap-3 p-5">
              <div className="flex items-center gap-3">
                <Avatar name={student.name} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{student.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{student.email}</p>
                </div>
              </div>
              {student.headline && <p className="text-xs text-muted-foreground">{student.headline}</p>}
              <div className="mt-auto flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold">{student.progress}%</span>
                </div>
                <Progress value={student.progress} className="h-1.5" />
                <div className="flex items-center justify-between">
                  {student.joinedAt && <span className="text-xs text-muted-foreground">Joined {formatDate(student.joinedAt)}</span>}
                  <Badge variant={student.progress >= 70 ? "success" : "secondary"} className="font-normal">{student.progress >= 70 ? "On track" : "Needs nudge"}</Badge>
                </div>
                <Button size="sm" variant="outline" className="mt-1">Message</Button>
              </div>
            </Card>
          ))}
        </div>
      </QueryState>
    </div>
  );
}
