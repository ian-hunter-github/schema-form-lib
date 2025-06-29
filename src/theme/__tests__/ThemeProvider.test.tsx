import { render, screen, waitFor, act } from '@testing-library/react';
import { vi } from 'vitest';
import { ThemeProvider, useTheme } from '../ThemeProvider';
import { defaultTheme } from '../themes/default';

describe('ThemeProvider', () => {
  it('should provide default theme', () => {
    const TestComponent = () => {
      const { theme } = useTheme();
      return <div data-testid="theme-name">{theme.name}</div>;
    };

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
      typography: {
        ...defaultTheme.typography,
        fontWeight: {
          ...defaultTheme.typography.fontWeight,
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700
        },
        lineHeight: {
          ...defaultTheme.typography.lineHeight,
          none: 1,
          tight: 1.25,
          normal: 1.5,
          loose: 2
        },
        field: {
          ...defaultTheme.typography.field,
          label: {
            ...defaultTheme.typography.field.label,
            fontWeight: 500,
            lineHeight: 1.25
          },
          input: {
            ...defaultTheme.typography.field.input,
            fontWeight: 400,
            lineHeight: 1.5
          },
          description: {
            ...defaultTheme.typography.field.description,
            fontWeight: 400,
            lineHeight: 1.5
          },
          error: {
            ...defaultTheme.typography.field.error,
            fontWeight: 400,
            lineHeight: 1.25
          },
          helper: {
            ...defaultTheme.typography.field.helper,
            fontWeight: 400,
            lineHeight: 1.25
          }
        },
        button: {
          ...defaultTheme.typography.button,
          fontWeight: 500,
          lineHeight: 1.25
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
      typography: {
        ...defaultTheme.typography,
        fontWeight: {
          ...defaultTheme.typography.fontWeight,
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700
        },
        lineHeight: {
          ...defaultTheme.typography.lineHeight,
          none: 1,
          tight: 1.25,
          normal: 1.5,
          loose: 2
        },
        field: {
          ...defaultTheme.typography.field,
          label: {
            ...defaultTheme.typography.field.label,
            fontWeight: 500,
            lineHeight: 1.25
          },
          input: {
            ...defaultTheme.typography.field.input,
            fontWeight: 400,
            lineHeight: 1.5
          },
          description: {
            ...defaultTheme.typography.field.description,
            fontWeight: 400,
            lineHeight: 1.5
          },
          error: {
            ...defaultTheme.typography.field.error,
            fontWeight: 400,
            lineHeight: 1.25
          },
          helper: {
            ...defaultTheme.typography.field.helper,
            fontWeight: 400,
            lineHeight: 1.25
          }
        },
        button: {
          ...defaultTheme.typography.button,
          fontWeight: 500,
          lineHeight: 1.25
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

    await waitFor(() => {
      expect(screen.getByTestId('theme-name')).toHaveTextContent('remote-theme');
    });
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
        typography: {
          ...defaultTheme.typography,
          fontWeight: {
            ...defaultTheme.typography.fontWeight,
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700
          },
        lineHeight: {
          ...defaultTheme.typography.lineHeight,
          none: 1,
          tight: 1.25,
          normal: 1.5,
          loose: 2
        },
        field: {
          ...defaultTheme.typography.field,
          label: {
            ...defaultTheme.typography.field.label,
            fontWeight: 500,
            lineHeight: 1.25
          },
          input: {
            ...defaultTheme.typography.field.input,
            fontWeight: 400,
            lineHeight: 1.5
          },
          description: {
            ...defaultTheme.typography.field.description,
            fontWeight: 400,
            lineHeight: 1.5
          },
          error: {
            ...defaultTheme.typography.field.error,
            fontWeight: 400,
            lineHeight: 1.25
          },
          helper: {
            ...defaultTheme.typography.field.helper,
            fontWeight: 400,
            lineHeight: 1.25
          }
        },
        button: {
          ...defaultTheme.typography.button,
          fontWeight: 500,
          lineHeight: 1.25
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
    await act(async () => {
      screen.getByTestId('update-button').click();
    });
    expect(screen.getByTestId('theme-name')).toHaveTextContent('updated');
  });
});
