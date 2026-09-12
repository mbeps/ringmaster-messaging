const IMAGES_BASE = "/images";

/**
 * Centralized registry for static application assets.
 * Follows the structuring-nextjs-projects asset registry pattern.
 */
export const ASSETS = {
  LOGO: {
    path: `${IMAGES_BASE}/logo.svg`,
    alt: "Logo",
  },
  AVATARS: {
    FALLBACK: {
      path: `${IMAGES_BASE}/placeholder.jpg`,
      alt: "Avatar",
    },
  },
} as const;

export type Assets = typeof ASSETS;
