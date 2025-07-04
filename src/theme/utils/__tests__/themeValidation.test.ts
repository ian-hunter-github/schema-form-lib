import { validateTheme, parseThemeJson } from '../themeValidation';
import { defaultTheme } from '../../themes/default';

describe('themeValidation', () => {
  describe('Layout Theme Validation', () => {
  it('should validate theme with layout properties', () => {
    const theme = {
      layout: {
        form: {
          gap: '1rem',
          maxWidth: '800px'
        },
        field: {
          direction: 'row'
        }
      }
    };
    const result = validateTheme(theme);
    expect(result.layout?.form?.gap).toBe('1rem');
    expect(result.layout?.field?.direction).toBe('row');
  });

  it('should merge partial layout with defaults', () => {
    const theme = {
      layout: {
        form: {
          gap: '2rem'
        }
      }
    };
    const result = validateTheme(theme);
    expect(result.layout?.form?.gap).toBe('2rem');
    expect(result.layout?.form?.maxWidth).toBe('800px'); // from default
  });

  it('should reject invalid layout direction', () => {
    const theme = {
      layout: {
        field: {
          direction: 'invalid'
        }
      }
    };
    expect(() => validateTheme(theme)).toThrow();
  });
});

describe('validateTheme', () => {
    it('should accept a valid theme', () => {
      const validTheme = {
        ...defaultTheme,
        name: 'custom',
        colors: {
          ...defaultTheme.colors,
          primary: {
            ...defaultTheme.colors.primary,
            500: '#0066ff'
          },
          semantic: {
            error: '#ff0000',
            warning: '#ffcc00',
            success: '#00cc00'
          },
          text: {
            primary: '#000000',
            secondary: '#666666'
          },
          border: {
            primary: '#cccccc'
          },
          background: {
            primary: '#ffffff'
          },
          state: defaultTheme.colors.state
        },
        typography: {
          ...defaultTheme.typography,
          fontWeight: {
            normal: '400px',
            medium: '500px',
            semibold: '600px',
            bold: '700px'
          },
          lineHeight: {
            none: '1px',
            tight: '1.25rem',
            normal: '1.5rem',
            loose: '2rem'
          },
          field: {
            label: {
              fontSize: '1rem',
              fontWeight: '600px',
              lineHeight: '1.5rem'
            },
            input: {
              fontSize: '1rem',
              fontWeight: '400px',
              lineHeight: '1.5rem'
            },
            description: {
              fontSize: '0.875rem',
              fontWeight: '400px',
              lineHeight: '1.5rem'
            },
            error: {
              fontSize: '0.875rem',
              fontWeight: '400px',
              lineHeight: '1.5rem'
            },
            helper: {
              fontSize: '0.875rem',
              fontWeight: '400px',
              lineHeight: '1.5rem'
            }
          },
          button: {
            fontSize: '1rem',
            fontWeight: '600px',
            lineHeight: '1.5rem'
          }
        },
        spacing: {
          xs: '0.25rem',
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem'
        },
        shadows: defaultTheme.shadows,
        components: defaultTheme.components
      };

      expect(() => validateTheme(validTheme)).not.toThrow();
    });

    it('should throw for invalid theme structure', () => {
      const invalidTheme = {
        ...defaultTheme,
        colors: {
          ...defaultTheme.colors,
          primary: 'not an object' // Invalid type
        }
      };

      expect(() => validateTheme(invalidTheme)).toThrow();
    });

    it('should merge partial themes with defaults', () => {
      const partialTheme = {
        name: 'partial',
        colors: {
          primary: {
            500: '#123456'
          },
          semantic: {
            error: '#ff0000'
          },
          text: {
            primary: '#000000',
            secondary: '#666666'
          },
          border: {
            primary: '#cccccc'
          },
          background: {
            primary: '#ffffff'
          }
        },
        typography: {
          fontSize: {
            base: '16px'
          },
          fontWeight: {
            normal: '400px',
            medium: '500px',
            semibold: '600px'
          },
          lineHeight: {
            tight: '1.25rem'
          },
          field: {
            label: {
              fontWeight: '600px'
            }
          }
        }
      };

      const result = validateTheme(partialTheme);
      expect(result.name).toBe('partial');
      expect(result.colors.primary[500]).toBe('#123456');
      expect(result.typography.fontSize.base).toBe('16px');
      expect(result.typography.fontWeight.normal).toBe('400px');
      expect(result.typography.fontWeight.medium).toBe('500px');
      expect(result.typography.fontWeight.semibold).toBe('600px');
      expect(result.spacing).toEqual(defaultTheme.spacing);
    });
  });

  describe('parseThemeJson', () => {
    it('should parse valid JSON theme', () => {
      const json = JSON.stringify({
        name: 'json-theme',
        colors: {
          ...defaultTheme.colors,
          primary: {
            500: '#654321'
          },
          background: {
            ...defaultTheme.colors.background,
            overlay: '#ffffff'
          }
        }
      });

      const result = parseThemeJson(json);
      expect(result.name).toBe('json-theme');
      expect(result.colors.primary[500]).toBe('#654321');
    });

    it('should throw for invalid JSON', () => {
      const invalidJson = '{ invalid: json }';
      expect(() => parseThemeJson(invalidJson)).toThrow();
    });
  });
});
