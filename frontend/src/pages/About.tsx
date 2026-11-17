import { Link } from "react-router-dom";
import { GraduationCap, Users, FolderKanban, Building2, Award, Heart, ShieldCheck, Rocket, ArrowRight } from "lucide-react";
import { PageHero } from "@/components/common/page-hero";
import { Section } from "@/components/common/section";
import { SectionHeading } from "@/components/common/section-heading";
import { Reveal } from "@/components/common/reveal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MentorCard } from "@/components/common/mentor-card";
import { useMentors, useStats } from "@/lib/queries";
import { useSeo } from "@/lib/hooks/use-seo";
import { formatNumber } from "@/lib/utils";

const values = [
  { icon: Heart, title: "Learner & Outcome First", text: "Every curriculum decision starts with what genuinely helps a student land a real career role." },
  { icon: ShieldCheck, title: "Verified & Transparent", text: "Publicly verifiable certificates, authentic client projects, and tamper-proof credential IDs." },
  { icon: Rocket, title: "Practical Over Theory", text: "Live pull-request reviews, code defenses, and deployable portfolios instead of multiple-choice quizzes." },
];

export default function About() {
  const stats = useStats();
  const mentors = useMentors();

  useSeo({
    title: "About Us",
    description:
      "InternshipJunction is India's premier experiential learning platform offering verified internships, live 1:1 mentorship, and placement drives.",
    canonicalPath: "/about",
  });

  const statItems = [
    { icon: GraduationCap, label: "Learners trained", value: stats.data?.studentsTrained || 15420 },
    { icon: Users, label: "Expert mentors", value: stats.data?.mentors || 48 },
    { icon: FolderKanban, label: "Guided projects", value: stats.data?.projects || 1280 },
    { icon: Building2, label: "Hiring partners", value: stats.data?.hiringPartners || 160 },
    { icon: Award, label: "Certificates issued", value: stats.data?.certifications || 8900 },
  ];

  return (
    <div>
      <PageHero
        title="Closing the College-to-Industry Gap"
        description="InternshipJunction blends live mentor-led training, verified industry internships, and AI-powered career tools so every student can launch a high-impact tech career."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "About" }]}
      >
        <div className="flex flex-wrap gap-3">
          <Button variant="gradient" asChild><Link to="/register">Join InternshipJunction</Link></Button>
          <Button variant="outline" asChild><Link to="/contact">Partner with us</Link></Button>
        </div>
      </PageHero>

      <Section>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {statItems.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.05}>
              <Card className="flex flex-col items-center gap-2 p-5 text-center">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><s.icon className="size-5" /></span>
                <p className="text-2xl font-bold">
                  {stats.isLoading ? <Skeleton className="h-7 w-16" /> : s.value ? `${formatNumber(s.value)}+` : "-"}
                </p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="bg-muted/30">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col gap-4">
            <SectionHeading eyebrow="Our Mission" title="Built by Engineers & Tech Leaders Who Understand Hiring" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              InternshipJunction was founded to address a critical challenge: millions of students graduate each year with academic theory, but lack verifiable, production-grade project experience that hiring managers expect.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We engineered a rigorous, hands-on model where learners work on real-world industry tasks, receive 1:1 code reviews from senior developers, earn accredited certificates, and access direct job referrals across 150+ tech companies.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild><Link to="/courses">Explore programs <ArrowRight className="size-4" /></Link></Button>
              <Button variant="outline" asChild><Link to="/internships">Explore internships</Link></Button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.05}>
                <Card className="flex h-full flex-col gap-3 p-5">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-[linear-gradient(135deg,var(--primary),var(--accent))] text-white"><v.icon className="size-5" /></span>
                  <h3 className="text-base font-semibold">{v.title}</h3>
                  <p className="text-sm text-muted-foreground">{v.text}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Leadership & Mentors"
          title="Mentors from Top Technology Companies"
          description="Learn directly from senior practitioners who build scalable systems daily."
        />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {mentors.isLoading
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-80 w-full" />)
            : mentors.data?.slice(0, 4).map((mentor) => <MentorCard key={mentor.id} mentor={mentor} />)}
        </div>
      </Section>
    </div>
  );
}
