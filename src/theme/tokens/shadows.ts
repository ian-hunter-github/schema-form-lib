export const shadows = {
  // Base shadows
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  
  // Focus shadows
  focus: '0 0 0 3px rgba(59, 130, 246, 0.1)',
  focusError: '0 0 0 3px rgba(220, 38, 38, 0.1)',
  focusWarning: '0 0 0 3px rgba(217, 119, 6, 0.1)',
  focusSuccess: '0 0 0 3px rgba(5, 150, 105, 0.1)',
  
  // Component-specific shadows
  field: {
    default: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    focus: '0 0 0 3px rgba(59, 130, 246, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    error: '0 0 0 3px rgba(220, 38, 38, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  },
  
  button: {
    default: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    hover: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    active: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },
  
  card: {
    default: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    hover: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  
  dropdown: {
    default: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
} as const;

export type Shadows = typeof shadows;
