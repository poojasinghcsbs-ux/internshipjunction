import { Quote } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { RatingStars } from "./rating-stars";
import type { Review } from "@/lib/types";

export function TestimonialCard({ review }: { review: Review }) {
  return (
    <Card className="flex h-full flex-col gap-4 p-5">
      <Quote className="size-6 text-primary/40" />
      <p className="flex-1 text-sm leading-relaxed text-muted-foreground">"{review.content}"</p>
      <RatingStars rating={review.rating} />
      <div className="flex items-center gap-3 border-t border-border pt-4">
        <Avatar name={review.author} className="size-9" />
        <div>
          <p className="text-sm font-semibold">{review.author}</p>
          <p className="text-xs text-muted-foreground">{review.role}</p>
        </div>
      </div>
    </Card>
  );
}
