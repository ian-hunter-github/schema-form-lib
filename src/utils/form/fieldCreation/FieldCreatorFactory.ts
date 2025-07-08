import type { JSONSchema, JSONValue } from '../../../types/schema';
import type { FormField } from '../../../types/fields';
import { ObjectFieldCreator } from './ObjectFieldCreator';
import { ArrayFieldCreator } from './ArrayFieldCreator';
import { PrimitiveFieldCreator } from './PrimitiveFieldCreator';
import { SchemaAnalyzer } from '../valueHandling/SchemaAnalyzer';

export class FieldCreatorFactory {
  static createField(
    fields: Map<string, FormField>,
    path: string,
    schema: JSONSchema,
    value?: JSONValue
  ): FormField {
    if (ObjectFieldCreator.canHandle(schema)) {
      return ObjectFieldCreator.createField(fields, path, schema, value);
    }
    
    if (ArrayFieldCreator.canHandle(schema)) {
      return ArrayFieldCreator.createField(fields, path, schema, value);
    }
    
    if (PrimitiveFieldCreator.canHandle(schema)) {
      return PrimitiveFieldCreator.createField(fields, path, schema, value);
    }
    
    throw new Error(`Unsupported schema type: ${schema.type} at path: ${path}`);
  }

  static createFieldsForSchema(
    fields: Map<string, FormField>,
    path: string,
    schema: JSONSchema
  ): void {
    if (ObjectFieldCreator.canHandle(schema)) {
      ObjectFieldCreator.createFieldsForSchema(fields, path, schema);
    } else if (ArrayFieldCreator.canHandle(schema)) {
      ArrayFieldCreator.createFieldsForSchema(fields, path, schema);
    } else if (PrimitiveFieldCreator.canHandle(schema)) {
      PrimitiveFieldCreator.createFieldsForSchema(fields, path, schema);
    } else {
      throw new Error(`Unsupported schema type: ${schema.type} at path: ${path}`);
    }
  }

  static canCreateField(schema: JSONSchema): boolean {
    return ObjectFieldCreator.canHandle(schema) ||
           ArrayFieldCreator.canHandle(schema) ||
           PrimitiveFieldCreator.canHandle(schema);
  }

  static getFieldType(schema: JSONSchema): 'object' | 'array' | 'primitive' | 'unknown' {
    if (SchemaAnalyzer.isObjectSchema(schema)) return 'object';
    if (SchemaAnalyzer.isArraySchema(schema)) return 'array';
    if (SchemaAnalyzer.isPrimitiveSchema(schema)) return 'primitive';
    return 'unknown';
  }
}
