import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Plus, Trash2, Printer, Save, Sparkles, User, GraduationCap, Briefcase, Wrench } from "lucide-react";
import { DashboardPageHeader } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/providers/auth-provider";
import { api, apiErrorMessage } from "@/lib/api";
import { toast } from "sonner";

interface ExperienceItem { company: string; role: string; period: string; summary: string }
interface EducationItem { school: string; degree: string; period: string }

export default function ResumeBuilder() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const title = "My Resume";
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [headline, setHeadline] = useState(user?.headline ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [summary, setSummary] = useState("Motivated developer with hands-on project experience in modern web technologies.");
  const [skills, setSkills] = useState("React, TypeScript, Node.js, Express, MySQL, Tailwind CSS");
  const [experience, setExperience] = useState<ExperienceItem[]>([{ company: "InternshipJunction Projects", role: "Full-Stack Intern", period: "2025", summary: "Built and deployed full-stack features with mentor guidance." }]);
  const [education, setEducation] = useState<EducationItem[]>([{ school: "State University", degree: "B.Tech, Computer Science", period: "2022 - 2026" }]);

  const save = useMutation({
    mutationFn: async () => {
      const data = { fullName, headline, email, phone, summary, skills: skills.split(",").map((s) => s.trim()).filter(Boolean), experience, education };
      await api.post("/resumes", { title, template: "modern", data });
    },
    onSuccess: () => {
      toast.success("Resume saved!");
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  return (
    <div>
      <DashboardPageHeader
        title="Resume builder"
        description="Craft an ATS-friendly resume and save multiple versions."
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.print()}><Printer className="size-4" /> Print</Button>
            <Button variant="gradient" loading={save.isPending} onClick={() => save.mutate()}><Save className="size-4" /> Save resume</Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        {/* Editor */}
        <div className="flex flex-col gap-5">
          <Card className="p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold"><User className="size-4 text-primary" /> Personal details</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5"><Label>Full name</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
              <div className="flex flex-col gap-1.5"><Label>Headline</Label><Input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Full-Stack Developer" /></div>
              <div className="flex flex-col gap-1.5"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div className="flex flex-col gap-1.5"><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold"><Sparkles className="size-4 text-primary" /> Summary</h2>
            <Textarea className="mt-3" rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} />
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold"><Briefcase className="size-4 text-primary" /> Experience</h2>
              <Button size="sm" variant="ghost" onClick={() => setExperience([...experience, { company: "", role: "", period: "", summary: "" }])}><Plus className="size-4" /> Add</Button>
            </div>
            <div className="mt-3 flex flex-col gap-3">
              {experience.map((item, index) => (
                <div key={index} className="rounded-lg border border-border p-3">
                  <div className="grid gap-2 sm:grid-cols-3">
                    <Input placeholder="Role" value={item.role} onChange={(e) => update(experience, setExperience, index, { role: e.target.value })} />
                    <Input placeholder="Company" value={item.company} onChange={(e) => update(experience, setExperience, index, { company: e.target.value })} />
                    <Input placeholder="Period" value={item.period} onChange={(e) => update(experience, setExperience, index, { period: e.target.value })} />
                  </div>
                  <Textarea className="mt-2" rows={2} placeholder="What did you achieve?" value={item.summary} onChange={(e) => update(experience, setExperience, index, { summary: e.target.value })} />
                  <Button size="icon-sm" variant="ghost" className="mt-1 text-destructive" onClick={() => setExperience(experience.filter((_, i) => i !== index))}><Trash2 className="size-4" /></Button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold"><GraduationCap className="size-4 text-primary" /> Education</h2>
              <Button size="sm" variant="ghost" onClick={() => setEducation([...education, { school: "", degree: "", period: "" }])}><Plus className="size-4" /> Add</Button>
            </div>
            <div className="mt-3 flex flex-col gap-3">
              {education.map((item, index) => (
                <div key={index} className="rounded-lg border border-border p-3">
                  <div className="grid gap-2 sm:grid-cols-3">
                    <Input placeholder="Degree" value={item.degree} onChange={(e) => update(education, setEducation, index, { degree: e.target.value })} />
                    <Input placeholder="School" value={item.school} onChange={(e) => update(education, setEducation, index, { school: e.target.value })} />
                    <Input placeholder="Period" value={item.period} onChange={(e) => update(education, setEducation, index, { period: e.target.value })} />
                  </div>
                  <Button size="icon-sm" variant="ghost" className="mt-1 text-destructive" onClick={() => setEducation(education.filter((_, i) => i !== index))}><Trash2 className="size-4" /></Button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold"><Wrench className="size-4 text-primary" /> Skills</h2>
            <Textarea className="mt-3" rows={2} value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Comma separated skills" />
          </Card>
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Live preview</p>
          <Card className="p-6" id="resume-preview">
            <h1 className="text-2xl font-bold">{fullName || "Your Name"}</h1>
            <p className="text-sm text-primary">{headline || "Your headline"}</p>
            <p className="mt-1 text-xs text-muted-foreground">{email} {phone && `· ${phone}`}</p>
            <div className="mt-4 border-t border-border pt-4">
              <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Summary</h2>
              <p className="mt-1 text-sm">{summary}</p>
            </div>
            {experience.length > 0 && (
              <div className="mt-4 border-t border-border pt-4">
                <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Experience</h2>
                <div className="mt-2 flex flex-col gap-3">
                  {experience.map((item, index) => (
                    <div key={index}>
                      <p className="text-sm font-semibold">{item.role || "Role"} {item.company && <span className="text-muted-foreground">· {item.company}</span>}</p>
                      <p className="text-xs text-muted-foreground">{item.period}</p>
                      <p className="mt-0.5 text-sm">{item.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {education.length > 0 && (
              <div className="mt-4 border-t border-border pt-4">
                <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Education</h2>
                <div className="mt-2 flex flex-col gap-2">
                  {education.map((item, index) => (
                    <div key={index}>
                      <p className="text-sm font-semibold">{item.degree}</p>
                      <p className="text-xs text-muted-foreground">{item.school} · {item.period}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-4 border-t border-border pt-4">
              <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Skills</h2>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {skills.split(",").map((s) => s.trim()).filter(Boolean).map((skill) => <Badge key={skill} variant="secondary" className="font-normal">{skill}</Badge>)}
              </div>
            </div>
          </Card>
          <Card className="mt-4 flex items-start gap-3 p-4">
            <FileText className="mt-0.5 size-4 shrink-0 text-primary" />
            <p className="text-xs text-muted-foreground">Tip: run this resume through the <strong>ATS checker</strong> to see how recruiters' systems score it.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function update<T>(items: T[], setter: (items: T[]) => void, index: number, patch: Partial<T>) {
  setter(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
}
