import React from 'react';
import type { FieldProps } from '../../types/schema';

const EnumField: React.FC<FieldProps> = ({ name, value, schema, onChange, error, parentId }) => {

    const fieldId = parentId ? parentId + "." + name : name;

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
      <label htmlFor={fieldId} data-testid={`${fieldId}-label`}>
        {schema.title || name}
      </label>
      {schema.description && (
        <div data-testid={`${fieldId}-description`}>{schema.description}</div>
      )}
      <select
        id={fieldId}
        data-testid={fieldId}
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
        <div data-testid={`${fieldId}-error`} style={{ color: 'red' }}>
          {error}
        </div>
      )}
    </>
  );
};

export default EnumField;
