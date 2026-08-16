import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { IconBook, IconPen, IconHeadphones, IconChat, IconBookmark } from "@/components/brand/icons";
import { FeatureCard } from "@/components/FeatureCard";
import "./home.css";

const FEATURES = [
  { to: "/reading", key: "reading", icon: <IconBook /> },
  { to: "/writing", key: "writing", icon: <IconPen /> },
  { to: "/listening", key: "listening", icon: <IconHeadphones /> },
  { to: "/everyday-english", key: "everydayEnglish", icon: <IconChat /> },
  { to: "/vocabulary", key: "vocabulary", icon: <IconBookmark /> },
] as const;

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <section className="hero-crest">
        <div className="hero-crest__grain" />
        <div className="hero-crest__inner">
          <div className="crest-stage fade-up">
            <BrandLogo />
          </div>

          <h1 className="hero-crest__name fade-up" style={{ animationDelay: "80ms" }}>
            {t("brand")}
          </h1>

          <p className="hero-crest__eyebrow fade-up" style={{ animationDelay: "140ms" }}>
            {t("home.kicker")}
          </p>

          <p className="hero-crest__tagline fade-up" style={{ animationDelay: "200ms" }}>
            {t("home.subtitle")}
          </p>

          <div className="hero-crest__actions fade-up" style={{ animationDelay: "260ms" }}>
            <Link to="/register" className="hero-crest__cta">
              {t("auth.createAccount")}
            </Link>
            <Link to="/reading" className="hero-crest__ghost">
              {t("common.start")}
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="section-title">{t("home.chooseMode")}</h2>
        <div className="section-rule">
          <span className="section-rule__dot" />
        </div>
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <FeatureCard
              key={feature.to}
              to={feature.to}
              icon={feature.icon}
              title={t(`nav.${feature.key}`)}
              description={t(`home.descriptions.${feature.key}`, { defaultValue: "" })}
              delay={i * 60}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
