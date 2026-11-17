import { useMemo, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X, Briefcase, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/common/page-hero";
import { InternshipCard } from "@/components/common/internship-card";
import { CardSkeletonGrid, QueryState } from "@/components/common/query-state";
import { Pagination } from "@/components/common/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useInternships } from "@/lib/queries";
import { useSeo } from "@/lib/hooks/use-seo";

const DOMAINS = [
  "Web Development", "Data Science", "Data Analytics", "Machine Learning", "AI",
  "Cyber Security", "Cloud Computing", "DevOps", "UI/UX", "Graphic Design",
  "Digital Marketing", "Business Analytics", "Finance",
];
const MODES = [
  { value: "remote", label: "Remote (100% Online)" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "On-site" },
];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const SORTS = [
  { value: "featured", label: "Featured First" },
  { value: "deadline", label: "Deadline Soon" },
  { value: "applicants", label: "Most Popular" },
];

export default function Internships() {
  const [params, setParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(params.get("search") ?? "");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const page = Number(params.get("page") ?? 1);

  const queryParams = useMemo(
    () => ({
      search: params.get("search") ?? undefined,
      domain: params.get("domain") ?? undefined,
      mode: params.get("mode") ?? undefined,
      level: params.get("level") ?? undefined,
      sort: params.get("sort") ?? undefined,
      page,
      pageSize: 9,
    }),
    [params, page]
  );

  const internships = useInternships(queryParams);

  useSeo({
    title: "Virtual Internships & Industrial Training",
    description:
      "Join project-based virtual internships at InternshipJunction. Build real-world applications, receive 1:1 mentor code reviews, and earn verified certificates with Letter of Recommendation.",
    canonicalPath: "/internships",
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

  const activeFilters = [
    params.get("domain") && { key: "domain", label: params.get("domain")! },
    params.get("mode") && { key: "mode", label: params.get("mode")! },
    params.get("level") && { key: "level", label: params.get("level")! },
  ].filter(Boolean) as { key: string; label: string }[];

  const filters = (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="i-domain" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Domain</Label>
        <Select id="i-domain" value={params.get("domain") ?? "all"} onChange={(e) => update("domain", e.target.value === "all" ? undefined : e.target.value)}>
          <option value="all">All Domains</option>
          {DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="i-mode" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mode</Label>
        <Select id="i-mode" value={params.get("mode") ?? "all"} onChange={(e) => update("mode", e.target.value === "all" ? undefined : e.target.value)}>
          <option value="all">All Modes</option>
          {MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="i-level" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Skill Level</Label>
        <Select id="i-level" value={params.get("level") ?? "all"} onChange={(e) => update("level", e.target.value === "all" ? undefined : e.target.value)}>
          <option value="all">All Levels</option>
          {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
        </Select>
      </div>
      <Button variant="outline" size="sm" onClick={clearAll} className="w-full">Reset All Filters</Button>

      <div className="mt-2 rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-xs text-muted-foreground space-y-2">
        <p className="font-bold text-foreground flex items-center gap-1.5">
          <ShieldCheck className="size-4 text-emerald-500" /> Guarantee
        </p>
        <p className="leading-relaxed">
          All internships include ISO 9001:2015 verifiable certificates and mentor reviews.
        </p>
      </div>
    </div>
  );

  return (
    <div>
      <PageHero
        title="Industrial Project Internships"
        description="Bridge the gap between college theory and corporate expectations. Work on live industry problem statements, receive pull-request reviews, and earn verified credentials."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Internships" }]}
      >
        <form onSubmit={(e: FormEvent) => { e.preventDefault(); update("search", searchInput.trim() || undefined); }} className="flex max-w-xl items-center gap-2 rounded-xl border border-border bg-card p-1.5 shadow-soft" role="search">
          <Search className="ml-2.5 size-4 shrink-0 text-muted-foreground" />
          <Input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search by domain, Python, React, AWS, AI..." className="h-10 border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm" aria-label="Search internships" />
          <Button type="submit" variant="gradient">Search</Button>
        </form>
      </PageHero>

      {/* QUICK DOMAIN PILLS */}
      <div className="border-b border-border bg-muted/20 py-3.5">
        <div className="container-page flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => update("domain", undefined)}
            className={`shrink-0 rounded-full px-3.5 py-1 text-xs font-semibold transition-colors ${
              !params.get("domain") ? "bg-primary text-white shadow-soft" : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            All Tracks
          </button>
          {DOMAINS.slice(0, 8).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => update("domain", d)}
              className={`shrink-0 rounded-full px-3.5 py-1 text-xs font-semibold transition-colors ${
                params.get("domain") === d ? "bg-primary text-white shadow-soft" : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="container-page py-10">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-5 shadow-soft">{filters}</div>
          </aside>
          <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-foreground">
                  {internships.isLoading ? "Loading..." : `${internships.data?.total ?? 0} internships available`}
                </p>
                {activeFilters.map((f) => (
                  <Badge key={f.key} variant="secondary" className="gap-1 capitalize text-xs">
                    {f.label}
                    <button type="button" onClick={() => update(f.key)} aria-label={`Remove ${f.label} filter`}><X className="size-3" /></button>
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setFiltersOpen((v) => !v)}>
                  <SlidersHorizontal className="size-4" /> Filters
                </Button>
                <Select aria-label="Sort internships" value={params.get("sort") ?? "featured"} onChange={(e) => update("sort", e.target.value === "featured" ? undefined : e.target.value)} className="w-44 text-xs font-medium">
                  {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </Select>
              </div>
            </div>

            {filtersOpen && <div className="mb-6 rounded-2xl border border-border bg-card p-5 lg:hidden shadow-soft">{filters}</div>}

            <QueryState
              isLoading={internships.isLoading}
              isError={internships.isError}
              error={internships.error}
              onRetry={() => internships.refetch()}
              skeleton={<CardSkeletonGrid count={9} />}
              isEmpty={!internships.isLoading && !internships.isError && (internships.data?.data.length ?? 0) === 0}
              empty={
                <EmptyState
                  icon={Briefcase}
                  title="No internships match your selected criteria"
                  description="Try broadening your search term or clearing some filters to view available tracks."
                  action={<Button onClick={clearAll} variant="gradient">Clear all filters</Button>}
                />
              }
            >
              <div className="card-grid">
                {internships.data?.data.map((internship) => <InternshipCard key={internship.id} internship={internship} />)}
              </div>
              <Pagination
                page={page}
                totalPages={internships.data?.totalPages ?? 1}
                onChange={(p) => { const n = new URLSearchParams(params); n.set("page", String(p)); setParams(n); }}
              />
            </QueryState>
          </div>
        </div>
      </div>
    </div>
  );
}
