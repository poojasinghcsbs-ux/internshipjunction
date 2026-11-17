import { Link } from "react-router-dom";
import { Clock, BookOpen, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RatingStars } from "./rating-stars";
import { formatCurrency, formatNumber, discountPercent, cn } from "@/lib/utils";
import type { Course } from "@/lib/types";

export function CourseCard({ course, className }: { course: Course; className?: string }) {
  const discount = discountPercent(course.originalPrice, course.price);
  return (
    <Card className={cn("group flex flex-col overflow-hidden hover:shadow-lift", className)}>
      <Link to={`/course/${course.slug}`} className="relative block aspect-video overflow-hidden bg-muted">
        <img
          src={course.thumbnail}
          alt={course.title}
          loading="lazy"
          decoding="async"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge variant="default" className="bg-background/90 backdrop-blur">{course.category}</Badge>
          {course.isFeatured && <Badge variant="accent" className="bg-background/90 backdrop-blur">Featured</Badge>}
        </div>
        {discount > 0 && (
          <Badge variant="destructive" className="absolute right-3 top-3">{discount}% OFF</Badge>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <BookOpen className="size-3.5" /> {course.level}
          </span>
          <Badge variant={course.mode === "live" ? "success" : "secondary"}>{course.mode === "live" ? "Live" : "Self-paced"}</Badge>
        </div>
        <Link to={`/course/${course.slug}`} className="line-clamp-2 text-base font-semibold leading-snug transition-colors hover:text-primary">
          {course.title}
        </Link>
        <p className="line-clamp-2 text-sm text-muted-foreground">{course.shortDescription}</p>
        <div className="flex flex-wrap gap-1.5">
          {course.technologies.slice(0, 3).map((tech) => (
            <Badge key={tech} variant="outline" className="font-normal">{tech}</Badge>
          ))}
          {course.technologies.length > 3 && <Badge variant="outline" className="font-normal">+{course.technologies.length - 3}</Badge>}
        </div>
        <div className="mt-auto flex flex-col gap-3 pt-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <RatingStars rating={course.rating} reviews={course.reviewsCount} />
            <span className="inline-flex items-center gap-1"><Users className="size-3.5" /> {formatNumber(course.studentsCount)}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Clock className="size-3.5" /> {course.duration}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-foreground">{formatCurrency(course.price)}</span>
              {discount > 0 && <span className="text-sm text-muted-foreground line-through">{formatCurrency(course.originalPrice)}</span>}
            </div>
            <Button size="sm" asChild>
              <Link to={`/course/${course.slug}`}>View</Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
