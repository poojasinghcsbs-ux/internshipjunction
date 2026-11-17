import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ScanSearch, Sparkles, AlertTriangle, CheckCircle2, Lightbulb, ArrowRight } from "lucide-react";
import { DashboardPageHeader } from "@/components/layout/dashboard-shell";
import { QueryState } from "@/components/common/query-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useAtsReports } from "@/lib/queries";
import { api, apiErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import type { AtsReport } from "@/lib/types";

export default function AtsChecker() {
  const reports = useAtsReports();
  const queryClient = useQueryClient();
  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState("Full-Stack Developer");
  const [report, setReport] = useState<AtsReport | null>(null);

  const analyze = useMutation({
    mutationFn: async () => {
      const { data } = await api.post<AtsReport>("/ats/analyze", { resumeText, targetRole });
      return data;
    },
    onSuccess: (data) => {
      setReport(data);
      queryClient.invalidateQueries({ queryKey: ["ats-reports"] });
      toast.success("Resume analyzed!");
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  return (
    <div>
      <DashboardPageHeader title="ATS checker" description="Score your resume against applicant tracking systems and fix gaps fast." />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <Card className="flex flex-col gap-4 p-5">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><ScanSearch className="size-5" /></span>
            <div>
              <h2 className="text-sm font-semibold">Analyze your resume</h2>
              <p className="text-xs text-muted-foreground">Paste your resume text below</p>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="role">Target role</Label>
            <Input id="role" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="e.g. Data Analyst" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="resume">Resume text</Label>
            <Textarea id="resume" rows={12} value={resumeText} onChange={(e) => setResumeText(e.target.value)} placeholder="Paste the full text of your resume here (at least 40 characters)..." />
          </div>
          <Button variant="gradient" loading={analyze.isPending} disabled={resumeText.trim().length < 40} onClick={() => analyze.mutate()}>
            <Sparkles className="size-4" /> Analyze resume
          </Button>
        </Card>

        <div className="flex flex-col gap-6">
          {report ? (
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">Report for {report.targetRole}</h2>
                <Badge variant={report.overallScore >= 75 ? "success" : report.overallScore >= 50 ? "warning" : "destructive"}>Score {report.overallScore}/100</Badge>
              </div>
              <Progress value={report.overallScore} className="mt-3" />
              <p className="mt-3 text-sm text-muted-foreground">{report.summary}</p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {report.sections.map((section) => (
                  <div key={section.name} className="rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">{section.name}</span>
                      <span className="font-semibold">{section.score}</span>
                    </div>
                    <Progress value={section.score} className="mt-2 h-1" />
                    <p className="mt-1.5 text-xs text-muted-foreground">{section.note}</p>
                  </div>
                ))}
              </div>

              {report.missingKeywords.length > 0 && (
                <div className="mt-5">
                  <h3 className="flex items-center gap-2 text-sm font-semibold"><AlertTriangle className="size-4 text-amber-500" /> Missing keywords</h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {report.missingKeywords.map((keyword) => <Badge key={keyword} variant="warning" className="font-normal">{keyword}</Badge>)}
                  </div>
                </div>
              )}

              {report.recommendedSkills.length > 0 && (
                <div className="mt-5">
                  <h3 className="flex items-center gap-2 text-sm font-semibold"><CheckCircle2 className="size-4 text-success" /> Recommended skills</h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {report.recommendedSkills.map((skill) => <Badge key={skill} variant="success" className="font-normal">{skill}</Badge>)}
                  </div>
                </div>
              )}

              {report.suggestions.length > 0 && (
                <div className="mt-5">
                  <h3 className="flex items-center gap-2 text-sm font-semibold"><Lightbulb className="size-4 text-primary" /> Improvement suggestions</h3>
                  <div className="mt-2 flex flex-col gap-3">
                    {report.suggestions.map((suggestion, index) => (
                      <div key={index} className="rounded-lg border border-border p-3 text-sm">
                        <p className="font-medium">{suggestion.issue}</p>
                        <div className="mt-2 flex flex-col gap-1 text-xs">
                          <span className="text-destructive line-through">{suggestion.before}</span>
                          <span className="flex items-center gap-1 text-success"><ArrowRight className="size-3" /> {suggestion.after}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <Card className="flex flex-col items-center justify-center gap-2 p-10 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary"><ScanSearch className="size-6" /></span>
              <p className="text-sm font-semibold">No analysis yet</p>
              <p className="max-w-xs text-xs text-muted-foreground">Paste your resume and hit analyze to get an instant ATS score with actionable feedback.</p>
            </Card>
          )}

          <Card className="p-5">
            <h2 className="text-sm font-semibold">Past reports</h2>
            <QueryState isLoading={reports.isLoading} isError={reports.isError} error={reports.error} onRetry={() => reports.refetch()}>
              <div className="mt-3 flex flex-col gap-2">
                {(reports.data ?? []).map((r) => (
                  <button key={r.id} type="button" onClick={() => setReport(r)} className="flex items-center justify-between rounded-lg border border-border p-3 text-left text-sm transition-colors hover:bg-muted">
                    <div>
                      <p className="font-medium">{r.targetRole ?? r.fileName}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</p>
                    </div>
                    <Badge variant={r.overallScore >= 75 ? "success" : r.overallScore >= 50 ? "warning" : "destructive"}>{r.overallScore}</Badge>
                  </button>
                ))}
                {(reports.data ?? []).length === 0 && <p className="text-xs text-muted-foreground">Your analyzed resumes will appear here.</p>}
              </div>
            </QueryState>
          </Card>
        </div>
      </div>
    </div>
  );
}
