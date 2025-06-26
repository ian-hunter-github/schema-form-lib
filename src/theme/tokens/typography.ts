export const typography = {
  // Font families
  fontFamily: {
    sans: ['system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
    mono: ['ui-monospace', 'SFMono-Regular', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
  },
  
  // Font sizes
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
  },
  
  // Font weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Line heights
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
  
  // Letter spacing
  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
  },
  
  // Component-specific typography
  field: {
    label: {
      fontSize: '0.875rem',  // 14px
      fontWeight: '500',
      lineHeight: '1.25',
    },
    input: {
      fontSize: '1rem',      // 16px
      fontWeight: '400',
      lineHeight: '1.5',
    },
    description: {
      fontSize: '0.875rem',  // 14px
      fontWeight: '400',
      lineHeight: '1.5',
    },
    error: {
      fontSize: '0.875rem',  // 14px
      fontWeight: '400',
      lineHeight: '1.25',
    },
    helper: {
      fontSize: '0.75rem',   // 12px
      fontWeight: '400',
      lineHeight: '1.25',
    },
  },
  
  button: {
    fontSize: '0.875rem',    // 14px
    fontWeight: '500',
    lineHeight: '1.25',
  },
  
  heading: {
    h1: {
      fontSize: '2.25rem',   // 36px
      fontWeight: '700',
      lineHeight: '1.25',
    },
    h2: {
      fontSize: '1.875rem',  // 30px
      fontWeight: '600',
      lineHeight: '1.25',
    },
    h3: {
      fontSize: '1.5rem',    // 24px
      fontWeight: '600',
      lineHeight: '1.25',
    },
    h4: {
      fontSize: '1.25rem',   // 20px
      fontWeight: '600',
      lineHeight: '1.25',
    },
  },
} as const;

export type Typography = typeof typography;
