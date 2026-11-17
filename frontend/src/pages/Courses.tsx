import { useMemo, useState, type FormEvent } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, SlidersHorizontal, X, BookOpen } from "lucide-react";
import { PageHero } from "@/components/common/page-hero";
import { CourseCard } from "@/components/common/course-card";
import { CardSkeletonGrid, QueryState } from "@/components/common/query-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/ui/empty-state";
import { useCourses } from "@/lib/queries";
import { useSeo } from "@/lib/hooks/use-seo";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "Web Development", "Data Science", "Data Analytics", "Machine Learning", "AI",
  "Cyber Security", "Cloud Computing", "DevOps", "UI/UX", "Graphic Design",
  "Digital Marketing", "Business Analytics", "Finance",
];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const MODES = [
  { value: "live", label: "Live" },
  { value: "self-paced", label: "Self-paced" },
];
const SORTS = [
  { value: "popular", label: "Most popular" },
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Highest rated" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

export default function Courses() {
  const [params, setParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(params.get("search") ?? "");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const page = Number(params.get("page") ?? 1);

  const queryParams = useMemo(
    () => ({
      search: params.get("search") ?? undefined,
      category: params.get("category") ?? undefined,
      level: params.get("level") ?? undefined,
      mode: params.get("mode") ?? undefined,
      sort: params.get("sort") ?? undefined,
      minRating: params.get("minRating") ?? undefined,
      featured: params.get("featured") ?? undefined,
      page,
      pageSize: 9,
    }),
    [params, page]
  );

  const courses = useCourses(queryParams);

  useSeo({
    title: "Online Courses",
    description:
      "Browse mentor-led, project-based courses across web development, data science, AI, cloud, security, design and more. Learn in-demand skills and earn verified certificates.",
    canonicalPath: "/courses",
  });

  const update = (key: string, value?: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    setParams(next, { replace: true });
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    update("search", searchInput.trim() || undefined);
  };

  const clearAll = () => {
    setSearchInput("");
    setParams(new URLSearchParams(), { replace: true });
  };

  const activeFilters = [
    params.get("category") && { key: "category", label: params.get("category")! },
    params.get("level") && { key: "level", label: params.get("level")! },
    params.get("mode") && { key: "mode", label: params.get("mode") === "live" ? "Live" : "Self-paced" },
    params.get("minRating") && { key: "minRating", label: `${params.get("minRating")}+ rating` },
    params.get("featured") && { key: "featured", label: "Featured" },
  ].filter(Boolean) as { key: string; label: string }[];

  const filters = (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Label className="text-sm font-semibold">Category</Label>
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => update("category")}
            className={cn("text-left text-sm transition-colors hover:text-primary", !params.get("category") ? "font-semibold text-primary" : "text-muted-foreground")}
          >
            All categories
          </button>
          {CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => update("category", category)}
              className={cn(
                "text-left text-sm transition-colors hover:text-primary",
                params.get("category") === category ? "font-semibold text-primary" : "text-muted-foreground"
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="f-level" className="text-sm font-semibold">Level</Label>
        <Select id="f-level" value={params.get("level") ?? "all"} onChange={(e) => update("level", e.target.value === "all" ? undefined : e.target.value)}>
          <option value="all">All levels</option>
          {LEVELS.map((level) => <option key={level} value={level}>{level}</option>)}
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="f-mode" className="text-sm font-semibold">Mode</Label>
        <Select id="f-mode" value={params.get("mode") ?? "all"} onChange={(e) => update("mode", e.target.value === "all" ? undefined : e.target.value)}>
          <option value="all">All modes</option>
          {MODES.map((mode) => <option key={mode.value} value={mode.value}>{mode.label}</option>)}
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="f-rating" className="text-sm font-semibold">Minimum rating</Label>
        <Select id="f-rating" value={params.get("minRating") ?? "all"} onChange={(e) => update("minRating", e.target.value === "all" ? undefined : e.target.value)}>
          <option value="all">Any rating</option>
          <option value="4.5">4.5 & above</option>
          <option value="4">4.0 & above</option>
          <option value="3.5">3.5 & above</option>
        </Select>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={params.get("featured") === "true"}
          onChange={(e) => update("featured", e.target.checked ? "true" : undefined)}
          className="size-4 rounded border-input text-primary focus-visible:ring-ring"
        />
        Featured only
      </label>

      <Button variant="outline" size="sm" onClick={clearAll}>Clear filters</Button>
    </div>
  );

  return (
    <div>
      <PageHero
        title="Explore courses"
        description="Project-based courses designed with hiring managers. Learn live or self-paced at your own rhythm."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Courses" }]}
      >
        <form onSubmit={onSubmit} className="flex max-w-xl items-center gap-2 rounded-xl border border-border bg-card p-1.5" role="search">
          <Search className="ml-2 size-4 shrink-0 text-muted-foreground" />
          <Input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search courses and skills" className="h-10 border-0 bg-transparent shadow-none focus-visible:ring-0" aria-label="Search courses" />
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
                <p className="text-sm text-muted-foreground">
                  {courses.isLoading ? "Loading..." : `${courses.data?.total ?? 0} courses found`}
                </p>
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
                <Select
                  aria-label="Sort courses"
                  value={params.get("sort") ?? "popular"}
                  onChange={(e) => update("sort", e.target.value === "popular" ? undefined : e.target.value)}
                  className="w-44"
                >
                  {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </Select>
              </div>
            </div>

            {filtersOpen && (
              <div className="mb-6 rounded-xl border border-border bg-card p-5 lg:hidden">{filters}</div>
            )}

            <QueryState
              isLoading={courses.isLoading}
              isError={courses.isError}
              error={courses.error}
              onRetry={() => courses.refetch()}
              skeleton={<CardSkeletonGrid count={9} />}
              isEmpty={!courses.isLoading && !courses.isError && (courses.data?.data.length ?? 0) === 0}
              empty={
                <EmptyState
                  icon={BookOpen}
                  title="No courses match your filters"
                  description="Try adjusting your search or clearing some filters to see more results."
                  action={<Button onClick={clearAll}>Clear filters</Button>}
                />
              }
            >
              <div className="card-grid">
                {courses.data?.data.map((course) => <CourseCard key={course.id} course={course} />)}
              </div>

              {courses.data && courses.data.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => { const n = new URLSearchParams(params); n.set("page", String(page - 1)); setParams(n); }}>
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">Page {page} of {courses.data.totalPages}</span>
                  <Button variant="outline" size="sm" disabled={page >= courses.data.totalPages} onClick={() => { const n = new URLSearchParams(params); n.set("page", String(page + 1)); setParams(n); }}>
                    Next
                  </Button>
                </div>
              )}
            </QueryState>
          </div>
        </div>

        <div className="mt-14 rounded-2xl border border-border bg-muted/40 p-6 text-center sm:p-10">
          <h2 className="text-xl font-bold">Not sure which course to pick?</h2>
          <p className="mt-2 text-sm text-muted-foreground">Take our career quiz or talk to a mentor to find the right path for your goals.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Button asChild><Link to="/mentors">Talk to a mentor</Link></Button>
            <Button variant="outline" asChild><Link to="/pricing">Compare plans</Link></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
