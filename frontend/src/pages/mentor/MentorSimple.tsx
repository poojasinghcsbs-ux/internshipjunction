import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Video, Star, HelpCircle, MessageSquare, CalendarClock, Users, Send, CheckCircle2,
} from "lucide-react";
import { DashboardPageHeader } from "@/components/layout/dashboard-shell";
import { QueryState, ListSkeletonRows } from "@/components/common/query-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { api, apiErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

type Kind = "classes" | "reviews" | "questions" | "messages" | "sessions";

const CONFIG: Record<Kind, { title: string; description: string; icon: typeof Video; path: string }> = {
  classes: { title: "Live classes", description: "Your scheduled teaching sessions.", icon: Video, path: "/mentor/classes" },
  sessions: { title: "Mentoring sessions", description: "1:1 sessions with your students.", icon: CalendarClock, path: "/mentor/sessions" },
  reviews: { title: "Reviews", description: "Feedback your students have shared.", icon: Star, path: "/mentor/reviews" },
  questions: { title: "Student questions", description: "Answer doubts from your learners.", icon: HelpCircle, path: "/mentor/questions" },
  messages: { title: "Messages", description: "Recent messages from students.", icon: MessageSquare, path: "/mentor/messages" },
};

export default function MentorSimple({ kind }: { kind: Kind }) {
  const config = CONFIG[kind];
  const queryClient = useQueryClient();
  const [answering, setAnswering] = useState<{ id: number; question: string } | null>(null);
  const [answer, setAnswer] = useState("");

  const query = useQuery({
    queryKey: ["mentor", kind],
    queryFn: () => api.get<Record<string, unknown>[]>(config.path).then((r) => r.data),
  });

  const submitAnswer = useMutation({
    mutationFn: async () => api.post(`/mentor/questions/${answering!.id}/answer`, { answer }),
    onSuccess: () => {
      toast.success("Answer submitted!");
      queryClient.invalidateQueries({ queryKey: ["mentor", "questions"] });
      setAnswering(null);
      setAnswer("");
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const rows = query.data ?? [];

  return (
    <div>
      <DashboardPageHeader title={config.title} description={config.description} />

      <QueryState
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        onRetry={() => query.refetch()}
        skeleton={<ListSkeletonRows rows={5} />}
        isEmpty={rows.length === 0}
        empty={<EmptyState icon={config.icon} title="Nothing here yet" description="This section will populate as activity happens." />}
      >
        <div className="flex flex-col gap-3">
          {kind === "classes" && rows.map((row) => (
            <Card key={row.id as number} className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Video className="size-5" /></span>
                <div>
                  <p className="text-sm font-semibold">{row.title as string}</p>
                  <p className="text-xs text-muted-foreground">{row.course as string}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Users className="size-3.5" /> {row.students as number}</span>
                <Badge variant="secondary">{formatDate(row.startsAt as string)}</Badge>
              </div>
            </Card>
          ))}

          {kind === "sessions" && rows.map((row) => (
            <Card key={row.id as number} className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><CalendarClock className="size-5" /></span>
                <div>
                  <p className="text-sm font-semibold">{row.title as string}</p>
                  <p className="text-xs text-muted-foreground">with {row.mentor as string}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">{formatDate(row.scheduledAt as string)}</span>
                <Badge variant={row.status === "upcoming" ? "default" : "outline"} className="capitalize">{row.status as string}</Badge>
              </div>
            </Card>
          ))}

          {kind === "reviews" && (
            <div className="grid gap-4 sm:grid-cols-2">
              {rows.map((row) => (
                <Card key={row.id as number} className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar name={row.student as string} />
                      <div>
                        <p className="text-sm font-semibold">{row.student as string}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(row.createdAt as string)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={i < (row.rating as number) ? "size-4 fill-amber-400 text-amber-400" : "size-4 text-muted"} />)}
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{row.comment as string}</p>
                </Card>
              ))}
            </div>
          )}

          {kind === "questions" && rows.map((row) => (
            <Card key={row.id as number} className="flex flex-wrap items-start justify-between gap-4 p-5">
              <div className="flex items-start gap-3">
                <Avatar name={row.student as string} />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{row.student as string}</p>
                    <Badge variant={row.status === "answered" ? "success" : "warning"} className="capitalize">{row.status as string}</Badge>
                  </div>
                  <p className="mt-1 text-sm">{row.question as string}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{row.course as string} · {formatDate(row.createdAt as string)}</p>
                </div>
              </div>
              {row.status !== "answered" && (
                <Button size="sm" variant="gradient" onClick={() => setAnswering({ id: row.id as number, question: row.question as string })}><Send className="size-4" /> Answer</Button>
              )}
            </Card>
          ))}

          {kind === "messages" && rows.map((row) => (
            <Card key={row.id as number} className="flex items-start gap-3 p-5">
              <Avatar name={row.from as string} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{row.from as string}</p>
                  <span className="text-xs text-muted-foreground">· {formatDate(row.createdAt as string)}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{row.message as string}</p>
                <Button size="sm" variant="ghost" className="mt-2"><MessageSquare className="size-4" /> Reply</Button>
              </div>
            </Card>
          ))}
        </div>
      </QueryState>

      {kind === "questions" && (
        <Dialog open={Boolean(answering)} onOpenChange={(o) => !o && setAnswering(null)} title="Answer question">
          <DialogHeader>
            <DialogTitle>Answer the question</DialogTitle>
            <DialogDescription>{answering?.question}</DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex flex-col gap-4">
            <Textarea rows={5} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Write a clear, helpful answer..." />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAnswering(null)}>Cancel</Button>
              <Button variant="gradient" loading={submitAnswer.isPending} disabled={!answer.trim()} onClick={() => submitAnswer.mutate()}><CheckCircle2 className="size-4" /> Submit answer</Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
