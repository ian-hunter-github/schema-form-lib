import React from 'react';
import type { FieldProps } from '../../types/schema';
import { capitalizeFirstLetter } from '../../utils/StringUtils';

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
    <div className="field-container">
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
      <label 
        htmlFor={fieldId} 
        id={`${fieldId}-label`}
        data-testid={`${fieldId}-label`}
        className={schema.required ? 'label required' : 'label'}
      >
        {capitalizeFirstLetter(schema.title || name)}
      </label>
      {schema.description && (
        <div id={`${fieldId}-description`} data-testid={`${fieldId}-description`}>{schema.description}</div>
      )}
      {error && (
        <div data-testid={`${fieldId}-error`} style={{ color: 'red' }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default EnumField;
