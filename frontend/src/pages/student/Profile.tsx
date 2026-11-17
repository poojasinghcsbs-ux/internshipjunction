import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { User as UserIcon, Mail, Phone, Briefcase, Save, ShieldCheck } from "lucide-react";
import { DashboardPageHeader } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/components/providers/auth-provider";
import { api, apiErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import type { User } from "@/lib/types";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [headline, setHeadline] = useState(user?.headline ?? "");

  const save = useMutation({
    mutationFn: async () => {
      const { data } = await api.put<User>("/profile", { fullName, phone, headline });
      return data;
    },
    onSuccess: (data) => {
      updateUser(data);
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Profile updated!");
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  return (
    <div>
      <DashboardPageHeader title="Profile" description="Manage your personal information and public presence." />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card className="flex flex-col items-center gap-3 p-6 text-center">
          <Avatar name={user?.fullName ?? "User"} src={user?.avatarUrl ?? undefined} className="size-20 text-2xl" />
          <div>
            <h2 className="text-lg font-bold">{user?.fullName}</h2>
            <p className="text-sm text-muted-foreground">{user?.headline ?? "InternshipJunction learner"}</p>
          </div>
          <Badge variant="secondary" className="capitalize">{user?.role.replace("_", " ")}</Badge>
          {user?.createdAt && <p className="text-xs text-muted-foreground">Member since {formatDate(user.createdAt)}</p>}
          <div className="mt-2 flex w-full items-center gap-2 rounded-lg border border-border bg-muted/40 p-3 text-left text-xs text-muted-foreground">
            <ShieldCheck className="size-4 shrink-0 text-success" /> Your profile is visible to mentors and recruiters you interact with.
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-semibold">Personal details</h2>
          <div className="mt-4 grid gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name"><UserIcon className="mr-1 inline size-3.5" /> Full name</Label>
              <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email"><Mail className="mr-1 inline size-3.5" /> Email</Label>
              <Input id="email" value={user?.email ?? ""} disabled />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone"><Phone className="mr-1 inline size-3.5" /> Phone</Label>
              <Input id="phone" value={phone ?? ""} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="headline"><Briefcase className="mr-1 inline size-3.5" /> Headline</Label>
              <Input id="headline" value={headline ?? ""} onChange={(e) => setHeadline(e.target.value)} placeholder="Aspiring Full-Stack Developer" />
            </div>
            <div className="flex justify-end">
              <Button variant="gradient" loading={save.isPending} onClick={() => save.mutate()}><Save className="size-4" /> Save changes</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
