import { Navigate, Outlet, useLocation } from "react-router-dom";
import { homePath, useAuth } from "../context/AuthContext";
import Loader from "./Loader";

/** Only logged-in users get through. Pass role="ADMIN" or "STUDENT" to restrict further. */
export function ProtectedRoute({ role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader fullPage text="Checking your session…" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (role && user.role !== role) return <Navigate to={homePath(user)} replace />;
  return <Outlet />;
}

/** Login and register pages: logged-in users are sent to their own dashboard instead. */
export function GuestRoute() {
  const { user, loading } = useAuth();

  if (loading) return <Loader fullPage text="Checking your session…" />;
  if (user) return <Navigate to={homePath(user)} replace />;
  return <Outlet />;
}

