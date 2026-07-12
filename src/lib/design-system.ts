/**
 * Design-system class name helpers for TypeScript consumers.
 * Prefer these over scattering long Tailwind strings.
 */

export const ds = {
  card: "ds-card",
  cardInteractive: "ds-card ds-card-interactive",
  featuredHero: "ds-featured-hero",
  featuredHeroCopy: "ds-featured-hero-copy",
  featuredHeroText: "ds-featured-hero-text",
  featuredHeroActions: "ds-featured-hero-actions",
  pageContainer: "ds-page-container",
  pageContainerWide: "ds-page-container ds-page-container-wide",
  contentStack: "ds-content-stack",
  sectionStack: "ds-section-stack",
  gridStats: "ds-grid-stats",
  gridActions: "ds-grid-actions",
  gridCards: "ds-grid-cards",
  focusRing: "ds-focus-ring",
  press: "ds-press",
  fadeIn: "ds-fade-in",
  slideUp: "ds-slide-up",
  slideDown: "ds-slide-down",
  scaleIn: "ds-scale-in",
  toast: "ds-toast",
  loadingPulse: "ds-loading-pulse",
  checkPop: "ds-check-pop",
  heart: "ds-heart",
  strike: "ds-strike",
  collapse: "ds-collapse",
  display: "ds-display",
  h1: "ds-h1",
  h2: "ds-h2",
  h3: "ds-h3",
  sectionTitle: "ds-section-title",
  bodyLg: "ds-body-lg",
  body: "ds-body",
  small: "ds-small",
  caption: "ds-caption",
  label: "ds-label",
  buttonText: "ds-button-text",
} as const;

export type DsClass = (typeof ds)[keyof typeof ds];
