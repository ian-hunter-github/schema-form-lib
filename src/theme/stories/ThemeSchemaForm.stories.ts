import type { Meta, StoryObj } from '@storybook/react-vite';
import FormRenderer from '../../components/FormRenderer';
import { FormModel } from '../../utils/formModel/FormModel';
import type { JSONSchemaProperties } from '../../types/schema';
import themeSchema from '../schema/theme.schema.json';

const createFormModel = (schema: JSONSchemaProperties) => {
  const formModel = new FormModel(schema);
  Object.entries(schema).forEach(([key, field]) => {
    if (field.default !== undefined) {
      formModel.setValue(key, field.default);
    } else if (field.type === 'object' && field.properties) {
      // Handle nested objects with oneOf schemas
      Object.entries(field.properties).forEach(([nestedKey, nestedField]) => {
        if ('oneOf' in nestedField && Array.isArray(nestedField.oneOf)) {
          // For oneOf fields, use first valid type as default
          const firstValidType = nestedField.oneOf.find((f) => 'type' in f);
          if (firstValidType) {
            if (firstValidType.type === 'number') {
              formModel.setValue(`${key}.${nestedKey}`, 0);
            } else if (firstValidType.type === 'string') {
              formModel.setValue(`${key}.${nestedKey}`, '');
            }
          }
        }
      });
    }
  });
  return formModel;
};

const meta = {
  title: 'Theme/ThemeSchemaForm',
  component: FormRenderer,
  tags: ['autodocs'],
  argTypes: {
    formModel: {
      control: 'object',
      description: 'Form model instance'
    },
    onSubmit: {
      action: 'submitted',
      description: 'Callback when form is submitted'
    }
  }
} satisfies Meta<typeof FormRenderer>;

export default meta;

type Story = StoryObj<typeof FormRenderer>;

export const Default: Story = {
  args: {
    formModel: createFormModel(themeSchema as unknown as JSONSchemaProperties)
  }
};

export const WithDefaults: Story = {
  args: {
    formModel: createFormModel({
      ...themeSchema,
      properties: {
        ...themeSchema.properties,
        name: {
          ...themeSchema.properties.name,
          default: 'My Theme'
        },
        colors: {
          ...themeSchema.properties.colors,
          properties: {
            ...themeSchema.properties.colors.properties,
            primary: {
              ...themeSchema.properties.colors.properties.primary,
              default: {
                main: '#1976d2',
                light: '#42a5f5', 
                dark: '#1565c0'
              }
            },
            semantic: {
              ...themeSchema.properties.colors.properties.semantic,
              default: {
                error: '#d32f2f',
                warning: '#ed6c02',
                success: '#2e7d32'
              }
            }
          }
        }
      }
    } as unknown as JSONSchemaProperties)
  }
};
