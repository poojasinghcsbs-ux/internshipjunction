import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/components/providers/auth-provider";
import type { Role } from "@/lib/types";

export function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    const fallback = user.role === "student" ? "/dashboard" : user.role === "mentor" ? "/mentor" : "/admin";
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}
