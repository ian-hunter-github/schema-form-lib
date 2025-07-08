import type { JSONSchema, JSONValue } from '../../types/schema';

export function isJSONSchema(schema: unknown): schema is JSONSchema {
  return typeof schema === 'object' && schema !== null && 'type' in schema;
}

export function isJSONObject(value: unknown): value is Record<string, JSONValue> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export interface FormError {
  code: string;
  message: string;
  path?: string;
  details?: unknown;
}
