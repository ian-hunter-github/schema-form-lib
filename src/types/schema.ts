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
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  title?: string;
  description?: string;
  enum?: string[];
  default?: FormValue;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  readOnly?: boolean;
  items?: JSONSchema;
  properties?: JSONSchemaProperties;
  required?: boolean;
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
  domContextId: string;
  required?: boolean;
  depth?: number;
  parentId?: string;
};

export type InitialFieldState = {
  value: JSONValue;
  required: boolean;
};
