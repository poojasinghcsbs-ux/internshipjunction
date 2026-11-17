import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IndianRupee, RotateCcw, Receipt } from "lucide-react";
import { DashboardPageHeader } from "@/components/layout/dashboard-shell";
import { Pagination } from "@/components/common/pagination";
import { QueryState, ListSkeletonRows } from "@/components/common/query-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { useAdminPayments } from "@/lib/queries";
import { api, apiErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/utils";

const statusVariant: Record<string, "success" | "warning" | "destructive" | "outline"> = {
  paid: "success",
  pending: "warning",
  refunded: "outline",
  failed: "destructive",
};

export default function AdminPayments() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");

  const payments = useAdminPayments({ page, pageSize: 10, status: status !== "all" ? status : undefined });

  const refund = useMutation({
    mutationFn: async (id: number) => api.post(`/admin/payments/${id}/refund`),
    onSuccess: () => {
      toast.success("Order refunded");
      queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  return (
    <div>
      <DashboardPageHeader title="Payments" description="Track orders, revenue and issue refunds." />

      <div className="mb-5">
        <Select className="w-44" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="all">All statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="refunded">Refunded</option>
        </Select>
      </div>

      <QueryState
        isLoading={payments.isLoading}
        isError={payments.isError}
        error={payments.error}
        onRetry={() => payments.refetch()}
        skeleton={<ListSkeletonRows rows={6} />}
        isEmpty={(payments.data?.data ?? []).length === 0}
        empty={<EmptyState icon={Receipt} title="No payments found" description="Orders will appear here once students enroll." />}
      >
        <Card className="p-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(payments.data?.data ?? []).map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="text-sm font-medium">#{order.id}</TableCell>
                  <TableCell className="max-w-xs truncate text-sm">{order.program}</TableCell>
                  <TableCell className="text-sm font-semibold">{formatCurrency(order.amount)}</TableCell>
                  <TableCell className="text-sm capitalize text-muted-foreground">{order.provider}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</TableCell>
                  <TableCell><Badge variant={statusVariant[order.status] ?? "outline"} className="capitalize">{order.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    {order.status === "paid" ? (
                      <Button size="sm" variant="ghost" loading={refund.isPending && refund.variables === order.id} onClick={() => refund.mutate(order.id)}>
                        <RotateCcw className="size-4" /> Refund
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {payments.data && payments.data.totalPages > 1 && (
          <div className="mt-6"><Pagination page={payments.data.page} totalPages={payments.data.totalPages} onChange={setPage} /></div>
        )}
      </QueryState>

      <Card className="mt-6 flex items-center gap-3 p-5">
        <span className="flex size-10 items-center justify-center rounded-lg bg-success/10 text-success"><IndianRupee className="size-5" /></span>
        <div>
          <p className="text-sm font-semibold">Refunds are processed through the payment provider.</p>
          <p className="text-xs text-muted-foreground">In demo mode this updates the order status instantly with no real money movement.</p>
        </div>
      </Card>
    </div>
  );
}
