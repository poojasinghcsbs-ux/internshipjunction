import { useState } from "react";
import { Link } from "react-router-dom";
import { PageHero } from "@/components/common/page-hero";
import { QueryState } from "@/components/common/query-state";
import { Section } from "@/components/common/section";
import { SectionHeading } from "@/components/common/section-heading";
import { Reveal } from "@/components/common/reveal";
import { MentorCard } from "@/components/common/mentor-card";
import { RatingStars } from "@/components/common/rating-stars";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";
import { Dialog, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMentor, useMentors } from "@/lib/queries";
import { useSeo } from "@/lib/hooks/use-seo";
import { Globe, BookOpen } from "lucide-react";
import type { Mentor } from "@/lib/types";

type MentorDetail = Mentor & { courses?: { id: number; slug: string; title: string }[] };

export default function Mentors() {
  const mentors = useMentors();
  const [selectedId, setSelectedId] = useState(0);
  const detail = useMentor(selectedId) as ReturnType<typeof useMentor> & { data?: MentorDetail };

  useSeo({
    title: "Mentors",
    description:
      "Learn from industry mentors working at leading companies. Get guidance, project reviews and career advice from practitioners who've done the job.",
    canonicalPath: "/mentors",
  });

  const onView = (mentor: Mentor) => setSelectedId(mentor.id);

  return (
    <div>
      <PageHero
        title="Meet your mentors"
        description="Practitioners from top companies who guide your learning, review your work and prepare you for interviews."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Mentors" }]}
      />

      <Section>
        <QueryState
          isLoading={mentors.isLoading}
          isError={mentors.isError}
          error={mentors.error}
          onRetry={() => mentors.refetch()}
          skeleton={
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-80 w-full" />)}
            </div>
          }
        >
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {mentors.data?.map((mentor, i) => (
              <Reveal key={mentor.id} delay={(i % 4) * 0.05}>
                <MentorCard mentor={mentor} onView={onView} />
              </Reveal>
            ))}
          </div>
        </QueryState>
      </Section>

      <Section className="bg-muted/30 pb-20">
        <SectionHeading align="center" eyebrow="How mentorship works" title="Support that actually moves you forward" description="Choose a plan and get matched with a mentor aligned to your goals." />
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {[
            { title: "1. Get matched", text: "We match you with a mentor based on your target role and current level." },
            { title: "2. Weekly sessions", text: "Ask questions, review projects and plan your learning every week." },
            { title: "3. Career prep", text: "Resume reviews, mock interviews and referrals to hiring partners." },
          ].map((item, i) => (
            <Reveal key={item.title} delay={i * 0.08}>
              <div className="h-full rounded-xl border border-border bg-card p-6 text-center shadow-soft">
                <h3 className="text-base font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button size="lg" asChild><Link to="/pricing">See mentorship plans</Link></Button>
        </div>
      </Section>

      <Dialog open={selectedId > 0} onOpenChange={(open) => !open && setSelectedId(0)} title="Mentor profile" className="sm:max-w-xl">
        {detail.isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : detail.data ? (
          <div className="flex flex-col gap-4">
            <DialogHeader>
              <div className="flex items-center gap-4">
                <Avatar name={detail.data.name} src={detail.data.avatarUrl} className="size-16 text-xl" />
                <div>
                  <DialogTitle>{detail.data.name}</DialogTitle>
                  <DialogDescription>{detail.data.role} · {detail.data.company}</DialogDescription>
                  <RatingStars rating={detail.data.rating} reviews={detail.data.reviewsCount} className="mt-1" />
                </div>
              </div>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">{detail.data.bio}</p>
            <div className="flex flex-wrap gap-2">
              {detail.data.expertise.map((e) => <Badge key={e} variant="outline" className="font-normal">{e}</Badge>)}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span>{detail.data.experienceYears}+ years experience</span>
              <span>{detail.data.availability}</span>
              {detail.data.linkedin && (
                <a href={detail.data.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-primary hover:underline">
                  <Globe className="size-4" /> LinkedIn
                </a>
              )}
            </div>
            {detail.data.courses && detail.data.courses.length > 0 && (
              <div className="border-t border-border pt-4">
                <p className="mb-2 text-sm font-semibold">Courses taught</p>
                <div className="flex flex-col gap-2">
                  {detail.data.courses.map((c) => (
                    <Link key={c.id} to={`/course/${c.slug}`} onClick={() => setSelectedId(0)} className="flex items-center gap-3 rounded-lg border border-border p-2 text-sm transition-colors hover:bg-muted">
                      <BookOpen className="size-4 text-primary" /> {c.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </Dialog>
    </div>
  );
}
