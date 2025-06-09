export type JSONValue = string | number | boolean | string[];
export type FormValue = string | number | boolean | string[];

export type JSONSchema = {
  type: 'string' | 'number' | 'boolean' | 'array';
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
};
