export const spacing = {
  // Base spacing scale (4px base unit)
  0: '0',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
  24: '6rem',    // 96px
  32: '8rem',    // 128px
  
  // Semantic spacing
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
  
  // Component-specific spacing
  field: {
    padding: '0.75rem',      // 12px - internal field padding
    margin: '0.5rem',        // 8px - margin between fields
    gap: '0.5rem',           // 8px - gap between related elements
  },
  
  form: {
    section: '1.5rem',       // 24px - between form sections
    group: '1rem',           // 16px - between field groups
    field: '0.75rem',        // 12px - between individual fields
  },
  
  array: {
    item: '0.75rem',         // 12px - between array items
    content: '1rem',         // 16px - padding inside array items
    header: '0.75rem',       // 12px - padding in array item headers
  },
  
  button: {
    padding: '0.5rem 1rem',  // 8px 16px - button internal padding
    gap: '0.5rem',           // 8px - gap between button elements
  },
} as const;

export type Spacing = typeof spacing;
