import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { UserPlus, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/brand/logo";
import { useAuth, type RegisterPayload } from "@/components/providers/auth-provider";
import { apiErrorMessage } from "@/lib/api";
import { useSeo } from "@/lib/hooks/use-seo";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Role } from "@/lib/types";

const perks = [
  "Enroll in verified internship & training programs",
  "Build hands-on production capstones with mentor code reviews",
  "Earn verifiable industry certificates & Letter of Recommendation",
  "Unlock direct referrals across 150+ hiring partner companies",
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [role, setRole] = useState<Role>(params.get("role") === "mentor" ? "mentor" : "student");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "" });

  useSeo({ title: "Sign Up", description: "Create your free InternshipJunction account and start learning in-demand skills today." });

  const update = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setError("Please accept the Terms and Privacy Policy to continue.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payload: RegisterPayload = { ...form, role };
      const user = await register(payload);
      toast.success(`Welcome to InternshipJunction, ${user.fullName.split(" ")[0]}!`);
      navigate(user.role === "mentor" ? "/mentor" : "/dashboard", { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-page flex min-h-[calc(100vh-4rem)] items-center justify-center py-10">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-card shadow-lift lg:grid-cols-2">
        <div className="p-8">
          <h1 className="text-xl font-bold">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Log in</Link></p>

          <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl border border-border bg-muted/40 p-1">
            {(["student", "mentor"] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium capitalize transition-colors",
                  role === r ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                )}
              >
                I'm a {r}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" required value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Your full name" autoComplete="name" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="remail">Email</Label>
                <Input id="remail" type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" autoComplete="email" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input id="phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+91 98765 43210" autoComplete="tel" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="rpassword">Password</Label>
              <div className="relative">
                <Input id="rpassword" type={show ? "text" : "password"} required minLength={8} value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="At least 8 characters" autoComplete="new-password" className="pr-10" />
                <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground">
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <label className="flex items-start gap-2 text-sm text-muted-foreground">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 size-4 rounded border-input text-primary focus-visible:ring-ring" />
              <span>I agree to the <Link to="/terms-and-conditions" className="text-primary hover:underline">Terms</Link> and <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>.</span>
            </label>

            {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

            <Button type="submit" variant="gradient" size="lg" loading={loading}>
              <UserPlus className="size-4" /> Create account
            </Button>
          </form>
        </div>

        <div className="hidden flex-col justify-between gap-6 bg-[linear-gradient(150deg,var(--primary),var(--accent))] p-8 text-white lg:flex">
          <Link to="/"><Logo className="[&_span:last-child]:text-white" /></Link>
          <div>
            <h2 className="text-2xl font-bold">Start Your Journey Today</h2>
            <p className="mt-2 text-sm text-white/85">Join 15,000+ ambitious learners building career-defining projects and landing tech roles.</p>
            <ul className="mt-6 flex flex-col gap-3 text-sm text-white/90">
              {perks.map((perk) => (
                <li key={perk} className="flex items-center gap-2"><CheckCircle2 className="size-4" /> {perk}</li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-white/70">100% Practical & Verified Programs</p>
        </div>
      </div>
    </div>
  );
}
