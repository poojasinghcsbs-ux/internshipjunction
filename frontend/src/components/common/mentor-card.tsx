import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RatingStars } from "./rating-stars";
import { Briefcase, CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Mentor } from "@/lib/types";

export function MentorCard({
  mentor,
  onView,
  className,
}: {
  mentor: Mentor;
  onView?: (mentor: Mentor) => void;
  className?: string;
}) {
  return (
    <Card className={cn("flex flex-col gap-4 p-5 text-center hover:shadow-lift", className)}>
      <Avatar name={mentor.name} src={mentor.avatarUrl} className="mx-auto size-16 text-lg" />
      <div>
        <h3 className="text-base font-semibold">{mentor.name}</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">{mentor.role}</p>
        <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Briefcase className="size-3.5" /> {mentor.company}
        </p>
      </div>
      <RatingStars rating={mentor.rating} reviews={mentor.reviewsCount} className="justify-center" />
      <div className="flex flex-wrap justify-center gap-1.5">
        {mentor.expertise.slice(0, 3).map((skill) => (
          <Badge key={skill} variant="outline" className="font-normal">{skill}</Badge>
        ))}
      </div>
      <p className="line-clamp-2 text-xs text-muted-foreground">{mentor.bio}</p>
      <div className="mt-auto flex flex-col gap-2 pt-1">
        <span className="inline-flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <CalendarClock className="size-3.5" /> {mentor.availability}
        </span>
        {onView && (
          <Button variant="outline" size="sm" onClick={() => onView(mentor)}>
            View Profile
          </Button>
        )}
      </div>
    </Card>
  );
}
