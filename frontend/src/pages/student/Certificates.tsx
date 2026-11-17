import { Link } from "react-router-dom";
import { Award, Download, ShieldCheck, ExternalLink } from "lucide-react";
import { DashboardPageHeader } from "@/components/layout/dashboard-shell";
import { QueryState } from "@/components/common/query-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useCertificates } from "@/lib/queries";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function Certificates() {
  const certificates = useCertificates();

  return (
    <div>
      <DashboardPageHeader
        title="Certificates"
        description="Download and share your verified achievements."
        action={<Button variant="outline" asChild><Link to="/verify">Verify a certificate</Link></Button>}
      />

      <QueryState
        isLoading={certificates.isLoading}
        isError={certificates.isError}
        error={certificates.error}
        onRetry={() => certificates.refetch()}
        isEmpty={(certificates.data ?? []).length === 0}
        empty={<EmptyState icon={Award} title="No certificates yet" description="Complete a program to earn your first verified certificate." action={<Button asChild><Link to="/courses">Browse courses</Link></Button>} />}
      >
        <div className="grid gap-5 md:grid-cols-2">
          {(certificates.data ?? []).map((certificate) => (
            <Card key={certificate.id} className="overflow-hidden">
              <div className="relative flex items-center gap-4 border-b border-border bg-gradient-to-br from-primary/10 via-transparent to-accent/10 p-5">
                <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lift"><Award className="size-7" /></span>
                <div className="min-w-0">
                  <h3 className="line-clamp-1 text-base font-semibold">{certificate.program}</h3>
                  <p className="text-xs capitalize text-muted-foreground">{certificate.programType} · issued {formatDate(certificate.issuedAt)}</p>
                </div>
                <Badge variant={certificate.status === "valid" ? "success" : "destructive"} className="absolute right-4 top-4 capitalize">{certificate.status}</Badge>
              </div>
              <div className="flex flex-col gap-3 p-5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Certificate ID</span>
                  <span className="font-mono font-medium">{certificate.certificateId}</span>
                </div>
                {certificate.grade && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Grade</span>
                    <span className="font-medium">{certificate.grade}</span>
                  </div>
                )}
                <div className="mt-1 flex flex-wrap gap-2">
                  <Button size="sm" variant="gradient" onClick={() => toast.success("Preparing your certificate download...")}><Download className="size-4" /> Download</Button>
                  <Button size="sm" variant="outline" asChild><Link to={`/verify-certificate/${certificate.certificateId}`}><ShieldCheck className="size-4" /> Verify</Link></Button>
                  <Button size="sm" variant="ghost" asChild><a href={`https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(certificate.program)}`} target="_blank" rel="noreferrer"><ExternalLink className="size-4" /> Share</a></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </QueryState>
    </div>
  );
}
