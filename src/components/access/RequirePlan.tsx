import { Outlet, useLocation } from "react-router-dom";
import { useAccess } from "@/context/AccessContext";
import { sectionOf, PRO_SECTIONS } from "@/lib/plans";
import { isFreeSlangPath } from "@/lib/freeAccess";
import { Paywall } from "./Paywall";

/** Wait for the plan, then gate paid lesson routes rather than free shelves.
 * Listening checks its account-wide fragment allowance inside the runner.
 * Smart repetition has no trial. The destination URL survives an upgrade.
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

  const section = sectionOf(location.pathname);
  if (isPro || section === "dictation" || (section === "slang" && isFreeSlangPath(location.pathname))) return <Outlet />;

  /* The section is read from the path so one guard serves all three. The
     fallback cannot normally happen — this component is only mounted under
     those routes — but a paywall that names nothing is better than a crash. */
  return <Paywall section={sectionOf(location.pathname) ?? PRO_SECTIONS[0]} />;
}
