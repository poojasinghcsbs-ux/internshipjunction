import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Video, ClipboardList } from "lucide-react";
import { DashboardPageHeader } from "@/components/layout/dashboard-shell";
import { QueryState } from "@/components/common/query-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@/lib/queries";
import { cn } from "@/lib/utils";

interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  subtitle: string;
  kind: "class" | "assignment";
}

export default function CalendarPage() {
  const dashboard = useDashboard();
  const [cursor, setCursor] = useState(() => new Date());

  const events = useMemo<CalendarEvent[]>(() => {
    if (!dashboard.data) return [];
    const classes = dashboard.data.upcomingClasses.map((c) => ({
      id: `class-${c.id}`, date: c.startsAt, title: c.title, subtitle: `Live class · ${c.mentor}`, kind: "class" as const,
    }));
    const assignments = dashboard.data.pendingAssignments.map((a) => ({
      id: `assignment-${a.id}`, date: a.dueDate, title: a.title, subtitle: `Due · ${a.course}`, kind: "assignment" as const,
    }));
    return [...classes, ...assignments];
  }, [dashboard.data]);

  const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
  const startWeekday = monthStart.getDay();
  const daysInMonth = monthEnd.getDate();

  const eventsByDay = useMemo(() => {
    const map = new Map<number, CalendarEvent[]>();
    events.forEach((event) => {
      const date = new Date(event.date);
      if (date.getMonth() === cursor.getMonth() && date.getFullYear() === cursor.getFullYear()) {
        const day = date.getDate();
        map.set(day, [...(map.get(day) ?? []), event]);
      }
    });
    return map;
  }, [events, cursor]);

  const cells: (number | null)[] = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const today = new Date();

  return (
    <div>
      <DashboardPageHeader title="Calendar" description="Your classes, deadlines and milestones at a glance." />

      <QueryState
        isLoading={dashboard.isLoading}
        isError={dashboard.isError}
        error={dashboard.error}
        onRetry={() => dashboard.refetch()}
        skeleton={<Skeleton className="h-[420px] w-full" />}
      >
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">{cursor.toLocaleString("en", { month: "long", year: "numeric" })}</h2>
              <div className="flex gap-1">
                <Button variant="outline" size="icon-sm" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}><ChevronLeft className="size-4" /></Button>
                <Button variant="outline" size="sm" onClick={() => setCursor(new Date())}>Today</Button>
                <Button variant="outline" size="icon-sm" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}><ChevronRight className="size-4" /></Button>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d} className="py-1">{d}</div>)}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1">
              {cells.map((day, index) => {
                const dayEvents = day ? eventsByDay.get(day) ?? [] : [];
                const isToday = day === today.getDate() && cursor.getMonth() === today.getMonth() && cursor.getFullYear() === today.getFullYear();
                return (
                  <div
                    key={index}
                    className={cn(
                      "flex min-h-20 flex-col gap-1 rounded-lg border p-1.5 text-left",
                      day ? "border-border" : "border-transparent",
                      isToday && "border-primary bg-primary/5"
                    )}
                  >
                    {day && <span className={cn("text-xs font-medium", isToday && "text-primary")}>{day}</span>}
                    {dayEvents.slice(0, 2).map((event) => (
                      <span key={event.id} className={cn("truncate rounded px-1 py-0.5 text-[10px]", event.kind === "class" ? "bg-primary/10 text-primary" : "bg-amber-500/10 text-amber-600")}>
                        {event.title}
                      </span>
                    ))}
                    {dayEvents.length > 2 && <span className="px-1 text-[10px] text-muted-foreground">+{dayEvents.length - 2} more</span>}
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-base font-semibold">Upcoming</h2>
            <div className="mt-4 flex flex-col gap-3">
              {events
                .filter((e) => new Date(e.date) >= new Date(today.toDateString()))
                .sort((a, b) => +new Date(a.date) - +new Date(b.date))
                .slice(0, 8)
                .map((event) => (
                  <div key={event.id} className="flex items-start gap-3">
                    <span className={cn("mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg", event.kind === "class" ? "bg-primary/10 text-primary" : "bg-amber-500/10 text-amber-600")}>
                      {event.kind === "class" ? <Video className="size-4" /> : <ClipboardList className="size-4" />}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event.subtitle}</p>
                      <Badge variant="outline" className="mt-1 font-normal">
                        {new Date(event.date).toLocaleDateString("en", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </Badge>
                    </div>
                  </div>
                ))}
              {events.length === 0 && <p className="text-sm text-muted-foreground">No events scheduled.</p>}
            </div>
          </Card>
        </div>
      </QueryState>
    </div>
  );
}
