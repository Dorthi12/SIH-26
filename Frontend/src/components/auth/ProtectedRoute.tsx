/**
 * ProtectedRoute — Redirects unauthenticated users to /login.
 * Preserves the intended destination so the user lands there after login.
 */
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Pass current path as `from` so Login can redirect back after auth
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
