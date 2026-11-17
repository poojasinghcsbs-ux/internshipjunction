import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { GraduationCap, Eye, EyeOff, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/brand/logo";
import { useAuth } from "@/components/providers/auth-provider";
import { apiErrorMessage } from "@/lib/api";
import { useSeo } from "@/lib/hooks/use-seo";
import { toast } from "sonner";

const demoAccounts = [
  { label: "Student", email: "aditya.sharma@student.internshipjunction.com", password: "Password@123" },
  { label: "Mentor", email: "aarav.mehta@mentor.internshipjunction.com", password: "Password@123" },
  { label: "Admin", email: "admin@internshipjunction.com", password: "Password@123" },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useSeo({ title: "Log in", description: "Log in to your InternshipJunction account to continue learning and building your career." });

  const redirect = params.get("redirect");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.fullName.split(" ")[0]}!`);
      const fallback = user.role === "student" ? "/dashboard" : user.role === "mentor" ? "/mentor" : "/admin";
      navigate(redirect || fallback, { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (account: (typeof demoAccounts)[number]) => {
    setEmail(account.email);
    setPassword(account.password);
  };

  return (
    <div className="container-page flex min-h-[calc(100vh-4rem)] items-center justify-center py-10">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-card shadow-lift lg:grid-cols-2">
        <div className="hidden flex-col justify-between gap-6 bg-[linear-gradient(150deg,var(--primary),var(--accent))] p-8 text-white lg:flex">
          <Link to="/"><Logo className="[&_span:last-child]:text-white" /></Link>
          <div>
            <h2 className="text-2xl font-bold">Welcome back</h2>
            <p className="mt-2 text-sm text-white/85">
              Pick up where you left off — continue live internship tasks, submit projects, and track your job placements.
            </p>
            <ul className="mt-6 flex flex-col gap-3 text-sm text-white/90">
              {["Access verified internship & project tracks", "Resume and ATS score tools in one place", "Live masterclasses and 1:1 mentor code reviews", "Apply and track job referrals effortlessly"].map((item) => (
                <li key={item} className="flex items-center gap-2"><GraduationCap className="size-4" /> {item}</li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-white/70">InternshipJunction Technologies</p>
        </div>

        <div className="p-8">
          <h1 className="text-xl font-bold">Log in to InternshipJunction</h1>
          <p className="mt-1 text-sm text-muted-foreground">Don't have an account? <Link to="/register" className="font-medium text-primary hover:underline">Sign up</Link></p>

          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" aria-invalid={Boolean(error)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" type={show ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pr-10" aria-invalid={Boolean(error)} />
                <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground">
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted-foreground">
                <input type="checkbox" className="size-4 rounded border-input text-primary focus-visible:ring-ring" defaultChecked /> Remember me
              </label>
              <Link to="/contact" className="font-medium text-primary hover:underline">Forgot password?</Link>
            </div>

            <Button type="submit" variant="gradient" size="lg" loading={loading}>
              <LogIn className="size-4" /> Log in
            </Button>
          </form>

          <div className="mt-6 border-t border-border pt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Quick Demo accounts (password: Password@123)</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {demoAccounts.map((account) => (
                <Badge key={account.label} variant="outline" className="cursor-pointer px-3 py-1.5 transition-colors hover:border-primary hover:text-primary" onClick={() => fillDemo(account)}>
                  Use {account.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
