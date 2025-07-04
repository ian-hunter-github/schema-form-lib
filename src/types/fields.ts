/**
 * Type definitions for form fields and related components
 */

import type { JSONSchema, JSONValue } from "./schema";
import type { FormModel } from "../utils/form/FormModel";

export interface FormField {
  path: string;
  value: JSONValue;
  pristineValue: JSONValue;
  schema: JSONSchema;
  errors: string[];
  errorCount: number;
  required: boolean;
  dirty: boolean;
  dirtyCount: number;
  hasChanges: boolean;
  lastModified: Date;
  isTouched?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isHidden?: boolean;
  validationState?: 'valid' | 'invalid' | 'pending';
}

export interface FieldComponentProps {
  field: FormField;
  formModel: FormModel;
  onChange: (value: unknown, shouldValidate?: boolean) => void;
}

export interface ArrayFieldComponentProps extends FieldComponentProps {
  onAddItem: (value?: unknown) => void;
  onRemoveItem: (index: number) => void;
  onMoveItem: (fromIndex: number, toIndex: number) => void;
}

export interface OneOfFieldProps {
  schema: JSONSchema;
  path: string;
  onChange: (path: string, value: unknown) => void;
}

export type FieldType = 
  | 'string' 
  | 'number' 
  | 'boolean' 
  | 'array' 
  | 'object' 
  | 'enum' 
  | 'oneOf';
