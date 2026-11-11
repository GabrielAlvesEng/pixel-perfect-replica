// Central SolidAuto theme: brand colors, shapes, typography and springs.
import type { Transition } from "framer-motion";

export const colors = {
  primary: "#410FA0", primaryHover: "#330B80", primaryDeep: "#2A0870", primaryContainer: "#EFEAFB",
  lilac: "#8B63E7", steel: "#0E0E10", white: "#FFFFFF",
  text: "#0E0E10", textSecondary: "#5B5A6B", textFaint: "#8D8C9C",
  background: "#F5F4F9", surface: "#FFFFFF", stripe: "#F8F7FC", border: "#E6E3EF",
  success: "#1E7B4F", successBg: "#E3F4EA", warning: "#7A4505", warningBg: "#FDF0DC", error: "#8F1D14", errorBg: "#FBE4E2",
  sidebar: "#0E0E10", sidebarHover: "#1D1C24", sidebarText: "#C8C6D4", sidebarMuted: "#76748A",
} as const;

export const shape = { chip: 8, field: 12, card: 20, cardLarge: 24, pill: 999 } as const;
export const typography = { sans: '"Inter", "Segoe UI", sans-serif', mono: '"JetBrains Mono", monospace' } as const;

export const springs = {
  standard: { type: "spring", stiffness: 400, damping: 30 } satisfies Transition,
  bouncy: { type: "spring", stiffness: 500, damping: 18 } satisfies Transition,
  screen: { type: "spring", stiffness: 260, damping: 32 } satisfies Transition,
};

export const fadeThrough = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: springs.screen },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.12 } },
};
