// Spacing scale for consistent padding, margin, and gap values across the application.
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  giant: 48,
} as const;

export type SpacingKey = keyof typeof SPACING;
