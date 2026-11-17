import { ClipboardList, CalendarClock } from "lucide-react";
import { DashboardPageHeader } from "@/components/layout/dashboard-shell";
import { QueryState } from "@/components/common/query-state";
import { ListSkeletonRows } from "@/components/common/query-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useAssignments } from "@/lib/queries";
import { formatDate, daysUntil } from "@/lib/utils";

export default function Assignments() {
  const assignments = useAssignments();

  return (
    <div>
      <DashboardPageHeader title="Assignments" description="Track what's due and submit before the deadline to stay on track." />

      <QueryState
        isLoading={assignments.isLoading}
        isError={assignments.isError}
        error={assignments.error}
        onRetry={() => assignments.refetch()}
        skeleton={<ListSkeletonRows rows={4} />}
        isEmpty={(assignments.data ?? []).length === 0}
        empty={<EmptyState icon={ClipboardList} title="You're all caught up" description="No pending assignments right now. Great work!" />}
      >
        <div className="flex flex-col gap-3">
          {(assignments.data ?? []).map((assignment) => {
            const due = daysUntil(assignment.dueDate);
            const urgent = due <= 3;
            return (
              <Card key={assignment.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><ClipboardList className="size-5" /></span>
                  <div>
                    <h3 className="text-sm font-semibold">{assignment.title}</h3>
                    <p className="text-xs text-muted-foreground">{assignment.course}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={urgent ? "destructive" : "warning"} className="inline-flex items-center gap-1">
                    <CalendarClock className="size-3.5" /> {formatDate(assignment.dueDate)}
                  </Badge>
                  <Button size="sm" variant="outline">Start</Button>
                </div>
              </Card>
            );
          })}
        </div>
      </QueryState>
    </div>
  );
}
