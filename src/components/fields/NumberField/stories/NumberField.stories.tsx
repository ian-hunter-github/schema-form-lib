import type { Meta, StoryObj } from '@storybook/react-vite';
import NumberField from '../NumberField';
import type { FormField } from '../../../../utils/formModel/types';
import type { JSONSchema } from '../../../../types/schema';

// Helper function to create mock FormField
const createMockFormField = (overrides: Partial<FormField> = {}): FormField => {
  const defaultSchema: JSONSchema = {
    type: 'number',
    title: 'Sample Field',
    description: 'This is a sample number field',
  };

  return {
    path: 'sampleField',
    value: 0,
    pristineValue: 0,
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

const meta: Meta<typeof NumberField> = {
  title: 'Components/Fields/NumberField',
  component: NumberField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A number input field component that uses FormField as backing data structure. Supports validation, dirty state tracking, and various field configurations.',
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
    onChange: (value) => { console.log('NumberField changed:', value); },
  },
};

// Story with initial value
export const WithValue: Story = {
  args: {
    field: createMockFormField({
      value: 42,
      pristineValue: 42,
    }),
    onChange: (value) => { console.log('NumberField changed:', value); },
  },
};

// Decimal value story
export const DecimalValue: Story = {
  args: {
    field: createMockFormField({
      value: 3.14159,
      pristineValue: 3.14159,
      schema: {
        type: 'number',
        title: 'Pi Value',
        description: 'Enter a decimal number',
      },
    }),
    onChange: (value) => { console.log('NumberField changed:', value); },
  },
};

// Negative value story
export const NegativeValue: Story = {
  args: {
    field: createMockFormField({
      value: -25,
      pristineValue: -25,
      schema: {
        type: 'number',
        title: 'Temperature',
        description: 'Enter temperature in Celsius',
      },
    }),
    onChange: (value) => { console.log('NumberField changed:', value); },
  },
};

// Required field story
export const Required: Story = {
  args: {
    field: createMockFormField({
      required: true,
      schema: {
        type: 'number',
        title: 'Required Field',
        description: 'This field is required',
      },
    }),
    onChange: (value) => { console.log('NumberField changed:', value); },
  },
};

// Field with validation errors
export const WithErrors: Story = {
  args: {
    field: createMockFormField({
      value: -5,
      errors: ['Value must be greater than 0'],
      errorCount: 1,
      schema: {
        type: 'number',
        title: 'Age',
        description: 'Enter your age (must be positive)',
        minimum: 0,
      },
    }),
    onChange: (value) => { console.log('NumberField changed:', value); },
  },
};

// Dirty field story
export const Dirty: Story = {
  args: {
    field: createMockFormField({
      value: 100,
      pristineValue: 50,
      dirty: true,
      dirtyCount: 1,
      hasChanges: true,
      schema: {
        type: 'number',
        title: 'Modified Field',
        description: 'This field has been modified',
      },
    }),
    onChange: (value) => { console.log('NumberField changed:', value); },
  },
};

// Read-only field story
export const ReadOnly: Story = {
  args: {
    field: createMockFormField({
      value: 999,
      schema: {
        type: 'number',
        title: 'Read-Only Field',
        description: 'This field cannot be edited',
        readOnly: true,
      },
    }),
    onChange: (value) => { console.log('NumberField changed:', value); },
  },
};

// Field without description
export const NoDescription: Story = {
  args: {
    field: createMockFormField({
      value: 123,
      schema: {
        type: 'number',
        title: 'Simple Field',
      },
    }),
    onChange: (value) => { console.log('NumberField changed:', value); },
  },
};

// Field with DOM context ID
export const WithDomContext: Story = {
  args: {
    field: createMockFormField({
      path: 'user.age',
      value: 25,
      schema: {
        type: 'number',
        title: 'Age',
        description: 'Enter your age in years',
        minimum: 0,
        maximum: 150,
      },
    }),
    onChange: (value) => { console.log('NumberField changed:', value); },
  },
};

// Complex field with all features
export const Complex: Story = {
  args: {
    field: createMockFormField({
      path: 'product.price',
      value: 29.99,
      pristineValue: 19.99,
      schema: {
        type: 'number',
        title: 'Product Price',
        description: 'Enter the price in USD (minimum $1.00)',
        minimum: 1,
        maximum: 10000,
      },
      errors: [],
      errorCount: 0,
      required: true,
      dirty: true,
      dirtyCount: 1,
      hasChanges: true,
      lastModified: new Date(),
    }),
    onChange: (value) => { console.log('NumberField changed:', value); },
  },
};

// Field with multiple errors
export const MultipleErrors: Story = {
  args: {
    field: createMockFormField({
      value: 150,
      errors: [
        'Value is required',
        'Value must be between 18 and 100',
        'Invalid age range',
      ],
      errorCount: 3,
      required: true,
      schema: {
        type: 'number',
        title: 'Age Verification',
        description: 'Enter your age (18-100)',
        minimum: 18,
        maximum: 100,
      },
    }),
    onChange: (value) => { console.log('NumberField changed:', value); },
  },
};

// Nested field path
export const NestedPath: Story = {
  args: {
    field: createMockFormField({
      path: 'user.profile.settings.timeout',
      value: 300,
      schema: {
        type: 'number',
        title: 'Session Timeout',
        description: 'Enter timeout in seconds',
        minimum: 60,
        maximum: 3600,
      },
    }),
    onChange: (value) => { console.log('NumberField changed:', value); },
  },
};

// Currency example
export const Currency: Story = {
  args: {
    field: createMockFormField({
      path: 'order.total',
      value: 149.99,
      schema: {
        type: 'number',
        title: 'Order Total',
        description: 'Total amount in USD',
        minimum: 0,
      },
    }),
    onChange: (value) => { console.log('NumberField changed:', value); },
  },
};

// Percentage example
export const Percentage: Story = {
  args: {
    field: createMockFormField({
      path: 'discount.rate',
      value: 15,
      schema: {
        type: 'number',
        title: 'Discount Rate',
        description: 'Enter discount percentage (0-100)',
        minimum: 0,
        maximum: 100,
      },
    }),
    onChange: (value) => { console.log('NumberField changed:', value); },
  },
};

// Quantity example
export const Quantity: Story = {
  args: {
    field: createMockFormField({
      path: 'item.quantity',
      value: 5,
      schema: {
        type: 'integer',
        title: 'Quantity',
        description: 'Number of items to order',
        minimum: 1,
        maximum: 999,
      },
    }),
    onChange: (value) => { console.log('NumberField changed:', value); },
  },
};

// Large number example
export const LargeNumber: Story = {
  args: {
    field: createMockFormField({
      path: 'company.revenue',
      value: 1500000,
      schema: {
        type: 'number',
        title: 'Annual Revenue',
        description: 'Enter annual revenue in USD',
        minimum: 0,
      },
    }),
    onChange: (value) => { console.log('NumberField changed:', value); },
  },
};

// Zero value example
export const ZeroValue: Story = {
  args: {
    field: createMockFormField({
      path: 'settings.retries',
      value: 0,
      schema: {
        type: 'integer',
        title: 'Retry Count',
        description: 'Number of retry attempts (0 = no retries)',
        minimum: 0,
        maximum: 10,
      },
    }),
    onChange: (value) => { console.log('NumberField changed:', value); },
  },
};
