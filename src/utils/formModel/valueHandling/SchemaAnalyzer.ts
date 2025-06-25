import type { JSONSchema } from '../../../types/schema';

export class SchemaAnalyzer {
  static isObjectSchema(schema: JSONSchema): boolean {
    return schema.type === 'object' && !!schema.properties;
  }

  static isArraySchema(schema: JSONSchema): boolean {
    return schema.type === 'array' && !!schema.items;
  }

  static isPrimitiveSchema(schema: JSONSchema): boolean {
    return ['string', 'number', 'integer', 'boolean'].includes(schema.type);
  }

  static getRequiredProperties(schema: JSONSchema): string[] {
    if (schema.type === 'object' && schema.required) {
      return Array.isArray(schema.required) ? schema.required : [];
    }
    return [];
  }

  static hasNestedStructure(schema: JSONSchema): boolean {
    return this.isObjectSchema(schema) || this.isArraySchema(schema);
  }

  static getArrayItemSchema(schema: JSONSchema): JSONSchema | null {
    if (this.isArraySchema(schema)) {
      return schema.items as JSONSchema;
    }
    return null;
  }
}
