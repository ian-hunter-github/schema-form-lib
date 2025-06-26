import { colors } from '../tokens/colors';
import { spacing } from '../tokens/spacing';
import { typography } from '../tokens/typography';
import { shadows } from '../tokens/shadows';
import { components } from '../tokens/components';

export const defaultTheme = {
  name: 'default',
  colors,
  spacing,
  typography,
  shadows,
  components,
  
  // Theme-specific overrides
  overrides: {
    // Can be used to override specific token values for this theme
  },
} as const;

export type Theme = typeof defaultTheme;
