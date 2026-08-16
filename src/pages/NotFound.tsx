import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-5 text-center">
      <p className="text-6xl font-extrabold" style={{ color: "var(--color-primary)" }}>
        404
      </p>
      <Link
        to="/"
        className="mt-6 rounded-full px-5 py-3 text-sm font-semibold on-primary"
        style={{ background: "var(--color-primary)" }}
      >
        {t("nav.home")}
      </Link>
    </div>
  );
}
