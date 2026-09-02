import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

/**
 * The wall around the learning sections.
 *
 * Everything behind it writes progress — saved words, review schedules, streaks
 * — and progress without an account has nowhere to go: it lands in one
 * browser's localStorage and is gone with the next device or a cleared cache.
 * Letting someone read for twenty minutes and then quietly losing the words
 * they saved is worse than asking them to sign in first.
 *
 * The public edges stay open: the landing page, the auth pages themselves, and
 * the legal pages, which have to be readable *before* anyone agrees to them.
 */
export function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Restoring a session takes a moment. Redirecting during it would bounce a
  // signed-in user to the login screen on every hard refresh.
  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="skeleton h-8 w-48 rounded-[var(--radius-sm)]" />
        <div className="skeleton mt-4 h-4 w-72 rounded-[var(--radius-sm)]" />
        <div className="skeleton mt-8 h-40 w-full rounded-[var(--radius-lg)]" />
      </div>
    );
  }

  if (!user) {
    // `from` is what sends them back to the page they actually wanted once
    // they are in, instead of dumping everyone on the dashboard.
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  return <Outlet />;
}
