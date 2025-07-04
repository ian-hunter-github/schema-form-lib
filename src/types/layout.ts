import type { JSONSchema } from './schema';

export type LayoutStrategy = 
  | 'vertical'           // 1 field per row
  | 'intelligent-flow'   // Smart wrapping with content awareness
  | 'grid-12'           // 12-column grid with intelligent sizing
  | 'grid-custom'       // Custom grid configuration
  | 'responsive-adaptive'; // Combines intelligent-flow + grid based on screen size

export type ResponsiveBreakpoint = 'mobile' | 'tablet' | 'desktop';

export interface ResponsiveColumns {
  mobile?: number;
  tablet?: number;
  desktop?: number;
}

export interface FieldGroup {
  fields: string[];
  columns?: number | number[];
  groupSpan?: number;
}

export interface LayoutConfig {
  strategy: LayoutStrategy;
  columns?: number | ResponsiveColumns;
  minColumns?: number;
  maxColumns?: number;
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fieldGroups?: FieldGroup[];
  breakpoints?: {
    [K in ResponsiveBreakpoint]?: LayoutStrategy;
  };
  fieldWidths?: Record<string, number>;
  debug?: boolean; // Shows grid lines and field boundaries for debugging
}

export interface FieldLayoutConfig {
  columns?: number | ResponsiveColumns;
  minColumns?: number;
  maxColumns?: number;
  span?: 'full' | number;
  order?: number;
  breakBefore?: boolean;
  breakAfter?: boolean;
}

// Default field widths for 12-column grid
export const DEFAULT_FIELD_WIDTHS: Record<string, number> = {
  // Narrow fields (3 columns = 25%)
  boolean: 3,
  
  // Medium fields (4 columns = 33%)
  number: 4,
  integer: 4,
  
  // Wide fields (6 columns = 50%)
  string: 6,
  email: 6,
  url: 6,
  password: 6,
  
  // Full width fields (12 columns = 100%)
  textarea: 12,
  array: 12,
  object: 12,
  
  // Enum fields - variable based on options
  enum: 4,
} as const;

// Breakpoint definitions
export const BREAKPOINTS = {
  mobile: { max: 768 },
  tablet: { min: 769, max: 1024 },
  desktop: { min: 1025 }
} as const;

// Extended JSON Schema with layout support
export interface JSONSchemaWithLayout extends JSONSchema {
  'x-layout'?: FieldLayoutConfig;
}

// Form-level layout configuration
export interface FormLayoutConfig extends LayoutConfig {
  'x-layout'?: LayoutConfig;
}
