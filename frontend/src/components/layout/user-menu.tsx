import { useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut, User as UserIcon, Shield, GraduationCap } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const dashboardPath = user.role === "admin" || user.role === "super_admin" ? "/admin" : user.role === "mentor" ? "/mentor" : "/dashboard";

  return (
    <DropdownMenu
      trigger={
        <Button variant="ghost" className="gap-2 pl-1.5 pr-2.5">
          <Avatar name={user.fullName} src={user.avatarUrl} className="size-7" />
          <span className="hidden max-w-28 truncate text-sm font-medium sm:inline">{user.fullName.split(" ")[0]}</span>
        </Button>
      }
    >
      <DropdownMenuLabel>{user.fullName}</DropdownMenuLabel>
      <div className="px-3 pb-2 text-xs text-muted-foreground">{user.email}</div>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => navigate(dashboardPath)}>
        <LayoutDashboard className="size-4" /> Dashboard
      </DropdownMenuItem>
      {user.role === "student" && (
        <DropdownMenuItem onClick={() => navigate("/dashboard/profile")}>
          <UserIcon className="size-4" /> My Profile
        </DropdownMenuItem>
      )}
      {user.role === "student" && (
        <DropdownMenuItem onClick={() => navigate("/dashboard/certificates")}>
          <GraduationCap className="size-4" /> Certificates
        </DropdownMenuItem>
      )}
      {(user.role === "admin" || user.role === "super_admin") && (
        <DropdownMenuItem onClick={() => navigate("/admin")}>
          <Shield className="size-4" /> Admin Console
        </DropdownMenuItem>
      )}
      <DropdownMenuSeparator />
      <DropdownMenuItem
        destructive
        onClick={async () => {
          await logout();
          toast.success("Logged out successfully");
          navigate("/");
        }}
      >
        <LogOut className="size-4" /> Logout
      </DropdownMenuItem>
    </DropdownMenu>
  );
}
