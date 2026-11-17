import { cn } from "@/lib/utils";

const statusMap: Record<string, string> = {
  active: "bg-success/12 text-success",
  published: "bg-success/12 text-success",
  approved: "bg-success/12 text-success",
  completed: "bg-success/12 text-success",
  selected: "bg-success/12 text-success",
  verified: "bg-success/12 text-success",
  open: "bg-success/12 text-success",

  pending: "bg-warning/12 text-warning",
  "in-progress": "bg-warning/12 text-warning",
  "under-review": "bg-warning/12 text-warning",
  "changes-requested": "bg-warning/12 text-warning",
  shortlisted: "bg-warning/12 text-warning",
  interview: "bg-warning/12 text-warning",
  draft: "bg-muted text-muted-foreground",
  "not-started": "bg-muted text-muted-foreground",
  new: "bg-primary/10 text-primary",
  applied: "bg-primary/10 text-primary",
  submitted: "bg-primary/10 text-primary",

  inactive: "bg-muted text-muted-foreground",
  unpublished: "bg-muted text-muted-foreground",
  closed: "bg-muted text-muted-foreground",
  rejected: "bg-destructive/12 text-destructive",
  revoked: "bg-destructive/12 text-destructive",
};

export function StatusPill({ status, className }: { status: string; className?: string }) {
  const key = status?.toLowerCase?.() ?? "";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        statusMap[key] ?? "bg-muted text-muted-foreground",
        className
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {status?.replace(/[-_]/g, " ")}
    </span>
  );
}
