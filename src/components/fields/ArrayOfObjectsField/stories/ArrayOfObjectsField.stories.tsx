import type { Meta, StoryObj } from '@storybook/react';
import ArrayOfObjectsField from '../ArrayOfObjectsField';
import type { FormField } from '../../../../utils/formModel/types';
import type { FormModel } from '../../../../utils/formModel/FormModel';
import type { JSONSchema } from '../../../../types/schema';

// Mock FormModel for Storybook
const createMockFormModel = (initialData: any[] = []): FormModel => {
  let data = [...initialData];
  
  return {
    addValue: (path: string, value: any) => {
      console.log('addValue called:', path, value);
      data.push(value);
    },
    deleteValue: (path: string) => {
      console.log('deleteValue called:', path);
      const match = path.match(/\.(\d+)$/);
      if (match) {
        const index = parseInt(match[1], 10);
        data.splice(index, 1);
      }
    },
    setValue: (path: string, value: any) => {
      console.log('setValue called:', path, value);
    },
    validate: () => {
      console.log('validate called');
    },
    getField: (path: string) => {
      console.log('getField called:', path);
      
      // Handle array item paths
      const arrayItemMatch = path.match(/^(.+)\.(\d+)$/);
      if (arrayItemMatch) {
        const [, arrayPath, indexStr] = arrayItemMatch;
        const index = parseInt(indexStr, 10);
        if (index < data.length) {
          return {
            path,
            value: data[index],
            pristineValue: data[index],
            schema: { type: 'object' as const },
            errors: [],
            errorCount: 0,
            required: false,
            dirty: false,
            dirtyCount: 0,
            hasChanges: false,
            lastModified: new Date()
          };
        }
      }
      
      // Handle nested property paths
      const nestedMatch = path.match(/^(.+)\.(\d+)\.(.+)$/);
      if (nestedMatch) {
        const [, arrayPath, indexStr, property] = nestedMatch;
        const index = parseInt(indexStr, 10);
        if (index < data.length && data[index] && typeof data[index] === 'object') {
          const value = (data[index] as any)[property];
          return {
            path,
            value,
            pristineValue: value,
            schema: { type: 'string' as const },
            errors: [],
            errorCount: 0,
            required: false,
            dirty: false,
            dirtyCount: 0,
            hasChanges: false,
            lastModified: new Date()
          };
        }
      }
      
      return undefined;
    }
  } as unknown as FormModel;
};

const createPersonSchema = (): JSONSchema => ({
  type: 'array',
  title: 'People',
  description: 'A list of people with their information',
  items: {
    type: 'object',
    properties: {
      name: { 
        type: 'string', 
        title: 'Full Name',
        description: 'The person\'s full name'
      },
      age: { 
        type: 'number', 
        title: 'Age',
        description: 'Age in years',
        minimum: 0,
        maximum: 150
      },
      email: { 
        type: 'string', 
        title: 'Email Address',
        description: 'Contact email address'
      },
      active: { 
        type: 'boolean', 
        title: 'Active Status',
        description: 'Whether the person is currently active'
      }
    }
  }
});

const createAddressSchema = (): JSONSchema => ({
  type: 'array',
  title: 'Addresses',
  description: 'A collection of addresses',
  items: {
    type: 'object',
    properties: {
      street: { 
        type: 'string', 
        title: 'Street Address',
        description: 'Street number and name'
      },
      city: { 
        type: 'string', 
        title: 'City'
      },
      state: { 
        type: 'string', 
        title: 'State/Province'
      },
      zipCode: { 
        type: 'string', 
        title: 'ZIP/Postal Code'
      },
      country: { 
        type: 'string', 
        title: 'Country',
        default: 'United States'
      },
      isPrimary: { 
        type: 'boolean', 
        title: 'Primary Address',
        description: 'Is this the primary address?'
      }
    }
  }
});

const meta: Meta<typeof ArrayOfObjectsField> = {
  title: 'Fields/ArrayOfObjectsField',
  component: ArrayOfObjectsField,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A field component for managing arrays of objects with expandable/collapsible items.'
      }
    }
  },
  argTypes: {
    field: {
      description: 'The form field configuration',
      control: false
    },
    formModel: {
      description: 'The form model instance',
      control: false
    },
    onChange: {
      description: 'Callback function called when the field value changes',
      control: false
    }
  }
};

export default meta;
type Story = StoryObj<typeof ArrayOfObjectsField>;

// Empty Array Story
export const Empty: Story = {
  args: {
    field: {
      path: 'people',
      schema: createPersonSchema(),
      value: [],
      pristineValue: [],
      errors: [],
      errorCount: 0,
      required: false,
      dirty: false,
      dirtyCount: 0,
      hasChanges: false,
      lastModified: new Date()
    } as FormField,
    formModel: createMockFormModel([]),
    onChange: (value: any, shouldValidate?: boolean) => {
      console.log('Field changed:', { value, shouldValidate });
    }
  }
};

// With Existing Items
export const WithItems: Story = {
  args: {
    field: {
      path: 'people',
      schema: createPersonSchema(),
      value: [
        { name: 'John Doe', age: 30, email: 'john@example.com', active: true },
        { name: 'Jane Smith', age: 25, email: 'jane@example.com', active: false },
        { name: 'Bob Johnson', age: 35, email: 'bob@example.com', active: true }
      ],
      pristineValue: [],
      errors: [],
      errorCount: 0,
      required: false,
      dirty: true,
      dirtyCount: 1,
      hasChanges: true,
      lastModified: new Date()
    } as FormField,
    formModel: createMockFormModel([
      { name: 'John Doe', age: 30, email: 'john@example.com', active: true },
      { name: 'Jane Smith', age: 25, email: 'jane@example.com', active: false },
      { name: 'Bob Johnson', age: 35, email: 'bob@example.com', active: true }
    ]),
    onChange: (value: any, shouldValidate?: boolean) => {
      console.log('Field changed:', { value, shouldValidate });
    }
  }
};

// With Validation Errors
export const WithErrors: Story = {
  args: {
    field: {
      path: 'people',
      schema: createPersonSchema(),
      value: [
        { name: '', age: -5, email: 'invalid-email', active: true }
      ],
      pristineValue: [],
      errors: ['At least one person is required', 'Invalid data in person 1'],
      errorCount: 2,
      required: true,
      dirty: true,
      dirtyCount: 1,
      hasChanges: true,
      lastModified: new Date()
    } as FormField,
    formModel: createMockFormModel([
      { name: '', age: -5, email: 'invalid-email', active: true }
    ]),
    onChange: (value: any, shouldValidate?: boolean) => {
      console.log('Field changed:', { value, shouldValidate });
    }
  }
};

// Read Only
export const ReadOnly: Story = {
  args: {
    field: {
      path: 'people',
      schema: {
        ...createPersonSchema(),
        readOnly: true
      },
      value: [
        { name: 'John Doe', age: 30, email: 'john@example.com', active: true },
        { name: 'Jane Smith', age: 25, email: 'jane@example.com', active: false }
      ],
      pristineValue: [
        { name: 'John Doe', age: 30, email: 'john@example.com', active: true },
        { name: 'Jane Smith', age: 25, email: 'jane@example.com', active: false }
      ],
      errors: [],
      errorCount: 0,
      required: false,
      dirty: false,
      dirtyCount: 0,
      hasChanges: false,
      lastModified: new Date()
    } as FormField,
    formModel: createMockFormModel([
      { name: 'John Doe', age: 30, email: 'john@example.com', active: true },
      { name: 'Jane Smith', age: 25, email: 'jane@example.com', active: false }
    ]),
    onChange: (value: any, shouldValidate?: boolean) => {
      console.log('Field changed:', { value, shouldValidate });
    }
  }
};

// Complex Schema (Addresses)
export const ComplexSchema: Story = {
  args: {
    field: {
      path: 'addresses',
      schema: createAddressSchema(),
      value: [
        {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345',
          country: 'United States',
          isPrimary: true
        },
        {
          street: '456 Oak Ave',
          city: 'Another City',
          state: 'NY',
          zipCode: '67890',
          country: 'United States',
          isPrimary: false
        }
      ],
      pristineValue: [],
      errors: [],
      errorCount: 0,
      required: false,
      dirty: true,
      dirtyCount: 1,
      hasChanges: true,
      lastModified: new Date()
    } as FormField,
    formModel: createMockFormModel([
      {
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345',
        country: 'United States',
        isPrimary: true
      },
      {
        street: '456 Oak Ave',
        city: 'Another City',
        state: 'NY',
        zipCode: '67890',
        country: 'United States',
        isPrimary: false
      }
    ]),
    onChange: (value: any, shouldValidate?: boolean) => {
      console.log('Field changed:', { value, shouldValidate });
    }
  }
};

// Required Field
export const Required: Story = {
  args: {
    field: {
      path: 'people',
      schema: {
        ...createPersonSchema(),
        required: true
      },
      value: [],
      pristineValue: [],
      errors: ['This field is required'],
      errorCount: 1,
      required: true,
      dirty: false,
      dirtyCount: 0,
      hasChanges: false,
      lastModified: new Date()
    } as FormField,
    formModel: createMockFormModel([]),
    onChange: (value: any, shouldValidate?: boolean) => {
      console.log('Field changed:', { value, shouldValidate });
    }
  }
};
