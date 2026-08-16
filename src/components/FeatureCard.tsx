import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import "./feature-card.css";

interface FeatureCardProps {
  to: string;
  icon: ReactNode;
  title: string;
  description: string;
  delay?: number;
}

export function FeatureCard({ to, icon, title, description, delay = 0 }: FeatureCardProps) {
  return (
    <Link to={to} className="feature-card fade-up" style={{ animationDelay: `${delay}ms` }}>
      <span className="feature-card__rule" aria-hidden="true" />
      <span className="feature-card__icon">{icon}</span>
      <h3 className="feature-card__title">{title}</h3>
      <p className="feature-card__text">{description}</p>
    </Link>
  );
}
