import {
  IndianRupee, Users, GraduationCap, TrendingUp, Briefcase, Target, Activity,
} from "lucide-react";
import { DashboardPageHeader } from "@/components/layout/dashboard-shell";
import { StatCard } from "@/components/common/stat-card";
import { QueryState } from "@/components/common/query-state";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAnalytics } from "@/lib/queries";
import { formatCurrency, formatNumber } from "@/lib/utils";

export default function AdminAnalytics() {
  const analytics = useAnalytics();
  const data = analytics.data;
  const maxRevenue = Math.max(1, ...(data?.revenueByMonth.map((m) => m.revenue) ?? [1]));
  const totalCategory = (data?.enrollmentsByCategory.reduce((s, c) => s + c.count, 0)) || 1;

  return (
    <div>
      <DashboardPageHeader title="Analytics" description="Deep-dive into revenue, growth and learner behaviour." />

      <QueryState isLoading={analytics.isLoading} isError={analytics.isError} error={analytics.error} onRetry={() => analytics.refetch()}>
        {data && (
          <div className="flex flex-col gap-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={IndianRupee} label="Revenue" value={formatCurrency(data.revenue)} />
              <StatCard icon={Users} label="Active users" value={formatNumber(data.activeUsers)} />
              <StatCard icon={GraduationCap} label="Enrollments" value={formatNumber(data.enrollments)} />
              <StatCard icon={Target} label="Conversion" value={`${data.conversionRate}%`} />
            </div>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-base font-semibold"><TrendingUp className="size-4 text-primary" /> Monthly revenue</h2>
                <span className="text-sm text-muted-foreground">Last 12 months</span>
              </div>
              <div className="mt-6 flex h-64 items-end gap-2">
                {data.revenueByMonth.map((month) => (
                  <div key={month.month} className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-[10px] font-medium text-muted-foreground">{(month.revenue / 1000).toFixed(0)}k</span>
                    <div className="flex w-full flex-1 items-end">
                      <div className="w-full rounded-t-md bg-gradient-to-t from-primary/50 to-primary" style={{ height: `${(month.revenue / maxRevenue) * 100}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{month.month}</span>
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="p-6">
                <h2 className="text-base font-semibold">Enrollments by category</h2>
                <div className="mt-5 flex flex-col gap-4">
                  {data.enrollmentsByCategory.map((category) => (
                    <div key={category.category}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{category.category}</span>
                        <span className="text-muted-foreground">{formatNumber(category.count)} · {Math.round((category.count / totalCategory) * 100)}%</span>
                      </div>
                      <Progress value={(category.count / totalCategory) * 100} className="mt-1.5 h-2" />
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-base font-semibold">Engagement funnel</h2>
                <div className="mt-5 flex flex-col gap-4">
                  {[
                    { label: "Platform visitors", value: data.activeUsers * 12, pct: 100 },
                    { label: "Signed up", value: data.activeUsers, pct: 42 },
                    { label: "Enrolled", value: data.enrollments, pct: 18 },
                    { label: "Completed programs", value: Math.round(data.enrollments * (data.completionRate / 100)), pct: data.completionRate / 2 },
                    { label: "Placed", value: Math.round(data.enrollments * 0.08), pct: 8 },
                  ].map((step) => (
                    <div key={step.label}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{step.label}</span>
                        <span className="text-muted-foreground">{formatNumber(step.value)}</span>
                      </div>
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${step.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="flex items-center gap-3 p-5"><span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Briefcase className="size-5" /></span><div><p className="text-xl font-bold">{formatNumber(data.jobApplications)}</p><p className="text-xs text-muted-foreground">Job applications</p></div></Card>
              <Card className="flex items-center gap-3 p-5"><span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Activity className="size-5" /></span><div><p className="text-xl font-bold">{formatNumber(data.internshipApplications)}</p><p className="text-xs text-muted-foreground">Internship applications</p></div></Card>
              <Card className="flex items-center gap-3 p-5"><span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><GraduationCap className="size-5" /></span><div><p className="text-xl font-bold">{data.completionRate}%</p><p className="text-xs text-muted-foreground">Completion rate</p></div></Card>
            </div>
          </div>
        )}
      </QueryState>
    </div>
  );
}
