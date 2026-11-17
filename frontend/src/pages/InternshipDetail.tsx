import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Clock, MapPin, Award, Users, CalendarDays, CheckCircle2, ShieldCheck,
  Briefcase, Send, Layers, Star, FileText, CheckCircle, Sparkles
} from "lucide-react";
import { PageHero } from "@/components/common/page-hero";
import { QueryState } from "@/components/common/query-state";
import { Section } from "@/components/common/section";
import { SectionHeading } from "@/components/common/section-heading";
import { StatusPill } from "@/components/ui/status-pill";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Accordion } from "@/components/ui/accordion";
import { Dialog, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useInternship } from "@/lib/queries";
import { useAuth } from "@/components/providers/auth-provider";
import { api, apiErrorMessage } from "@/lib/api";
import { useSeo } from "@/lib/hooks/use-seo";
import { formatDate, formatNumber } from "@/lib/utils";
import { toast } from "sonner";

interface ApplyResponse {
  success: boolean;
  applicationNumber: string;
  message: string;
}

const internshipFaqs = [
  {
    title: "Is this internship recognized by colleges and employers?",
    content: "Yes! InternshipJunction is ISO 9001:2015 certified and recognized under Startup India and MSME. Your completion certificate contains a unique Credential ID and public URL that colleges and companies can verify instantly."
  },
  {
    title: "How do I qualify for the Letter of Recommendation (LOR)?",
    content: "Learners who submit all weekly milestone tasks on time, score above 85% on their final capstone project code defense, and demonstrate active problem-solving receive an official Letter of Recommendation signed by industry mentors."
  },
  {
    title: "Can I manage this alongside college exams or full-time work?",
    content: "Yes. The program is designed for flexible learning. You receive weekly milestone goals, recorded masterclasses, and weekend mentor check-ins so you can work at your own pace."
  },
  {
    title: "What happens after I submit this application?",
    content: "Our admissions and mentor team reviews your submission within 24 to 48 hours. You will receive an email confirmation with your cohort onboarding details and repository setup guidelines."
  },
];

export default function InternshipDetail() {
  const { slug = "" } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const internship = useInternship(slug);
  const data = internship.data;

  const [open, setOpen] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<ApplyResponse | null>(null);

  // Application form fields
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    college: "",
    degree: "",
    graduationYear: "2026",
    duration: "8 weeks",
    portfolioUrl: "",
    linkedinUrl: "",
    coverLetter: "",
  });

  useSeo({
    title: data?.title ? `${data.title} - Virtual Internship` : "Internship Details",
    description: data?.shortDescription ?? "Apply to this industry internship program on InternshipJunction.",
    image: data?.thumbnail,
    canonicalPath: `/internship/${slug}`,
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      const { data: res } = await api.post<ApplyResponse>(`/internships/${slug}/apply`, form);
      return res;
    },
    onSuccess: (res) => {
      setSubmittedApp(res);
      toast.success("Application submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["internship", slug] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    applyMutation.mutate();
  };

  const handleOpen = () => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        fullName: prev.fullName || user.fullName,
        email: prev.email || user.email,
        phone: prev.phone || user.phone || "",
      }));
    }
    setOpen(true);
  };

  if (internship.isLoading) {
    return (
      <div className="container-page py-10">
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (internship.isError || !data) {
    return (
      <Section>
        <QueryState isError error={internship.error} onRetry={() => internship.refetch()}>
          <div />
        </QueryState>
      </Section>
    );
  }

  return (
    <div>
      <PageHero
        title={data.title}
        breadcrumbs={[
          { label: "Home", to: "/" },
          { label: "Internships", to: "/internships" },
          { label: data.domain },
        ]}
      >
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm text-muted-foreground">
          <StatusPill status={data.status} />
          <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
            <Briefcase className="size-4 text-primary" /> {data.domain}
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium">
            <Clock className="size-4 text-primary" /> {data.duration}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-4 text-primary" /> {data.location} · {data.mode}
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
            <Users className="size-4 text-emerald-500" /> {formatNumber(data.applicantsCount)} enrolled
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
            ● ISO 9001:2015 Verified
          </span>
        </div>
      </PageHero>

      <div className="container-page grid gap-10 py-10 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-9">
          {/* BANNER PREVIEW */}
          <div className="relative aspect-[16/8] overflow-hidden rounded-2xl border border-border bg-muted shadow-soft">
            <img src={data.thumbnail} alt={data.title} className="size-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 text-white">
              <div>
                <p className="text-xs uppercase font-bold tracking-wider text-emerald-400">Industry Program</p>
                <h3 className="text-xl sm:text-2xl font-extrabold">{data.title}</h3>
              </div>
              <Badge className="bg-primary text-white border-0 py-1 px-3 text-xs font-semibold">
                Cohort Enrolling
              </Badge>
            </div>
          </div>

          {/* OVERVIEW */}
          <div>
            <h2 className="text-xl font-bold tracking-tight">Program Overview</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{data.overview}</p>
          </div>

          {/* TECH STACK & SKILLS */}
          <div>
            <h3 className="text-base font-bold">Technologies & Frameworks You Will Master</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {data.skills.map((s) => (
                <Badge key={s} variant="secondary" className="px-3 py-1 text-xs font-semibold">
                  {s}
                </Badge>
              ))}
            </div>
          </div>

          {/* ELIGIBILITY & PREREQUISITES */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-base font-bold flex items-center gap-2">
              <CheckCircle className="size-5 text-emerald-500" /> Who Can Apply
            </h3>
            <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {data.eligibility.map((e) => (
                <li key={e} className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                  <span>{e}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* WEEK-BY-WEEK MILESTONES */}
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold tracking-tight">Structured Milestone Roadmap</h3>
              <span className="text-xs font-semibold text-primary">{data.roadmap.length} Milestone Sprints</span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Each sprint involves real deliverables, code reviews, and architectural checkpoints.
            </p>

            <div className="mt-6 flex flex-col gap-4">
              {data.roadmap.map((week, i) => (
                <div key={week.week} className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-xs font-extrabold text-primary border border-primary/20 group-hover:bg-primary group-hover:text-white transition-colors">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {i < data.roadmap.length - 1 && <span className="mt-2 w-0.5 flex-1 bg-border" />}
                  </div>
                  <div className="flex-1 pb-6 rounded-xl border border-border/80 bg-card p-4 shadow-soft">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">{week.week}</span>
                    <h4 className="mt-0.5 text-base font-bold text-foreground">{week.title}</h4>
                    <ul className="mt-2.5 grid gap-1.5 sm:grid-cols-2">
                      {week.tasks.map((task) => (
                        <li key={task} className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                          <span className="size-1.5 rounded-full bg-primary/60 shrink-0" />
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CERTIFICATE & LOR HIGHLIGHT (UNIFIED MENTOR FOCUS) */}
          <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-lift">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-5">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  <Sparkles className="size-3.5" /> Tangible Proof of Work
                </span>
                <h3 className="mt-1 text-lg font-bold">Verified Credential & Letter of Recommendation</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Every graduate receives an accredited credential verifiable by employers worldwide.
                </p>
              </div>
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 font-semibold self-start sm:self-center">
                ISO 9001:2015 Verified
              </Badge>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border/80 bg-background/80 p-4">
                <ShieldCheck className="size-6 text-primary mb-2" />
                <h5 className="text-sm font-bold">Tamper-Proof ID</h5>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Unique credential ID with public URL for instant recruiter background verification.
                </p>
              </div>
              <div className="rounded-xl border border-border/80 bg-background/80 p-4">
                <FileText className="size-6 text-amber-500 mb-2" />
                <h5 className="text-sm font-bold">Performance LOR</h5>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Official Letter of Recommendation highlighting your project skills for top performers.
                </p>
              </div>
              <div className="rounded-xl border border-border/80 bg-background/80 p-4">
                <Briefcase className="size-6 text-emerald-500 mb-2" />
                <h5 className="text-sm font-bold">Placement Referral</h5>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Direct referral opportunities across our 150+ startup and MNC hiring partners.
                </p>
              </div>
            </div>
          </div>

          {/* PERKS LIST */}
          <div>
            <h3 className="text-base font-bold">Included in This Internship Track</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {data.perks.map((p) => (
                <div key={p} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 text-xs sm:text-sm font-medium">
                  <ShieldCheck className="size-4 shrink-0 text-emerald-500" />
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ ACCORDION */}
          <div>
            <h3 className="text-xl font-bold tracking-tight mb-4">Frequently Asked Questions</h3>
            <Accordion items={internshipFaqs} defaultOpen={0} />
          </div>
        </div>

        {/* STICKY APPLICATION SIDEBAR */}
        <aside>
          <div className="lg:sticky lg:top-24">
            <Card className="flex flex-col gap-4 p-6 shadow-lift border-primary/20">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Internship Model</span>
                <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                  {data.stipend}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="inline-flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="size-4 text-primary" /> Application Deadline
                </span>
                <span className="font-bold text-foreground">{formatDate(data.applicationDeadline)}</span>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="inline-flex items-center gap-2 text-muted-foreground">
                  <Award className="size-4 text-primary" /> Cohort Seats
                </span>
                <span className="font-bold text-foreground">{data.openings} open seats</span>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="inline-flex items-center gap-2 text-muted-foreground">
                  <Clock className="size-4 text-primary" /> Duration
                </span>
                <span className="font-bold text-foreground">{data.duration}</span>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="inline-flex items-center gap-2 text-muted-foreground">
                  <Layers className="size-4 text-primary" /> Skill Level
                </span>
                <span className="font-bold text-foreground">{data.level}</span>
              </div>

              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300 font-medium leading-relaxed">
                ✓ Includes Verifiable Certificate, Letter of Recommendation & 1:1 Mentor Code Reviews.
              </div>

              <Button
                variant="gradient"
                size="lg"
                className="w-full font-bold shadow-soft text-sm"
                onClick={handleOpen}
                disabled={data.status !== "open"}
              >
                {data.status === "open" ? "Apply for Internship Now" : "Applications Closed"}
              </Button>

              <p className="text-center text-[11px] text-muted-foreground leading-tight">
                ⚡ Fast application &bull; No prior work experience needed &bull; Certificate upon completion
              </p>
            </Card>

            <Card className="mt-4 p-4 bg-muted/40 border-border text-xs text-muted-foreground flex items-center gap-3">
              <Star className="size-5 text-amber-500 fill-amber-500 shrink-0" />
              <span>
                Rated <strong className="text-foreground">4.9/5</strong> by 15,000+ past interns across India.
              </span>
            </Card>
          </div>
        </aside>
      </div>

      {/* RECOMMENDED COURSES CROSS-SELL */}
      <Section className="bg-muted/30 pb-20">
        <SectionHeading
          align="center"
          eyebrow="Boost Your Preparation"
          title="Enhance Your Skills With Flagship Bootcamps"
          description="Prepare for your internship tasks by exploring our instructor-led deep-dive courses."
        />
        <div className="mt-6 flex justify-center">
          <Button variant="outline" asChild>
            <Link to="/courses">Explore All Bootcamps & Courses</Link>
          </Button>
        </div>
      </Section>

      {/* COMPREHENSIVE APPLICATION MODAL */}
      <Dialog open={open} onOpenChange={setOpen} title="Apply for Internship">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Apply for {data.title}</DialogTitle>
          <DialogDescription>
            Submit your candidate profile below. Our admissions and mentor team will evaluate your application.
          </DialogDescription>
        </DialogHeader>

        {submittedApp ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
              <CheckCircle2 className="size-8" />
            </span>
            <div>
              <h4 className="text-lg font-bold">Application Received!</h4>
              <p className="mt-1 text-xs text-muted-foreground">
                Application ID: <strong className="font-mono text-foreground">{submittedApp.applicationNumber}</strong>
              </p>
              <p className="mt-3 max-w-sm text-xs text-muted-foreground leading-relaxed">
                {submittedApp.message}
              </p>
            </div>
            <div className="flex gap-2 mt-2">
              <Button variant="outline" onClick={() => { setOpen(false); setSubmittedApp(null); }}>
                Close
              </Button>
              <Button variant="gradient" asChild>
                <Link to="/internships">Explore Other Tracks</Link>
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-3 flex flex-col gap-4 max-h-[75vh] overflow-y-auto px-1">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="app-name">Full Name *</Label>
                <Input
                  id="app-name"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="app-email">Email Address *</Label>
                <Input
                  id="app-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="e.g. rahul@example.com"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="app-phone">Phone / WhatsApp Number *</Label>
                <Input
                  id="app-phone"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="app-duration">Preferred Duration</Label>
                <Select
                  id="app-duration"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                >
                  <option value="4 weeks">4 Weeks (Fast Track)</option>
                  <option value="8 weeks">8 Weeks (Standard)</option>
                  <option value="12 weeks">12 Weeks (Comprehensive)</option>
                </Select>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="app-college">College / University</Label>
                <Input
                  id="app-college"
                  value={form.college}
                  onChange={(e) => setForm({ ...form, college: e.target.value })}
                  placeholder="e.g. IIT, NIT, Delhi University..."
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="app-grad">Graduation Year</Label>
                <Select
                  id="app-grad"
                  value={form.graduationYear}
                  onChange={(e) => setForm({ ...form, graduationYear: e.target.value })}
                >
                  <option value="2024">2024 (Graduated)</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                  <option value="other">Other / Working Professional</option>
                </Select>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="app-github">GitHub / Project Portfolio Link</Label>
                <Input
                  id="app-github"
                  value={form.portfolioUrl}
                  onChange={(e) => setForm({ ...form, portfolioUrl: e.target.value })}
                  placeholder="https://github.com/username"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="app-linkedin">LinkedIn Profile (optional)</Label>
                <Input
                  id="app-linkedin"
                  value={form.linkedinUrl}
                  onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="app-cover">Why are you interested in this internship?</Label>
              <Textarea
                id="app-cover"
                rows={3}
                value={form.coverLetter}
                onChange={(e) => setForm({ ...form, coverLetter: e.target.value })}
                placeholder="Mention any prior projects or what skills you want to build during this internship..."
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="gradient" loading={applyMutation.isPending} className="font-semibold">
                <Send className="size-4" /> Submit Application
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  );
}
