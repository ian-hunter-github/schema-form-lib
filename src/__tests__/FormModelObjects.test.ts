import { describe, it, expect } from 'vitest';
import { FormModel } from '../utils/FormModel';
import type { JSONSchemaProperties } from '../types/schema';
import { VALIDATION_MESSAGES } from '../utils/validationMessages';

describe('FormModel - Objects', () => {
  it('should handle nested objects', () => {
    const schema: JSONSchemaProperties = {
      person: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' }
        }
      }
    };
    const model = new FormModel(schema);
    
    expect(model.getField('person.name')?.value).toBe('');
    expect(model.getField('person.age')?.value).toBeUndefined();
    expect(model.getField('person')?.value).toEqual({
      name: '',
      age: undefined
    });
  });

  it('should update nested field values', () => {
    const schema: JSONSchemaProperties = {
      person: {
        type: 'object',
        properties: {
          name: { type: 'string' }
        }
      }
    };
    const model = new FormModel(schema);

    model.setValue('person.name', 'Bob');
    expect(model.getField('person.name')?.value).toBe('Bob');
    expect(model.getField('person')?.value).toEqual({ name: 'Bob' });
  });

  it('should validate nested required fields', () => {
    const schema: JSONSchemaProperties = {
      person: {
        type: 'object',
        properties: {
          age: { type: 'number', required: true }
        }
      }
    };
    const model = new FormModel(schema);

    expect(model.validate()).toBe(false);
    expect(model.getField('person.age')?.errors).toContain('Field is required');
  });

  it('should propagate error counts up to parent objects', () => {
    const schema: JSONSchemaProperties = {
      person: {
        type: 'object',
        properties: {
          name: { type: 'string', required: true },
          age: { type: 'number', required: true }
        }
      }
    };
    const model = new FormModel(schema);

    model.validate();
    expect(model.getField('person.name')?.errorCount).toBe(1);
    expect(model.getField('person.age')?.errorCount).toBe(1);
    expect(model.getField('person')?.errorCount).toBe(2);
  });

  it('should propagate dirty counts up to parent objects', () => {
    const schema: JSONSchemaProperties = {
      person: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' }
        }
      }
    };
    const model = new FormModel(schema);

    expect(model.getField('person')?.dirtyCount).toBe(0);

    model.setValue('person.name', 'Alice');
    expect(model.getField('person.name')?.dirty).toBe(true);
    expect(model.getField('person')?.dirtyCount).toBe(1);
  });

  it('should validate nested object constraints', () => {
    const schema: JSONSchemaProperties = {
      user: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 3 },
          age: { type: 'number', minimum: 18 }
        }
      }
    };
    const model = new FormModel(schema);
    
    model.setValue('user.name', 'ab');
    model.setValue('user.age', 15);
    const isValid = model.validate();
    expect(isValid).toBe(false);
    expect(model.getField('user.name')?.errors).toContain(VALIDATION_MESSAGES.MIN_LENGTH(3));
    expect(model.getField('user.age')?.errors).toContain(VALIDATION_MESSAGES.MIN_NUMBER(18));
  });
});
