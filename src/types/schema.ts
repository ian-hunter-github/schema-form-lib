export type PrimitiveJSONValue = string | number | boolean;

export interface JSONObject {
  [key: string]: JSONValue;
}

export type JSONValue = PrimitiveJSONValue | JSONValue[] | JSONObject;

export interface FormObject {
  [key: string]: FormValue;
}

export type FormValue = PrimitiveJSONValue | FormValue[] | FormObject;

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
  onChange: (value: FormValue) => void;
  error?: string;
  depth?: number;
  parentId: string;
  required?: boolean;
};

export type InitialFieldState = {
  value: JSONValue;
  required: boolean;
};
