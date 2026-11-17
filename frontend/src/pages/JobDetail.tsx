import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Building2, MapPin, Wallet, Clock, Bookmark, BookmarkCheck, Send,
  CheckCircle2, Briefcase, CalendarDays, Users,
} from "lucide-react";
import { PageHero } from "@/components/common/page-hero";
import { QueryState } from "@/components/common/query-state";
import { Section } from "@/components/common/section";
import { SectionHeading } from "@/components/common/section-heading";
import { JobCard } from "@/components/common/job-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useJob } from "@/lib/queries";
import { useAuth } from "@/components/providers/auth-provider";
import { api, apiErrorMessage } from "@/lib/api";
import { useSeo } from "@/lib/hooks/use-seo";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { Job } from "@/lib/types";

export default function JobDetail() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const job = useJob(slug);
  const data = job.data as (Job & { related?: Job[] }) | undefined;
  const [open, setOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [saved, setSaved] = useState(false);

  useSeo({
    title: data ? `${data.title} at ${data.company}` : "Job",
    description: data ? `${data.title} at ${data.company} · ${data.location}. Apply on InternshipJunction.` : "View job on InternshipJunction.",
    canonicalPath: `/job/${slug}`,
  });

  const apply = useMutation({
    mutationFn: async () => {
      const { data: result } = await api.post(`/jobs/${slug}/apply`, { coverLetter });
      return result;
    },
    onSuccess: () => {
      toast.success("Application submitted!");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["job-applications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      navigate("/dashboard/jobs");
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const toggleSave = async () => {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(`/job/${slug}`)}`);
      return;
    }
    try {
      if (saved) {
        await api.delete(`/jobs/${data!.id}/save`);
        setSaved(false);
        toast.success("Removed from saved jobs.");
      } else {
        await api.post(`/jobs/${data!.id}/save`);
        setSaved(true);
        toast.success("Job saved.");
      }
      queryClient.invalidateQueries({ queryKey: ["saved-jobs"] });
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  };

  if (job.isLoading) return <div className="container-page py-10"><Skeleton className="h-64 w-full" /></div>;
  if (job.isError || !data) {
    return <Section><QueryState isError error={job.error} onRetry={() => job.refetch()}><div /></QueryState></Section>;
  }

  return (
    <div>
      <PageHero title={data.title} breadcrumbs={[{ label: "Home", to: "/" }, { label: "Jobs", to: "/jobs" }, { label: data.company }]}>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><Building2 className="size-4" /> {data.company}</span>
          <span className="inline-flex items-center gap-1.5"><MapPin className="size-4" /> {data.location}{data.remote && " · Remote"}</span>
          <span className="inline-flex items-center gap-1.5"><Wallet className="size-4" /> {formatCurrency(data.salaryMin)}–{formatCurrency(data.salaryMax)}</span>
          <span className="inline-flex items-center gap-1.5"><Clock className="size-4" /> {data.experience}</span>
        </div>
      </PageHero>

      <div className="container-page grid gap-10 py-10 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-8">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{data.type}</Badge>
              {data.remote && <Badge variant="accent">Remote</Badge>}
              {data.skills.map((s) => <Badge key={s} variant="outline" className="font-normal">{s}</Badge>)}
            </div>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{data.description}</p>
          </div>

          <div>
            <h2 className="text-base font-semibold">Responsibilities</h2>
            <ul className="mt-3 flex flex-col gap-2">
              {data.responsibilities.map((r) => (
                <li key={r} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" /> {r}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-base font-semibold">Requirements</h2>
            <ul className="mt-3 flex flex-col gap-2">
              {data.requirements.map((r) => (
                <li key={r} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" /> {r}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside>
          <div className="lg:sticky lg:top-24 flex flex-col gap-4">
            <Card className="flex flex-col gap-4 p-6 shadow-lift">
              <div className="flex items-center gap-3">
                <span className="flex size-12 items-center justify-center rounded-xl border border-border bg-muted text-lg font-bold text-primary">
                  {data.company.slice(0, 1)}
                </span>
                <div>
                  <p className="text-sm font-semibold">{data.company}</p>
                  <p className="text-xs text-muted-foreground">{data.type}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 border-t border-border pt-4 text-sm">
                <span className="flex items-center gap-2 text-muted-foreground"><CalendarDays className="size-4" /> Posted {formatDate(data.postedAt)}</span>
                <span className="flex items-center gap-2 text-muted-foreground"><Users className="size-4" /> {data.applicantsCount} applicants</span>
                <span className="flex items-center gap-2 text-muted-foreground"><Briefcase className="size-4" /> {data.experience}</span>
              </div>
              <Button variant="gradient" size="lg" onClick={() => (user ? setOpen(true) : navigate(`/login?redirect=${encodeURIComponent(`/job/${slug}`)}`))}>
                Apply now
              </Button>
              <Button variant="outline" onClick={toggleSave}>
                {saved ? <><BookmarkCheck className="size-4" /> Saved</> : <><Bookmark className="size-4" /> Save job</>}
              </Button>
            </Card>
          </div>
        </aside>
      </div>

      {data.related && data.related.length > 0 && (
        <Section className="bg-muted/30 pb-20">
          <SectionHeading title={`More roles at ${data.company}`} />
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {data.related.map((r) => <JobCard key={r.id} job={r} />)}
          </div>
        </Section>
      )}

      <Dialog open={open} onOpenChange={setOpen} title="Apply to job">
        <DialogHeader>
          <DialogTitle>Apply to {data.title}</DialogTitle>
          <DialogDescription>at {data.company}. Share a short note to stand out.</DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); apply.mutate(); }}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="job-cover">Cover note</Label>
            <Textarea id="job-cover" rows={4} value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} placeholder="Why are you a great fit for this role?" />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="gradient" loading={apply.isPending}><Send className="size-4" /> Submit application</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
