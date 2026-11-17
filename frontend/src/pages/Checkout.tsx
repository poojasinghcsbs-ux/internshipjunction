import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ShieldCheck, Tag, CreditCard, CheckCircle2, Loader2, ArrowLeft, Lock, Sparkles,
} from "lucide-react";
import { PageHero } from "@/components/common/page-hero";
import { Section } from "@/components/common/section";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/components/providers/auth-provider";
import { api, apiErrorMessage } from "@/lib/api";
import { useSeo } from "@/lib/hooks/use-seo";
import { cn, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import type { Course, Fellowship, Internship } from "@/lib/types";

type ProgramType = "course" | "internship" | "fellowship";
type Plan = "self-paced" | "pro" | "advanced";

const PLANS: { value: Plan; label: string; multiplier: number; blurb: string }[] = [
  { value: "self-paced", label: "Self-paced", multiplier: 1, blurb: "Recorded lessons and resources" },
  { value: "pro", label: "Pro", multiplier: 1.35, blurb: "Adds live classes and mentor sessions" },
  { value: "advanced", label: "Advanced", multiplier: 1.7, blurb: "Adds placement support and priority reviews" },
];

interface NormalizedProgram {
  title: string;
  thumbnail: string;
  basePrice: number;
  originalPrice: number;
}

export default function Checkout() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const type = (params.get("type") as ProgramType) ?? "course";
  const slug = params.get("slug") ?? "";
  const [plan, setPlan] = useState<Plan>((params.get("plan") as Plan) ?? "pro");
  const [coupon, setCoupon] = useState("");

  useSeo({ title: "Checkout", description: "Complete your enrollment on InternshipJunction." });

  const program = useQuery<NormalizedProgram>({
    queryKey: ["checkout-program", type, slug],
    queryFn: async () => {
      if (type === "course") {
        const { data } = await api.get<Course>(`/courses/${slug}`);
        return { title: data.title, thumbnail: data.thumbnail, basePrice: data.price, originalPrice: data.originalPrice };
      }
      if (type === "internship") {
        const { data } = await api.get<Internship>(`/internships/${slug}`);
        return { title: data.title, thumbnail: data.thumbnail, basePrice: 4999, originalPrice: 4999 };
      }
      const { data } = await api.get<Fellowship>(`/fellowships/${slug}`);
      return { title: data.title, thumbnail: data.thumbnail, basePrice: data.price, originalPrice: data.originalPrice };
    },
    enabled: Boolean(slug),
    retry: false,
  });

  const multiplier = PLANS.find((p) => p.value === plan)?.multiplier ?? 1;
  const baseAmount = useMemo(() => Math.round((program.data?.basePrice ?? 0) * multiplier), [program.data, multiplier]);

  const couponQuery = useQuery({
    queryKey: ["coupon", coupon, baseAmount],
    queryFn: async () => {
      const { data } = await api.get<{ valid: boolean; discount: number; total: number; message?: string }>("/coupons/validate", { params: { code: coupon, amount: baseAmount } });
      return data;
    },
    enabled: coupon.trim().length > 2 && baseAmount > 0,
    retry: false,
  });

  const discount = couponQuery.data?.valid ? couponQuery.data.discount : 0;
  const total = baseAmount - discount;

  const checkout = useMutation({
    mutationFn: async () => {
      const { data: orderData } = await api.post("/checkout", { programType: type, slug, plan, couponCode: couponQuery.data?.valid ? coupon : undefined });
      const { data: verified } = await api.post("/verify", {
        checkoutId: orderData.checkoutId,
        razorpayOrderId: orderData.order.id,
      });
      return { orderData, verified };
    },
    onSuccess: () => {
      toast.success("Payment successful! You're enrolled.");
      navigate("/dashboard/internships");
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  if (!user) {
    return (
      <Section className="pb-24">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-2xl font-bold">Please log in to continue</h1>
          <p className="mt-2 text-sm text-muted-foreground">You need an account to complete your enrollment.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="gradient" asChild><Link to={`/login?redirect=${encodeURIComponent(`/checkout?type=${type}&slug=${slug}&plan=${plan}`)}`}>Log in</Link></Button>
            <Button variant="outline" asChild><Link to="/register">Create account</Link></Button>
          </div>
        </div>
      </Section>
    );
  }

  if (!slug) {
    return (
      <Section className="pb-24">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-2xl font-bold">Nothing to check out</h1>
          <p className="mt-2 text-sm text-muted-foreground">Pick a course, internship or fellowship to continue.</p>
          <Button className="mt-6" asChild><Link to="/courses">Browse courses</Link></Button>
        </div>
      </Section>
    );
  }

  return (
    <div>
      <PageHero title="Secure checkout" description="Review your plan, apply a coupon and complete your enrollment." breadcrumbs={[{ label: "Home", to: "/" }, { label: "Checkout" }]} />
      <Section className="pb-24">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="flex flex-col gap-6">
            <Card className="flex items-center gap-4 p-5">
              {program.isLoading ? (
                <><Skeleton className="size-16 rounded-lg" /><div className="flex-1"><Skeleton className="h-5 w-48" /><Skeleton className="mt-2 h-4 w-24" /></div></>
              ) : program.data ? (
                <>
                  <img src={program.data.thumbnail} alt={program.data.title} className="size-16 rounded-lg object-cover" />
                  <div>
                    <Badge variant="secondary" className="mb-1 capitalize">{type}</Badge>
                    <h2 className="text-base font-semibold">{program.data.title}</h2>
                  </div>
                </>
              ) : (
                <p className="text-sm text-destructive">We couldn't load this program. <Link to="/courses" className="underline">Go back</Link>.</p>
              )}
            </Card>

            <Card className="p-5">
              <h3 className="text-base font-semibold">Choose your plan</h3>
              <div className="mt-4 flex flex-col gap-3">
                {PLANS.map((option) => (
                  <label
                    key={option.value}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                      plan === option.value ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                    )}
                  >
                    <input type="radio" name="plan" value={option.value} checked={plan === option.value} onChange={() => setPlan(option.value)} className="mt-1 size-4 border-input text-primary focus-visible:ring-ring" />
                    <div className="flex flex-1 items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">{option.label}</p>
                        <p className="text-xs text-muted-foreground">{option.blurb}</p>
                      </div>
                      <span className="text-sm font-semibold">{formatCurrency(Math.round((program.data?.basePrice ?? 0) * option.multiplier))}</span>
                    </div>
                  </label>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="flex items-center gap-2 text-base font-semibold"><Tag className="size-4 text-primary" /> Apply coupon</h3>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <Input value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} placeholder="Enter coupon code (try JUNCTION10)" />
              </div>
              {couponQuery.isFetching && <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="size-3.5 animate-spin" /> Checking code...</p>}
              {couponQuery.data?.valid && <p className="mt-2 text-sm text-success">Coupon applied — you save {formatCurrency(couponQuery.data.discount)}!</p>}
              {couponQuery.data && !couponQuery.data.valid && coupon.length > 2 && <p className="mt-2 text-sm text-destructive">This coupon is not valid for this amount.</p>}
            </Card>

            <Card className="flex items-start gap-3 p-5">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-success" />
              <div>
                <p className="text-sm font-semibold">Safe & secure payments</p>
                <p className="text-xs text-muted-foreground">Payments are processed through Razorpay. This demo runs in simulated mode — no real charge is made.</p>
              </div>
            </Card>
          </div>

          <aside>
            <div className="lg:sticky lg:top-24">
              <Card className="p-6 shadow-lift">
                <h3 className="text-base font-semibold">Order summary</h3>
                <div className="mt-4 flex flex-col gap-3 text-sm">
                  <div className="flex items-center justify-between"><span className="text-muted-foreground">Program</span><span className="max-w-[60%] truncate text-right font-medium">{program.data?.title ?? "—"}</span></div>
                  <div className="flex items-center justify-between"><span className="text-muted-foreground">Plan</span><span className="font-medium capitalize">{plan}</span></div>
                  <div className="flex items-center justify-between"><span className="text-muted-foreground">Base amount</span><span className="font-medium">{formatCurrency(baseAmount)}</span></div>
                  {discount > 0 && <div className="flex items-center justify-between text-success"><span>Coupon discount</span><span>-{formatCurrency(discount)}</span></div>}
                  <Separator />
                  <div className="flex items-center justify-between text-base font-bold"><span>Total payable</span><span>{formatCurrency(total)}</span></div>
                </div>
                <Button variant="gradient" size="lg" className="mt-5 w-full" loading={checkout.isPending} disabled={!program.data} onClick={() => checkout.mutate()}>
                  <CreditCard className="size-4" /> Pay {formatCurrency(total)}
                </Button>
                <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground"><Lock className="size-3.5" /> Encrypted & secure</p>
                <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-2"><CheckCircle2 className="size-3.5 text-success" /> Lifetime access to materials</span>
                  <span className="flex items-center gap-2"><CheckCircle2 className="size-3.5 text-success" /> Verified certificate</span>
                  <span className="flex items-center gap-2"><Sparkles className="size-3.5 text-primary" /> 7-day refund window</span>
                </div>
                <Button variant="ghost" className="mt-4 w-full" asChild>
                  <Link to={type === "course" ? `/course/${slug}` : type === "internship" ? `/internship/${slug}` : `/fellowship/${slug}`}>
                    <ArrowLeft className="size-4" /> Back to program
                  </Link>
                </Button>
              </Card>
            </div>
          </aside>
        </div>
      </Section>
    </div>
  );
}
