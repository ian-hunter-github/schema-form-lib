import type { Meta, StoryObj } from '@storybook/react';
import StringField from '../StringField';
import type { FormField } from '../../../../utils/formModel/types';
import type { JSONSchema } from '../../../../types/schema';

// Helper function to create mock FormField
const createMockFormField = (overrides: Partial<FormField> = {}): FormField => {
  const defaultSchema: JSONSchema = {
    type: 'string',
    title: 'Sample Field',
    description: 'This is a sample string field',
  };

  return {
    path: 'sampleField',
    value: '',
    pristineValue: '',
    schema: defaultSchema,
    errors: [],
    errorCount: 0,
    required: false,
    dirty: false,
    dirtyCount: 0,
    hasChanges: false,
    lastModified: new Date(),
    ...overrides,
  };
};

const meta: Meta<typeof StringField> = {
  title: 'Components/Fields/StringField',
  component: StringField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A string input field component that uses FormField as backing data structure. Supports validation, dirty state tracking, and various field configurations.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    field: {
      description: 'The FormField object containing field data and metadata',
      control: { type: 'object' },
    },
    onChange: {
      description: 'Callback function called when field value changes',
      action: 'onChange',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {
    field: createMockFormField(),
    onChange: (value: string, triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};

// Story with initial value
export const WithValue: Story = {
  args: {
    field: createMockFormField({
      value: 'Hello, World!',
      pristineValue: 'Hello, World!',
    }),
    onChange: (value: string, triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};

// Required field story
export const Required: Story = {
  args: {
    field: createMockFormField({
      required: true,
      schema: {
        type: 'string',
        title: 'Required Field',
        description: 'This field is required',
      },
    }),
    onChange: (value: string, triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};

// Field with validation errors
export const WithErrors: Story = {
  args: {
    field: createMockFormField({
      value: 'ab',
      errors: ['Field must be at least 3 characters long'],
      errorCount: 1,
      schema: {
        type: 'string',
        title: 'Name',
        description: 'Enter your full name (minimum 3 characters)',
        minLength: 3,
      },
    }),
    onChange: (value: string, triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};

// Dirty field story
export const Dirty: Story = {
  args: {
    field: createMockFormField({
      value: 'Modified value',
      pristineValue: 'Original value',
      dirty: true,
      dirtyCount: 1,
      hasChanges: true,
      schema: {
        type: 'string',
        title: 'Modified Field',
        description: 'This field has been modified',
      },
    }),
    onChange: (value: string, triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};

// Read-only field story
export const ReadOnly: Story = {
  args: {
    field: createMockFormField({
      value: 'This field is read-only',
      schema: {
        type: 'string',
        title: 'Read-Only Field',
        description: 'This field cannot be edited',
        readOnly: true,
      },
    }),
    onChange: (value: string, triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};

// Field without description
export const NoDescription: Story = {
  args: {
    field: createMockFormField({
      schema: {
        type: 'string',
        title: 'Simple Field',
      },
    }),
    onChange: (value: string, triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};

// Field with nested path
export const WithNestedPath: Story = {
  args: {
    field: createMockFormField({
      path: 'user.email',
      schema: {
        type: 'string',
        title: 'Email Address',
        description: 'Enter your email address',
      },
    }),
    onChange: (value: string, triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};

// Complex field with all features
export const Complex: Story = {
  args: {
    field: createMockFormField({
      path: 'profile.bio',
      value: 'Software developer with 5+ years of experience...',
      pristineValue: 'Software developer...',
      schema: {
        type: 'string',
        title: 'Professional Bio',
        description: 'Tell us about your professional background (minimum 10 characters)',
        minLength: 10,
        maxLength: 500,
      },
      errors: [],
      errorCount: 0,
      required: true,
      dirty: true,
      dirtyCount: 1,
      hasChanges: true,
      lastModified: new Date(),
    }),
    onChange: (value: string, triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};

// Field with multiple errors
export const MultipleErrors: Story = {
  args: {
    field: createMockFormField({
      value: 'x',
      errors: [
        'Field is required',
        'Must be at least 3 characters long',
        'Must contain only letters and spaces',
      ],
      errorCount: 3,
      required: true,
      schema: {
        type: 'string',
        title: 'Full Name',
        description: 'Enter your full name',
        minLength: 3,
        pattern: '^[a-zA-Z\\s]+$',
      },
    }),
    onChange: (value: string, triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};

// Nested field path
export const NestedPath: Story = {
  args: {
    field: createMockFormField({
      path: 'user.profile.contact.phoneNumber',
      value: '+1-555-123-4567',
      schema: {
        type: 'string',
        title: 'Phone Number',
        description: 'Enter your phone number with country code',
        pattern: '^\\+?[1-9]\\d{1,14}$',
      },
    }),
    onChange: (value: string, triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};
