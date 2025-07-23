export const colors = {
  // Primary color palette
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Gray scale
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // Semantic colors
  semantic: {
    error: '#dc2626',
    errorLight: '#fef2f2',
    errorBorder: '#fecaca',
    
    warning: '#d97706',
    warningLight: '#fffbeb',
    warningBorder: '#fed7aa',
    
    success: '#059669',
    successLight: '#ecfdf5',
    successBorder: '#a7f3d0',
    
    info: '#0284c7',
    infoLight: '#f0f9ff',
    infoBorder: '#7dd3fc',
  },
  
  // State colors
  state: {
    hover: '#f3f4f6',
    active: '#e5e7eb',
    focus: '#3b82f6',
    disabled: '#f9fafb',
    
    // Field states
    dirty: '#fff3cd',
    dirtyBorder: '#ffc107',
    changed: '#fff3cd',
    changedBorder: '#ffc107',
  },
  
  // Background colors
  background: {
    primary: '#ffffff',
    secondary: '#f9fafb',
    tertiary: '#f3f4f6',
    overlay: 'rgba(0, 0, 0, 0.5)',
    nested: {
      0: '#B3D4FF',  // Pastel blue (base level)
      1: '#D1C4E9',  // Pastel purple
      2: '#B2DFDB',  // Pastel teal
      3: '#C8E6C9',  // Pastel green
      4: '#FFE0B2',  // Pastel orange
      5: '#F8BBD0',  // Pastel pink
      6: '#D7CCC8',  // Pastel brown
      7: '#CFD8DC',  // Pastel blue gray
      8: '#FFCCBC',  // Pastel deep orange
      9: '#E1BEE7',  // Pastel light purple
      10: '#BBDEFB', // Pastel light blue
    },
  },
  
  // Text colors
  text: {
    primary: '#111827',
    secondary: '#6b7280',
    tertiary: '#9ca3af',
    inverse: '#ffffff',
    link: '#3b82f6',
    linkHover: '#1d4ed8',
  },
  
  // Border colors
  border: {
    primary: '#e5e7eb',
    secondary: '#d1d5db',
    focus: '#3b82f6',
    error: '#fecaca',
    warning: '#fed7aa',
    success: '#a7f3d0',
  },
} as const satisfies {
  [key: string]: unknown;
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    overlay: string;
    nested: {
      [key: number]: string;
      0: string;
      1: string;
      2: string;
      3: string;
      4: string;
      5: string;
      6: string;
      7: string;
      8: string;
      9: string;
      10: string;
    };
  };
};

export type Colors = typeof colors;
