import type { JSONSchema, JSONValue } from '../../../types/schema';
import { isJSONSchema } from '../schemaUtils';
import { ValueConverter } from './ValueConverter';

export class DefaultValueProvider {
  static getDefaultValue(schema: JSONSchema): JSONValue {
    if (schema.default !== undefined) {
      return ValueConverter.convertFormValue(schema.default);
    }

    switch (schema.type) {
      case 'string':
        return '';
      case 'number':
      case 'integer':
        return 0;
      case 'boolean':
        return false;
      case 'array':
        return [];
      case 'object':
        return this.getDefaultObjectValue(schema);
      default:
        return undefined;
    }
  }

  static getDefaultObjectValue(schema: JSONSchema): Record<string, JSONValue> {
    const result: Record<string, JSONValue> = {};
    
    if (schema.properties) {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        if (isJSONSchema(propSchema)) {
          if (propSchema.default !== undefined) {
            result[key] = ValueConverter.convertFormValue(propSchema.default);
          } else if (propSchema.required) {
            result[key] = this.getDefaultValue(propSchema);
          }
        }
      }
    }
    
    return result;
  }

  static shouldInitializeProperty(schema: JSONSchema): boolean {
    return schema.default !== undefined || schema.isRequired === true;
  }
}
