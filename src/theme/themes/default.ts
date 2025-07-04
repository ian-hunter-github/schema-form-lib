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
    strategy: 'responsive-adaptive',
    gap: 'md',
    breakpoints: {
      mobile: 'vertical',
      tablet: 'intelligent-flow',
      desktop: 'grid-12'
    },
    fieldWidths: {
      boolean: 3,
      number: 4,
      integer: 4,
      string: 6,
      email: 6,
      url: 6,
      password: 6,
      textarea: 12,
      array: 12,
      object: 12,
      enum: 4
    },
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
