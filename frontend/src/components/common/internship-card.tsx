import { Link } from "react-router-dom";
import { Clock, MapPin, Users, ArrowRight, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { formatNumber, formatDate, cn } from "@/lib/utils";
import type { Internship } from "@/lib/types";

export function InternshipCard({ internship, className }: { internship: Internship; className?: string }) {
  return (
    <Card className={cn("group flex flex-col overflow-hidden border border-border/80 transition-all duration-300 hover:border-primary/50 hover:shadow-lift", className)}>
      <Link to={`/internship/${internship.slug}`} className="relative block aspect-[16/9] overflow-hidden bg-muted">
        <img
          src={internship.thumbnail}
          alt={internship.title}
          loading="lazy"
          decoding="async"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <Badge variant="default" className="bg-background/95 backdrop-blur-sm text-foreground font-semibold shadow-xs">
            {internship.domain}
          </Badge>
          <Badge variant="outline" className="bg-background/95 backdrop-blur-sm capitalize border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-medium">
            ● {internship.mode}
          </Badge>
        </div>
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-white/90">
          <span className="inline-flex items-center gap-1 font-medium bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs">
            <Users className="size-3" /> {formatNumber(internship.applicantsCount)} enrolled
          </span>
          <span className="font-semibold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
            {internship.stipend}
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <StatusPill status={internship.status} />
          <span className="text-xs text-muted-foreground font-medium">
            Deadline: {formatDate(internship.applicationDeadline)}
          </span>
        </div>

        <Link
          to={`/internship/${internship.slug}`}
          className="line-clamp-2 text-base font-bold leading-snug transition-colors group-hover:text-primary"
        >
          {internship.title}
        </Link>

        <p className="line-clamp-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {internship.shortDescription}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {internship.skills.slice(0, 4).map((skill) => (
            <Badge key={skill} variant="secondary" className="text-[11px] font-normal px-2 py-0.5">
              {skill}
            </Badge>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/60 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5 text-primary" /> {internship.duration}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-3.5 text-primary" /> {internship.location}
          </span>
          <span className="inline-flex items-center gap-1.5 col-span-2 text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="size-3.5" /> ISO Verified Certificate & LOR
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-3 border-t border-border/80">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Training & Project</span>
            <span className="text-xs font-bold text-foreground">100% Practical</span>
          </div>
          <Button size="sm" variant="gradient" className="gap-1 font-semibold" asChild>
            <Link to={`/internship/${internship.slug}`}>
              View Program <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
