import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Briefcase, Bookmark, Send, ExternalLink } from "lucide-react";
import { DashboardPageHeader } from "@/components/layout/dashboard-shell";
import { JobCard } from "@/components/common/job-card";
import { QueryState } from "@/components/common/query-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { useJobs, useJobApplications, useSavedJobs } from "@/lib/queries";
import { api, apiErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

const appStatusVariant: Record<string, "default" | "secondary" | "outline" | "success" | "warning" | "destructive"> = {
  applied: "secondary",
  shortlisted: "default",
  interview: "warning",
  selected: "success",
  rejected: "destructive",
};

export default function StudentJobs() {
  const [tab, setTab] = useState("recommended");
  const jobs = useJobs({ pageSize: 20 });
  const applications = useJobApplications();
  const saved = useSavedJobs();
  const queryClient = useQueryClient();

  const savedIds = new Set((saved.data ?? []).map((j) => j.id));

  const toggleSave = useMutation({
    mutationFn: async (jobId: number) => {
      if (savedIds.has(jobId)) await api.delete(`/jobs/${jobId}/save`);
      else await api.post(`/jobs/${jobId}/save`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  return (
    <div>
      <DashboardPageHeader title="Job board" description="Discover roles matched to your skills and track your applications." action={<Button variant="outline" asChild><Link to="/jobs">Browse all jobs</Link></Button>} />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
          <TabsTrigger value="applied">Applied ({applications.data?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="saved">Saved ({saved.data?.length ?? 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="recommended" className="mt-6">
          <QueryState isLoading={jobs.isLoading} isError={jobs.isError} error={jobs.error} onRetry={() => jobs.refetch()}>
            <div className="grid gap-4 md:grid-cols-2">
              {(jobs.data?.data ?? []).map((job) => (
                <JobCard key={job.id} job={job} saved={savedIds.has(job.id)} onSave={(j) => toggleSave.mutate(j.id)} />
              ))}
            </div>
          </QueryState>
        </TabsContent>

        <TabsContent value="applied" className="mt-6">
          <QueryState
            isLoading={applications.isLoading}
            isError={applications.isError}
            error={applications.error}
            onRetry={() => applications.refetch()}
            isEmpty={(applications.data ?? []).length === 0}
            empty={<EmptyState icon={Send} title="No applications yet" description="Apply to roles from the recommended tab to track them here." />}
          >
            <div className="flex flex-col gap-3">
              {(applications.data ?? []).map((application) => (
                <Card key={application.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex size-11 items-center justify-center rounded-xl border border-border bg-muted font-bold text-primary">{application.company.slice(0, 1)}</span>
                    <div>
                      <h3 className="text-sm font-semibold">{application.jobTitle}</h3>
                      <p className="text-xs text-muted-foreground">{application.company} · applied {formatDate(application.appliedAt)}</p>
                    </div>
                  </div>
                  <Badge variant={appStatusVariant[application.status] ?? "outline"} className="capitalize">{application.status}</Badge>
                </Card>
              ))}
            </div>
          </QueryState>
        </TabsContent>

        <TabsContent value="saved" className="mt-6">
          <QueryState
            isLoading={saved.isLoading}
            isError={saved.isError}
            error={saved.error}
            onRetry={() => saved.refetch()}
            isEmpty={(saved.data ?? []).length === 0}
            empty={<EmptyState icon={Bookmark} title="No saved jobs" description="Bookmark interesting roles to review them later." />}
          >
            <div className="grid gap-4 md:grid-cols-2">
              {(saved.data ?? []).map((job) => (
                <JobCard key={job.id} job={job} saved onSave={(j) => toggleSave.mutate(j.id)} />
              ))}
            </div>
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              <Briefcase className="size-4 text-primary" />
              <span>Apply from the job detail page. Track statuses under the Applied tab.</span>
              <Button size="sm" variant="ghost" className="ml-auto" asChild><Link to="/jobs">Find more <ExternalLink className="size-3.5" /></Link></Button>
            </div>
          </QueryState>
        </TabsContent>
      </Tabs>
    </div>
  );
}
