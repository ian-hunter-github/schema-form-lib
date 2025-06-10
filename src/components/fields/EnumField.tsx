import React from 'react';
import type { FieldProps } from '../../types/schema';

const EnumField: React.FC<FieldProps> = ({ name, value, schema, onChange, error }) => {
  if (!schema.enum) {
    return null;
  }

  const isMultiple = schema.type === 'array';
  const selectValue = isMultiple 
    ? Array.isArray(value) ? value.map(String) : []
    : typeof value === 'string' || typeof value === 'number' 
      ? String(value) 
      : '';

  return (
    <>
      <label htmlFor={name} data-testid={`label-${name}`}>
        {schema.title || name}
      </label>
      {schema.description && (
        <div data-testid={`description-${name}`}>{schema.description}</div>
      )}
      <select
        id={name}
        data-testid={name}
        multiple={isMultiple}
        value={selectValue}
        disabled={schema.readOnly}
        autoComplete="off"
        data-lpignore="true"
        onChange={(e) => {
          const newValue = isMultiple 
            ? Array.from(e.target.selectedOptions, option => option.value)
            : e.target.value;
          onChange(newValue);
        }}
      >
        {schema.enum.map((option) => {
          const stringOption = String(option);
          return (
            <option key={stringOption} value={stringOption}>
              {stringOption}
            </option>
          );
        })}
      </select>
      {error && (
        <div data-testid={`error-${name}`} style={{ color: 'red' }}>
          {error}
        </div>
      )}
    </>
  );
};

export default EnumField;
