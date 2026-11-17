import { Link } from "react-router-dom";
import { Globe, AtSign, Play, Code, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/brand/logo";

const columns = [
  {
    title: "Learn & Intern",
    links: [
      { label: "Internships", to: "/internships" },
      { label: "Courses & Bootcamps", to: "/courses" },
      { label: "Fellowships", to: "/fellowships" },
      { label: "Live Classes", to: "/courses?mode=live" },
      { label: "Capstone Projects", to: "/resources#projects" },
    ],
  },
  {
    title: "Career & Placement",
    links: [
      { label: "Job & Internship Portal", to: "/jobs" },
      { label: "Industry Mentors", to: "/mentors" },
      { label: "AI Resume Builder", to: "/resources#resume" },
      { label: "ATS Resume Checker", to: "/resources#ats" },
      { label: "Mock Interviews", to: "/resources#interview" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", to: "/about" },
      { label: "Contact Support", to: "/contact" },
      { label: "Plans & Pricing", to: "/pricing" },
      { label: "Career Resources", to: "/resources" },
      { label: "Verify Certificate", to: "/verify-certificate" },
    ],
  },
  {
    title: "Legal & Trust",
    links: [
      { label: "Privacy Policy", to: "/privacy-policy" },
      { label: "Terms & Conditions", to: "/terms-and-conditions" },
      { label: "ISO 9001:2015 Verified", to: "/about" },
      { label: "MSME Registered", to: "/about" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="container-page grid gap-10 py-14 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div className="flex flex-col gap-4">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            Empowering students and job-seekers with hands-on internships, live mentorship from industry leaders, and placement assistance.
          </p>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2"><Mail className="size-4" /> support@internshipjunction.com</span>
            <span className="inline-flex items-center gap-2"><Phone className="size-4" /> +91 98765 43210</span>
            <span className="inline-flex items-center gap-2"><MapPin className="size-4" /> Bengaluru & Noida, India</span>
          </div>
          <div className="flex items-center gap-2">
            {[
              { icon: Globe, label: "LinkedIn" },
              { icon: AtSign, label: "Twitter" },
              { icon: Play, label: "YouTube" },
              { icon: Code, label: "GitHub" },
            ].map(({ icon: Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="flex size-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:text-primary hover:border-primary/50"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        {columns.map((column) => (
          <div key={column.title} className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold">{column.title}</h4>
            <ul className="flex flex-col gap-2">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} InternshipJunction EdTech Pvt. Ltd. All rights reserved.</p>
          <p className="text-muted-foreground/80">Recognized under Startup India & MSME &bull; ISO 9001:2015 Certified</p>
        </div>
      </div>
    </footer>
  );
}
