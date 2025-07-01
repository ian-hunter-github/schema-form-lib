import type { JSONSchema } from '../../../../types/schema';

export const SchemaRendererMock = ({ 
  schema,
  onChange
}: {
  schema: JSONSchema;
  onChange: (val: unknown) => void;
}) => {
  if (schema.type === 'object' && schema.properties?.value) {
    return (
      <input
        type="text"
        role="textbox"
        onChange={(e) => onChange(e.target.value)}
        placeholder={schema.properties.value.format || 'Enter value'}
      />
    );
  }
  return <div>Unsupported type: {schema.type}</div>;
};
