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
  layout: {
    form: {
      gap: '1.5rem',
      maxWidth: '800px',
      padding: '1rem'
    },
    field: {
      gap: '0.5rem',
      direction: 'column'
    },
    section: {
      gap: '1rem',
      padding: '0.5rem'
    }
  },
} as const;

export type Theme = typeof defaultTheme;
