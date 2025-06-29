import type { Meta, StoryObj } from '@storybook/react-vite';
import BooleanField from '../BooleanField';
import type { FormField } from '../../../../utils/formModel/types';
import type { FormModel } from '../../../../utils/formModel/FormModel';
import type { JSONSchema } from '../../../../types/schema';

// Helper function to create mock FormField
const createMockFormField = (overrides: Partial<FormField> = {}): FormField => {
  const defaultSchema: JSONSchema = {
    type: 'boolean',
    title: 'Sample Field',
    description: 'This is a sample boolean field',
  };

  return {
    path: 'sampleField',
    value: false,
    pristineValue: false,
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

// Mock FormModel for stories
const createMockFormModel = (): FormModel => ({
  addValue: (path: string, value: unknown) => {
    console.log('FormModel addValue:', { path, value });
  },
  deleteValue: (path: string) => {
    console.log('FormModel deleteValue:', { path });
  },
  setValue: (path: string, value: unknown) => {
    console.log('FormModel setValue:', { path, value });
  },
  validate: () => {
    console.log('FormModel validate called');
  },
  getField: (path: string) => {
    console.log('FormModel getField:', { path });
    return undefined;
  }
} as unknown as FormModel);

const meta: Meta<typeof BooleanField> = {
  title: 'Components/Fields/BooleanField',
  component: BooleanField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A boolean checkbox field component that uses FormField as backing data structure. Supports validation, dirty state tracking, and various field configurations.',
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
    formModel: {
      description: 'The form model instance',
      control: false,
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {
    field: createMockFormField(),
    formModel: createMockFormModel(),
    onChange: (value: boolean, triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};

// Story with checked value
export const Checked: Story = {
  args: {
    field: createMockFormField({
      value: true,
      pristineValue: true,
    }),
    formModel: createMockFormModel(),
    onChange: (value: boolean, triggerValidation?: boolean) => {
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
        type: 'boolean',
        title: 'Required Field',
        description: 'This field is required',
      },
    }),
    formModel: createMockFormModel(),
    onChange: (value: boolean, triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};

// Field with validation errors
export const WithErrors: Story = {
  args: {
    field: createMockFormField({
      value: false,
      errors: ['This field must be checked to continue'],
      errorCount: 1,
      schema: {
        type: 'boolean',
        title: 'Terms and Conditions',
        description: 'I agree to the terms and conditions',
      },
    }),
    formModel: createMockFormModel(),
    onChange: (value: boolean, triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};

// Dirty field story
export const Dirty: Story = {
  args: {
    field: createMockFormField({
      value: true,
      pristineValue: false,
      dirty: true,
      dirtyCount: 1,
      hasChanges: true,
      schema: {
        type: 'boolean',
        title: 'Modified Field',
        description: 'This field has been modified',
      },
    }),
    formModel: createMockFormModel(),
    onChange: (value: boolean, triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};

// Read-only field story
export const ReadOnly: Story = {
  args: {
    field: createMockFormField({
      value: true,
      schema: {
        type: 'boolean',
        title: 'Read-Only Field',
        description: 'This field cannot be edited',
        readOnly: true,
      },
    }),
    formModel: createMockFormModel(),
    onChange: (value: boolean, triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};

// Field without description
export const NoDescription: Story = {
  args: {
    field: createMockFormField({
      schema: {
        type: 'boolean',
        title: 'Simple Field',
      },
    }),
    formModel: createMockFormModel(),
    onChange: (value: boolean, triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};

// Field with DOM context ID
export const WithDomContext: Story = {
  args: {
    field: createMockFormField({
      path: 'user.isActive',
      schema: {
        type: 'boolean',
        title: 'Active Status',
        description: 'Check to activate user account',
      },
    }),
    formModel: createMockFormModel(),
    onChange: (value: boolean, triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};

// Complex field with all features
export const Complex: Story = {
  args: {
    field: createMockFormField({
      path: 'profile.notifications',
      value: true,
      pristineValue: false,
      schema: {
        type: 'boolean',
        title: 'Email Notifications',
        description: 'Receive email notifications for important updates',
      },
      errors: [],
      errorCount: 0,
      required: true,
      dirty: true,
      dirtyCount: 1,
      hasChanges: true,
      lastModified: new Date(),
    }),
    formModel: createMockFormModel(),
    onChange: (value: boolean, triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};

// Field with multiple errors
export const MultipleErrors: Story = {
  args: {
    field: createMockFormField({
      value: false,
      errors: [
        'Field is required',
        'You must accept the terms to continue',
        'This agreement is mandatory',
      ],
      errorCount: 3,
      required: true,
      schema: {
        type: 'boolean',
        title: 'Legal Agreement',
        description: 'I have read and agree to all terms',
      },
    }),
    formModel: createMockFormModel(),
    onChange: (value: boolean, triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};

// Nested field path
export const NestedPath: Story = {
  args: {
    field: createMockFormField({
      path: 'user.preferences.marketing.emailOptIn',
      value: false,
      schema: {
        type: 'boolean',
        title: 'Marketing Emails',
        description: 'Receive promotional emails and special offers',
      },
    }),
    formModel: createMockFormModel(),
    onChange: (value: boolean, triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};

// Privacy settings example
export const PrivacySettings: Story = {
  args: {
    field: createMockFormField({
      path: 'privacy.shareData',
      value: false,
      schema: {
        type: 'boolean',
        title: 'Share Usage Data',
        description: 'Help improve our service by sharing anonymous usage data',
      },
      required: false,
    }),
    formModel: createMockFormModel(),
    onChange: (value: boolean, triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};

// Subscription example
export const Subscription: Story = {
  args: {
    field: createMockFormField({
      path: 'subscription.autoRenew',
      value: true,
      pristineValue: true,
      schema: {
        type: 'boolean',
        title: 'Auto-Renewal',
        description: 'Automatically renew subscription when it expires',
      },
    }),
    formModel: createMockFormModel(),
    onChange: (value: boolean, triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};
