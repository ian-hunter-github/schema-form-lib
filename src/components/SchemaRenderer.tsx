import React, { memo } from 'react';
import type { JSONSchema, JSONValue } from '../types/schema';
import { DemoStringField } from './fields/StringField/DemoStringField';
import { DemoNumberField } from './fields/NumberField/DemoNumberField';
import { DemoBooleanField } from './fields/BooleanField/DemoBooleanField';

interface SchemaRendererProps {
  schema: JSONSchema;
  path: string;
  value?: JSONValue;
  onChange?: (value: JSONValue, shouldValidate?: boolean) => void;
}

const SchemaRenderer: React.FC<SchemaRendererProps> = ({ 
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

const areEqual = (prevProps: SchemaRendererProps, nextProps: SchemaRendererProps) => {
  return (
    prevProps.schema === nextProps.schema &&
    prevProps.value === nextProps.value &&
    prevProps.onChange === nextProps.onChange
  );
};

export default memo(SchemaRenderer, areEqual);
