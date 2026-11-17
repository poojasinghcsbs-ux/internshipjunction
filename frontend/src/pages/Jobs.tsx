import { useMemo, useState, type FormEvent } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, SlidersHorizontal, X, BriefcaseBusiness, Bookmark } from "lucide-react";
import { PageHero } from "@/components/common/page-hero";
import { JobCard } from "@/components/common/job-card";
import { QueryState } from "@/components/common/query-state";
import { Pagination } from "@/components/common/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useJobs } from "@/lib/queries";
import { useAuth } from "@/components/providers/auth-provider";
import { useSeo } from "@/lib/hooks/use-seo";
import { api } from "@/lib/api";
import { toast } from "sonner";

const TYPES = ["Full-time", "Part-time", "Internship", "Contract"];
const EXPERIENCE = ["Fresher", "0-2 years", "1-3 years", "2-4 years", "3-6 years", "5-9 years"];
const LOCATIONS = ["Remote", "Bengaluru", "Hyderabad", "Pune", "Mumbai", "Delhi", "Gurugram", "Noida", "Chennai"];
const SORTS = [
  { value: "recent", label: "Most recent" },
  { value: "salary", label: "Highest salary" },
  { value: "oldest", label: "Oldest" },
];

export default function Jobs() {
  const [params, setParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(params.get("search") ?? "");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { user } = useAuth();
  const page = Number(params.get("page") ?? 1);

  const queryParams = useMemo(
    () => ({
      search: params.get("search") ?? undefined,
      remote: params.get("remote") ?? undefined,
      type: params.get("type") ?? undefined,
      experience: params.get("experience") ?? undefined,
      location: params.get("location") ?? undefined,
      sort: params.get("sort") ?? undefined,
      page,
      pageSize: 8,
    }),
    [params, page]
  );

  const jobs = useJobs(queryParams);

  useSeo({
    title: "Job Portal",
    description:
      "Discover curated jobs for students and early-career professionals. Filter by role, location, remote work and experience, then apply in a click.",
    canonicalPath: "/jobs",
  });

  const update = (key: string, value?: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    setParams(next, { replace: true });
  };

  const clearAll = () => {
    setSearchInput("");
    setParams(new URLSearchParams(), { replace: true });
  };

  const saveJob = async (job: { id: number }) => {
    if (!user) {
      toast.error("Please log in to save jobs.");
      return;
    }
    try {
      await api.post(`/jobs/${job.id}/save`);
      toast.success("Job saved to your list.");
    } catch {
      toast.error("Could not save this job.");
    }
  };

  const activeFilters = [
    params.get("type") && { key: "type", label: params.get("type")! },
    params.get("experience") && { key: "experience", label: params.get("experience")! },
    params.get("location") && { key: "location", label: params.get("location")! },
    params.get("remote") && { key: "remote", label: "Remote" },
  ].filter(Boolean) as { key: string; label: string }[];

  const filters = (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="j-type" className="text-sm font-semibold">Job type</Label>
        <Select id="j-type" value={params.get("type") ?? "all"} onChange={(e) => update("type", e.target.value === "all" ? undefined : e.target.value)}>
          <option value="all">All types</option>
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="j-exp" className="text-sm font-semibold">Experience</Label>
        <Select id="j-exp" value={params.get("experience") ?? "all"} onChange={(e) => update("experience", e.target.value === "all" ? undefined : e.target.value)}>
          <option value="all">Any experience</option>
          {EXPERIENCE.map((x) => <option key={x} value={x}>{x}</option>)}
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="j-loc" className="text-sm font-semibold">Location</Label>
        <Select id="j-loc" value={params.get("location") ?? "all"} onChange={(e) => update("location", e.target.value === "all" ? undefined : e.target.value)}>
          <option value="all">All locations</option>
          {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
        </Select>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={params.get("remote") === "true"} onChange={(e) => update("remote", e.target.checked ? "true" : undefined)} className="size-4 rounded border-input text-primary focus-visible:ring-ring" />
        Remote only
      </label>
      <Button variant="outline" size="sm" onClick={clearAll}>Clear filters</Button>
    </div>
  );

  return (
    <div>
      <PageHero
        title="Job portal"
        description="Hand-picked roles from companies that hire for skills, not just degrees. Apply with your InternshipJunction profile."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Jobs" }]}
      >
        <form onSubmit={(e: FormEvent) => { e.preventDefault(); update("search", searchInput.trim() || undefined); }} className="flex max-w-xl items-center gap-2 rounded-xl border border-border bg-card p-1.5" role="search">
          <Search className="ml-2 size-4 shrink-0 text-muted-foreground" />
          <Input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search roles, companies or skills" className="h-10 border-0 bg-transparent shadow-none focus-visible:ring-0" aria-label="Search jobs" />
          <Button type="submit" variant="gradient">Search</Button>
        </form>
      </PageHero>

      <div className="container-page py-10">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-xl border border-border bg-card p-5">{filters}</div>
          </aside>
          <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm text-muted-foreground">{jobs.isLoading ? "Loading..." : `${jobs.data?.total ?? 0} jobs found`}</p>
                {activeFilters.map((f) => (
                  <Badge key={f.key} variant="secondary" className="gap-1">
                    {f.label}
                    <button type="button" onClick={() => update(f.key)} aria-label={`Remove ${f.label} filter`}><X className="size-3" /></button>
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setFiltersOpen((v) => !v)}>
                  <SlidersHorizontal className="size-4" /> Filters
                </Button>
                <Select aria-label="Sort jobs" value={params.get("sort") ?? "recent"} onChange={(e) => update("sort", e.target.value === "recent" ? undefined : e.target.value)} className="w-40">
                  {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </Select>
              </div>
            </div>

            {filtersOpen && <div className="mb-6 rounded-xl border border-border bg-card p-5 lg:hidden">{filters}</div>}

            {!user && (
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                <p className="inline-flex items-center gap-2 text-sm"><Bookmark className="size-4 text-primary" /> Log in to save jobs and track your applications.</p>
                <Button size="sm" asChild><Link to="/login">Log in</Link></Button>
              </div>
            )}

            <QueryState
              isLoading={jobs.isLoading}
              isError={jobs.isError}
              error={jobs.error}
              onRetry={() => jobs.refetch()}
              skeleton={<div className="flex flex-col gap-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}</div>}
              isEmpty={!jobs.isLoading && !jobs.isError && (jobs.data?.data.length ?? 0) === 0}
              empty={
                <EmptyState
                  icon={BriefcaseBusiness}
                  title="No jobs match your filters"
                  description="Try broadening your search or clearing some filters."
                  action={<Button onClick={clearAll}>Clear filters</Button>}
                />
              }
            >
              <div className="flex flex-col gap-4">
                {jobs.data?.data.map((job) => <JobCard key={job.id} job={job} onSave={saveJob} />)}
              </div>
              <Pagination
                page={page}
                totalPages={jobs.data?.totalPages ?? 1}
                onChange={(p) => { const n = new URLSearchParams(params); n.set("page", String(p)); setParams(n); }}
              />
            </QueryState>
          </div>
        </div>
      </div>
    </div>
  );
}
