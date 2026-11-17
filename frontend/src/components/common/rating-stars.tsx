import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({
  rating,
  reviews,
  size = "sm",
  className,
}: {
  rating: number;
  reviews?: number;
  size?: "sm" | "md";
  className?: string;
}) {
  const starSize = size === "md" ? "size-4" : "size-3.5";
  return (
    <span className={cn("inline-flex items-center gap-1", className)} aria-label={`Rated ${rating} out of 5`}>
      <span className="inline-flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(
              starSize,
              i <= Math.round(rating) ? "fill-warning text-warning" : "text-muted-foreground/40"
            )}
          />
        ))}
      </span>
      <span className="text-xs font-semibold text-foreground">{rating.toFixed(1)}</span>
      {reviews !== undefined && <span className="text-xs text-muted-foreground">({reviews})</span>}
    </span>
  );
}
