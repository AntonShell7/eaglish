import { Outlet, useLocation } from "react-router-dom";
import { useAccess } from "@/context/AccessContext";
import { sectionOf, PRO_SECTIONS } from "@/lib/plans";
import { Paywall } from "./Paywall";

/**
 * The gate on the paid sections.
 *
 * It renders the paywall in place rather than redirecting, for one reason that
 * matters: the address stays the one the learner asked for. A link to a
 * dictation shared in a chat, opened by somebody without a plan, shows them
 * what that dictation is and offers the way in — and once they have a plan, a
 * reload puts them in the lesson. A redirect to /pricing throws the
 * destination away and they never find it again.
 *
 * While the plan is unknown it waits. Refusing on an unanswered question would
 * show the price to the people who have already paid, every time their
 * connection was slow, which is the one failure here that costs trust rather
 * than money.
 */
export function RequirePlan() {
  const { isPro, loading } = useAccess();
  const location = useLocation();

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-10">
        <div className="skeleton h-8 w-56 rounded-[var(--radius-sm)]" />
        <div className="skeleton mt-4 h-4 w-72 rounded-[var(--radius-sm)]" />
        <div className="skeleton mt-8 h-40 w-full rounded-[var(--radius-lg)]" />
      </div>
    );
  }

  if (isPro) return <Outlet />;

  /* The section is read from the path so one guard serves all three. The
     fallback cannot normally happen — this component is only mounted under
     those routes — but a paywall that names nothing is better than a crash. */
  return <Paywall section={sectionOf(location.pathname) ?? PRO_SECTIONS[0]} />;
}
