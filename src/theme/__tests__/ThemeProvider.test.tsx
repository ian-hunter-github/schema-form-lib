import { render, screen, waitFor, act, cleanup } from '@testing-library/react';
import { vi } from 'vitest';
import { ThemeProvider, useTheme } from '../ThemeProvider';
import { defaultTheme } from '../themes/default';
import LayoutContainer from '../../components/layout/LayoutContainer';
import { FormModel } from '../../utils/formModel/FormModel';
import type { FormField } from '../../utils/formModel/types';

describe('ThemeProvider', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('should provide default theme', () => {
    function TestComponent() {
      const { theme } = useTheme();
      return <div data-testid="theme-name">{theme.name}</div>;
    }

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme-name')).toHaveTextContent(defaultTheme.name);
  });

  it('should accept JSON string as initialTheme', () => {
    const jsonTheme = JSON.stringify({
      ...defaultTheme,
      name: 'json-theme',
      colors: {
        ...defaultTheme.colors,
        background: {
          ...defaultTheme.colors.background,
          overlay: '#000'
        }
      },
      spacing: {
        ...defaultTheme.spacing,
        button: {
          ...defaultTheme.spacing.button,
          padding: '0.5rem'
        }
      },
      typography: {
        ...defaultTheme.typography,
        fontWeight: {
          ...defaultTheme.typography.fontWeight,
          normal: '400px',
          medium: '500px',
          semibold: '600px',
          bold: '700px'
        },
        lineHeight: {
          ...defaultTheme.typography.lineHeight,
          none: '1px',
          tight: '1.25rem',
          normal: '1.5rem',
          loose: '2rem',
          relaxed: '1.75rem'
        },
        field: {
          ...defaultTheme.typography.field,
          label: {
            ...defaultTheme.typography.field.label,
            fontWeight: '500px',
            lineHeight: '1.25rem'
          },
          input: {
            ...defaultTheme.typography.field.input,
            fontWeight: '400px',
            lineHeight: '1.5rem'
          },
          description: {
            ...defaultTheme.typography.field.description,
            fontWeight: '400px',
            lineHeight: '1.5rem'
          },
          error: {
            ...defaultTheme.typography.field.error,
            fontWeight: '400px',
            lineHeight: '1.25rem'
          },
          helper: {
            ...defaultTheme.typography.field.helper,
            fontWeight: '400px',
            lineHeight: '1.25rem'
          }
        },
        button: {
          ...defaultTheme.typography.button,
          fontWeight: '500px',
          lineHeight: '1.25rem'
        }
      }
    });

    const TestComponent = () => {
      const { theme } = useTheme();
      return <div data-testid="theme-name">{theme.name}</div>;
    };

    render(
      <ThemeProvider initialTheme={jsonTheme}>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme-name')).toHaveTextContent('json-theme');
  });

  it('should handle theme loading from URL', async () => {
    const mockTheme = {
      ...defaultTheme,
      name: 'remote-theme',
      colors: {
        ...defaultTheme.colors,
        background: {
          ...defaultTheme.colors.background,
          overlay: '#00000080'
        }
      },
      spacing: {
        ...defaultTheme.spacing,
        button: {
          ...defaultTheme.spacing.button,
          padding: '0.5rem'
        }
      },
      typography: {
        ...defaultTheme.typography,
        fontWeight: {
          ...defaultTheme.typography.fontWeight,
          normal: '400px',
          medium: '500px',
          semibold: '600px',
          bold: '700px'
        },
        lineHeight: {
          ...defaultTheme.typography.lineHeight,
          none: '1px',
          tight: '1.25rem',
          normal: '1.5rem',
          loose: '2rem',
          relaxed: '1.75rem'
        },
        field: {
          ...defaultTheme.typography.field,
          label: {
            ...defaultTheme.typography.field.label,
            fontWeight: '500px',
            lineHeight: '1.25rem'
          },
          input: {
            ...defaultTheme.typography.field.input,
            fontWeight: '400px',
            lineHeight: '1.5rem'
          },
          description: {
            ...defaultTheme.typography.field.description,
            fontWeight: '400px',
            lineHeight: '1.5rem'
          },
          error: {
            ...defaultTheme.typography.field.error,
            fontWeight: '400px',
            lineHeight: '1.25rem'
          },
          helper: {
            ...defaultTheme.typography.field.helper,
            fontWeight: '400px',
            lineHeight: '1.25rem'
          }
        },
        button: {
          ...defaultTheme.typography.button,
          fontWeight: '500px',
          lineHeight: '1.25rem'
        }
      }
    };

    global.fetch = vi.fn(() =>
      Promise.resolve(new Response(JSON.stringify(mockTheme), {
        status: 200,
        headers: { 'Content-type': 'application/json' }
      }))
    );

    const TestComponent = () => {
      const { theme } = useTheme();
      return <div data-testid="theme-name">{theme.name}</div>;
    };

    render(
      <ThemeProvider themeUrl="https://example.com/theme.json">
        <TestComponent />
      </ThemeProvider>
    );

    // Wait for theme to load and verify content
    await waitFor(() => {
      expect(screen.getByTestId('theme-name')).toHaveTextContent('remote-theme');
    }, { timeout: 1000 });
  });

  it('should call onThemeError when URL loading fails', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve(new Response(null, {
        status: 404,
        statusText: 'Not Found'
      }))
    );
    const onError = vi.fn();

    render(
      <ThemeProvider 
        themeUrl="https://example.com/theme.json"
        onThemeError={onError}
      >
        <div>Test</div>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });

  it('should handle invalid JSON theme', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onError = vi.fn();
    const invalidJson = '{ invalid: json }';

    expect(() => {
      render(
        <ThemeProvider 
          initialTheme={invalidJson}
          onThemeError={onError}
        >
          <div>Test</div>
        </ThemeProvider>
      );
    }).toThrow('Failed to parse theme JSON');
    
    consoleError.mockRestore();
  });

  it('should update theme via setTheme with JSON string', async () => {
    const TestComponent = () => {
      const { theme, setTheme } = useTheme();
      return (
        <>
          <div data-testid="theme-name">{theme.name}</div>
          <button 
            onClick={() => {
              const updatedTheme = { 
                ...defaultTheme, 
                name: 'updated',
                colors: {
                  ...defaultTheme.colors,
                  background: {
                    ...defaultTheme.colors.background,
                    overlay: '#000000'
                  }
                },
                spacing: {
                  ...defaultTheme.spacing,
                  xs: '0.5rem',
                  sm: '1rem',
                  md: '1.5rem',
                  button: {
                    ...defaultTheme.spacing.button,
                    padding: '0.5rem'
                  }
                },
                typography: {
                  ...defaultTheme.typography,
                  fontWeight: {
                    ...defaultTheme.typography.fontWeight,
                    normal: '400px',
                    medium: '500px',
                    semibold: '600px',
                    bold: '700px'
                  },
                  lineHeight: {
                    ...defaultTheme.typography.lineHeight,
                    none: '1px',
                    tight: '1.25rem',
                    normal: '1.5rem',
                    loose: '2rem',
                    relaxed: '1.75rem'
                  },
                  field: {
                    ...defaultTheme.typography.field,
                    label: {
                      ...defaultTheme.typography.field.label,
                      fontWeight: '500px',
                      lineHeight: '1.25rem'
                    },
                    input: {
                      ...defaultTheme.typography.field.input,
                      fontWeight: '400px',
                      lineHeight: '1.5rem'
                    },
                    description: {
                      ...defaultTheme.typography.field.description,
                      fontWeight: '400px',
                      lineHeight: '1.5rem'
                    },
                    error: {
                      ...defaultTheme.typography.field.error,
                      fontWeight: '400px',
                      lineHeight: '1.25rem'
                    },
                    helper: {
                      ...defaultTheme.typography.field.helper,
                      fontWeight: '400px',
                      lineHeight: '1.25rem'
                    }
                  },
                  button: {
                    ...defaultTheme.typography.button,
                    fontWeight: '500px',
                    lineHeight: '1.25rem'
                  }
                }
              };
              setTheme(JSON.stringify(updatedTheme));
            }}
            data-testid="update-button"
          >
            Update
          </button>
        </>
      );
    };

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme-name')).toHaveTextContent(defaultTheme.name);
    // Click update button
    act(() => {
      screen.getByTestId('update-button').click();
    });

    // Wait for update to complete
    await waitFor(() => {
      expect(screen.getByTestId('theme-name')).toHaveTextContent('updated');
    });
  });

  describe('Layout Configuration', () => {
    const mockFields: FormField[] = [
      {
        path: 'testField',
        schema: { type: 'string' },
        value: 'test',
        pristineValue: 'test',
        errors: [],
        errorCount: 0,
        required: false,
        dirty: false,
        dirtyCount: 0,
        hasChanges: false,
        lastModified: new Date(0)
      }
    ];
    const mockModel = new FormModel({});

    it('should use theme layout configuration', () => {
      const customTheme = {
        ...defaultTheme,
        layout: {
          ...defaultTheme.layout,
          strategy: 'responsive-adaptive' as const,
          gap: 'md' as const,
          fieldWidths: {
            ...defaultTheme.layout.fieldWidths,
            string: 6 as const
          }
        }
      };

      render(
        <ThemeProvider initialTheme={customTheme}>
          <LayoutContainer 
            fields={mockFields}
            formModel={mockModel}
            onChange={() => {}}
            layoutConfig={{
              strategy: 'grid-12'
            }}
          />
        </ThemeProvider>
      );

      const container = screen.getByTestId('layout-container');
      expect(container).toHaveStyle('display: grid');
      expect(container).toHaveStyle('grid-template-columns: repeat(12, 1fr)');
    });

    it('should merge theme and prop layout configurations', () => {
      const customTheme = {
        ...defaultTheme,
        layout: {
          ...defaultTheme.layout,
          strategy: 'responsive-adaptive' as const,
          breakpoints: {
            mobile: 'vertical' as const,
            tablet: 'intelligent-flow' as const,
            desktop: 'grid-12' as const
          },
          gap: 'md' as const
        }
      };

      render(
        <ThemeProvider initialTheme={customTheme}>
          <LayoutContainer 
            fields={mockFields}
            formModel={mockModel}
            layoutConfig={{
              strategy: 'responsive-adaptive',
              fieldWidths: {
                string: 8
              }
            }}
            onChange={() => {}}
          />
        </ThemeProvider>
      );

      const fieldWrapper = screen.getByTestId('field-wrapper');
      expect(fieldWrapper).toHaveStyle('flex: 0 0 50%');
      expect(fieldWrapper).toHaveStyle('max-width: 50%');
    });

    it('should fall back to vertical layout when no strategy specified', () => {
      render(
        <ThemeProvider>
          <LayoutContainer 
            fields={mockFields}
            formModel={mockModel}
            onChange={() => {}}
            layoutConfig={{ strategy: 'invalid-strategy' as 'grid-12' }}
          />
        </ThemeProvider>
      );

      const container = screen.getByTestId('layout-container');
      expect(container).toHaveStyle('display: flex');
      expect(container).toHaveStyle('flex-direction: column');
    });
  });
});
