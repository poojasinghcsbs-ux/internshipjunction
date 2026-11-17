import { Link } from "react-router-dom";
import {
  IndianRupee, Users, GraduationCap, TrendingUp, Briefcase, BarChart3, ArrowRight, Activity,
} from "lucide-react";
import { DashboardPageHeader } from "@/components/layout/dashboard-shell";
import { StatCard } from "@/components/common/stat-card";
import { QueryState } from "@/components/common/query-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAnalytics } from "@/lib/queries";
import { formatCurrency, formatNumber } from "@/lib/utils";

export default function AdminOverview() {
  const analytics = useAnalytics();
  const data = analytics.data;
  const maxRevenue = Math.max(1, ...(data?.revenueByMonth.map((m) => m.revenue) ?? [1]));
  const totalCategory = (data?.enrollmentsByCategory.reduce((s, c) => s + c.count, 0)) || 1;

  return (
    <div>
      <DashboardPageHeader
        title="Admin overview"
        description="Platform health, revenue and engagement at a glance."
        action={<Button variant="gradient" asChild><Link to="/admin/analytics">Full analytics <ArrowRight className="size-4" /></Link></Button>}
      />

      <QueryState isLoading={analytics.isLoading} isError={analytics.isError} error={analytics.error} onRetry={() => analytics.refetch()}>
        {data && (
          <div className="flex flex-col gap-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={IndianRupee} label="Total revenue" value={formatCurrency(data.revenue)} hint="From paid orders" />
              <StatCard icon={Users} label="Active users" value={formatNumber(data.activeUsers)} hint={`${formatNumber(data.students)} students total`} />
              <StatCard icon={GraduationCap} label="Enrollments" value={formatNumber(data.enrollments)} hint={`${data.completionRate}% completion rate`} />
              <StatCard icon={TrendingUp} label="Conversion rate" value={`${data.conversionRate}%`} hint="Visitor to enrollment" />
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
              <Card className="p-5">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-base font-semibold"><BarChart3 className="size-4 text-primary" /> Revenue trend</h2>
                  <Badge variant="success">+18.4%</Badge>
                </div>
                <div className="mt-6 flex h-48 items-end gap-2">
                  {data.revenueByMonth.map((month) => (
                    <div key={month.month} className="group flex flex-1 flex-col items-center gap-2">
                      <div className="relative flex w-full flex-1 items-end">
                        <div className="w-full rounded-t-md bg-gradient-to-t from-primary/60 to-primary transition-all group-hover:from-primary group-hover:to-accent" style={{ height: `${(month.revenue / maxRevenue) * 100}%` }}>
                          <span className="pointer-events-none absolute -top-6 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-1.5 py-0.5 text-[10px] text-background group-hover:block">
                            {formatCurrency(month.revenue)}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{month.month}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-5">
                <h2 className="text-base font-semibold">Enrollments by category</h2>
                <div className="mt-5 flex flex-col gap-4">
                  {data.enrollmentsByCategory.map((category) => (
                    <div key={category.category}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">{category.category}</span>
                        <span className="text-muted-foreground">{formatNumber(category.count)}</span>
                      </div>
                      <Progress value={(category.count / totalCategory) * 100} className="mt-1.5 h-1.5" />
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="flex items-center gap-3 p-5">
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Briefcase className="size-5" /></span>
                <div>
                  <p className="text-2xl font-bold">{formatNumber(data.jobApplications)}</p>
                  <p className="text-xs text-muted-foreground">Job applications</p>
                </div>
              </Card>
              <Card className="flex items-center gap-3 p-5">
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Activity className="size-5" /></span>
                <div>
                  <p className="text-2xl font-bold">{formatNumber(data.internshipApplications)}</p>
                  <p className="text-xs text-muted-foreground">Internship applications</p>
                </div>
              </Card>
              <Card className="flex items-center gap-3 p-5">
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><GraduationCap className="size-5" /></span>
                <div>
                  <p className="text-2xl font-bold">{data.completionRate}%</p>
                  <p className="text-xs text-muted-foreground">Completion rate</p>
                </div>
              </Card>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="outline" asChild><Link to="/admin/users">Manage users</Link></Button>
              <Button variant="outline" asChild><Link to="/admin/courses">Manage courses</Link></Button>
              <Button variant="outline" asChild><Link to="/admin/payments">Payments</Link></Button>
              <Button variant="outline" asChild><Link to="/admin/certificates">Certificates</Link></Button>
            </div>
          </div>
        )}
      </QueryState>
    </div>
  );
}
