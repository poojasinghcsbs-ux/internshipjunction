import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, Award, FolderKanban, Inbox } from "lucide-react";
import { DashboardPageHeader } from "@/components/layout/dashboard-shell";
import { Pagination } from "@/components/common/pagination";
import { QueryState, ListSkeletonRows } from "@/components/common/query-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";

type Kind = "internships" | "fellowships" | "projects" | "jobs";

const CONFIG: Record<Kind, { title: string; description: string; icon: typeof Briefcase }> = {
  internships: { title: "Internships", description: "All internship programs and applications.", icon: Briefcase },
  fellowships: { title: "Fellowships", description: "Career fellowships and their cohorts.", icon: Award },
  projects: { title: "Projects", description: "Student project submissions across courses.", icon: FolderKanban },
  jobs: { title: "Jobs", description: "Job postings published on the board.", icon: Inbox },
};

interface Row {
  id: number;
  title?: string;
  slug?: string;
  domain?: string;
  category?: string;
  level?: string;
  duration?: string;
  seatsLeft?: number;
  applicants?: number;
  applicantsCount?: number;
  status?: string;
  courseTitle?: string;
  difficulty?: string;
  company?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  postedAt?: string;
}

export default function AdminContent({ kind }: { kind: Kind }) {
  const config = CONFIG[kind];
  const [page, setPage] = useState(1);
  const paginated = kind === "internships" || kind === "projects" || kind === "jobs";

  const query = useQuery({
    queryKey: ["admin-content", kind, page],
    queryFn: async () => {
      const { data } = await api.get<Row[] | { data: Row[]; totalPages: number; page: number }>(`/admin/${kind}`, { params: paginated ? { page, pageSize: 10 } : undefined });
      if (Array.isArray(data)) return { data, totalPages: 1, page: 1 };
      return data;
    },
  });

  const result = query.data;
  const rows = result?.data ?? [];

  return (
    <div>
      <DashboardPageHeader title={config.title} description={config.description} />

      <QueryState
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        onRetry={() => query.refetch()}
        skeleton={<ListSkeletonRows rows={6} />}
        isEmpty={rows.length === 0}
        empty={<EmptyState icon={config.icon} title={`No ${config.title.toLowerCase()} yet`} description="Content will appear here once created." />}
      >
        <Card className="p-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{kind === "jobs" ? "Role" : "Title"}</TableHead>
                <TableHead>{kind === "internships" ? "Domain" : kind === "projects" ? "Course" : kind === "jobs" ? "Company" : "Cohort"}</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Status / Reach</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="max-w-xs">
                    <p className="truncate text-sm font-medium">{row.title ?? row.courseTitle ?? `#${row.id}`}</p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {kind === "internships" && row.domain}
                    {kind === "projects" && row.courseTitle}
                    {kind === "jobs" && row.company}
                    {kind === "fellowships" && row.domain}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {kind === "internships" && <span>{row.level} · {row.duration}</span>}
                    {kind === "fellowships" && <span>{row.duration} · {row.seatsLeft} seats left</span>}
                    {kind === "projects" && <span>{row.difficulty}</span>}
                    {kind === "jobs" && <span>{row.location} · {row.salaryMin ? formatCurrency(row.salaryMin) : ""}{row.salaryMax ? `–${formatCurrency(row.salaryMax)}` : ""}</span>}
                  </TableCell>
                  <TableCell>
                    {kind === "fellowships" ? (
                      <Badge variant="secondary">{row.applicants} applicants</Badge>
                    ) : kind === "jobs" ? (
                      <span className="text-xs text-muted-foreground">Posted {formatDate(row.postedAt)}</span>
                    ) : kind === "projects" ? (
                      <Badge variant="outline" className="capitalize">{row.status?.replace("-", " ") ?? "—"}</Badge>
                    ) : (
                      <Badge variant="secondary">{row.applicantsCount ?? 0} applicants</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {paginated && result && result.totalPages > 1 && (
          <div className="mt-6"><Pagination page={result.page} totalPages={result.totalPages} onChange={setPage} /></div>
        )}
      </QueryState>
    </div>
  );
}
