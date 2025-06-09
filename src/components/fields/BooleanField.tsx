import React from 'react';
import type { FieldProps } from '../../types/schema';

const BooleanField: React.FC<FieldProps> = ({ name, value, schema, onChange, error }) => {
  return (
    <>
      {schema.description && (
        <div data-testid={`description-${name}`}>{schema.description}</div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          id={name}
          data-testid={name}
          type="checkbox"
          checked={value as boolean}
          disabled={schema.readOnly}
          onChange={(e) => onChange(e.target.checked)}
        />
        <label htmlFor={name} data-testid={`label-${name}`}>
          {schema.title || name}
        </label>
      </div>
      {error && (
        <div data-testid={`error-${name}`} style={{ color: 'red' }}>
          {error}
        </div>
      )}
    </>
  );
};

export default BooleanField;
