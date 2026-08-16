import { useState } from "react";
import { EagleMark } from "./EagleMark";
import "./brand-logo.css";

interface BrandLogoProps {
  className?: string;
  /**
   * "hero" — large mark on the deep-violet brand field.
   * "chip" — small mark for the header.
   */
  variant?: "hero" | "chip";
}

/**
 * Renders the real artwork from /logo-mark.png — a transparent PNG (or SVG)
 * of the eagle mark. Because the mark is a flat silhouette, a filter recolours
 * it per placement: white on the violet hero, brand violet in the header.
 *
 * If the file is missing the drawn EagleMark stands in, so the layout never
 * shows a broken image.
 */
export function BrandLogo({ className, variant = "hero" }: BrandLogoProps) {
  const [assetMissing, setAssetMissing] = useState(false);
  const classes = [variant === "hero" ? "brand-logo" : "brand-chip", className].filter(Boolean).join(" ");

  if (assetMissing) {
    return <EagleMark className={classes} />;
  }

  return <img src="/logo-mark.png" alt="" className={`${classes} brand-art`} onError={() => setAssetMissing(true)} />;
}
