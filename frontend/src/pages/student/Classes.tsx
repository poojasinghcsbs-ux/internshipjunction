import { Video, Clock, User, CalendarDays } from "lucide-react";
import { DashboardPageHeader } from "@/components/layout/dashboard-shell";
import { QueryState } from "@/components/common/query-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useClasses } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export default function Classes() {
  const classes = useClasses();

  return (
    <div>
      <DashboardPageHeader title="Live classes" description="Join live mentor-led sessions and catch up on recordings." />

      <QueryState
        isLoading={classes.isLoading}
        isError={classes.isError}
        error={classes.error}
        onRetry={() => classes.refetch()}
        skeleton={<div className="grid gap-4 md:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />)}</div>}
        isEmpty={(classes.data ?? []).length === 0}
        empty={<EmptyState icon={CalendarDays} title="No live classes scheduled" description="Your mentor will schedule sessions soon. Check back later." />}
      >
        <div className="grid gap-4 md:grid-cols-2">
          {(classes.data ?? []).map((cls) => (
            <Card key={cls.id} className="flex flex-col gap-4 p-5">
              <div className="flex items-start gap-3">
                <span className="flex size-11 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <span className="text-sm font-bold leading-none">{new Date(cls.startsAt).getDate()}</span>
                  <span className="text-[10px] uppercase leading-none">{new Date(cls.startsAt).toLocaleString("en", { month: "short" })}</span>
                </span>
                <div>
                  <h3 className="text-sm font-semibold">{cls.title}</h3>
                  <p className="text-xs text-muted-foreground">{cls.course}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Clock className="size-3.5" /> {formatDate(cls.startsAt)}</span>
                <span className="inline-flex items-center gap-1"><User className="size-3.5" /> {cls.mentor}</span>
                <Badge variant="secondary" className="font-normal">Live</Badge>
              </div>
              <Button variant="gradient" size="sm" className="mt-auto"><Video className="size-4" /> Join class</Button>
            </Card>
          ))}
        </div>
      </QueryState>
    </div>
  );
}
