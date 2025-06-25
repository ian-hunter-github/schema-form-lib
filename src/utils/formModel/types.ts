import type { JSONSchema, JSONValue } from '../../types/schema';

export interface FormField {
  path: string;
  value: JSONValue;
  schema: JSONSchema;
  errors: string[];
  errorCount: number;
  required: boolean;
  dirty: boolean;
  dirtyCount: number;
}

export function isJSONSchema(schema: unknown): schema is JSONSchema {
  return typeof schema === 'object' && schema !== null && 'type' in schema;
}

export function isJSONObject(value: unknown): value is Record<string, JSONValue> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
