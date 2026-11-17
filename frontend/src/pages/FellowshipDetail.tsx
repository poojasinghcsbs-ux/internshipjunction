import { Link, useNavigate, useParams } from "react-router-dom";
import {
  CalendarDays, Users, Sparkles, CheckCircle2, BriefcaseBusiness, Award,
  Target, Clock, ArrowRight,
} from "lucide-react";
import { PageHero } from "@/components/common/page-hero";
import { QueryState } from "@/components/common/query-state";
import { Section } from "@/components/common/section";
import { SectionHeading } from "@/components/common/section-heading";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Accordion } from "@/components/ui/accordion";
import { useFellowship } from "@/lib/queries";
import { useAuth } from "@/components/providers/auth-provider";
import { useSeo } from "@/lib/hooks/use-seo";
import { formatCurrency, formatDate, discountPercent } from "@/lib/utils";

export default function FellowshipDetail() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const fellowship = useFellowship(slug);
  const data = fellowship.data;

  useSeo({
    title: data?.title ?? "Fellowship",
    description: data?.shortDescription ?? "Join this career fellowship on InternshipJunction.",
    image: data?.thumbnail,
    canonicalPath: `/fellowship/${slug}`,
  });

  const enroll = () => {
    const target = `/checkout?type=fellowship&slug=${slug}&plan=advanced`;
    if (!user) navigate(`/login?redirect=${encodeURIComponent(target)}`);
    else navigate(target);
  };

  if (fellowship.isLoading) return <div className="container-page py-10"><Skeleton className="h-64 w-full" /></div>;
  if (fellowship.isError || !data) {
    return <Section><QueryState isError error={fellowship.error} onRetry={() => fellowship.refetch()}><div /></QueryState></Section>;
  }

  const discount = discountPercent(data.originalPrice, data.price);
  const seatsPct = Math.round(((data.seats - data.seatsLeft) / data.seats) * 100);

  return (
    <div>
      <PageHero title={data.title} breadcrumbs={[{ label: "Home", to: "/" }, { label: "Fellowships", to: "/fellowships" }, { label: data.cohort }]}>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 text-primary"><Sparkles className="size-4" /> {data.cohort}</span>
          <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-4" /> Starts {formatDate(data.startDate)}</span>
          <span className="inline-flex items-center gap-1.5"><Clock className="size-4" /> {data.duration}</span>
          <span className="inline-flex items-center gap-1.5"><Users className="size-4" /> {data.seatsLeft} seats left</span>
        </div>
      </PageHero>

      <div className="container-page grid gap-10 py-10 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-8">
          <div className="aspect-video overflow-hidden rounded-2xl border border-border bg-muted">
            <img src={data.thumbnail} alt={data.title} className="size-full object-cover" />
          </div>

          <div>
            <h2 className="text-lg font-semibold">Program overview</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{data.overview}</p>
          </div>

          <div>
            <h3 className="text-base font-semibold">Program highlights</h3>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {data.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" /> {h}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-base font-semibold">Curriculum</h3>
            <div className="mt-3">
              <Accordion
                defaultOpen={0}
                items={data.curriculum.map((module, index) => ({
                  title: (
                    <span className="flex items-center gap-2">
                      <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">{index + 1}</span>
                      {module.title}
                    </span>
                  ),
                  content: (
                    <ul className="flex flex-col gap-1.5">
                      {module.items.map((item) => <li key={item} className="text-sm">• {item}</li>)}
                    </ul>
                  ),
                }))}
              />
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold">Mentors</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {data.mentors.map((m) => <Badge key={m} variant="secondary" className="px-3 py-1.5">{m}</Badge>)}
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold">Career support included</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {data.careerSupport.map((c) => (
                <div key={c} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-sm">
                  <BriefcaseBusiness className="size-4 shrink-0 text-primary" /> {c}
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside>
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
              <div className="flex flex-col gap-2">
                <Progress value={seatsPct} />
                <p className="text-xs text-muted-foreground">{data.seatsLeft} of {data.seats} seats left · {seatsPct}% filled</p>
              </div>
              <Button variant="gradient" size="lg" onClick={enroll} disabled={data.seatsLeft <= 0}>
                {data.seatsLeft > 0 ? "Apply for this cohort" : "Cohort full"}
              </Button>
              <Button variant="outline" asChild><Link to="/contact">Talk to an advisor</Link></Button>
              <div className="flex flex-col gap-2 border-t border-border pt-4 text-sm">
                <span className="flex items-center gap-2 text-muted-foreground"><Target className="size-4" /> {data.domain}</span>
                <span className="flex items-center gap-2 text-muted-foreground"><Award className="size-4" /> Verified fellowship certificate</span>
                <span className="flex items-center gap-2 text-muted-foreground"><CalendarDays className="size-4" /> Starts {formatDate(data.startDate)}</span>
              </div>
            </Card>
          </div>
        </aside>
      </div>

      <Section className="bg-muted/30 pb-20">
        <SectionHeading align="center" title="Not sure yet?" description="Speak with our admissions team to see if this fellowship is right for you." />
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild><Link to="/contact">Talk to admissions <ArrowRight className="size-4" /></Link></Button>
          <Button variant="outline" asChild><Link to="/fellowships">Compare fellowships</Link></Button>
        </div>
      </Section>
    </div>
  );
}
