import { useTranslation } from "react-i18next";
import { LegalPage } from "@/components/legal/LegalPage";
import { offerDoc, OPERATOR_READY } from "@/data/legal";

/**
 * The public offer.
 *
 * Its own page rather than a section of the terms, because a payment provider
 * moderating the site looks for exactly this document at exactly this kind of
 * address, and because a contract people pay money under should not be found
 * by scrolling through something else.
 *
 * The banner is the point of `OPERATOR_READY`. An offer whose requisites are
 * still dashes is a draft, and publishing a draft as though it were a contract
 * is worse than publishing nothing — the moderator sees placeholder text and
 * rejects the application, or worse, does not and the document is void.
 */
export default function Offer() {
  const { t, i18n } = useTranslation();
  const doc = offerDoc[i18n.language.startsWith("ru") ? "ru" : "en"];

  return (
    <>
      {!OPERATOR_READY && (
        <div className="mx-auto max-w-3xl px-5 pt-8">
          <div
            role="status"
            className="rounded-[var(--radius-md)] border p-4"
            style={{
              borderColor: "var(--color-danger)",
              background: "color-mix(in srgb, var(--color-danger) 8%, transparent)",
            }}
          >
            <p className="font-semibold">{t("offer.draftTitle")}</p>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
              {t("offer.draftBody")}
            </p>
          </div>
        </div>
      )}

      <LegalPage doc={doc} other={{ to: "/terms", label: t("footer.terms") }} />
    </>
  );
}
