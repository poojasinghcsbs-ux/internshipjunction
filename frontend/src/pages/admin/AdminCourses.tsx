import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, BookOpen, Star } from "lucide-react";
import { DashboardPageHeader } from "@/components/layout/dashboard-shell";
import { Pagination } from "@/components/common/pagination";
import { QueryState, ListSkeletonRows } from "@/components/common/query-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { api } from "@/lib/api";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { Course, Paginated } from "@/lib/types";

export default function AdminCourses() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 300);

  const courses = useQuery({
    queryKey: ["admin-courses", { page, search: debounced }],
    queryFn: () => api.get<Paginated<Course>>("/admin/courses", { params: { page, pageSize: 10, search: debounced || undefined } }).then((r) => r.data),
  });

  return (
    <div>
      <DashboardPageHeader title="Courses" description="Catalog of all courses on the platform." />

      <div className="relative mb-5 max-w-xs">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search courses..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      </div>

      <QueryState
        isLoading={courses.isLoading}
        isError={courses.isError}
        error={courses.error}
        onRetry={() => courses.refetch()}
        skeleton={<ListSkeletonRows rows={6} />}
        isEmpty={(courses.data?.data ?? []).length === 0}
        empty={<EmptyState icon={BookOpen} title="No courses found" description="Try a different search term." />}
      >
        <Card className="p-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(courses.data?.data ?? []).map((course) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img src={course.thumbnail} alt={course.title} className="size-10 rounded-lg object-cover" />
                      <div className="max-w-xs">
                        <p className="truncate text-sm font-medium">{course.title}</p>
                        <p className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Star className="size-3 fill-amber-400 text-amber-400" /> {course.rating} · {course.reviewsCount} reviews</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="secondary" className="font-normal">{course.category}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{course.level}</TableCell>
                  <TableCell className="text-sm font-medium">{formatCurrency(course.price)}</TableCell>
                  <TableCell className="text-sm">{formatNumber(course.studentsCount)}</TableCell>
                  <TableCell><Badge variant={course.status === "active" ? "success" : "outline"} className="capitalize">{course.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {courses.data && courses.data.totalPages > 1 && (
          <div className="mt-6"><Pagination page={courses.data.page} totalPages={courses.data.totalPages} onChange={setPage} /></div>
        )}
      </QueryState>
    </div>
  );
}
