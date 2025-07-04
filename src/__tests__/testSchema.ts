import type { JSONSchema } from '../types/schema';

export const testSchema: JSONSchema = {
  type: 'object',
  properties: {
    firstName: {
      type: 'string',
      title: 'First Name',
      minLength: 2,
      maxLength: 50
    },
    lastName: {
      type: 'string', 
      title: 'Last Name',
      minLength: 2,
      maxLength: 50
    },
    age: {
      type: 'number',
      title: 'Age',
      minimum: 18,
      maximum: 120
    },
    email: {
      type: 'string',
      title: 'Email',
      format: 'email'
    },
    subscribe: {
      type: 'boolean',
      title: 'Subscribe to newsletter'
    },
    address: {
      type: 'object',
      properties: {
        street: { 
          type: 'string',
          isRequired: true
        },
        city: { 
          type: 'string',
          isRequired: true
        },
        zip: { 
          type: 'string', 
          pattern: '^\\d{5}(-\\d{4})?$',
          isRequired: true
        }
      }
    }
  },
  required: ['firstName', 'lastName', 'email'] as string[]
};
