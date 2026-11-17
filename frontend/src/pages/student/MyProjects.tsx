import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FolderKanban, Clock, Send, ExternalLink, Wrench } from "lucide-react";
import { DashboardPageHeader } from "@/components/layout/dashboard-shell";
import { QueryState } from "@/components/common/query-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useProjects } from "@/lib/queries";
import { api, apiErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import type { Project } from "@/lib/types";

const statusVariant: Record<string, "default" | "secondary" | "outline" | "success" | "warning" | "destructive"> = {
  "not-started": "outline",
  "in-progress": "secondary",
  submitted: "default",
  "under-review": "warning",
  "changes-requested": "destructive",
  approved: "success",
  completed: "success",
};

export default function MyProjects() {
  const projects = useProjects();
  const queryClient = useQueryClient();
  const [active, setActive] = useState<Project | null>(null);
  const [repoUrl, setRepoUrl] = useState("");
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [description, setDescription] = useState("");

  const submit = useMutation({
    mutationFn: async () => {
      if (!active) return;
      await api.post(`/projects/${active.id}/submit`, { repoUrl, submissionUrl, description });
    },
    onSuccess: () => {
      toast.success("Project submitted for review!");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      closeDialog();
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  function openDialog(project: Project) {
    setActive(project);
    setRepoUrl(project.repoUrl ?? "");
    setSubmissionUrl(project.submissionUrl ?? "");
    setDescription("");
  }
  function closeDialog() {
    setActive(null);
    setRepoUrl("");
    setSubmissionUrl("");
    setDescription("");
  }

  return (
    <div>
      <DashboardPageHeader
        title="My projects"
        description="Build real portfolios, submit your work and get mentor feedback."
      />

      <QueryState
        isLoading={projects.isLoading}
        isError={projects.isError}
        error={projects.error}
        onRetry={() => projects.refetch()}
        isEmpty={(projects.data ?? []).length === 0}
        empty={<EmptyState icon={FolderKanban} title="No projects yet" description="Projects unlock as you start your courses. Enroll to begin building." />}
      >
        <div className="grid gap-5 md:grid-cols-2">
          {(projects.data ?? []).map((project) => (
            <Card key={project.id} className="flex flex-col gap-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold">{project.title}</h3>
                  {project.courseTitle && <p className="text-xs text-muted-foreground">{project.courseTitle}</p>}
                </div>
                <Badge variant={statusVariant[project.status] ?? "outline"} className="shrink-0 capitalize">{project.status.replace("-", " ")}</Badge>
              </div>
              <p className="line-clamp-3 text-sm text-muted-foreground">{project.description}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Wrench className="size-3.5" /> {project.difficulty}</span>
                <span className="inline-flex items-center gap-1"><Clock className="size-3.5" /> ~{project.estimatedHours}h</span>
                {project.score != null && <Badge variant="success">Score: {project.score}</Badge>}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {project.skills.slice(0, 4).map((skill) => <Badge key={skill} variant="secondary" className="font-normal">{skill}</Badge>)}
              </div>
              {project.feedback && (
                <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs">
                  <p className="font-semibold text-foreground">Mentor feedback</p>
                  <p className="mt-1 text-muted-foreground">{project.feedback}</p>
                </div>
              )}
              <div className="mt-auto flex flex-wrap gap-2">
                {(project.status === "not-started" || project.status === "in-progress" || project.status === "changes-requested") ? (
                  <Button size="sm" variant="gradient" onClick={() => openDialog(project)}><Send className="size-4" /> Submit work</Button>
                ) : (
                  <Button size="sm" variant="outline" disabled><Send className="size-4" /> Submitted</Button>
                )}
                {project.repoUrl && <Button size="sm" variant="ghost" asChild><a href={project.repoUrl} target="_blank" rel="noreferrer"><ExternalLink className="size-4" /> Repository</a></Button>}
                {project.submissionUrl && <Button size="sm" variant="ghost" asChild><a href={project.submissionUrl} target="_blank" rel="noreferrer"><ExternalLink className="size-4" /> Live demo</a></Button>}
              </div>
            </Card>
          ))}
        </div>
      </QueryState>

      <Dialog open={Boolean(active)} onOpenChange={(open) => !open && closeDialog()} title="Submit project">
        <DialogHeader>
          <DialogTitle>Submit &ldquo;{active?.title}&rdquo;</DialogTitle>
          <DialogDescription>Share your repository or live link. Your mentor will review and provide feedback.</DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="repo">Repository URL</Label>
            <Input id="repo" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} placeholder="https://github.com/you/project" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="live">Live / demo URL (optional)</Label>
            <Input id="live" value={submissionUrl} onChange={(e) => setSubmissionUrl(e.target.value)} placeholder="https://your-demo.vercel.app" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Notes for your mentor (optional)</Label>
            <Textarea id="notes" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="What did you build and what would you like feedback on?" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button variant="gradient" loading={submit.isPending} disabled={!repoUrl && !submissionUrl} onClick={() => submit.mutate()}>Submit project</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
