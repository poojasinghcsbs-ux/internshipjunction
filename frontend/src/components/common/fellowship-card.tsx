import { Link } from "react-router-dom";
import { Calendar, Users, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import type { Fellowship } from "@/lib/types";

export function FellowshipCard({ fellowship, className }: { fellowship: Fellowship; className?: string }) {
  const seatsPct = Math.round(((fellowship.seats - fellowship.seatsLeft) / fellowship.seats) * 100);
  return (
    <Card className={cn("group flex flex-col overflow-hidden hover:shadow-lift", className)}>
      <Link to={`/fellowship/${fellowship.slug}`} className="relative block aspect-[16/9] overflow-hidden bg-muted">
        <img src={fellowship.thumbnail} alt={fellowship.title} loading="lazy" decoding="async" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <Badge variant="accent" className="absolute left-3 top-3 bg-background/90 backdrop-blur">{fellowship.cohort}</Badge>
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
          <Sparkles className="size-3.5" /> {fellowship.domain}
        </span>
        <Link to={`/fellowship/${fellowship.slug}`} className="line-clamp-2 text-base font-semibold leading-snug transition-colors hover:text-primary">
          {fellowship.title}
        </Link>
        <p className="line-clamp-2 text-sm text-muted-foreground">{fellowship.shortDescription}</p>
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><Calendar className="size-3.5" /> Starts {formatDate(fellowship.startDate)}</span>
          <span className="inline-flex items-center gap-1.5"/>
          <span className="inline-flex items-center gap-1.5 col-span-2"><Users className="size-3.5" /> {fellowship.seatsLeft} of {fellowship.seats} seats left</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <Progress value={seatsPct} className="h-1.5" />
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold">{formatCurrency(fellowship.price)}</span>
            <span className="text-sm text-muted-foreground line-through">{formatCurrency(fellowship.originalPrice)}</span>
          </div>
          <Button size="sm" asChild>
            <Link to={`/fellowship/${fellowship.slug}`}>Apply</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
