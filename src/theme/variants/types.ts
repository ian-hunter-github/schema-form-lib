export interface VariantConfig {
  // Array variants
  array?: 'form' | 'table' | 'card' | 'inline';
  
  // Boolean variants
  boolean?: 'checkbox' | 'toggle' | 'radio' | 'button';
  
  // Field size variants
  size?: 'sm' | 'md' | 'lg';
  
  // Density variants
  density?: 'compact' | 'normal' | 'comfortable';
  
  // Button variants
  button?: 'primary' | 'secondary' | 'danger';
}

export interface ComponentVariants {
  // Array field variants
  arrayField: {
    form: React.CSSProperties;
    table: React.CSSProperties;
    card: React.CSSProperties;
    inline: React.CSSProperties;
  };
  
  // Boolean field variants
  booleanField: {
    checkbox: React.CSSProperties;
    toggle: React.CSSProperties;
    radio: React.CSSProperties;
    button: React.CSSProperties;
  };
  
  // Size variants (applied to all fields)
  fieldSize: {
    sm: React.CSSProperties;
    md: React.CSSProperties;
    lg: React.CSSProperties;
  };
  
  // Density variants (spacing adjustments)
  density: {
    compact: {
      spacing: Record<string, string>;
      components: Record<string, React.CSSProperties>;
    };
    normal: {
      spacing: Record<string, string>;
      components: Record<string, React.CSSProperties>;
    };
    comfortable: {
      spacing: Record<string, string>;
      components: Record<string, React.CSSProperties>;
    };
  };
}

// Schema extension types for variant specification
export interface SchemaVariantExtensions {
  'x-variant'?: string;
  'x-size'?: 'sm' | 'md' | 'lg';
  'x-density'?: 'compact' | 'normal' | 'comfortable';
  'x-theme-override'?: Record<string, any>;
}

export type VariantKey = keyof VariantConfig;
export type VariantValue<K extends VariantKey> = VariantConfig[K];
