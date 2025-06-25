import type { Meta, StoryObj } from '@storybook/react';
import EnumField from '../EnumField';
import type { FormField } from '../../../../utils/formModel/types';
import type { JSONSchema } from '../../../../types/schema';

// Helper function to create mock FormField
const createMockFormField = (overrides: Partial<FormField> = {}): FormField => {
  const defaultSchema: JSONSchema = {
    type: 'string',
    title: 'Sample Field',
    description: 'This is a sample enum field',
    enum: ['option1', 'option2', 'option3'],
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

const meta: Meta<typeof EnumField> = {
  title: 'Components/Fields/EnumField',
  component: EnumField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'An enum/select field component that uses FormField as backing data structure. Supports both single and multiple selection, validation, dirty state tracking, and various field configurations.',
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
    domContextId: {
      description: 'Optional DOM context ID for field identification',
      control: { type: 'text' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {
    field: createMockFormField(),
    onChange: (value: string | string[], triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};

// Story with selected value
export const WithSelectedValue: Story = {
  args: {
    field: createMockFormField({
      value: 'option2',
      pristineValue: 'option2',
    }),
    onChange: (value: string | string[], triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};

// Multiple selection story
export const MultipleSelection: Story = {
  args: {
    field: createMockFormField({
      value: ['option1', 'option3'],
      pristineValue: ['option1', 'option3'],
      schema: {
        type: 'array',
        title: 'Multi Select Field',
        description: 'Select multiple options',
        enum: ['option1', 'option2', 'option3', 'option4'],
      },
    }),
    onChange: (value: string | string[], triggerValidation?: boolean) => {
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
        enum: ['yes', 'no', 'maybe'],
      },
    }),
    onChange: (value: string | string[], triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};

// Field with validation errors
export const WithErrors: Story = {
  args: {
    field: createMockFormField({
      value: '',
      errors: ['Please select an option'],
      errorCount: 1,
      schema: {
        type: 'string',
        title: 'Status',
        description: 'Select your current status',
        enum: ['active', 'inactive', 'pending'],
      },
    }),
    onChange: (value: string | string[], triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};

// Dirty field story
export const Dirty: Story = {
  args: {
    field: createMockFormField({
      value: 'option3',
      pristineValue: 'option1',
      dirty: true,
      dirtyCount: 1,
      hasChanges: true,
      schema: {
        type: 'string',
        title: 'Modified Field',
        description: 'This field has been modified',
        enum: ['option1', 'option2', 'option3'],
      },
    }),
    onChange: (value: string | string[], triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};

// Read-only field story
export const ReadOnly: Story = {
  args: {
    field: createMockFormField({
      value: 'option2',
      schema: {
        type: 'string',
        title: 'Read-Only Field',
        description: 'This field cannot be edited',
        enum: ['option1', 'option2', 'option3'],
        readOnly: true,
      },
    }),
    onChange: (value: string | string[], triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};

// Field without description
export const NoDescription: Story = {
  args: {
    field: createMockFormField({
      value: 'option1',
      schema: {
        type: 'string',
        title: 'Simple Field',
        enum: ['option1', 'option2', 'option3'],
      },
    }),
    onChange: (value: string | string[], triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};

// Field with DOM context ID
export const WithDomContext: Story = {
  args: {
    field: createMockFormField({
      path: 'user.role',
      value: 'admin',
      schema: {
        type: 'string',
        title: 'User Role',
        description: 'Select user role',
        enum: ['admin', 'user', 'guest'],
      },
    }),
    domContextId: 'userForm',
    onChange: (value: string | string[], triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};

// Complex field with all features
export const Complex: Story = {
  args: {
    field: createMockFormField({
      path: 'project.priority',
      value: 'high',
      pristineValue: 'medium',
      schema: {
        type: 'string',
        title: 'Project Priority',
        description: 'Select the priority level for this project',
        enum: ['low', 'medium', 'high', 'critical'],
      },
      errors: [],
      errorCount: 0,
      required: true,
      dirty: true,
      dirtyCount: 1,
      hasChanges: true,
      lastModified: new Date(),
    }),
    domContextId: 'projectForm',
    onChange: (value: string | string[], triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};

// Field with multiple errors
export const MultipleErrors: Story = {
  args: {
    field: createMockFormField({
      value: '',
      errors: [
        'Field is required',
        'Please select a valid option',
        'Selection cannot be empty',
      ],
      errorCount: 3,
      required: true,
      schema: {
        type: 'string',
        title: 'Category',
        description: 'Select a category',
        enum: ['electronics', 'clothing', 'books', 'home'],
      },
    }),
    onChange: (value: string | string[], triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};

// Nested field path
export const NestedPath: Story = {
  args: {
    field: createMockFormField({
      path: 'user.preferences.theme',
      value: 'dark',
      schema: {
        type: 'string',
        title: 'Theme Preference',
        description: 'Choose your preferred theme',
        enum: ['light', 'dark', 'auto'],
      },
    }),
    onChange: (value: string | string[], triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};

// Country selection example
export const CountrySelection: Story = {
  args: {
    field: createMockFormField({
      path: 'address.country',
      value: 'US',
      schema: {
        type: 'string',
        title: 'Country',
        description: 'Select your country',
        enum: ['US', 'CA', 'UK', 'DE', 'FR', 'JP', 'AU'],
      },
    }),
    domContextId: 'addressForm',
    onChange: (value: string | string[], triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};

// Size selection example
export const SizeSelection: Story = {
  args: {
    field: createMockFormField({
      path: 'product.size',
      value: 'M',
      schema: {
        type: 'string',
        title: 'Size',
        description: 'Select product size',
        enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      },
    }),
    onChange: (value: string | string[], triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};

// Multiple tags selection
export const MultipleTags: Story = {
  args: {
    field: createMockFormField({
      path: 'article.tags',
      value: ['javascript', 'react'],
      schema: {
        type: 'array',
        title: 'Tags',
        description: 'Select relevant tags (hold Ctrl/Cmd to select multiple)',
        enum: ['javascript', 'react', 'typescript', 'vue', 'angular', 'node', 'python'],
      },
    }),
    onChange: (value: string | string[], triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};

// Status selection with colors
export const StatusSelection: Story = {
  args: {
    field: createMockFormField({
      path: 'task.status',
      value: 'in-progress',
      schema: {
        type: 'string',
        title: 'Task Status',
        description: 'Current status of the task',
        enum: ['todo', 'in-progress', 'review', 'done', 'cancelled'],
      },
    }),
    onChange: (value: string | string[], triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};

// Language selection
export const LanguageSelection: Story = {
  args: {
    field: createMockFormField({
      path: 'user.language',
      value: 'en',
      schema: {
        type: 'string',
        title: 'Preferred Language',
        description: 'Select your preferred language',
        enum: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'zh'],
      },
    }),
    onChange: (value: string | string[], triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};

// Empty multiple selection
export const EmptyMultipleSelection: Story = {
  args: {
    field: createMockFormField({
      path: 'permissions',
      value: [],
      schema: {
        type: 'array',
        title: 'Permissions',
        description: 'Select user permissions',
        enum: ['read', 'write', 'delete', 'admin'],
      },
    }),
    onChange: (value: string | string[], triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};
