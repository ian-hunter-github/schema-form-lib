import { defaultTheme } from '../themes/default';
import type { Theme } from '../themes/default';
import Ajv from 'ajv';
import themeSchema from '../schema/theme.schema.json';

interface LayoutTheme {
  form?: {
    gap?: string;
    maxWidth?: string;
    padding?: string;
  };
  field?: {
    gap?: string;
    direction?: 'row' | 'column';
  };
  section?: {
    gap?: string;
    padding?: string;
  };
}

export type ThemeWithLayout = Theme & {
  layout?: LayoutTheme;
};

const ajv = new Ajv({
  strict: true,
  strictRequired: true,
  allErrors: true,
  strictTypes: false
});

// Register custom color format (supports hex with/without alpha and rgba)
ajv.addFormat("color", {
  type: "string",
  validate: (value) => /^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$|^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[01]?\d?\d?\s*)?\)$/.test(value)
});

// Removed x-format keyword since we're using standard format validation

const validate = ajv.compile(themeSchema);

/**
 * Validates and normalizes a theme configuration object
 * @param themeConfig The theme configuration to validate (can be partial)
 * @returns Normalized theme object that matches Theme type
 * @throws Error if validation fails
 */
export function validateTheme(themeConfig: unknown): ThemeWithLayout {
  // Skip validation if themeConfig is undefined/null
  if (!themeConfig) {
    return defaultTheme;
  }

  // For partial themes, only validate properties that exist
  const partialValidation = typeof themeConfig === 'object' && themeConfig !== null;
  if (partialValidation) {
    const partialSchema = {
      ...themeSchema,
      required: [] // Remove all required fields for partial validation
    };
    const partialValidate = ajv.compile(partialSchema);
    const isValid = partialValidate(themeConfig);
    if (!isValid) {
      throw new Error(`Invalid theme configuration: ${ajv.errorsText(partialValidate.errors)}`);
    }
  } else {
    // Full validation for complete themes
    const isValid = validate(themeConfig);
    if (!isValid) {
      throw new Error(`Invalid theme configuration: ${ajv.errorsText(validate.errors)}`);
    }
  }

  // Deep merge with default theme to ensure all properties exist
  return deepMergeTheme(defaultTheme, themeConfig as Partial<Theme>);
}

/**
 * Deep merges a partial theme with the default theme
 */
function deepMergeTheme(defaultTheme: Theme, partialTheme: Partial<ThemeWithLayout>): ThemeWithLayout {
  return {
    ...defaultTheme,
    ...partialTheme,
    colors: {
      ...defaultTheme.colors,
      ...partialTheme.colors,
      semantic: {
        ...defaultTheme.colors.semantic,
        ...partialTheme.colors?.semantic
      },
      text: {
        ...defaultTheme.colors.text,
        ...partialTheme.colors?.text
      },
      border: {
        ...defaultTheme.colors.border,
        ...partialTheme.colors?.border
      },
      background: {
        ...defaultTheme.colors.background,
        ...partialTheme.colors?.background
      },
      state: {
        ...defaultTheme.colors.state,
        ...partialTheme.colors?.state
      }
    },
    spacing: {
      ...defaultTheme.spacing,
      ...partialTheme.spacing,
      button: {
        ...defaultTheme.spacing.button,
        ...partialTheme.spacing?.button
      },
      array: {
        ...defaultTheme.spacing.array,
        ...partialTheme.spacing?.array
      },
      form: {
        ...defaultTheme.spacing.form,
        ...partialTheme.spacing?.form
      },
      field: {
        ...defaultTheme.spacing.field,
        ...partialTheme.spacing?.field
      }
    },
    typography: {
      ...defaultTheme.typography,
      ...partialTheme.typography,
      field: {
        ...defaultTheme.typography.field,
        ...partialTheme.typography?.field,
        label: {
          ...defaultTheme.typography.field.label,
          ...partialTheme.typography?.field?.label
        },
        input: {
          ...defaultTheme.typography.field.input,
          ...partialTheme.typography?.field?.input
        },
        description: {
          ...defaultTheme.typography.field.description,
          ...partialTheme.typography?.field?.description
        },
        error: {
          ...defaultTheme.typography.field.error,
          ...partialTheme.typography?.field?.error
        },
        helper: {
          ...defaultTheme.typography.field.helper,
          ...partialTheme.typography?.field?.helper
        }
      },
      button: {
        ...defaultTheme.typography.button,
        ...partialTheme.typography?.button
      }
    },
    shadows: {
      ...defaultTheme.shadows,
      ...partialTheme.shadows,
      field: {
        ...defaultTheme.shadows.field,
        ...partialTheme.shadows?.field
      },
      button: {
        ...defaultTheme.shadows.button,
        ...partialTheme.shadows?.button
      },
      card: {
        ...defaultTheme.shadows.card,
        ...partialTheme.shadows?.card
      }
    },
    components: {
      ...defaultTheme.components,
      ...partialTheme.components,
      density: {
        ...defaultTheme.components.density,
        ...partialTheme.components?.density
      }
    },
    layout: {
      ...defaultTheme.layout,
      ...partialTheme.layout,
      form: {
        ...defaultTheme.layout?.form,
        ...partialTheme.layout?.form
      },
      field: {
        ...defaultTheme.layout?.field,
        ...partialTheme.layout?.field
      },
      section: {
        ...defaultTheme.layout?.section,
        ...partialTheme.layout?.section
      }
    }
  };
}

/**
 * Parses a JSON string into a validated theme object
 * @param jsonString JSON string containing theme configuration
 * @returns Validated theme object
 * @throws Error if parsing or validation fails
 */
export function parseThemeJson(jsonString: string): ThemeWithLayout {
  try {
    const parsed = JSON.parse(jsonString);
    return validateTheme(parsed);
  } catch (error) {
    throw new Error(`Failed to parse theme JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}
