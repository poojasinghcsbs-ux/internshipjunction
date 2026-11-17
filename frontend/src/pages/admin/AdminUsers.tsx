import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Search, Trash2, Shield } from "lucide-react";
import { DashboardPageHeader } from "@/components/layout/dashboard-shell";
import { Pagination } from "@/components/common/pagination";
import { QueryState, ListSkeletonRows } from "@/components/common/query-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useAdminUsers } from "@/lib/queries";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { api, apiErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import type { Role, User } from "@/lib/types";

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [role, setRole] = useState("all");
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 300);
  const [deleting, setDeleting] = useState<User | null>(null);

  const users = useAdminUsers({ page, pageSize: 10, role: role !== "all" ? role : undefined, search: debounced || undefined });

  const changeRole = useMutation({
    mutationFn: async ({ id, role }: { id: number; role: Role }) => api.patch(`/admin/users/${id}/role`, { role }),
    onSuccess: () => {
      toast.success("Role updated");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const remove = useMutation({
    mutationFn: async (id: number) => api.delete(`/admin/users/${id}`),
    onSuccess: () => {
      toast.success("User removed");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setDeleting(null);
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  return (
    <div>
      <DashboardPageHeader title="Users" description="Manage accounts, roles and access across the platform." />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by name or email..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Select className="w-40" value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}>
          <option value="all">All roles</option>
          <option value="student">Students</option>
          <option value="mentor">Mentors</option>
          <option value="admin">Admins</option>
          <option value="super_admin">Super admins</option>
        </Select>
      </div>

      <QueryState
        isLoading={users.isLoading}
        isError={users.isError}
        error={users.error}
        onRetry={() => users.refetch()}
        skeleton={<ListSkeletonRows rows={6} />}
        isEmpty={(users.data?.data ?? []).length === 0}
        empty={<EmptyState icon={Users} title="No users found" description="Try adjusting your filters." />}
      >
        <Card className="p-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(users.data?.data ?? []).map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar name={user.fullName} />
                      <div>
                        <p className="text-sm font-medium">{user.fullName}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.role === "super_admin" ? (
                      <Badge variant="success" className="inline-flex items-center gap-1"><Shield className="size-3" /> Super admin</Badge>
                    ) : (
                      <Select
                        className="h-8 w-32 text-xs"
                        value={user.role}
                        onChange={(e) => changeRole.mutate({ id: user.id, role: e.target.value as Role })}
                      >
                        <option value="student">Student</option>
                        <option value="mentor">Mentor</option>
                        <option value="admin">Admin</option>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      disabled={user.role === "super_admin"}
                      onClick={() => setDeleting(user)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {users.data && users.data.totalPages > 1 && (
          <div className="mt-6"><Pagination page={users.data.page} totalPages={users.data.totalPages} onChange={setPage} /></div>
        )}
      </QueryState>

      <Dialog open={Boolean(deleting)} onOpenChange={(o) => !o && setDeleting(null)} title="Delete user">
        <DialogHeader>
          <DialogTitle>Remove {deleting?.fullName}?</DialogTitle>
          <DialogDescription>This action cannot be undone. The user will immediately lose access.</DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
          <Button variant="destructive" loading={remove.isPending} onClick={() => deleting && remove.mutate(deleting.id)}>Delete user</Button>
        </div>
      </Dialog>
    </div>
  );
}
