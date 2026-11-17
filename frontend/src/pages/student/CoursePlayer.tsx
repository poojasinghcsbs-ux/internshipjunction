import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  BookOpen, Video, CheckCircle2, PlayCircle, ChevronLeft, ChevronRight,
  Download, FileText, HelpCircle, ClipboardList, Radio, Check,
} from "lucide-react";
import { DashboardPageHeader } from "@/components/layout/dashboard-shell";
import { QueryState } from "@/components/common/query-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useCoursePlayer } from "@/lib/queries";
import { cn } from "@/lib/utils";
import type { Lesson } from "@/lib/types";

const typeIcon: Record<string, typeof Video> = {
  video: Video,
  reading: FileText,
  quiz: HelpCircle,
  assignment: ClipboardList,
  live: Radio,
};

export default function CoursePlayer() {
  const { slug = "" } = useParams();
  const player = useCoursePlayer(slug);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  const lessons = useMemo(() => {
    if (!player.data) return [] as (Lesson & { moduleTitle: string })[];
    return player.data.modules.flatMap((module) => module.lessons.map((lesson) => ({ ...lesson, moduleTitle: module.title })));
  }, [player.data]);

  const activeIndex = useMemo(() => {
    if (currentId == null) return 0;
    const index = lessons.findIndex((l) => l.id === currentId);
    return index >= 0 ? index : 0;
  }, [currentId, lessons]);

  const active = lessons[activeIndex];
  const percent = lessons.length ? Math.round((completed.size / lessons.length) * 100) : 0;

  const toggleComplete = (id: number) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div>
      <DashboardPageHeader
        title={player.data?.course.title ?? "Course player"}
        description="Watch lessons, complete readings and track your progress."
        action={<Button variant="outline" asChild><Link to="/dashboard/courses">Back to my courses</Link></Button>}
      />

      <QueryState
        isLoading={player.isLoading}
        isError={player.isError}
        error={player.error}
        onRetry={() => player.refetch()}
        skeleton={<div className="grid gap-6 lg:grid-cols-[1fr_340px]"><Skeleton className="aspect-video w-full" /><Skeleton className="h-96 w-full" /></div>}
      >
        {player.data && active && (
          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <div className="flex flex-col gap-5">
              {/* Video / lesson stage */}
              <div className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-black">
                {player.data.course.thumbnail ? (
                  <img src={player.data.course.thumbnail} alt={active.title} className="size-full object-cover opacity-60" />
                ) : null}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center text-white">
                  <span className="flex size-16 items-center justify-center rounded-full bg-white/90 text-primary"><PlayCircle className="size-8" /></span>
                  <p className="px-6 text-lg font-semibold">{active.title}</p>
                  <Badge className="border-transparent bg-white/20 text-white capitalize">{active.type} · {active.duration}</Badge>
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={activeIndex === 0} onClick={() => setCurrentId(lessons[activeIndex - 1].id)}>
                    <ChevronLeft className="size-4" /> Previous
                  </Button>
                  <Button variant="outline" size="sm" disabled={activeIndex >= lessons.length - 1} onClick={() => setCurrentId(lessons[activeIndex + 1].id)}>
                    Next <ChevronRight className="size-4" />
                  </Button>
                </div>
                <Button
                  variant={completed.has(active.id) ? "success" : "gradient"}
                  size="sm"
                  onClick={() => toggleComplete(active.id)}
                >
                  <Check className="size-4" /> {completed.has(active.id) ? "Completed" : "Mark as complete"}
                </Button>
              </div>

              {/* Lesson info */}
              <Card className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-base font-semibold">{active.title}</h2>
                  <Badge variant="outline" className="font-normal">{active.moduleTitle}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Lesson {activeIndex + 1} of {lessons.length} · {active.duration}. {active.isPreview ? "This is a preview lesson." : "Complete this lesson to unlock the next milestone."}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button variant="outline" size="sm"><Download className="size-4" /> Download resources</Button>
                  <Button variant="outline" size="sm"><BookOpen className="size-4" /> Lesson notes</Button>
                </div>
              </Card>
            </div>

            {/* Sidebar: curriculum */}
            <aside>
              <div className="lg:sticky lg:top-24">
                <Card className="p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold">Curriculum</h2>
                    <span className="text-sm font-semibold text-primary">{percent}%</span>
                  </div>
                  <Progress value={percent} className="mt-3 h-1.5" />
                  <p className="mt-2 text-xs text-muted-foreground">{completed.size} of {lessons.length} lessons completed</p>

                  <div className="mt-5 flex flex-col gap-4">
                    {player.data.modules.map((module, moduleIndex) => (
                      <div key={module.id}>
                        <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          <span className="flex size-5 items-center justify-center rounded bg-primary/10 text-[10px] font-bold text-primary">{moduleIndex + 1}</span>
                          {module.title}
                        </p>
                        <div className="flex flex-col gap-1">
                          {module.lessons.map((lesson) => {
                            const Icon = typeIcon[lesson.type] ?? Video;
                            const isActive = lesson.id === active.id;
                            const isDone = completed.has(lesson.id);
                            return (
                              <button
                                key={lesson.id}
                                type="button"
                                onClick={() => setCurrentId(lesson.id)}
                                className={cn(
                                  "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                              >
                                {isDone ? <CheckCircle2 className="size-4 shrink-0 text-success" /> : <Icon className="size-4 shrink-0" />}
                                <span className="line-clamp-2 flex-1">{lesson.title}</span>
                                <span className="text-[10px] text-muted-foreground">{lesson.duration}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </aside>
          </div>
        )}
      </QueryState>
    </div>
  );
}
