export type PrimitiveJSONValue = string | number | boolean;

export interface JSONObject {
  [key: string]: JSONValue;
}

export type JSONValue = PrimitiveJSONValue | JSONValue[] | JSONObject | null | undefined;

export interface FormObject {
  [key: string]: FormValue;
}

export type FormValue = PrimitiveJSONValue | FormValue[] | FormObject | null | undefined;

export type JSONSchema = {
  type: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object';
  title?: string;
  description?: string;
  enum?: string[];
  default?: FormValue;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;
  readOnly?: boolean;
  items?: JSONSchema;
  properties?: JSONSchemaProperties;
  // For object schemas (draft-7 standard)
  required?: string[];
  // For property schemas (our extension)
  isRequired?: boolean;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
  additionalItems?: boolean | JSONSchema;
  oneOf?: JSONSchema[];
  anyOf?: JSONSchema[];
  allOf?: JSONSchema[];
  validationMessage?: string;
};

export type JSONSchemaProperties = {
  [key: string]: JSONSchema;
};

export type FieldProps = {
  name: string;
  value: FormValue;
  schema: JSONSchema;
  onChange: (value: FormValue, triggerValidation?: boolean) => void;
  error?: string;
  required?: boolean;
  depth?: number;
  parentId?: string;
};

export type InitialFieldState = {
  value: JSONValue;
  required: boolean;
};
