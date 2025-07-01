import { PathBuilder } from '../PathBuilder';
import { SchemaPathExtractor } from '../SchemaPathExtractor';
import type { JSONSchema } from '../../../../types/schema';

describe('PathBuilder with oneOf support', () => {
  const testSchema: JSONSchema = {
    type: 'object',
    properties: {
      contactMethod: {
        type: 'object',
        oneOf: [
          {
            type: 'object',
            properties: {
              email: { type: 'string' }
            }
          },
          {
            type: 'object',
            properties: {
              phone: { type: 'string' }
            }
          }
        ]
      }
    }
  };

  it('should generate paths ignoring oneOf nodes', () => {
    const paths = SchemaPathExtractor.getPaths(testSchema);
    expect(paths).toEqual([
      'contactMethod.email',
      'contactMethod.phone'
    ]);
  });

  it('should build correct child paths for oneOf variants', () => {
    const parentPath = 'contactMethod';
    const childKey = 'email';
    expect(PathBuilder.buildChildPath(parentPath, childKey)).toBe('contactMethod.email');
  });

  it('should handle nested oneOf schemas', () => {
    const schema: JSONSchema = {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          oneOf: [{
            type: 'object',
            properties: {
              contact: {
                type: 'object',
                oneOf: [{
                  type: 'object',
                  properties: {
                    email: { type: 'string' }
                  }
                }]
              }
            }
          }]
        }
      }
    };
    expect(SchemaPathExtractor.getPaths(schema)).toEqual(['user.contact.email']);
  });

  it('should handle anyOf/allOf like oneOf', () => {
    const schema: JSONSchema = {
      type: 'object',
      properties: {
        contact: {
          type: 'object',
          anyOf: [{
            type: 'object',
            properties: {
              phone: { type: 'string' }
            }
          }],
          allOf: [{
            type: 'object',
            properties: {
              verified: { type: 'boolean' }
            }
          }]
        }
      }
    };
    expect(SchemaPathExtractor.getPaths(schema)).toEqual([
      'contact.phone',
      'contact.verified'
    ]);
  });
});
