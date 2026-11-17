import { Link } from "react-router-dom";
import {
  FileText, ScanSearch, MessagesSquare, BriefcaseBusiness, FolderKanban,
  Award, ArrowRight, CheckCircle2, BookOpen, Video,
} from "lucide-react";
import { PageHero } from "@/components/common/page-hero";
import { Section } from "@/components/common/section";
import { SectionHeading } from "@/components/common/section-heading";
import { Reveal } from "@/components/common/reveal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion } from "@/components/ui/accordion";
import { useSeo } from "@/lib/hooks/use-seo";

const tools = [
  {
    id: "resume",
    icon: FileText,
    title: "Resume Builder",
    description: "Build an ATS-friendly resume with guided sections, live preview, strong action verbs and one-click PDF export.",
    to: "/dashboard/resume",
    points: ["Recruiter-approved templates", "Live preview & auto-save", "PDF export ready to apply", "Guided content prompts"],
  },
  {
    id: "ats",
    icon: ScanSearch,
    title: "AI ATS Resume Checker",
    description: "Paste your resume, pick a target role and get an instant score with section-wise feedback and keyword gaps.",
    to: "/dashboard/ats",
    points: ["Overall ATS score", "Section-wise breakdown", "Missing keywords", "Rewrite suggestions"],
  },
  {
    id: "interview",
    icon: MessagesSquare,
    title: "AI Mock Interviews",
    description: "Practice role-specific technical and HR interviews, answer timed questions and receive detailed scoring.",
    to: "/dashboard/interviews",
    points: ["Role & stack specific", "Instant scoring", "Strengths & weaknesses", "Actionable improvement plan"],
  },
  {
    id: "jobs",
    icon: BriefcaseBusiness,
    title: "Job Portal & Tracker",
    description: "Discover curated roles, apply in a click and track every application status from applied to selected.",
    to: "/jobs",
    points: ["Curated early-career roles", "Save & apply fast", "Application tracking", "Recommended matches"],
  },
  {
    id: "projects",
    icon: FolderKanban,
    title: "Project Portfolio",
    description: "Ship real projects from your courses, submit them for mentor review and showcase a public-ready portfolio.",
    to: "/dashboard/projects",
    points: ["Guided project briefs", "Mentor code review", "Scores & feedback", "Portfolio-ready output"],
  },
  {
    id: "certificates",
    icon: Award,
    title: "Verified Certificates",
    description: "Earn verifiable certificates for every course, internship and fellowship with public verification links.",
    to: "/dashboard/certificates",
    points: ["Unique certificate ID", "Public verify link", "Shareable to LinkedIn", "Employer-recognised"],
  },
];

export default function Resources() {
  useSeo({
    title: "Career Resources & Tools",
    description:
      "Free career tools from InternshipJunction: resume builder, AI ATS checker, mock interviews, project portfolio, job portal and verified certificates.",
    canonicalPath: "/resources",
  });

  return (
    <div>
      <PageHero
        title="Career toolkit & resources"
        description="Everything you need to go from learning to hired — built right into your InternshipJunction account."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Resources" }]}
      >
        <div className="flex flex-wrap gap-3">
          <Button variant="gradient" asChild><Link to="/register">Create free account</Link></Button>
          <Button variant="outline" asChild><Link to="/courses">Browse courses</Link></Button>
        </div>
      </PageHero>

      <Section>
        <div className="grid gap-6 lg:grid-cols-2">
          {tools.map((tool, i) => (
            <Reveal key={tool.id} delay={(i % 2) * 0.05}>
              <Card id={tool.id} className="flex h-full flex-col gap-4 p-6 scroll-mt-24">
                <div className="flex items-center gap-3">
                  <span className="flex size-12 items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--primary),var(--accent))] text-white">
                    <tool.icon className="size-6" />
                  </span>
                  <h2 className="text-lg font-semibold">{tool.title}</h2>
                </div>
                <p className="text-sm text-muted-foreground">{tool.description}</p>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {tool.points.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" /> {point}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-2">
                  <Button variant="outline" asChild>
                    <Link to={tool.to}>Open {tool.title} <ArrowRight className="size-4" /></Link>
                  </Button>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="bg-muted/30">
        <SectionHeading align="center" eyebrow="Guides & learning" title="Resources to sharpen your edge" description="Templates, checklists and lessons curated by our career team." />
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {[
            { icon: BookOpen, title: "Resume templates", text: "Download starting templates for freshers and experienced professionals.", tag: "Templates" },
            { icon: Video, title: "Interview masterclass", text: "Watch recorded sessions on behavioural and technical interview strategy.", tag: "Video" },
            { icon: BriefcaseBusiness, title: "Career playbooks", text: "Step-by-step guides to switching into tech, data, design and product.", tag: "Guide" },
          ].map((item, i) => (
            <Reveal key={item.title} delay={i * 0.06}>
              <Card className="flex h-full flex-col gap-3 p-5">
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><item.icon className="size-5" /></span>
                <Badge variant="secondary" className="w-fit">{item.tag}</Badge>
                <h3 className="text-base font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.text}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionHeading eyebrow="FAQ" title="Tool questions, answered" description="Quick answers about our career toolkit." />
          <Accordion
            items={[
              { title: "Are these tools free?", content: "The resume builder and ATS checker are free for all registered learners. Advanced AI mock interviews and full placement support are included in Pro and Advanced plans." },
              { title: "Is my data secure?", content: "Yes. Your resume and interview data are private to your account and never shared with employers without your explicit application." },
              { title: "Do certificates expire?", content: "No. InternshipJunction certificates are valid indefinitely and remain verifiable through their public links." },
              { title: "Can I export my resume as PDF?", content: "Absolutely. The resume builder offers one-click PDF export formatted for applicant tracking systems." },
            ]}
          />
        </div>
      </Section>
    </div>
  );
}
