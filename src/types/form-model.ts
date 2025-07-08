import type { FormField } from "./fields";
import type { FormModel } from "../utils/form/FormModel";

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
