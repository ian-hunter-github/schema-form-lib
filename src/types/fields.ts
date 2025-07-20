/**
 * Type definitions for form fields
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

export interface FormFieldProps {
  field: FormField;
  onChange?: (value: JSONValue, shouldValidate?: boolean) => void;
  onError?: (error: Error) => void;
  formModel?: FormModel;
  children?: React.ReactNode;
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
