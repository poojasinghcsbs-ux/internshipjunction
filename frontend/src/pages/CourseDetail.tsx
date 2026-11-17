import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Clock, Users, BookOpen, Video, Award, CheckCircle2, GraduationCap,
  PlayCircle, Star, BarChart3, Globe, ArrowRight, Layers,
} from "lucide-react";
import { PageHero } from "@/components/common/page-hero";
import { QueryState } from "@/components/common/query-state";
import { Section } from "@/components/common/section";
import { SectionHeading } from "@/components/common/section-heading";
import { CourseCard } from "@/components/common/course-card";
import { TestimonialCard } from "@/components/common/testimonial-card";
import { RatingStars } from "@/components/common/rating-stars";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion } from "@/components/ui/accordion";
import { useCourse } from "@/lib/queries";
import { useAuth } from "@/components/providers/auth-provider";
import { useSeo } from "@/lib/hooks/use-seo";
import { formatCurrency, formatNumber, discountPercent } from "@/lib/utils";
import type { Course } from "@/lib/types";

const lessonIcon: Record<string, typeof Video> = {
  video: Video,
  reading: BookOpen,
  quiz: Star,
  assignment: CheckCircle2,
  live: PlayCircle,
};

export default function CourseDetail() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const course = useCourse(slug);
  const [tab, setTab] = useState("overview");
  const data = course.data as (Course & { related?: Course[] }) | undefined;

  useSeo({
    title: data?.title ?? "Course",
    description: data?.shortDescription ?? "Explore this mentor-led course on InternshipJunction.",
    image: data?.thumbnail,
    canonicalPath: `/course/${slug}`,
    jsonLd: data
      ? {
          "@context": "https://schema.org",
          "@type": "Course",
          name: data.title,
          description: data.shortDescription,
          provider: { "@type": "Organization", name: "InternshipJunction", sameAs: "https://internshipjunction.com" },
          offers: { "@type": "Offer", price: data.price, priceCurrency: "INR", availability: "https://schema.org/InStock" },
          aggregateRating: { "@type": "AggregateRating", ratingValue: data.rating, reviewCount: data.reviewsCount },
        }
      : undefined,
  });

  const enroll = () => {
    const target = `/checkout?type=course&slug=${slug}&plan=pro`;
    if (!user) navigate(`/login?redirect=${encodeURIComponent(target)}`);
    else navigate(target);
  };

  if (course.isLoading) {
    return (
      <div className="container-page py-10">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (course.isError || !data) {
    return (
      <Section>
        <QueryState isError error={course.error} onRetry={() => course.refetch()}>
          <div />
        </QueryState>
      </Section>
    );
  }

  const discount = discountPercent(data.originalPrice, data.price);
  const totalLessons = data.modules?.reduce((sum, m) => sum + m.lessons.length, 0) ?? 0;

  return (
    <div>
      <PageHero title={data.title} breadcrumbs={[{ label: "Home", to: "/" }, { label: "Courses", to: "/courses" }, { label: data.category }]}>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <RatingStars rating={data.rating} reviews={data.reviewsCount} size="md" />
          <span className="inline-flex items-center gap-1.5"><Users className="size-4" /> {formatNumber(data.studentsCount)} learners</span>
          <span className="inline-flex items-center gap-1.5"><BarChart3 className="size-4" /> {data.level}</span>
          <span className="inline-flex items-center gap-1.5"><Clock className="size-4" /> {data.duration}</span>
        </div>
      </PageHero>

      <div className="container-page grid gap-10 py-10 lg:grid-cols-[1fr_360px]">
        <div>
          {/* Media */}
          <div className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-muted">
            <img src={data.thumbnail} alt={data.title} className="size-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/25">
              <span className="flex size-16 items-center justify-center rounded-full bg-white/90 text-primary shadow-lift">
                <PlayCircle className="size-8" />
              </span>
            </div>
            <Badge variant="success" className="absolute left-4 top-4 bg-background/90 backdrop-blur">
              {data.mode === "live" ? "Live instructor-led" : "Self-paced"}
            </Badge>
          </div>

          <p className="mt-6 text-base text-muted-foreground">{data.shortDescription}</p>

          <Tabs value={tab} onValueChange={setTab} className="mt-8">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="mentor">Mentor</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="flex flex-col gap-8">
                <div>
                  <h2 className="text-lg font-semibold">About this course</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{data.overview}</p>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <h3 className="text-base font-semibold">What you'll learn</h3>
                    <ul className="mt-3 flex flex-col gap-2">
                      {data.outcomes.map((o) => (
                        <li key={o} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" /> {o}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold">Who this is for</h3>
                    <ul className="mt-3 flex flex-col gap-2">
                      {data.audience.map((a) => (
                        <li key={a} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" /> {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-semibold">Prerequisites</h3>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {data.prerequisites.map((p) => <Badge key={p} variant="outline" className="font-normal">{p}</Badge>)}
                  </ul>
                </div>
                <div>
                  <h3 className="text-base font-semibold">Career outcomes</h3>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {data.careerOutcomes.map((c) => (
                      <div key={c} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-sm">
                        <GraduationCap className="size-4 shrink-0 text-primary" /> {c}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-semibold">Technologies covered</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {data.technologies.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="curriculum">
              <p className="mb-4 text-sm text-muted-foreground">
                {data.modules?.length ?? 0} modules · {totalLessons} lessons · {data.duration}
              </p>
              <Accordion
                defaultOpen={0}
                items={(data.modules ?? []).map((module, index) => ({
                  title: (
                    <span className="flex items-center gap-2">
                      <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">{index + 1}</span>
                      {module.title}
                    </span>
                  ),
                  content: (
                    <ul className="flex flex-col divide-y divide-border">
                      {module.lessons.map((lesson) => {
                        const Icon = lessonIcon[lesson.type] ?? Video;
                        return (
                          <li key={lesson.id} className="flex items-center justify-between gap-3 py-2.5">
                            <span className="flex items-center gap-3 text-sm">
                              <Icon className="size-4 text-muted-foreground" />
                              {lesson.title}
                              {lesson.isPreview && <Badge variant="accent">Preview</Badge>}
                            </span>
                            <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                          </li>
                        );
                      })}
                    </ul>
                  ),
                }))}
              />
            </TabsContent>

            <TabsContent value="reviews">
              <div className="grid gap-4 sm:grid-cols-2">
                {(data.reviews ?? []).map((review) => <TestimonialCard key={review.id} review={review} />)}
              </div>
            </TabsContent>

            <TabsContent value="mentor">
              {data.mentor ? (
                <Card className="flex flex-col items-start gap-5 p-6 sm:flex-row">
                  <Avatar name={data.mentor.name} src={data.mentor.avatarUrl} className="size-20 text-2xl" />
                  <div>
                    <h3 className="text-lg font-semibold">{data.mentor.name}</h3>
                    <p className="text-sm text-muted-foreground">{data.mentor.role} · {data.mentor.company}</p>
                    <RatingStars rating={data.mentor.rating} reviews={data.mentor.reviewsCount} className="mt-2" />
                    <p className="mt-3 text-sm text-muted-foreground">{data.mentor.bio}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {data.mentor.expertise.map((e) => <Badge key={e} variant="outline" className="font-normal">{e}</Badge>)}
                    </div>
                  </div>
                </Card>
              ) : (
                <p className="text-sm text-muted-foreground">Mentor details coming soon.</p>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sticky pricing */}
        <aside className="lg:relative">
          <div className="lg:sticky lg:top-24">
            <Card className="flex flex-col gap-5 p-6 shadow-lift">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold">{formatCurrency(data.price)}</span>
                {discount > 0 && (
                  <>
                    <span className="text-base text-muted-foreground line-through">{formatCurrency(data.originalPrice)}</span>
                    <Badge variant="destructive">{discount}% OFF</Badge>
                  </>
                )}
              </div>
              <div className="flex flex-col gap-1.5 text-sm">
                <span className="flex items-center gap-2 text-success"><Clock className="size-4" /> Enroll now, lifetime access</span>
                <span className="flex items-center gap-2 text-muted-foreground"><Award className="size-4" /> {data.certification}</span>
              </div>
              <Button variant="gradient" size="lg" onClick={enroll}>Enroll now</Button>
              <Button variant="outline" size="lg" asChild>
                <Link to={`/checkout?type=course&slug=${slug}&plan=self-paced`}>View payment options</Link>
              </Button>
              <div className="flex flex-col gap-3 border-t border-border pt-5 text-sm">
                <span className="flex items-center justify-between"><span className="inline-flex items-center gap-2 text-muted-foreground"><BookOpen className="size-4" /> Modules</span> {data.modules?.length ?? 0}</span>
                <span className="flex items-center justify-between"><span className="inline-flex items-center gap-2 text-muted-foreground"><Video className="size-4" /> Lessons</span> {totalLessons}</span>
                <span className="flex items-center justify-between"><span className="inline-flex items-center gap-2 text-muted-foreground"><Clock className="size-4" /> Duration</span> {data.duration}</span>
                <span className="flex items-center justify-between"><span className="inline-flex items-center gap-2 text-muted-foreground"><BarChart3 className="size-4" /> Level</span> {data.level}</span>
                <span className="flex items-center justify-between"><span className="inline-flex items-center gap-2 text-muted-foreground"><Users className="size-4" /> Enrolled</span> {formatNumber(data.studentsCount)}</span>
                <span className="flex items-center justify-between"><span className="inline-flex items-center gap-2 text-muted-foreground"><Globe className="size-4" /> Language</span> English</span>
              </div>
            </Card>
          </div>
        </aside>
      </div>

      {data.related && data.related.length > 0 && (
        <Section className="bg-muted/30">
          <SectionHeading eyebrow="Keep exploring" title="Related courses" action={<Button variant="outline" asChild><Link to="/courses">All courses <ArrowRight className="size-4" /></Link></Button>} />
          <div className="mt-8 card-grid">
            {data.related.map((r) => <CourseCard key={r.id} course={r} />)}
          </div>
        </Section>
      )}

      <Section>
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 text-center sm:p-12">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary"><Layers className="size-6" /></span>
          <h2 className="text-2xl font-bold">Ready to start {data.title}?</h2>
          <p className="max-w-xl text-sm text-muted-foreground">Join thousands of learners and take the next step in your career today.</p>
          <Button variant="gradient" size="lg" onClick={enroll}>Enroll now <ArrowRight className="size-4" /></Button>
        </div>
      </Section>
    </div>
  );
}
