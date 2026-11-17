import { useState, type FormEvent } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, ShieldX, Search, Award, CalendarDays, User, BookOpen, Building2 } from "lucide-react";
import { PageHero } from "@/components/common/page-hero";
import { Section } from "@/components/common/section";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { useSeo } from "@/lib/hooks/use-seo";
import { formatDate } from "@/lib/utils";

interface CertificateResult {
  valid: boolean;
  certificateId: string;
  studentName: string;
  program: string;
  programType: string;
  issuedAt: string;
  grade?: string | null;
  status: string;
  issuedBy: string;
}

export default function VerifyCertificate() {
  const { certificateId: routeId } = useParams();
  const [input, setInput] = useState(routeId ?? "");
  const [query, setQuery] = useState(routeId ?? "");

  useSeo({
    title: "Verify Certificate",
    description: "Verify the authenticity of any InternshipJunction certificate instantly using its unique credential ID.",
    canonicalPath: "/verify-certificate",
  });

  const { data, isFetching, isError, error } = useQuery<CertificateResult>({
    queryKey: ["verify-certificate", query],
    queryFn: async () => {
      const { data } = await api.get<CertificateResult>(`/verify-certificate/${query}`);
      return data;
    },
    enabled: Boolean(query),
    retry: false,
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setQuery(input.trim().toUpperCase());
  };

  return (
    <div>
      <PageHero
        title="Verify Certificate Credential"
        description="Employers, recruiters, and academic institutions can validate any InternshipJunction certificate instantly."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Verify Certificate" }]}
      />

      <Section className="pb-20">
        <div className="mx-auto max-w-2xl">
          <Card className="p-6 sm:p-8">
            <form onSubmit={onSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex flex-1 flex-col gap-2">
                <Label htmlFor="cert-id">Certificate ID / Credential ID</Label>
                <Input id="cert-id" value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g. IJ-2026-0001-DS" required />
              </div>
              <Button type="submit" variant="gradient" loading={isFetching}><Search className="size-4" /> Verify</Button>
            </form>
            <p className="mt-3 text-xs text-muted-foreground">
              Tip: try <span className="font-mono font-semibold">IJ-2026-0001-DS</span> for a demo certificate verification.
            </p>
          </Card>

          {isFetching && <Skeleton className="mt-6 h-56 w-full" />}

          {!isFetching && isError && query && (
            <Card className="mt-6 flex flex-col items-center gap-3 border-destructive/30 p-8 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-destructive/12 text-destructive"><ShieldX className="size-7" /></span>
              <h3 className="text-lg font-semibold">Certificate Not Found</h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                {error instanceof Error ? error.message : "We couldn't find a record for this Certificate ID. Please double check the ID format and try again."}
              </p>
            </Card>
          )}

          {!isFetching && data && (
            <Card className="mt-6 overflow-hidden">
              <div className="flex items-center justify-between gap-3 bg-[linear-gradient(120deg,var(--primary),var(--accent))] px-6 py-5 text-white">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-white/20"><Award className="size-6" /></span>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-white/80">Certificate of Completion & Internship</p>
                    <p className="text-sm font-semibold">{data.issuedBy || "InternshipJunction Technologies"}</p>
                  </div>
                </div>
                {data.valid ? (
                  <Badge className="border-transparent bg-white/20 text-white"><BadgeCheck className="size-3.5" /> Verified Authenticity</Badge>
                ) : (
                  <Badge variant="destructive">Revoked</Badge>
                )}
              </div>
              <div className="grid gap-4 p-6 sm:grid-cols-2">
                <Detail icon={User} label="Recipient / Learner" value={data.studentName} />
                <Detail icon={BookOpen} label="Program Track" value={data.program} />
                <Detail icon={Award} label="Credential ID" value={data.certificateId} mono />
                <Detail icon={CalendarDays} label="Issued Date" value={formatDate(data.issuedAt)} />
                <Detail icon={Building2} label="Issuing Authority" value={data.issuedBy} />
                <Detail icon={BadgeCheck} label="Performance Grade" value={data.grade ?? "Distinction"} />
              </div>
              <div className={`px-6 py-4 text-sm ${data.valid ? "bg-success/8 text-success" : "bg-destructive/8 text-destructive"}`}>
                {data.valid
                  ? "✓ This certificate is authentic, digitally verified, and issued by InternshipJunction Technologies Pvt. Ltd."
                  : "This certificate has been revoked and is no longer valid."}
              </div>
            </Card>
          )}
        </div>
      </Section>
    </div>
  );
}

function Detail({ icon: Icon, label, value, mono }: { icon: typeof User; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-sm font-medium ${mono ? "font-mono" : ""}`}>{value}</p>
      </div>
    </div>
  );
}
