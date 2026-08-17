import { useAuth } from "@/context/AuthContext";
import Landing from "./Landing";
import Dashboard from "./Dashboard";

/**
 * "/" means two different things.
 *
 * Signed out, it's the pitch: what the method is and why it works. Signed in,
 * that pitch is noise — and its "create an account" button was actively
 * confusing, since the visitor already has one. So the route resolves to
 * whichever page is true for the current session.
 */
export default function Home() {
  const { user, loading } = useAuth();

  // Auth restores asynchronously. Rendering the landing during that gap makes
  // a signed-in user see a sign-up pitch flash on every reload.
  if (loading) return <div className="min-h-[60vh]" />;

  return user ? <Dashboard /> : <Landing />;
}
