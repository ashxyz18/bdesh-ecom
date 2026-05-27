import type { CSSProperties } from "react";
import type { StoreSettings } from "@/lib/storefront/types";

type HeroSettings = NonNullable<StoreSettings["hero"]>;

interface Props {
  hero: HeroSettings;
  fallbackImage?: string;
  className?: string;
  style?: CSSProperties;
  rounded?: boolean;
  overlay?: "gradient" | "dark" | "none";
}

/**
 * Drop-in hero background renderer used by templates. Prefers a looping
 * muted video when `hero.videoUrl` is configured, otherwise falls back to
 * `hero.image` and finally to the supplied `fallbackImage`. Optionally
 * overlays a gradient or dark scrim so the headline text remains readable.
 *
 * Templates render this absolutely-positioned inside a sized container.
 */
export function HeroMedia({ hero, fallbackImage, className, style, rounded, overlay = "gradient" }: Props) {
  const image = hero.image || fallbackImage;
  const radius = rounded ? "var(--sf-radius)" : undefined;

  return (
    <div
      className={`absolute inset-0 overflow-hidden ${className || ""}`}
      style={{ borderRadius: radius, ...style }}
    >
      {hero.videoUrl ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          poster={hero.videoPoster || image}
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={hero.videoUrl} />
        </video>
      ) : image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : null}

      {overlay === "gradient" ? (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.0) 30%, rgba(0,0,0,0.55) 100%)",
            opacity: (hero.overlayOpacity ?? 100) / 100,
          }}
        />
      ) : null}
      {overlay === "dark" ? (
        <div
          className="absolute inset-0 pointer-events-none bg-black"
          style={{ opacity: ((hero.overlayOpacity ?? 30) / 100) }}
        />
      ) : null}
    </div>
  );
}
