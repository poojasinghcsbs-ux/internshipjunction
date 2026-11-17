import { PageHero } from "@/components/common/page-hero";
import { FellowshipCard } from "@/components/common/fellowship-card";
import { QueryState } from "@/components/common/query-state";
import { Section } from "@/components/common/section";
import { SectionHeading } from "@/components/common/section-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { Reveal } from "@/components/common/reveal";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Rocket, Users, Award, BriefcaseBusiness, Target, CalendarClock } from "lucide-react";
import { useFellowships } from "@/lib/queries";
import { useSeo } from "@/lib/hooks/use-seo";

export default function Fellowships() {
  const fellowships = useFellowships();
  useSeo({
    title: "Career Fellowships",
    description:
      "Intensive, cohort-based career fellowships with live mentorship, capstone projects and placement support until you land the role your skills deserve.",
    canonicalPath: "/fellowships",
  });

  return (
    <div>
      <PageHero
        title="Career fellowships"
        description="Go beyond courses. Join a cohort, build a portfolio-grade capstone and get dedicated placement support."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Fellowships" }]}
      >
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2"><Users className="size-4 text-primary" /> Small cohorts</span>
          <span className="inline-flex items-center gap-2"><CalendarClock className="size-4 text-primary" /> 12–24 weeks</span>
          <span className="inline-flex items-center gap-2"><BriefcaseBusiness className="size-4 text-primary" /> Placement support</span>
        </div>
      </PageHero>

      <Section>
        <QueryState
          isLoading={fellowships.isLoading}
          isError={fellowships.isError}
          error={fellowships.error}
          onRetry={() => fellowships.refetch()}
          skeleton={
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-96 w-full" />)}
            </div>
          }
        >
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {fellowships.data?.map((f, i) => (
              <Reveal key={f.id} delay={i * 0.05}><FellowshipCard fellowship={f} /></Reveal>
            ))}
          </div>
        </QueryState>
      </Section>

      <Section className="bg-muted/30">
        <SectionHeading align="center" eyebrow="Why fellowships" title="What makes our fellowships different" description="A structured, high-support route from skill-building to signed offer." />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Rocket, title: "Capstone-first", text: "Every fellowship ends with a production-grade capstone reviewed by industry mentors." },
            { icon: Target, title: "Personalised roadmap", text: "Your mentor adapts the plan to your background, target role and timeline." },
            { icon: Award, title: "Verified certification", text: "Graduate with a verifiable fellowship certificate recognised by hiring partners." },
            { icon: BriefcaseBusiness, title: "Placement support", text: "Resume reviews, mock interviews and warm referrals until you get hired." },
            { icon: Users, title: "Peer cohort", text: "Learn alongside a motivated cohort, with accountability pods and group projects." },
            { icon: CalendarClock, title: "Flexible schedule", text: "Weekend and evening live sessions designed to fit around work or college." },
          ].map((item, i) => (
            <Reveal key={item.title} delay={i * 0.05}>
              <div className="flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-soft">
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><item.icon className="size-5" /></span>
                <h3 className="mt-4 text-base font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button size="lg" asChild><Link to="/contact">Talk to an admissions advisor</Link></Button>
        </div>
      </Section>
    </div>
  );
}
