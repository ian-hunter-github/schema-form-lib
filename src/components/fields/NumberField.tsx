import React from 'react';
import type { FieldProps } from '../../types/schema';

const NumberField: React.FC<FieldProps> = ({ name, value, schema, onChange, error, testIdPrefix }) => {
  const fieldTestId = testIdPrefix && testIdPrefix.endsWith(name) ? testIdPrefix : 
                    testIdPrefix ? `${testIdPrefix}.${name}` : name;
  return (
    <>
      <label htmlFor={name} data-testid={`label-${fieldTestId}`}>
        {schema.title || name}
      </label>
      {schema.description && (
        <div data-testid={`description-${fieldTestId}`}>{schema.description}</div>
      )}
      <input
        id={name}
        data-testid={fieldTestId}
        type="number"
        value={value as number}
        disabled={schema.readOnly}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {error && (
        <div data-testid={`error-${fieldTestId}`} style={{ color: 'red' }}>
          {error}
        </div>
      )}
    </>
  );
};

export default NumberField;
