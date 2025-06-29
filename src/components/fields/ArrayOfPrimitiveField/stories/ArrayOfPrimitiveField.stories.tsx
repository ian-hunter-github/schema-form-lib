import type { Meta, StoryObj } from '@storybook/react-vite';
import ArrayOfPrimitiveField from '../ArrayOfPrimitiveField';
import type { FormField } from '../../../../utils/formModel/types';
import type { FormModel } from '../../../../utils/formModel/FormModel';
import type { JSONSchema } from '../../../../types/schema';

// Helper function to create mock FormField
const createMockFormField = (overrides: Partial<FormField> = {}): FormField => {
  const defaultSchema: JSONSchema = {
    type: 'array',
    title: 'Sample Field',
    description: 'This is a sample array field',
    items: { type: 'string' },
  };

  return {
    path: 'sampleField',
    value: [],
    pristineValue: [],
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

const meta: Meta<typeof ArrayOfPrimitiveField> = {
  title: 'Components/Fields/ArrayOfPrimitiveField',
  component: ArrayOfPrimitiveField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'An array field component for primitive values that uses FormField as backing data structure. Supports adding/removing items, validation, dirty state tracking, and various field configurations.',
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
    onChange: (value: string[], triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};

// Story with initial items
export const WithItems: Story = {
  args: {
    field: createMockFormField({
      value: ['Item 1', 'Item 2', 'Item 3'],
      pristineValue: ['Item 1', 'Item 2', 'Item 3'],
    }),
    formModel: createMockFormModel(),
    onChange: (value: string[], triggerValidation?: boolean) => {
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
        type: 'array',
        title: 'Required Field',
        description: 'This field is required',
        items: { type: 'string' },
      },
    }),
    formModel: createMockFormModel(),
    onChange: (value: string[], triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};

// Field with validation errors
export const WithErrors: Story = {
  args: {
    field: createMockFormField({
      value: [],
      errors: ['Array must have at least one item'],
      errorCount: 1,
      schema: {
        type: 'array',
        title: 'Tags',
        description: 'Add tags for this item',
        items: { type: 'string' },
        minItems: 1,
      },
    }),
    formModel: createMockFormModel(),
    onChange: (value: string[], triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};

// Dirty field story
export const Dirty: Story = {
  args: {
    field: createMockFormField({
      value: ['Modified Item 1', 'New Item 2'],
      pristineValue: ['Original Item 1'],
      dirty: true,
      dirtyCount: 1,
      hasChanges: true,
      schema: {
        type: 'array',
        title: 'Modified Field',
        description: 'This field has been modified',
        items: { type: 'string' },
      },
    }),
    formModel: createMockFormModel(),
    onChange: (value: string[], triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};

// Read-only field story
export const ReadOnly: Story = {
  args: {
    field: createMockFormField({
      value: ['Read-only Item 1', 'Read-only Item 2'],
      schema: {
        type: 'array',
        title: 'Read-Only Field',
        description: 'This field cannot be edited',
        items: { type: 'string' },
        readOnly: true,
      },
    }),
    formModel: createMockFormModel(),
    onChange: (value: string[], triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};

// Field without description
export const NoDescription: Story = {
  args: {
    field: createMockFormField({
      value: ['Simple Item'],
      schema: {
        type: 'array',
        title: 'Simple Field',
        items: { type: 'string' },
      },
    }),
    formModel: createMockFormModel(),
    onChange: (value: string[], triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};

// Field with DOM context ID
export const WithDomContext: Story = {
  args: {
    field: createMockFormField({
      path: 'user.hobbies',
      value: ['Reading', 'Swimming'],
      schema: {
        type: 'array',
        title: 'Hobbies',
        description: 'List your hobbies',
        items: { type: 'string' },
      },
    }),
    formModel: createMockFormModel(),
    onChange: (value: string[], triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};

// Complex field with all features
export const Complex: Story = {
  args: {
    field: createMockFormField({
      path: 'project.technologies',
      value: ['React', 'TypeScript', 'Node.js'],
      pristineValue: ['React', 'JavaScript'],
      schema: {
        type: 'array',
        title: 'Technologies Used',
        description: 'List the technologies used in this project',
        items: { type: 'string' },
        minItems: 1,
        maxItems: 10,
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
    onChange: (value: string[], triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};

// Field with multiple errors
export const MultipleErrors: Story = {
  args: {
    field: createMockFormField({
      value: [],
      errors: [
        'Field is required',
        'Array must have at least 2 items',
        'Cannot be empty',
      ],
      errorCount: 3,
      required: true,
      schema: {
        type: 'array',
        title: 'Skills',
        description: 'List your skills',
        items: { type: 'string' },
        minItems: 2,
      },
    }),
    formModel: createMockFormModel(),
    onChange: (value: string[], triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};

// Nested field path
export const NestedPath: Story = {
  args: {
    field: createMockFormField({
      path: 'user.profile.languages',
      value: ['English', 'Spanish'],
      schema: {
        type: 'array',
        title: 'Languages',
        description: 'Languages you speak',
        items: { type: 'string' },
      },
    }),
    formModel: createMockFormModel(),
    onChange: (value: string[], triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};

// Tags example
export const Tags: Story = {
  args: {
    field: createMockFormField({
      path: 'article.tags',
      value: ['javascript', 'react', 'tutorial'],
      schema: {
        type: 'array',
        title: 'Article Tags',
        description: 'Add tags to categorize this article',
        items: { type: 'string' },
      },
    }),
    formModel: createMockFormModel(),
    onChange: (value: string[], triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};

// Email list example
export const EmailList: Story = {
  args: {
    field: createMockFormField({
      path: 'notification.emails',
      value: ['admin@example.com', 'user@example.com'],
      schema: {
        type: 'array',
        title: 'Notification Emails',
        description: 'Email addresses to notify',
        items: { type: 'string' },
      },
    }),
    formModel: createMockFormModel(),
    onChange: (value: string[], triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};

// Empty array
export const EmptyArray: Story = {
  args: {
    field: createMockFormField({
      path: 'empty.list',
      value: [],
      schema: {
        type: 'array',
        title: 'Empty List',
        description: 'Start by adding your first item',
        items: { type: 'string' },
      },
    }),
    formModel: createMockFormModel(),
    onChange: (value: string[], triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};

// Single item
export const SingleItem: Story = {
  args: {
    field: createMockFormField({
      path: 'single.item',
      value: ['Only Item'],
      schema: {
        type: 'array',
        title: 'Single Item List',
        description: 'A list with just one item',
        items: { type: 'string' },
      },
    }),
    formModel: createMockFormModel(),
    onChange: (value: string[], triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};

// Many items
export const ManyItems: Story = {
  args: {
    field: createMockFormField({
      path: 'many.items',
      value: [
        'Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5',
        'Item 6', 'Item 7', 'Item 8', 'Item 9', 'Item 10'
      ],
      schema: {
        type: 'array',
        title: 'Many Items',
        description: 'A list with many items',
        items: { type: 'string' },
      },
    }),
    formModel: createMockFormModel(),
    onChange: (value: string[], triggerValidation?: boolean) => {
      console.log('Field changed:', { value, triggerValidation });
    },
  },
};
