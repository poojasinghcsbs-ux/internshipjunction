import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, Briefcase, Award, Mic, Megaphone, Info } from "lucide-react";
import { DashboardPageHeader } from "@/components/layout/dashboard-shell";
import { QueryState, ListSkeletonRows } from "@/components/common/query-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useNotifications } from "@/lib/queries";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn, formatDate } from "@/lib/utils";

const iconFor: Record<string, typeof Bell> = {
  application: Briefcase,
  certificate: Award,
  interview: Mic,
  announcement: Megaphone,
  info: Info,
};

export default function Notifications() {
  const notifications = useNotifications();
  const queryClient = useQueryClient();

  const markRead = useMutation({
    mutationFn: async (id: number) => api.post(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAll = useMutation({
    mutationFn: async () => api.post("/notifications/read-all"),
    onSuccess: () => {
      toast.success("All caught up!");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const unread = (notifications.data ?? []).filter((n) => !n.read).length;

  return (
    <div>
      <DashboardPageHeader
        title="Notifications"
        description="Stay on top of applications, certificates and announcements."
        action={unread > 0 ? <Button variant="outline" loading={markAll.isPending} onClick={() => markAll.mutate()}><CheckCheck className="size-4" /> Mark all read</Button> : undefined}
      />

      <QueryState
        isLoading={notifications.isLoading}
        isError={notifications.isError}
        error={notifications.error}
        onRetry={() => notifications.refetch()}
        skeleton={<ListSkeletonRows rows={5} />}
        isEmpty={(notifications.data ?? []).length === 0}
        empty={<EmptyState icon={Bell} title="No notifications" description="You're all caught up. We'll let you know when something happens." />}
      >
        <div className="flex flex-col gap-2">
          {(notifications.data ?? []).map((notification) => {
            const Icon = iconFor[notification.type] ?? Info;
            return (
              <Card
                key={notification.id}
                className={cn("flex items-start gap-4 p-4 transition-colors", !notification.read && "border-primary/40 bg-primary/5")}
              >
                <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", notification.read ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary")}>
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{notification.title}</p>
                    {!notification.read && <Badge variant="default" className="h-4 px-1.5 text-[10px]">New</Badge>}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{notification.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatDate(notification.createdAt)}</p>
                </div>
                {!notification.read && (
                  <Button size="sm" variant="ghost" onClick={() => markRead.mutate(notification.id)}>Mark read</Button>
                )}
              </Card>
            );
          })}
        </div>
      </QueryState>
    </div>
  );
}
