import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Award, Ban, ShieldCheck } from "lucide-react";
import { DashboardPageHeader } from "@/components/layout/dashboard-shell";
import { QueryState, ListSkeletonRows } from "@/components/common/query-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { useAdminCertificates } from "@/lib/queries";
import { api, apiErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

export default function AdminCertificates() {
  const queryClient = useQueryClient();
  const certificates = useAdminCertificates();

  const revoke = useMutation({
    mutationFn: async (id: number) => api.post(`/admin/certificates/${id}/revoke`),
    onSuccess: () => {
      toast.success("Certificate revoked");
      queryClient.invalidateQueries({ queryKey: ["admin-certificates"] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const rows = certificates.data ?? [];

  return (
    <div>
      <DashboardPageHeader title="Certificates" description="Issue, verify and revoke program certificates." />

      <QueryState
        isLoading={certificates.isLoading}
        isError={certificates.isError}
        error={certificates.error}
        onRetry={() => certificates.refetch()}
        skeleton={<ListSkeletonRows rows={6} />}
        isEmpty={rows.length === 0}
        empty={<EmptyState icon={Award} title="No certificates issued" description="Certificates appear here as students complete programs." />}
      >
        <Card className="p-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Certificate ID</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Issued</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((certificate) => (
                <TableRow key={certificate.id}>
                  <TableCell><span className="font-mono text-xs">{certificate.certificateId}</span></TableCell>
                  <TableCell className="max-w-xs truncate text-sm">{certificate.program}</TableCell>
                  <TableCell className="text-sm">{certificate.studentName}</TableCell>
                  <TableCell><Badge variant="secondary" className="font-normal capitalize">{certificate.programType}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(certificate.issuedAt)}</TableCell>
                  <TableCell>
                    <Badge variant={certificate.status === "valid" ? "success" : "destructive"} className="inline-flex items-center gap-1 capitalize">
                      {certificate.status === "valid" ? <ShieldCheck className="size-3" /> : <Ban className="size-3" />} {certificate.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {certificate.status === "valid" ? (
                      <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive" loading={revoke.isPending && revoke.variables === certificate.id} onClick={() => revoke.mutate(certificate.id)}>
                        <Ban className="size-4" /> Revoke
                      </Button>
                    ) : <span className="text-xs text-muted-foreground">—</span>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </QueryState>
    </div>
  );
}
