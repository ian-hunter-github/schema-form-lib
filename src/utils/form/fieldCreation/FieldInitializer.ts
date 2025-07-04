import type { JSONSchema, JSONValue } from '../../../types/schema';
import type { FormField } from '../types';
import { DefaultValueProvider } from '../valueHandling/DefaultValueProvider';

export class FieldInitializer {
  static createField(path: string, schema: JSONSchema, value?: JSONValue): FormField {
    const fieldValue = value !== undefined ? value : DefaultValueProvider.getDefaultValue(schema);
    
    return {
      path,
      value: fieldValue,
      pristineValue: fieldValue,  // Initialize pristine value to the same as initial value
      schema,
      errors: [],
      errorCount: 0,
      required: schema.isRequired || false,
      dirty: false,
      dirtyCount: 0,
      hasChanges: false,          // No changes initially
      lastModified: new Date()    // Set initial timestamp
    };
  }

  static createEmptyField(path: string, schema: JSONSchema): FormField {
    return this.createField(path, schema, undefined);
  }

  static createFieldWithValue(path: string, schema: JSONSchema, value: JSONValue): FormField {
    return this.createField(path, schema, value);
  }

  static updateFieldValue(field: FormField, newValue: JSONValue): void {
    field.value = newValue;
    field.dirty = true;
    field.dirtyCount++;
    field.hasChanges = !this.valuesEqual(newValue, field.pristineValue);
    field.lastModified = new Date();
  }

  static markFieldDirty(field: FormField): void {
    field.dirty = true;
    field.dirtyCount++;
    field.lastModified = new Date();
  }

  static revertFieldValue(field: FormField): void {
    field.value = field.pristineValue;
    field.hasChanges = false;
    field.dirty = false;
    field.dirtyCount = 0;
    field.lastModified = new Date();
  }

  static setPristineValue(field: FormField, pristineValue: JSONValue): void {
    field.pristineValue = pristineValue;
    field.hasChanges = !this.valuesEqual(field.value, pristineValue);
  }

  static valuesEqual(value1: JSONValue, value2: JSONValue): boolean {
    // Deep equality check for JSON values
    return JSON.stringify(value1) === JSON.stringify(value2);
  }

  static clearFieldErrors(field: FormField): void {
    field.errors = [];
    field.errorCount = 0;
  }

  static setFieldErrors(field: FormField, errors: string[]): void {
    field.errors = errors;
    field.errorCount = errors.length;
  }
}
