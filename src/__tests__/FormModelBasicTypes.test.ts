import { describe, it, expect } from 'vitest';
import { FormModel } from '../utils/FormModel';
import type { JSONSchemaProperties } from '../types/schema';

describe('FormModel - Basic Types', () => {
  it('should handle string type with default', () => {
    const schema: JSONSchemaProperties = {
      name: { type: 'string', default: 'John' }
    };
    const model = new FormModel(schema);
    expect(model.getField('name')?.value).toBe('John');
  });

  it('should handle number type', () => {
    const schema: JSONSchemaProperties = {
      age: { type: 'number' }
    };
    const model = new FormModel(schema);
    expect(model.getField('age')?.value).toBeUndefined();
  });

  it('should handle boolean type', () => {
    const schema: JSONSchemaProperties = {
      active: { type: 'boolean', default: true }
    };
    const model = new FormModel(schema);
    expect(model.getField('active')?.value).toBe(true);
  });

  it('should validate required string', () => {
    const schema: JSONSchemaProperties = {
      name: { type: 'string', required: true }
    };
    const model = new FormModel(schema);
    expect(model.validate()).toBe(false);
    expect(model.getField('name')?.errors).toContain('Field is required');
  });

  it('should validate number type', () => {
    const schema: JSONSchemaProperties = {
      age: { type: 'number' }
    };
    const model = new FormModel(schema);
    model.setValue('age', 'not a number');
    expect(model.validate()).toBe(false);
    expect(model.getField('age')?.errors).toContain('Must be a number');
  });

  it('should validate string length constraints', () => {
    const schema: JSONSchemaProperties = {
      password: {
        type: 'string',
        minLength: 8,
        maxLength: 20
      }
    };
    const model = new FormModel(schema);
    
    model.setValue('password', 'short');
    expect(model.validate()).toBe(false);
    expect(model.getField('password')?.errors).toContain('Must be at least 8 characters');
  });
});
