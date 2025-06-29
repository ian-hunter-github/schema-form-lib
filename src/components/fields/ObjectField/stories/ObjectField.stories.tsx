import type { Meta, StoryObj } from '@storybook/react-vite';
import ObjectField from '../ObjectField';
import type { FormField } from '../../../../utils/formModel/types';
import type { FormModel } from '../../../../utils/formModel/FormModel';
import type { JSONSchema, JSONValue } from '../../../../types/schema';

// Helper function to create mock FormField
const createMockFormField = (overrides: Partial<FormField> = {}): FormField => {
  const defaultSchema: JSONSchema = {
    type: 'object',
    title: 'User Profile',
    description: 'Complete user profile information',
    properties: {
      name: { type: 'string', title: 'Full Name' },
      email: { type: 'string', title: 'Email Address' },
      age: { type: 'number', title: 'Age' },
      active: { type: 'boolean', title: 'Active Status' }
    }
  };

  return {
    path: 'userProfile',
    value: {},
    pristineValue: {},
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
const createMockFormModel = (fields: Record<string, FormField> = {}): FormModel => {
  const mockModel = {
    fields: new Map(Object.entries(fields)),
    listeners: new Set(),
    buildForm: () => {},
    getField: (path: string) => fields[path],
    getFields: () => new Map(Object.entries(fields)),
    setValue: (path: string, value: JSONValue) => {
      console.log('FormModel setValue:', { path, value });
    },
    validate: () => true,
    addValue: (arrayPath: string) => `${arrayPath}[0]`,
    deleteValue: () => 0,
    addListener: () => {},
    removeListener: () => {},
    notifyListeners: () => {},
    moveArrayItem: () => {},
    insertArrayItem: (arrayPath: string, index: number) => `${arrayPath}[${index}]`,
    getArrayLength: () => 0,
    resetForm: () => {},
    clearErrors: () => {},
    revertField: () => true,
    revertBranch: () => true,
    revertAll: () => {},
    hasUnsavedChanges: () => false,
    getChangedFields: () => [],
    getChangedPaths: () => [],
    createSnapshot: () => new Map(),
    restoreFromSnapshot: () => {},
    setPristineValues: () => {},
    getChangeStatistics: () => ({
      totalFields: 0,
      changedFields: 0,
      dirtyFields: 0,
      hasUnsavedChanges: false,
    }),
  };
  return mockModel as unknown as FormModel;
};

const meta: Meta<typeof ObjectField> = {
  title: 'Components/Fields/ObjectField',
  component: ObjectField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'An object field component that renders nested fields in an accordion layout. Supports recursive nesting of objects and various field types.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    field: {
      description: 'The FormField object containing object field data and metadata',
      control: { type: 'object' },
    },
    onChange: {
      description: 'Callback function called when nested field values change',
      action: 'onChange',
    },
    formModel: {
      description: 'FormModel instance for accessing nested fields',
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
    onChange: (value: JSONValue, shouldValidate?: boolean) => {
      console.log('Object field changed:', { value, shouldValidate });
    },
    formModel: createMockFormModel(),
  },
};

// Story with nested fields
export const WithNestedFields: Story = {
  args: {
    field: createMockFormField(),
    onChange: (value: JSONValue, shouldValidate?: boolean) => {
      console.log('Object field changed:', { value, shouldValidate });
    },
    formModel: createMockFormModel({
      'userProfile.name': createMockFormField({
        path: 'userProfile.name',
        schema: { type: 'string', title: 'Full Name' },
        value: 'John Doe'
      }),
      'userProfile.email': createMockFormField({
        path: 'userProfile.email',
        schema: { type: 'string', title: 'Email Address' },
        value: 'john@example.com'
      }),
      'userProfile.age': createMockFormField({
        path: 'userProfile.age',
        schema: { type: 'number', title: 'Age' },
        value: 30
      }),
      'userProfile.active': createMockFormField({
        path: 'userProfile.active',
        schema: { type: 'boolean', title: 'Active Status' },
        value: true
      })
    }),
  },
};

// Required field story
export const Required: Story = {
  args: {
    field: createMockFormField({
      required: true,
      schema: {
        type: 'object',
        title: 'Required Profile',
        description: 'This profile section is required',
        properties: {
          name: { type: 'string', title: 'Name' },
          email: { type: 'string', title: 'Email' }
        }
      },
    }),
    onChange: (value: JSONValue, shouldValidate?: boolean) => {
      console.log('Object field changed:', { value, shouldValidate });
    },
    formModel: createMockFormModel(),
  },
};

// Field with validation errors
export const WithErrors: Story = {
  args: {
    field: createMockFormField({
      errors: ['Profile validation failed', 'Missing required fields'],
      errorCount: 2,
      schema: {
        type: 'object',
        title: 'Profile with Errors',
        description: 'This profile has validation errors',
        properties: {
          name: { type: 'string', title: 'Name' },
          email: { type: 'string', title: 'Email' }
        }
      },
    }),
    onChange: (value: JSONValue, shouldValidate?: boolean) => {
      console.log('Object field changed:', { value, shouldValidate });
    },
    formModel: createMockFormModel(),
  },
};

// Dirty field story
export const Dirty: Story = {
  args: {
    field: createMockFormField({
      dirty: true,
      dirtyCount: 2,
      hasChanges: true,
      schema: {
        type: 'object',
        title: 'Modified Profile',
        description: 'This profile has been modified',
        properties: {
          name: { type: 'string', title: 'Name' },
          email: { type: 'string', title: 'Email' }
        }
      },
    }),
    onChange: (value: JSONValue, shouldValidate?: boolean) => {
      console.log('Object field changed:', { value, shouldValidate });
    },
    formModel: createMockFormModel(),
  },
};

// Nested objects story
export const NestedObjects: Story = {
  args: {
    field: createMockFormField({
      schema: {
        type: 'object',
        title: 'User Account',
        description: 'Complete user account information',
        properties: {
          profile: {
            type: 'object',
            title: 'Profile Information',
            properties: {
              name: { type: 'string', title: 'Full Name' },
              bio: { type: 'string', title: 'Biography' }
            }
          },
          settings: {
            type: 'object',
            title: 'Account Settings',
            properties: {
              theme: { type: 'string', title: 'Theme' },
              notifications: { type: 'boolean', title: 'Enable Notifications' }
            }
          }
        }
      },
    }),
    onChange: (value: JSONValue, shouldValidate?: boolean) => {
      console.log('Object field changed:', { value, shouldValidate });
    },
    formModel: createMockFormModel({
      'userProfile.profile': createMockFormField({
        path: 'userProfile.profile',
        schema: {
          type: 'object',
          title: 'Profile Information',
          properties: {
            name: { type: 'string', title: 'Full Name' },
            bio: { type: 'string', title: 'Biography' }
          }
        }
      }),
      'userProfile.settings': createMockFormField({
        path: 'userProfile.settings',
        schema: {
          type: 'object',
          title: 'Account Settings',
          properties: {
            theme: { type: 'string', title: 'Theme' },
            notifications: { type: 'boolean', title: 'Enable Notifications' }
          }
        }
      })
    }),
  },
};

// Empty object story
export const EmptyObject: Story = {
  args: {
    field: createMockFormField({
      schema: {
        type: 'object',
        title: 'Empty Object',
        description: 'An object with no properties defined',
        properties: {}
      },
    }),
    onChange: (value: JSONValue, shouldValidate?: boolean) => {
      console.log('Object field changed:', { value, shouldValidate });
    },
    formModel: createMockFormModel(),
  },
};

// Field without description
export const NoDescription: Story = {
  args: {
    field: createMockFormField({
      schema: {
        type: 'object',
        title: 'Simple Object',
        properties: {
          name: { type: 'string', title: 'Name' }
        }
      },
    }),
    onChange: (value: JSONValue, shouldValidate?: boolean) => {
      console.log('Object field changed:', { value, shouldValidate });
    },
    formModel: createMockFormModel(),
  },
};

// Field with DOM context ID
export const WithDomContext: Story = {
  args: {
    field: createMockFormField({
      path: 'user.profile',
      schema: {
        type: 'object',
        title: 'User Profile',
        description: 'User profile information',
        properties: {
          name: { type: 'string', title: 'Name' },
          email: { type: 'string', title: 'Email' }
        }
      },
    }),
    onChange: (value: JSONValue, shouldValidate?: boolean) => {
      console.log('Object field changed:', { value, shouldValidate });
    },
    formModel: createMockFormModel(),
  },
};

// Complex nested structure
export const ComplexNested: Story = {
  args: {
    field: createMockFormField({
      path: 'company',
      schema: {
        type: 'object',
        title: 'Company Information',
        description: 'Complete company profile with nested structures',
        properties: {
          basic: {
            type: 'object',
            title: 'Basic Information',
            properties: {
              name: { type: 'string', title: 'Company Name' },
              founded: { type: 'number', title: 'Founded Year' }
            }
          },
          contact: {
            type: 'object',
            title: 'Contact Information',
            properties: {
              address: {
                type: 'object',
                title: 'Address',
                properties: {
                  street: { type: 'string', title: 'Street' },
                  city: { type: 'string', title: 'City' },
                  country: { type: 'string', title: 'Country' }
                }
              },
              phone: { type: 'string', title: 'Phone Number' },
              email: { type: 'string', title: 'Email Address' }
            }
          }
        }
      },
      required: true,
      dirty: true,
      hasChanges: true,
    }),
    onChange: (value: JSONValue, shouldValidate?: boolean) => {
      console.log('Object field changed:', { value, shouldValidate });
    },
    formModel: createMockFormModel({
      'company.basic': createMockFormField({
        path: 'company.basic',
        schema: {
          type: 'object',
          title: 'Basic Information',
          properties: {
            name: { type: 'string', title: 'Company Name' },
            founded: { type: 'number', title: 'Founded Year' }
          }
        }
      }),
      'company.contact': createMockFormField({
        path: 'company.contact',
        schema: {
          type: 'object',
          title: 'Contact Information',
          properties: {
            address: {
              type: 'object',
              title: 'Address',
              properties: {
                street: { type: 'string', title: 'Street' },
                city: { type: 'string', title: 'City' },
                country: { type: 'string', title: 'Country' }
              }
            },
            phone: { type: 'string', title: 'Phone Number' },
            email: { type: 'string', title: 'Email Address' }
          }
        }
      }),
      'company.contact.address': createMockFormField({
        path: 'company.contact.address',
        schema: {
          type: 'object',
          title: 'Address',
          properties: {
            street: { type: 'string', title: 'Street' },
            city: { type: 'string', title: 'City' },
            country: { type: 'string', title: 'Country' }
          }
        }
      })
    }),
  },
};

// Mixed field types
export const MixedFieldTypes: Story = {
  args: {
    field: createMockFormField({
      schema: {
        type: 'object',
        title: 'Mixed Field Types',
        description: 'Object containing various field types',
        properties: {
          name: { type: 'string', title: 'Name' },
          age: { type: 'number', title: 'Age' },
          active: { type: 'boolean', title: 'Active' },
          role: { 
            type: 'string', 
            title: 'Role',
            enum: ['admin', 'user', 'guest']
          },
          tags: {
            type: 'array',
            title: 'Tags',
            items: { type: 'string' }
          }
        }
      },
    }),
    onChange: (value: JSONValue, shouldValidate?: boolean) => {
      console.log('Object field changed:', { value, shouldValidate });
    },
    formModel: createMockFormModel({
      'userProfile.name': createMockFormField({
        path: 'userProfile.name',
        schema: { type: 'string', title: 'Name' },
        value: 'Jane Smith'
      }),
      'userProfile.age': createMockFormField({
        path: 'userProfile.age',
        schema: { type: 'number', title: 'Age' },
        value: 28
      }),
      'userProfile.active': createMockFormField({
        path: 'userProfile.active',
        schema: { type: 'boolean', title: 'Active' },
        value: true
      }),
      'userProfile.role': createMockFormField({
        path: 'userProfile.role',
        schema: { 
          type: 'string', 
          title: 'Role',
          enum: ['admin', 'user', 'guest']
        },
        value: 'user'
      }),
      'userProfile.tags': createMockFormField({
        path: 'userProfile.tags',
        schema: {
          type: 'array',
          title: 'Tags',
          items: { type: 'string' }
        },
        value: ['developer', 'javascript']
      })
    }),
  },
};
