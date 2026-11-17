import { Link } from "react-router-dom";
import { Building2, MapPin, Wallet, Clock, Bookmark, BookmarkCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import type { Job } from "@/lib/types";

export function JobCard({
  job,
  onSave,
  saved,
  className,
}: {
  job: Job;
  onSave?: (job: Job) => void;
  saved?: boolean;
  className?: string;
}) {
  return (
    <Card className={cn("flex flex-col gap-4 p-5 hover:shadow-lift", className)}>
      <div className="flex items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-lg font-bold text-primary">
          {job.company.slice(0, 1)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link to={`/job/${job.slug}`} className="block truncate text-base font-semibold transition-colors hover:text-primary">
                {job.title}
              </Link>
              <p className="mt-0.5 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <Building2 className="size-3.5" /> {job.company}
              </p>
            </div>
            {onSave && (
              <button
                type="button"
                onClick={() => onSave(job)}
                aria-label={saved ? "Remove from saved" : "Save job"}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
              >
                {saved ? <BookmarkCheck className="size-4 text-primary" /> : <Bookmark className="size-4" />}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5" /> {job.location}{job.remote && " · Remote"}</span>
        <span className="inline-flex items-center gap-1.5"><Wallet className="size-3.5" /> {formatCurrency(job.salaryMin)}–{formatCurrency(job.salaryMax)}</span>
        <span className="inline-flex items-center gap-1.5"><Clock className="size-3.5" /> {job.experience}</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Badge variant="secondary">{job.type}</Badge>
        {job.skills.slice(0, 4).map((skill) => (
          <Badge key={skill} variant="outline" className="font-normal">{skill}</Badge>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-3">
        <span className="text-xs text-muted-foreground">Posted {formatDate(job.postedAt)} · {job.applicantsCount} applicants</span>
        <Button size="sm" variant="outline" asChild>
          <Link to={`/job/${job.slug}`}>View Job</Link>
        </Button>
      </div>
    </Card>
  );
}
