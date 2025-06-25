import type { JSONSchema, JSONValue } from '../../../types/schema';
import type { FormField } from '../types';
import { FieldInitializer } from './FieldInitializer';
import { SchemaAnalyzer } from '../valueHandling/SchemaAnalyzer';

export class PrimitiveFieldCreator {
  static canHandle(schema: JSONSchema): boolean {
    return SchemaAnalyzer.isPrimitiveSchema(schema);
  }

  static createField(
    fields: Map<string, FormField>,
    path: string,
    schema: JSONSchema,
    value?: JSONValue
  ): FormField {
    const field = FieldInitializer.createField(path, schema, value);
    fields.set(path, field);
    return field;
  }

  static createFieldsForSchema(
    fields: Map<string, FormField>,
    path: string,
    schema: JSONSchema
  ): void {
    this.createField(fields, path, schema);
  }
}
