import React from 'react';
import type { FieldProps } from '../../types/schema';

const NumberField: React.FC<FieldProps> = ({ name, value, schema, onChange, error }) => {
  return (
    <>
      <label htmlFor={name} data-testid={`label-${name}`}>
        {schema.title || name}
      </label>
      {schema.description && (
        <div data-testid={`description-${name}`}>{schema.description}</div>
      )}
      <input
        id={name}
        data-testid={name}
        type="number"
        value={value as number}
        disabled={schema.readOnly}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {error && (
        <div data-testid={`error-${name}`} style={{ color: 'red' }}>
          {error}
        </div>
      )}
    </>
  );
};

export default NumberField;
