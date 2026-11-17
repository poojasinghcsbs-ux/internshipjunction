import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  Search, ArrowRight, GraduationCap, Users, FolderKanban, Building2,
  Award, BadgeCheck, PlayCircle, Sparkles, FileText, ScanSearch,
  MessagesSquare, BriefcaseBusiness, Star, Rocket, Target, Layers,
  ShieldCheck, Code2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Section } from "@/components/common/section";
import { SectionHeading } from "@/components/common/section-heading";
import { Reveal } from "@/components/common/reveal";
import { CourseCard } from "@/components/common/course-card";
import { InternshipCard } from "@/components/common/internship-card";
import { FellowshipCard } from "@/components/common/fellowship-card";
import { MentorCard } from "@/components/common/mentor-card";
import { TestimonialCard } from "@/components/common/testimonial-card";
import { Accordion } from "@/components/ui/accordion";
import { useCourses, useFellowships, useInternships, useMentors, useStats, useTestimonials } from "@/lib/queries";
import { useSeo } from "@/lib/hooks/use-seo";
import { formatNumber } from "@/lib/utils";

const categories = [
  "Web Development", "Data Science", "Machine Learning", "Artificial Intelligence",
  "Cyber Security", "Cloud Computing", "DevOps & CI/CD", "UI/UX Product Design",
  "Business Analytics", "Digital Marketing", "Full Stack Java", "Python Development"
];

const faqs = [
  {
    title: "How does the InternshipJunction internship program work?",
    content: "Our internships are 100% practical and project-driven. You choose your technical domain, work on real-world industry tasks guided by expert mentors, receive weekly code reviews, and earn a verified completion certificate with a Letter of Recommendation (LOR) upon successful submission."
  },
  {
    title: "Are the certificates verified and recognized by employers?",
    content: "Yes! Every certificate issued by InternshipJunction comes with a unique tamper-proof Credential ID and a public verification link. Employers and recruiters can validate your credentials instantly at internshipjunction.com/verify-certificate."
  },
  {
    title: "Do I need prior coding experience to enroll?",
    content: "No previous experience is required for beginner tracks. Our foundation modules and mentor-guided onboarding help learners from all educational backgrounds transition smoothly into tech."
  },
  {
    title: "How does 1:1 mentorship and doubt solving work?",
    content: "You receive access to dedicated mentor channels, weekly live doubt-clearing sessions, and 1:1 code reviews on your capstone projects to ensure your portfolio meets top industry standards."
  },
  {
    title: "What placement assistance is provided?",
    content: "We provide comprehensive career support including AI-powered ATS resume optimization, role-specific mock interviews, LinkedIn portfolio enhancement, and direct referrals across our 150+ hiring partner companies."
  },
  {
    title: "Can I do an internship alongside my college or job?",
    content: "Absolutely. All programs feature flexible, self-paced timelines with recorded sessions and weekend live mentor workshops designed specifically to fit college and working professional schedules."
  },
];

const trustBadges = [
  { label: "ISO 9001:2015 Certified", desc: "Standardized Quality Learning" },
  { label: "Recognized by Startup India", desc: "Govt. of India Initiative" },
  { label: "MSME Registered", desc: "Certified Skill Enterprise" },
  { label: "100% Practical Curriculum", desc: "Real Industry Problem Sets" },
];

export default function Home() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [search, setSearch] = useState("");
  const stats = useStats();
  const courses = useCourses({ featured: true, pageSize: 6 });
  const internships = useInternships({ pageSize: 3 });
  const fellowships = useFellowships();
  const mentors = useMentors();
  const testimonials = useTestimonials();

  useSeo({
    title: "Industry Internships, Tech Courses & Live Mentorship",
    description:
      "InternshipJunction is India's leading career platform for verified internships, practical tech courses, 1:1 live mentorship, and placement drives.",
    canonicalPath: "/",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.title,
          acceptedAnswer: { "@type": "Answer", text: f.content },
        })),
      },
    ],
  });

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/courses?search=${encodeURIComponent(search.trim())}`);
    }
  };

  const statCards = [
    { icon: GraduationCap, label: "Students Trained", value: stats.data?.studentsTrained || 15420 },
    { icon: Layers, label: "Live Programs", value: stats.data?.courses || 24 },
    { icon: Users, label: "Industry Mentors", value: stats.data?.mentors || 48 },
    { icon: FolderKanban, label: "Projects Completed", value: stats.data?.projects || 1280 },
    { icon: Building2, label: "Hiring Partners", value: stats.data?.hiringPartners || 160 },
    { icon: Award, label: "Certifications Issued", value: stats.data?.certifications || 8900 },
  ];

  return (
    <div>
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-4 pb-16 lg:py-20">
        <div className="hero-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-primary/20 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -left-24 top-40 size-80 rounded-full bg-accent/20 blur-3xl" aria-hidden="true" />

        <div className="container-page relative grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-5 inline-flex flex-wrap items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary">
                <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>ISO 9001:2015 Certified</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-foreground">Startup India & MSME Recognized</span>
              </div>
            </motion.div>

            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.05 }}
              className="text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl"
            >
              Accelerate Your Career With{" "}
              <span className="gradient-text">Real-World Internships</span> & Live Mentorship.
            </motion.h1>

            <motion.p
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg"
            >
              Master high-demand tech skills through practical project internships, 1:1 mentor code reviews, verifiable credentials, and direct placement support.
            </motion.p>

            <motion.form
              onSubmit={onSearch}
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.15 }}
              className="mt-7 flex max-w-lg items-center gap-2 rounded-xl border border-border bg-card p-1.5 shadow-soft focus-within:border-primary/50"
              role="search"
            >
              <Search className="ml-2.5 size-4 shrink-0 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Web Dev, Python, AI, Data Science..."
                className="h-10 border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm"
                aria-label="Search courses and internships"
              />
              <Button type="submit" variant="gradient" className="shrink-0 font-medium">Find Tracks</Button>
            </motion.form>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2 }}
              className="mt-6 flex flex-wrap items-center gap-3"
            >
              <Button size="lg" variant="gradient" asChild>
                <Link to="/internships">Explore Internships <ArrowRight className="ml-1 size-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/courses">View All Programs</Link>
              </Button>
              <Button size="lg" variant="ghost" className="text-muted-foreground hover:text-foreground" asChild>
                <Link to="/resources#ats">Check Free ATS Resume</Link>
              </Button>
            </motion.div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs sm:text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 font-medium"><BadgeCheck className="size-4 text-emerald-500" /> Verifiable Certificate & LOR</span>
              <span className="inline-flex items-center gap-1.5 font-medium"><Users className="size-4 text-primary" /> 1:1 Expert Guidance</span>
              <span className="inline-flex items-center gap-1.5 font-medium"><Building2 className="size-4 text-accent" /> 150+ Hiring Partners</span>
            </div>
          </div>

          {/* HERO VISUAL WIDGET */}
          <div className="relative hidden lg:block">
            <Reveal delay={0.15}>
              <div className="relative rounded-2xl border border-border bg-card/90 p-5 shadow-lift backdrop-blur-sm">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full bg-rose-500" />
                    <span className="size-3 rounded-full bg-amber-500" />
                    <span className="size-3 rounded-full bg-emerald-500" />
                    <span className="ml-2 font-mono text-xs text-muted-foreground">internshipjunction.com/cohort</span>
                  </div>
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-500/10 text-[11px]">
                    ● Cohort Enrolling
                  </Badge>
                </div>

                <div className="mt-4 flex items-center gap-3 rounded-xl bg-primary/5 border border-primary/15 p-3.5">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white shadow-soft">
                    <PlayCircle className="size-5" />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Live Masterclass: Microservices & Docker</p>
                    <p className="text-xs text-muted-foreground">Guided by Senior Tech Lead • Next session today</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  {[
                    { label: "Hands-on Capstones", value: "100% Practical", icon: Code2 },
                    { label: "Mentor Rating", value: "4.9 / 5.0", icon: Star },
                    { label: "Hiring Network", value: "150+ Tech Firms", icon: Building2 },
                    { label: "ATS Resume Score", value: "92 / 100", icon: ScanSearch },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl border border-border bg-background/60 p-3">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <item.icon className="size-3.5 text-primary" />
                        <span>{item.label}</span>
                      </div>
                      <p className="mt-1 text-base font-bold text-foreground">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between rounded-xl border border-border/80 bg-muted/40 px-3.5 py-2.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-emerald-500" />
                    Tamper-Proof Credential ID
                  </span>
                  <span className="font-mono font-semibold text-foreground">IJ-2026-VERIFIED</span>
                </div>
              </div>
            </Reveal>

            {/* FLOATING BADGES */}
            <motion.div
              className="absolute -left-6 top-8 w-52 rounded-xl border border-border bg-card p-3 shadow-lift"
              initial={reduce ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Award className="size-3.5 text-amber-500" /> Verified Credential
              </p>
              <p className="mt-1 text-sm font-bold text-foreground">Full-Stack Web Internship</p>
            </motion.div>

            <motion.div
              className="absolute -bottom-6 right-4 w-56 rounded-xl border border-border bg-card p-3 shadow-lift"
              initial={reduce ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <BriefcaseBusiness className="size-3.5 text-emerald-500" /> Candidate Placed
              </p>
              <p className="mt-1 text-sm font-bold text-foreground">Software Engineer • ₹11.5 LPA</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* TRUST RECOGNITION STRIP */}
      <div className="border-y border-border bg-muted/30 py-5">
        <div className="container-page grid grid-cols-2 gap-4 sm:grid-cols-4">
          {trustBadges.map((badge) => (
            <div key={badge.label} className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BadgeCheck className="size-5" />
              </span>
              <div>
                <p className="text-xs sm:text-sm font-bold leading-tight">{badge.label}</p>
                <p className="text-[11px] text-muted-foreground">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* STATS COUNTER */}
      <Section className="py-10 sm:py-12">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {statCards.map((card, i) => (
            <Reveal key={card.label} delay={i * 0.05}>
              <div className="rounded-xl border border-border bg-card p-4 text-center shadow-soft hover:border-primary/40 transition-colors">
                <span className="mx-auto flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <card.icon className="size-4" />
                </span>
                <p className="mt-2 text-xl font-bold">
                  {stats.isLoading ? (
                    <Skeleton className="mx-auto h-6 w-16" />
                  ) : card.value ? (
                    `${formatNumber(card.value)}${typeof card.value === "number" && card.value > 100 ? "+" : ""}`
                  ) : "-"}
                </p>
                <p className="text-xs text-muted-foreground font-medium">{card.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* DOMAIN TRACKS & CATEGORIES */}
      <Section className="py-6">
        <SectionHeading
          eyebrow="Explore Domains"
          title="Industry-Aligned Career Tracks"
          description="Choose from high-growth technology disciplines designed in collaboration with hiring managers."
        />
        <div className="mt-6 flex flex-wrap gap-2">
          {categories.map((category) => (
            <Link key={category} to={`/courses?category=${encodeURIComponent(category)}`}>
              <Badge variant="outline" className="cursor-pointer px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary">
                {category}
              </Badge>
            </Link>
          ))}
        </div>
      </Section>

      {/* FEATURED INTERNSHIPS (UNIFIED MENTOR FOCUS) */}
      <Section className="bg-muted/30">
        <SectionHeading
          eyebrow="Practical Experience"
          title="Featured Virtual Internships"
          description="Gain tangible proof-of-work on production problem statements with mentor reviews and verified credentials."
          action={
            <Button variant="outline" asChild>
              <Link to="/internships">View All Internships <ArrowRight className="ml-1 size-4" /></Link>
            </Button>
          }
        />
        <div className="mt-8 card-grid">
          {internships.isLoading
            ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-96 w-full" />)
            : internships.data?.data.map((internship) => (
                <InternshipCard key={internship.id} internship={internship} />
              ))}
        </div>
      </Section>

      {/* POPULAR COURSES & BOOTCAMPS */}
      <Section>
        <SectionHeading
          eyebrow="Comprehensive Learning"
          title="Flagship Bootcamps & Courses"
          description="Go from fundamentals to advanced production patterns with live instructor-led masterclasses."
          action={
            <Button variant="outline" asChild>
              <Link to="/courses">View All Courses <ArrowRight className="ml-1 size-4" /></Link>
            </Button>
          }
        />
        <div className="mt-8 card-grid">
          {courses.isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-xl border border-border bg-card">
                  <Skeleton className="aspect-video w-full rounded-none" />
                  <div className="flex flex-col gap-3 p-4">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                </div>
              ))
            : courses.data?.data.map((course) => <CourseCard key={course.id} course={course} />)}
        </div>
      </Section>

      {/* CAREER FELLOWSHIPS */}
      <Section className="bg-muted/30">
        <SectionHeading
          eyebrow="Advanced Cohorts"
          title="Career Fellowships & Placement Guarantees"
          description="Intensive 16 to 24 week cohorts with 1:1 mentorship, real production projects, and direct placement assistance."
          action={<Button variant="outline" asChild><Link to="/fellowships">View all fellowships <ArrowRight className="size-4" /></Link></Button>}
        />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {fellowships.isLoading
            ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-96 w-full" />)
            : fellowships.data?.slice(0, 3).map((f, i) => (
                <Reveal key={f.id} delay={i * 0.05}><FellowshipCard fellowship={f} /></Reveal>
              ))}
        </div>
      </Section>

      {/* THE INTERNSHIPJUNCTION DIFFERENCE */}
      <Section>
        <SectionHeading
          align="center"
          eyebrow="The Advantage"
          title="Why InternshipJunction Over Traditional Courses?"
          description="See how hands-on project execution outperforms passive video lectures."
        />

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Code2,
              title: "Real Client & Industry Projects",
              text: "No trivial to-do apps. Build resilient backend APIs, ML pipelines, and full-stack SaaS apps ready for production.",
            },
            {
              icon: Users,
              title: "1:1 Live Mentor Code Reviews",
              text: "Get constructive PR feedback from experienced engineers who inspect your code cleanliness and system architecture.",
            },
            {
              icon: ShieldCheck,
              title: "Verifiable Credential & LOR",
              text: "Each certificate features a unique QR code and ID. Top performers receive personalized Letters of Recommendation.",
            },
            {
              icon: BriefcaseBusiness,
              title: "Placement Drives & Referrals",
              text: "Access our exclusive hiring portal, receive direct referrals, and prepare with role-specific AI mock interviews.",
            },
          ].map((item, i) => (
            <Reveal key={item.title} delay={i * 0.08}>
              <div className="flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-soft hover:border-primary/40 transition-all">
                <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                  <item.icon className="size-6" />
                </span>
                <h3 className="text-base font-bold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground flex-1 leading-relaxed">{item.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* HOW IT WORKS (4-STEP PATHWAY) */}
      <Section className="bg-muted/30">
        <SectionHeading
          align="center"
          eyebrow="Career Roadmap"
          title="4 Steps to Your Tech Breakthrough"
          description="A proven structured system to transition from student to job-ready professional."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Target, step: "01", title: "Select Domain & Enroll", text: "Choose your internship or bootcamp track according to your career aspirations." },
            { icon: Rocket, step: "02", title: "Build Real Projects", text: "Follow structured milestones, attend live sessions, and code real-world deliverables." },
            { icon: Award, step: "03", title: "Mentor Review & Defense", text: "Submit tasks, receive detailed pull-request reviews, and defend your architecture." },
            { icon: BriefcaseBusiness, step: "04", title: "Certification & Hiring", text: "Receive verified credentials, polish your resume with AI tools, and apply for partner jobs." },
          ].map((step, i) => (
            <Reveal key={step.title} delay={i * 0.08}>
              <div className="relative h-full rounded-xl border border-border bg-card p-6 shadow-soft">
                <span className="absolute right-4 top-4 font-mono text-3xl font-black text-muted-foreground/15">{step.step}</span>
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <step.icon className="size-5" />
                </span>
                <h3 className="mt-4 text-base font-bold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{step.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* CAREER ACCELERATOR TOOLKIT */}
      <Section>
        <SectionHeading
          eyebrow="Free Career Suite"
          title="Included In Every Enrollment"
          description="Cutting-edge AI tools built to boost your resume callbacks and interview performance."
          action={
            <Button variant="outline" asChild>
              <Link to="/resources">Explore Career Tools <ArrowRight className="ml-1 size-4" /></Link>
            </Button>
          }
        />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: FileText, title: "AI Resume Builder", text: "Create modern, recruiter-tested resumes with live formatting and instant PDF download.", to: "/resources#resume" },
            { icon: ScanSearch, title: "ATS Resume Checker", text: "Scan your resume against real job descriptions to identify keywords and score higher.", to: "/resources#ats" },
            { icon: MessagesSquare, title: "AI Mock Interviews", text: "Practice role-specific technical and HR rounds with instant evaluation and feedback.", to: "/resources#interview" },
            { icon: BriefcaseBusiness, title: "Exclusive Job Board", text: "Direct access to curated fresher and junior roles from verified partner companies.", to: "/jobs" },
          ].map((tool, i) => (
            <Reveal key={tool.title} delay={i * 0.06}>
              <Link to={tool.to} className="group flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lift">
                <span className="flex size-11 items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--primary),var(--accent))] text-white">
                  <tool.icon className="size-5" />
                </span>
                <h3 className="mt-4 text-base font-bold">{tool.title}</h3>
                <p className="mt-1 flex-1 text-sm text-muted-foreground leading-relaxed">{tool.text}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  Launch tool <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* INDUSTRY MENTORS */}
      <Section className="bg-muted/30">
        <SectionHeading
          eyebrow="Learn From Top Engineers"
          title="Meet Our Industry Mentors"
          description="Experienced tech leaders and practitioners who guide your learning, review your code, and prep you for interviews."
          action={
            <Button variant="outline" asChild>
              <Link to="/mentors">Meet All Mentors <ArrowRight className="ml-1 size-4" /></Link>
            </Button>
          }
        />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {mentors.isLoading
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-80 w-full" />)
            : mentors.data?.slice(0, 4).map((mentor) => <MentorCard key={mentor.id} mentor={mentor} />)}
        </div>
      </Section>

      {/* STUDENT TESTIMONIALS & OUTCOMES */}
      <Section>
        <SectionHeading
          eyebrow="Student Success"
          title="Proven Career Breakthroughs"
          description="Read genuine experiences from students and professionals who completed our programs."
        />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.isLoading
            ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 w-full" />)
            : testimonials.data?.slice(0, 6).map((review) => <TestimonialCard key={review.id} review={review} />)}
        </div>
      </Section>

      {/* FAQ SECTION */}
      <Section className="bg-muted/30">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionHeading
            eyebrow="Frequently Asked Questions"
            title="Everything You Need To Know"
            description="Have questions regarding our internships, live sessions, certification, or placement process? We're here to help."
            action={
              <Button variant="outline" asChild>
                <Link to="/contact">Contact Student Support</Link>
              </Button>
            }
          />
          <Accordion items={faqs} defaultOpen={0} />
        </div>
      </Section>

      {/* FINAL HIGH-CONVERTING CTA BANNER */}
      <Section className="pb-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border border-border bg-[linear-gradient(135deg,var(--primary),var(--accent))] px-6 py-12 text-center text-white sm:px-12 sm:py-16 shadow-lift">
            <div className="hero-grid pointer-events-none absolute inset-0 opacity-20" aria-hidden="true" />
            <div className="relative mx-auto max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="size-3.5" /> Start Your Internship Journey
              </span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Ready to Turn Practical Knowledge Into a Tech Career?
              </h2>
              <p className="mt-3 text-base text-white/90 leading-relaxed">
                Join over 15,000+ ambitious learners building real-world projects, earning verified certificates, and getting hired at leading companies.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Button size="lg" variant="secondary" className="font-semibold shadow-soft" asChild>
                  <Link to="/register">Apply Now For Free <ArrowRight className="ml-1 size-4" /></Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20" asChild>
                  <Link to="/internships">Explore All Internships</Link>
                </Button>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm text-white/85">
                <span className="inline-flex items-center gap-1.5"><Star className="size-4 fill-white" /> 4.9/5 Learner Rating</span>
                <span className="inline-flex items-center gap-1.5"><GraduationCap className="size-4" /> 15,000+ Enrolled</span>
                <span className="inline-flex items-center gap-1.5"><Building2 className="size-4" /> 150+ Hiring Partners</span>
              </div>
            </div>
          </div>
        </Reveal>
      </Section>
    </div>
  );
}
