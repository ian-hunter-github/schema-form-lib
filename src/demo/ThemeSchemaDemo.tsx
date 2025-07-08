import React, { useEffect } from 'react';
import FormRenderer from '../components/FormRenderer';
import { useFormModel } from '../hooks/useFormModel';
import themeSchema from '../theme/schema/theme.schema.json';
import type { JSONSchema, JSONSchemaProperties } from '../types/schema';
import type { FormField } from '../types/fields';
import { ThemeProvider } from '../theme/ThemeProvider';
import { validateTheme } from '../theme/utils/themeValidation';
import type { Theme } from '../theme/themes/default';

type ThemeFormValue = string | number | boolean | null | undefined | 
  { [key: string]: ThemeFormValue } | ThemeFormValue[];

export const ThemeSchemaDemo = () => {
  // Create a compatible schema object with proper typing
  const formSchema: JSONSchemaProperties = {};
  Object.entries(themeSchema.properties || {}).forEach(([key, value]) => {
    const schemaValue = value as JSONSchema;
    const type = schemaValue.type || ('properties' in schemaValue ? 'object' : 'string');
    formSchema[key] = {
      ...schemaValue,
      type // Ensure type is set and not duplicated
    };
  });

  const [formData, setFormData] = React.useState<Record<string, ThemeFormValue>>({});
  const [theme, setTheme] = React.useState<Theme | undefined>();
  const { formModel } = useFormModel(formSchema);

  useEffect(() => {
    const handleFormChange = (updatedFields: Map<string, FormField>) => {
      const currentData: Record<string, ThemeFormValue> = {};
      
      // Only update when fields actually change
      updatedFields.forEach((field, path) => {
        if (path && !path.includes('.')) { // Only root-level fields
          currentData[path] = field.value ?? null; // Convert undefined to null
        }
      });

      // Debounce updates to prevent excessive re-renders
      const timeoutId = setTimeout(() => {
        try {
          // Merge new changes with existing form data
          const mergedData = {...formData, ...currentData};
          // Validate only if we have complete data, otherwise accept partial updates
          if (Object.keys(mergedData).length >= Object.keys(themeSchema.properties || {}).length) {
            const validatedTheme = validateTheme(mergedData);
            setTheme(validatedTheme);
          }
          setFormData(mergedData);
        } catch {
          setFormData(prev => ({...prev, ...currentData}));
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    };

    formModel.addListener(handleFormChange);
    return () => formModel.removeListener(handleFormChange);
  }, [formModel]);

  // Initialize with default theme
  useEffect(() => {
      import('../theme/themes/default').then(({ defaultTheme }) => {
        setTheme(defaultTheme);
        // Set initial form data from default theme
        const initialData: Record<string, ThemeFormValue> = {};
        Object.entries(defaultTheme).forEach(([key, value]) => {
          if (value && typeof value === 'object' && !Array.isArray(value)) {
            initialData[key] = JSON.parse(JSON.stringify(value));
          } else {
            initialData[key] = value as ThemeFormValue;
          }
        });
        setFormData(initialData);
      });
  }, []);

  return (
    <ThemeProvider initialTheme={theme}>
      <div style={{ 
        display: 'flex',
        height: '100vh',
        padding: '20px',
        gap: '20px'
      }}>
        <div style={{ 
          flex: 1,
          overflow: 'auto',
          padding: '20px',
          borderRight: '1px solid #eee'
        }}>
          <h1>Theme Configuration Editor</h1>
          <FormRenderer 
            formModel={formModel}
            onSubmit={() => {}} // Required prop but not used
          />
        </div>
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '20px'
        }}>
          <h3>Theme JSON Preview</h3>
          <pre style={{
            background: '#f5f5f5',
            padding: '20px',
            borderRadius: '4px'
          }}>{JSON.stringify(formData, null, 2)}</pre>
        </div>
      </div>
    </ThemeProvider>
  );
};
