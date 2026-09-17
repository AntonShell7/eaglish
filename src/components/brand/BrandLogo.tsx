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

  // The header mark is painted through a CSS mask so it can take the brand's
  // colour, and a mask cannot recolour an <img>: it clips the element, but the
  // image's own pixels still draw on top, which left a violet eagle sitting on
  // a pine fill. A span has no pixels of its own, so the mask is the shape and
  // the background is the colour.
  if (variant === "chip") {
    return <span aria-hidden className={`${classes} brand-art`} />;
  }

  return <img src="/logo-mark.png" alt="" className={`${classes} brand-art`} onError={() => setAssetMissing(true)} />;
}
