import type { JSONSchema } from '../../types/schema';

export const oneOfDemoSchema: JSONSchema = {
  type: 'object',
  title: 'Contact Method',
  oneOf: [
    {
      type: 'object',
      title: 'Email',
      properties: {
        email: {
          type: 'string',
          title: 'Email Address',
          minLength: 5,
          pattern: '^[^@]+@[^@]+\\.[^@]+$'
        }
      }
    },
    {
      type: 'object',
      title: 'Phone',
      properties: {
        phone: {
          type: 'string',
          pattern: '^\\+?[0-9]{10,15}$',
          title: 'Phone Number',
          minLength: 10
        }
      }
    }
  ]
};
