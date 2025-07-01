import React from 'react';
import type { JSONSchema, JSONValue } from '../types/schema';
import { DemoStringField } from './fields/DemoStringField';
import { DemoNumberField } from './fields/DemoNumberField';
import { DemoBooleanField } from './fields/DemoBooleanField';

interface SchemaRendererProps {
  schema: JSONSchema;
  path: string;
  value?: JSONValue;
  onChange?: (value: JSONValue, shouldValidate?: boolean) => void;
}

export const SchemaRenderer: React.FC<SchemaRendererProps> = ({ 
  schema,
  value,
  onChange
}) => {
  if (!schema.type) return null;

  switch(schema.type) {
    case 'string':
      return <DemoStringField 
        schema={schema}
        value={value as string | undefined}
        onChange={(val) => onChange?.(val)}
      />;
    case 'number':
      return <DemoNumberField
        schema={schema}
        value={value as number | undefined}
        onChange={(val) => onChange?.(val)}
      />;
    case 'boolean':
      return <DemoBooleanField
        schema={schema}
        value={value as boolean | undefined}
        onChange={(val) => onChange?.(val)}
      />;
    default:
      return <div>Unsupported type: {schema.type}</div>;
  }
};
