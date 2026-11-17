import { Link } from "react-router-dom";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import { PageHero } from "@/components/common/page-hero";
import { Section } from "@/components/common/section";
import { SectionHeading } from "@/components/common/section-heading";
import { Reveal } from "@/components/common/reveal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion } from "@/components/ui/accordion";
import { useSeo } from "@/lib/hooks/use-seo";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Starter",
    price: 0,
    tagline: "For self-driven learners getting started.",
    features: [
      "Access to free self-paced lessons",
      "Community access",
      "Resume builder",
      "1 ATS resume scan / month",
      "Course certificate on completion",
    ],
    cta: "Start free",
    to: "/register",
    highlight: false,
  },
  {
    name: "Pro",
    price: 4999,
    tagline: "For learners who want mentorship and proof of work.",
    features: [
      "Everything in Starter",
      "All self-paced courses",
      "Live cohort classes",
      "Monthly 1:1 mentor session",
      "Unlimited ATS scans",
      "3 AI mock interviews / month",
      "Project reviews with feedback",
      "Verified certificates",
    ],
    cta: "Choose Pro",
    to: "/register",
    highlight: true,
  },
  {
    name: "Advanced",
    price: 14999,
    tagline: "For serious career switchers who want placement support.",
    features: [
      "Everything in Pro",
      "Weekly 1:1 mentorship",
      "Internship & fellowship access",
      "Dedicated placement support",
      "Unlimited AI mock interviews",
      "Priority project reviews",
      "Referrals to hiring partners",
      "Portfolio & GitHub optimisation",
    ],
    cta: "Go Advanced",
    to: "/contact",
    highlight: false,
  },
];

const faqs = [
  { title: "Can I switch plans later?", content: "Yes. You can upgrade at any time and we prorate the difference against your remaining access period." },
  { title: "Do you offer refunds?", content: "We offer a 7-day refund window on Pro and Advanced if you haven't consumed more than 20% of the program." },
  { title: "Are there EMI or installment options?", content: "Popular fellowships support monthly installments at checkout. Contact our team for a guided payment plan." },
  { title: "Is placement guaranteed?", content: "Advanced plans include dedicated placement support with referrals and interview prep. We don't promise a job, but we don't stop until you're hired." },
];

export default function Pricing() {
  useSeo({
    title: "Pricing & Plans",
    description:
      "Flexible InternshipJunction plans for every stage: free Starter access, Pro mentorship and an Advanced career-switcher plan with placement support.",
    canonicalPath: "/pricing",
  });

  return (
    <div>
      <PageHero
        title="Simple, transparent pricing"
        description="Start free and upgrade when you're ready for mentorship, internships and placement support."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Pricing" }]}
      />

      <Section>
        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 0.06}>
              <Card className={cn("relative flex h-full flex-col p-6", plan.highlight && "border-primary shadow-lift ring-1 ring-primary")}>
                {plan.highlight && (
                  <Badge className="absolute -top-3 left-6 border-transparent bg-[linear-gradient(100deg,var(--primary),var(--accent))] text-white">
                    <Sparkles className="size-3.5" /> Most popular
                  </Badge>
                )}
                <h2 className="text-lg font-bold">{plan.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold">{plan.price === 0 ? "Free" : `₹${plan.price.toLocaleString("en-IN")}`}</span>
                  {plan.price > 0 && <span className="text-sm text-muted-foreground">/ program</span>}
                </div>
                <Button variant={plan.highlight ? "gradient" : "outline"} size="lg" className="mt-5" asChild>
                  <Link to={plan.to}>{plan.cta}</Link>
                </Button>
                <ul className="mt-6 flex flex-col gap-3 border-t border-border pt-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="mt-0.5 size-4 shrink-0 text-success" /> {f}
                    </li>
                  ))}
                </ul>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="bg-muted/30">
        <SectionHeading align="center" eyebrow="Enterprise & colleges" title="Training for teams and campuses" description="Custom cohorts, dashboards and outcome reporting for organisations and universities." />
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button size="lg" asChild><Link to="/contact">Request a demo <ArrowRight className="size-4" /></Link></Button>
          <Button size="lg" variant="outline" asChild><Link to="/fellowships">Explore fellowships</Link></Button>
        </div>
      </Section>

      <Section className="pb-20">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionHeading eyebrow="FAQ" title="Pricing questions" description="Everything about payments, plans and guarantees." />
          <Accordion items={faqs} defaultOpen={0} />
        </div>
      </Section>
    </div>
  );
}
