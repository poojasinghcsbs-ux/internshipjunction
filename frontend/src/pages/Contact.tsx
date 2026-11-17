import { useState, type FormEvent } from "react";
import { Mail, Phone, MapPin, Send, Clock, MessageSquare, CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/common/page-hero";
import { Section } from "@/components/common/section";
import { SectionHeading } from "@/components/common/section-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Accordion } from "@/components/ui/accordion";
import { useSeo } from "@/lib/hooks/use-seo";
import { toast } from "sonner";
import { sleep } from "@/lib/utils";

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  useSeo({
    title: "Contact Us",
    description:
      "Get in touch with the InternshipJunction team for admissions, partnerships, colleges and enterprise training. We usually respond within one business day.",
    canonicalPath: "/contact",
  });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSending(true);
    await sleep(900);
    setSending(false);
    setSent(true);
    toast.success("Thanks! Our team will reach out within one business day.");
  };

  const channels = [
    { icon: Mail, label: "Email", value: "support@internshipjunction.com", href: "mailto:support@internshipjunction.com" },
    { icon: Phone, label: "Phone", value: "+91 90000 12345", href: "tel:+919000012345" },
    { icon: MapPin, label: "Office", value: "Bengaluru, Karnataka, India" },
    { icon: Clock, label: "Hours", value: "Mon–Sat · 9:00–18:00 IST" },
  ];

  return (
    <div>
      <PageHero
        title="Talk to our team"
        description="Questions about courses, fellowships, partnerships or enterprise training? We're here to help."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Contact" }]}
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <SectionHeading eyebrow="Send a message" title="We'd love to hear from you" description="Fill in the form and we'll get back within one business day." />
            {sent ? (
              <Card className="mt-6 flex flex-col items-center gap-3 p-10 text-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-success/12 text-success"><CheckCircle2 className="size-7" /></span>
                <h3 className="text-lg font-semibold">Message sent!</h3>
                <p className="max-w-sm text-sm text-muted-foreground">Thank you for reaching out. Our team will respond to your query shortly.</p>
                <Button variant="outline" onClick={() => setSent(false)}>Send another message</Button>
              </Card>
            ) : (
              <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="c-name">Full name</Label>
                    <Input id="c-name" required placeholder="Your name" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="c-email">Email</Label>
                    <Input id="c-email" type="email" required placeholder="you@example.com" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="c-topic">I'm interested in</Label>
                  <Select id="c-topic" defaultValue="courses">
                    <option value="courses">Course admissions</option>
                    <option value="fellowship">Fellowship / career switch</option>
                    <option value="internship">Internships</option>
                    <option value="college">College / campus program</option>
                    <option value="enterprise">Enterprise training</option>
                    <option value="support">Technical support</option>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="c-message">Message</Label>
                  <Textarea id="c-message" rows={5} required placeholder="Tell us how we can help..." />
                </div>
                <Button type="submit" variant="gradient" size="lg" loading={sending} className="w-fit">
                  <Send className="size-4" /> Send message
                </Button>
              </form>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {channels.map((c) => (
              <Card key={c.label} className="flex items-center gap-4 p-5">
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><c.icon className="size-5" /></span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{c.label}</p>
                  {c.href ? (
                    <a href={c.href} className="text-sm font-medium transition-colors hover:text-primary">{c.value}</a>
                  ) : (
                    <p className="text-sm font-medium">{c.value}</p>
                  )}
                </div>
              </Card>
            ))}
            <Card className="flex flex-col gap-3 p-5">
              <span className="flex items-center gap-2 text-sm font-semibold"><MessageSquare className="size-4 text-primary" /> Need a quick answer?</span>
              <p className="text-sm text-muted-foreground">Check our frequently asked questions below — most answers are a click away.</p>
            </Card>
          </div>
        </div>
      </Section>

      <Section className="bg-muted/30 pb-20">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionHeading eyebrow="FAQ" title="Common questions" description="Can't find what you're looking for? Message us above." />
          <Accordion
            defaultOpen={0}
            items={[
              { title: "How do I enroll in a course?", content: "Browse courses, open the one you like and click Enroll. You can pay securely at checkout and start learning immediately." },
              { title: "Do you offer college partnerships?", content: "Yes. We run campus programs with custom cohorts and placement drives. Choose 'College / campus program' in the form." },
              { title: "Can I get an invoice for my purchase?", content: "Absolutely. Invoices are generated automatically after payment and available under your account settings." },
              { title: "How quickly do you respond?", content: "We aim to reply within one business day, and usually much sooner during working hours." },
            ]}
          />
        </div>
      </Section>
    </div>
  );
}
