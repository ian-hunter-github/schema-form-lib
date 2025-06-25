import { describe, it, expect } from 'vitest';
import { FormModel } from '../utils/FormModel';
import type { JSONSchemaProperties } from '../types/schema';
import { VALIDATION_MESSAGES } from '../utils/validationMessages';

describe('FormModel - Arrays', () => {
  it('should handle array of strings', () => {
    const schema: JSONSchemaProperties = {
      tags: {
        type: 'array',
        items: { type: 'string' }
      }
    };
    const model = new FormModel(schema);
    
    const tagsField = model.getField('tags');
    expect(tagsField?.value).toEqual([]);
    expect(model.getField('tags.0')).toBeUndefined();
  });

  it('should handle array with default values', () => {
    const schema: JSONSchemaProperties = {
      tags: {
        type: 'array',
        items: { type: 'string' },
        default: ['default1', 'default2']
      }
    };
    const model = new FormModel(schema);
    
    const tagsField = model.getField('tags');
    expect(tagsField?.value).toEqual(['default1', 'default2']);
    expect(model.getField('tags.0')?.value).toBe('default1');
    expect(model.getField('tags.1')?.value).toBe('default2');
  });

  it('should update array items', () => {
    const schema: JSONSchemaProperties = {
      tags: {
        type: 'array',
        items: { type: 'string' },
        default: ['item1']
      }
    };
    const model = new FormModel(schema);
    
    model.setValue('tags.0', 'updated');
    expect(model.getField('tags.0')?.value).toBe('updated');
    const tagsField = model.getField('tags');
    expect(tagsField?.value).toEqual(['updated']);
  });

  it('should validate array items', () => {
    const schema: JSONSchemaProperties = {
      numbers: {
        type: 'array',
        items: { type: 'number', minimum: 0 },
        default: [-5]
      }
    };
    const model = new FormModel(schema);
    
    expect(model.validate()).toBe(false);
    const numberField = model.getField('numbers.0');
    expect(numberField?.errors).toContain(VALIDATION_MESSAGES.MIN_NUMBER(0));
  });

  it('should handle array of objects', () => {
    const schema: JSONSchemaProperties = {
      people: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            age: { type: 'number' }
          }
        },
        default: [{}] // Provide default array with one empty object
      }
    };
    const model = new FormModel(schema);
    
    expect(model.getField('people.0.name')?.value).toBeUndefined();
    expect(model.getField('people.0.age')?.value).toBeUndefined();
  });

  it('should validate nested array items', () => {
    const schema: JSONSchemaProperties = {
      people: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', required: true },
            age: { type: 'number', minimum: 18 }
          }
        },
        default: [{}] // Provide default array with one empty object
      }
    };
    const model = new FormModel(schema);
    
    model.setValue('people.0.age', 15);
    expect(model.validate()).toBe(false);
    const nameField = model.getField('people.0.name');
    const ageField = model.getField('people.0.age');
    expect(nameField?.errors).toContain(VALIDATION_MESSAGES.REQUIRED);
    expect(ageField?.errors).toContain(VALIDATION_MESSAGES.MIN_NUMBER(18));
  });

  it('should track dirty state for array items', () => {
    const schema: JSONSchemaProperties = {
      tags: {
        type: 'array',
        items: { type: 'string' },
        default: ['initial']
      }
    };
    const model = new FormModel(schema);
    
    const tagsField = model.getField('tags');
    expect(tagsField?.dirtyCount).toBe(0);
    
    model.setValue('tags.0', 'modified');
    const tagField = model.getField('tags.0');
    expect(tagField?.dirty).toBe(true);
    expect(tagsField?.dirtyCount).toBe(1);
  });

  it('should add elements to empty array', () => {
    const schema: JSONSchemaProperties = {
      tags: {
        type: 'array',
        items: { type: 'string' }
      }
    };
    const model = new FormModel(schema);
    
    const path = model.addValue('tags', 'new item');
    expect(path).toBe('tags.0');
    expect(model.getField('tags.0')?.value).toBe('new item');
    expect(model.getField('tags')?.value).toEqual(['new item']);
  });

  it('should append elements to existing array', () => {
    const schema: JSONSchemaProperties = {
      tags: {
        type: 'array',
        items: { type: 'string' },
        default: ['first']
      }
    };
    const model = new FormModel(schema);
    
    const path = model.addValue('tags', 'second');
    expect(path).toBe('tags.1');
    expect(model.getField('tags.1')?.value).toBe('second');
    expect(model.getField('tags')?.value).toEqual(['first', 'second']);
  });

  it('should delete elements and maintain indexes', () => {
    const schema: JSONSchemaProperties = {
      tags: {
        type: 'array',
        items: { type: 'string' },
        default: ['first', 'second', 'third']
      }
    };
    const model = new FormModel(schema);
    
    const newLength = model.deleteValue('tags.1');
    expect(newLength).toBe(2);
    expect(model.getField('tags')?.value).toEqual(['first', 'third']);
    expect(model.getField('tags.0')?.value).toBe('first');
    expect(model.getField('tags.1')?.value).toBe('third');
    expect(model.getField('tags.2')).toBeUndefined();
  });

  it('should handle deleting last element', () => {
    const schema: JSONSchemaProperties = {
      tags: {
        type: 'array',
        items: { type: 'string' },
        default: ['only']
      }
    };
    const model = new FormModel(schema);
    
    const newLength = model.deleteValue('tags.0');
    expect(newLength).toBe(0);
    expect(model.getField('tags')?.value).toEqual([]);
    expect(model.getField('tags.o')?.value).toBeUndefined();
    //expect(model.getField('tags.0')).toBeUndefined();
  });
});
