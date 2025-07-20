import type { FormField } from "./fields";
import type { JSONValue } from "./schema";

export interface FormModelOptions {
  hybridMode?: boolean;
}

export interface FormModel {
  getField(path: string): FormField;
  getFields(): Map<string, FormField>;
  setValue(path: string, value: JSONValue): void;
  validate(): boolean;
  shouldShowErrors(): boolean;
  shouldShowDirty(): boolean;
  
  // Hybrid mode methods
  getDirtyFields(): string[];
  getChangedValues(): Record<string, JSONValue>;
  clearAllDirtyStates(): void;
}

export interface FieldComponentProps {
  field: FormField;
  formModel: FormModel;
  onChange: (value: unknown, shouldValidate?: boolean) => void;
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
