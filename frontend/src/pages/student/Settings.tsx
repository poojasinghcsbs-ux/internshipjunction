import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Moon, Sun, Monitor, Bell, Mail, LogOut, Trash2, Shield } from "lucide-react";
import { DashboardPageHeader } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/components/providers/theme-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function ToggleRow({ icon: Icon, title, description, checked, onChange }: { icon: typeof Bell; title: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="size-4" /></span>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", checked ? "bg-primary" : "bg-muted")}
      >
        <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform", checked ? "translate-x-5" : "translate-x-0.5")} />
      </button>
    </div>
  );
}

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);
  const [productUpdates, setProductUpdates] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <div>
      <DashboardPageHeader title="Settings" description="Customize your experience, notifications and account security." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-base font-semibold">Appearance</h2>
          <p className="text-xs text-muted-foreground">Choose how InternshipJunction looks to you.</p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {([
              { value: "light", label: "Light", icon: Sun },
              { value: "dark", label: "Dark", icon: Moon },
              { value: "system", label: "System", icon: Monitor },
            ] as const).map((option) => {
              const active = option.value === "system" ? false : theme === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => option.value !== "system" && setTheme(option.value)}
                  className={cn("flex flex-col items-center gap-2 rounded-xl border p-4 text-xs font-medium transition-colors", active ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:bg-muted")}
                >
                  <option.icon className="size-5" /> {option.label}
                </button>
              );
            })}
          </div>

          <Separator className="my-6" />

          <h2 className="text-base font-semibold">Notifications</h2>
          <div className="mt-2 divide-y divide-border">
            <ToggleRow icon={Mail} title="Email notifications" description="Application and enrollment updates" checked={emailNotif} onChange={setEmailNotif} />
            <ToggleRow icon={Bell} title="Push notifications" description="Real-time alerts in your browser" checked={pushNotif} onChange={setPushNotif} />
            <ToggleRow icon={Bell} title="Product updates" description="New features and course launches" checked={productUpdates} onChange={setProductUpdates} />
          </div>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="p-6">
            <h2 className="flex items-center gap-2 text-base font-semibold"><Shield className="size-4 text-primary" /> Security</h2>
            <div className="mt-4 grid gap-3">
              <div className="flex flex-col gap-1.5"><Label>Current password</Label><Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" /></div>
              <div className="flex flex-col gap-1.5"><Label>New password</Label><Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" /></div>
              <Button
                variant="outline"
                disabled={!currentPassword || newPassword.length < 8}
                onClick={() => { toast.success("Password update requested."); setCurrentPassword(""); setNewPassword(""); }}
              >
                Update password
              </Button>
              <p className="text-xs text-muted-foreground">Choose a strong password of at least 8 characters with letters and numbers.</p>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-semibold">Account</h2>
            <div className="mt-4 flex flex-col gap-3">
              <Button variant="outline" onClick={handleLogout}><LogOut className="size-4" /> Log out</Button>
              <Button variant="ghost" className="justify-start text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => toast.error("Account deletion requires support. Please contact us.")}>
                <Trash2 className="size-4" /> Delete account
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
