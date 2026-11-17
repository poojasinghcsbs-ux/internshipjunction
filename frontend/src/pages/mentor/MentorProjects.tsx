import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FolderKanban, CheckCircle2, RotateCcw, Clock, ExternalLink } from "lucide-react";
import { DashboardPageHeader } from "@/components/layout/dashboard-shell";
import { QueryState } from "@/components/common/query-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useMentorProjects } from "@/lib/queries";
import { api, apiErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import type { Project } from "@/lib/types";

export default function MentorProjects() {
  const projects = useMentorProjects();
  const queryClient = useQueryClient();
  const [active, setActive] = useState<Project | null>(null);
  const [decision, setDecision] = useState("approved");
  const [score, setScore] = useState("85");
  const [feedback, setFeedback] = useState("");

  const review = useMutation({
    mutationFn: async () => {
      if (!active) return;
      await api.post(`/mentor/projects/${active.id}/review`, { decision, score: Number(score), feedback });
    },
    onSuccess: () => {
      toast.success("Review submitted!");
      queryClient.invalidateQueries({ queryKey: ["mentor-projects"] });
      setActive(null);
      setFeedback("");
      setDecision("approved");
      setScore("85");
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  return (
    <div>
      <DashboardPageHeader title="Project submissions" description="Review student work, leave feedback and assign scores." />

      <QueryState
        isLoading={projects.isLoading}
        isError={projects.isError}
        error={projects.error}
        onRetry={() => projects.refetch()}
        isEmpty={(projects.data ?? []).length === 0}
        empty={<EmptyState icon={FolderKanban} title="No submissions to review" description="You're all caught up. New submissions will appear here." />}
      >
        <div className="grid gap-5 md:grid-cols-2">
          {(projects.data ?? []).map((project) => (
            <Card key={project.id} className="flex flex-col gap-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold">{project.title}</h3>
                  {project.courseTitle && <p className="text-xs text-muted-foreground">{project.courseTitle}</p>}
                </div>
                <Badge variant={project.status === "under-review" ? "warning" : project.status === "submitted" ? "default" : "success"} className="shrink-0 capitalize">{project.status.replace("-", " ")}</Badge>
              </div>
              {project.description && <p className="line-clamp-2 text-sm text-muted-foreground">{project.description}</p>}
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                {project.difficulty && <span>{project.difficulty}</span>}
                {project.estimatedHours && <span className="inline-flex items-center gap-1"><Clock className="size-3.5" /> ~{project.estimatedHours}h</span>}
                {(project.repoUrl || project.submissionUrl) && <span className="inline-flex items-center gap-1">Links provided</span>}
              </div>
              <div className="mt-auto flex flex-wrap gap-2">
                <Button size="sm" variant="gradient" onClick={() => setActive(project)}><CheckCircle2 className="size-4" /> Review</Button>
                {project.repoUrl && <Button size="sm" variant="ghost" asChild><a href={project.repoUrl} target="_blank" rel="noreferrer"><ExternalLink className="size-4" /> Repo</a></Button>}
                {project.submissionUrl && <Button size="sm" variant="ghost" asChild><a href={project.submissionUrl} target="_blank" rel="noreferrer"><ExternalLink className="size-4" /> Live</a></Button>}
              </div>
            </Card>
          ))}
        </div>
      </QueryState>

      <Dialog open={Boolean(active)} onOpenChange={(o) => !o && setActive(null)} title="Review project">
        <DialogHeader>
          <DialogTitle>Review &ldquo;{active?.title}&rdquo;</DialogTitle>
          <DialogDescription>Provide a decision and constructive feedback for the student.</DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>Decision</Label>
              <Select value={decision} onChange={(e) => setDecision(e.target.value)}>
                <option value="approved">Approve</option>
                <option value="completed">Mark completed</option>
                <option value="changes-requested">Request changes</option>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Score (0-100)</Label>
              <Input type="number" min={0} max={100} value={score} onChange={(e) => setScore(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Feedback</Label>
            <Textarea rows={4} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Highlight strengths and suggest improvements..." />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setActive(null)}>Cancel</Button>
            <Button variant="gradient" loading={review.isPending} onClick={() => review.mutate()}>
              {decision === "changes-requested" ? <><RotateCcw className="size-4" /> Request changes</> : <><CheckCircle2 className="size-4" /> Submit review</>}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
